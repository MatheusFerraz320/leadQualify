import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client.js';
import { UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../common/guards/auth.guard.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { QueryLeadsDto } from './dto/query-leads.dto.js';
import type { RdWebhookPayload } from './rd-webhook.type.js';

const LEAD_USER_SELECT = { select: { id: true, name: true, email: true } };

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async ingestFromWebhook(token: string, payload: RdWebhookPayload) {
    const user = await this.prisma.users.findUnique({
      where: { rdWebhookToken: token },
    });

    if (!user) {
      throw new NotFoundException('Token de webhook inválido');
    }

    const contact = payload.contact ?? {};
    const email = this.normalizeEmail(contact.email);

    if (!email) {
      return { accepted: false, reason: 'missing_email' };
    }

    const productField =
      this.config.get<string>('RD_FIELD_PRODUCT') ?? 'cf_produto';
    const finalityField =
      this.config.get<string>('RD_FIELD_FINALITY') ?? 'cf_finalidade';

    const data = {
      name: this.normalize(contact.name) ?? email.split('@')[0],
      phone:
        this.normalize(contact.personal_phone) ??
        this.normalize(contact.mobile_phone) ??
        '',
      product: this.readCustomField(contact, productField),
      finality: this.readCustomField(contact, finalityField),
    };

    return this.prisma.lead.upsert({
      where: { userId_email: { userId: user.id, email } },
      create: { userId: user.id, email, ...data },
      update: data,
    });
  }

  findAll(user: AuthenticatedUser, query: QueryLeadsDto) {
    const where: Prisma.LeadWhereInput = {
      ...this.scopeWhere(user, query.userId),
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
      where: this.scopeWhere(user, undefined, { id }),
      include: { user: LEAD_USER_SELECT },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }

  async update(id: string, user: AuthenticatedUser, dto: UpdateLeadDto) {
    const where = this.scopeWhere(user, undefined, { id });
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
      where: this.scopeWhere(user, undefined, { id }),
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

  private scopeWhere(
    user: AuthenticatedUser,
    userId?: string,
    extra: Prisma.LeadWhereInput = {},
  ): Prisma.LeadWhereInput {
    if (user.role === UserRole.ADMIN) {
      return userId ? { ...extra, userId } : extra;
    }
    return { ...extra, userId: user.sub };
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
