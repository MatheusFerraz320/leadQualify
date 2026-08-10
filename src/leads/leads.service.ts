import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { scopeWhere } from '../common/scope.js';
import type { AuthenticatedUser } from '../common/guards/auth.guard.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { QueryLeadsDto } from './dto/query-leads.dto.js';
import type {
  RdWebhookConversion,
  RdWebhookPayload,
} from './rd-webhook.type.js';

const LEAD_USER_SELECT = { select: { id: true, name: true, email: true } };

interface WebhookEntry {
  email?: string;
  name?: string;
  phone: string;
  content: Record<string, unknown>;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async ingestFromWebhook(token: string, payload: RdWebhookPayload) {
    const user = await this.prisma.users.findUnique({
      where: { rdWebhookToken: token },
    });

    if (!user) {
      this.logger.warn('Webhook rejeitado: token inválido');
      throw new NotFoundException('Token de webhook inválido');
    }

    const entries = this.toWebhookEntries(payload);

    const productField =
      this.config.get<string>('RD_FIELD_PRODUCT') ?? 'cf_produto_ou_servico';
    const finalityField =
      this.config.get<string>('RD_FIELD_FINALITY') ?? 'cf_finalidade';

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const entry of entries) {
      const email = this.normalizeEmail(entry.email);

      if (!email) {
        skipped += 1;
        this.logger.warn(`Webhook de ${user.email}: lead sem email ignorado`);
        continue;
      }

      const data = {
        name: this.normalize(entry.name) ?? email.split('@')[0],
        phone: entry.phone,
        product: this.readCustomField(entry.content, productField),
        finality: this.readCustomField(entry.content, finalityField),
        utmAnuncioId:
          this.readCustomField(entry.content, 'cf_utm_anuncio_id') || null,
        utmCampanha:
          this.readCustomField(entry.content, 'cf_utm_campanha') || null,
        utmGrupoAnuncio:
          this.readCustomField(entry.content, 'cf_utm_grupo_anuncio') || null,
        utmPalavraChave:
          this.readCustomField(entry.content, 'cf_utm_palavra_chave') || null,
      };

      const lead = await this.prisma.lead.upsert({
        where: { userId_email: { userId: user.id, email } },
        create: { userId: user.id, email, ...data },
        update: data,
      });

      if (lead.createdAt === lead.updatedAt) {
        created += 1;
      } else {
        updated += 1;
      }
    }

    this.logger.log(
      `Webhook de ${user.email}: ${entries.length} lead(s) recebido(s) | criados=${created}, atualizados=${updated}, ignorados=${skipped}`,
    );

    return {
      accepted: true,
      processed: entries.length,
      created,
      updated,
      skipped,
    };
  }

  private toWebhookEntries(payload: RdWebhookPayload): WebhookEntry[] {
    if (Array.isArray(payload.leads) && payload.leads.length > 0) {
      return payload.leads.map((lead) => ({
        email: lead.email,
        name: lead.name,
        phone:
          this.normalize(lead.phone) ??
          this.normalize(lead.personal_phone) ??
          this.normalize(lead.mobile_phone) ??
          '',
        content: this.mergeRecords(
          lead.first_conversion?.content,
          this.nestedPayload(lead.first_conversion),
          lead.last_conversion?.content,
          this.nestedPayload(lead.last_conversion),
          lead.custom_fields,
        ),
      }));
    }

    const contact = payload.contact ?? {};
    return [
      {
        email: contact.email,
        name: contact.name,
        phone:
          this.normalize(contact.personal_phone) ??
          this.normalize(contact.mobile_phone) ??
          '',
        content: contact,
      },
    ];
  }

  private mergeRecords(
    ...sources: Array<Record<string, unknown> | undefined>
  ): Record<string, unknown> {
    const merged: Record<string, unknown> = {};
    for (const source of sources) {
      if (!source) continue;
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined && value !== null) {
          merged[key] = value;
        }
      }
    }
    return merged;
  }

  private nestedPayload(
    conversion: RdWebhookConversion | undefined,
  ): Record<string, unknown> {
    const content = conversion?.content;
    if (!content || typeof content !== 'object') return {};
    const original = content['__cdp__original_event'];
    if (original && typeof original === 'object' && !Array.isArray(original)) {
      const payload = (original as Record<string, unknown>)['payload'];
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        return payload as Record<string, unknown>;
      }
    }
    return {};
  }

  findAll(user: AuthenticatedUser, query: QueryLeadsDto) {
    const where: Prisma.LeadWhereInput = {
      ...scopeWhere(user, query.userId),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: LEAD_USER_SELECT },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const lead = await this.prisma.lead.findFirst({
      where: scopeWhere(user, undefined, { id }),
      include: { user: LEAD_USER_SELECT },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }

  async update(id: string, user: AuthenticatedUser, dto: UpdateLeadDto) {
    const where = scopeWhere(user, undefined, { id });
    const existing = await this.prisma.lead.findFirst({ where });

    if (!existing) {
      throw new NotFoundException('Lead não encontrado');
    }

    try {
      return await this.prisma.lead.update({
        where: { id },
        data: dto,
        include: { user: LEAD_USER_SELECT },
      });
    } catch (error) {
      return this.handleNotFoundOrRethrow(error);
    }
  }

  async remove(id: string, user: AuthenticatedUser) {
    const result = await this.prisma.lead.deleteMany({
      where: scopeWhere(user, undefined, { id }),
    });

    if (result.count === 0) {
      throw new NotFoundException('Lead não encontrado');
    }
  }

  async findByUser() {
    const grouped = await this.prisma.lead.groupBy({
      by: ['userId'],
      _count: { _all: true },
    });

    const userIds = grouped.map((group) => group.userId);
    const users = await this.prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((user) => [user.id, user]));

    return grouped
      .map((group) => ({
        userId: group.userId,
        user: userMap.get(group.userId) ?? null,
        total: group._count._all,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private normalize(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text || null;
  }

  private normalizeEmail(value: unknown): string | null {
    const email = this.normalize(value);
    return email ? email.toLowerCase() : null;
  }

  private readCustomField(
    contact: Record<string, unknown>,
    key: string,
  ): string {
    const value = contact[key];
    if (Array.isArray(value)) {
      return value.length > 0 ? this.primitiveToString(value[0]) : '';
    }
    return this.primitiveToString(value);
  }

  private primitiveToString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  }

  private handleNotFoundOrRethrow(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Lead não encontrado');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Email já cadastrado para este lead');
      }
    }
    throw error;
  }
}
