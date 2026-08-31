import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { LeadStatus, UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { scopeWhere } from '../common/scope.js';
import type { AuthenticatedUser } from '../common/guards/auth.guard.js';

type StatusGroup = { status: LeadStatus; count: number };

type UserBreakdown = {
  userId: string;
  user: { id: string; name: string; email: string } | null;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  conversionRate: number;
};

type RateItem = {
  label: string;
  approved: number;
  rejected: number;
  total: number;
  rate: number;
};

type RateBreakdown = {
  topApproval: RateItem[];
  topRejection: RateItem[];
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(
    user: AuthenticatedUser,
    requestedUserId?: string,
    month?: string,
  ) {
    const scopedUserId =
      user.role === UserRole.ADMIN ? (requestedUserId ?? null) : user.sub;
    const baseWhere = scopeWhere(user, scopedUserId ?? undefined);

    const now = new Date();
    const selectedMonth = month ? this.monthKeyBounds(month) : null;
    const startThisMonth =
      selectedMonth?.start ??
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startNextMonth =
      selectedMonth?.startNext ??
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const startPrevMonth = new Date(
      Date.UTC(
        startThisMonth.getUTCFullYear(),
        startThisMonth.getUTCMonth() - 1,
        1,
      ),
    );

    const where: Prisma.LeadWhereInput = selectedMonth
      ? { ...baseWhere, createdAt: { gte: startThisMonth, lt: startNextMonth } }
      : baseWhere;

    const [
      statusGroups,
      byProduct,
      byCampaign,
      monthly,
      thisMonth,
      prevMonth,
      byUser,
      byCampaignRate,
      byAdGroupRate,
    ] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.topProducts(where),
      this.topCampaigns(where),
      this.monthlyBuckets(baseWhere),
      this.prisma.lead.count({
        where: {
          ...where,
          createdAt: { gte: startThisMonth, lt: startNextMonth },
        },
      }),
      this.prisma.lead.count({
        where: {
          ...where,
          createdAt: { gte: startPrevMonth, lt: startThisMonth },
        },
      }),
      user.role === UserRole.ADMIN
        ? this.byUserBreakdown(where)
        : Promise.resolve([]),
      this.topByRate(where, 'utmCampanha'),
      this.topByRate(where, 'utmGrupoAnuncio'),
    ]);

    const totals = this.computeTotals(statusGroups, thisMonth, prevMonth);

    return {
      totals,
      byStatus: this.toByStatus(statusGroups),
      monthly,
      byProduct,
      byCampaign,
      byUser,
      byCampaignRate,
      byAdGroupRate,
    };
  }

  private computeTotals(
    groups: Array<{ status: LeadStatus; _count: { _all: number } }>,
    thisMonth: number,
    prevMonth: number,
  ) {
    let total = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;

    for (const group of groups) {
      total += group._count._all;
      if (group.status === LeadStatus.APPROVED) approved = group._count._all;
      else if (group.status === LeadStatus.PENDING) pending = group._count._all;
      else rejected = group._count._all;
    }

    const monthDeltaPct =
      prevMonth > 0
        ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100)
        : thisMonth > 0
          ? 100
          : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      conversionRate: total > 0 ? approved / total : 0,
      newThisMonth: thisMonth,
      previousMonth: prevMonth,
      monthDeltaPct,
    };
  }

  private toByStatus(
    groups: Array<{ status: LeadStatus; _count: { _all: number } }>,
  ): StatusGroup[] {
    const order: LeadStatus[] = [
      LeadStatus.PENDING,
      LeadStatus.APPROVED,
      LeadStatus.REJECTED,
    ];
    const counts = new Map<LeadStatus, number>(
      groups.map((group) => [group.status, group._count._all]),
    );
    return order
      .filter((status) => counts.has(status))
      .map((status) => ({ status, count: counts.get(status) ?? 0 }));
  }

  private monthKeyBounds(month: string) {
    const [year, monthIndex] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, monthIndex - 1, 1));
    const startNext = new Date(Date.UTC(year, monthIndex, 1));
    return { start, startNext };
  }

  private async topProducts(
    where: Prisma.LeadWhereInput,
  ): Promise<Array<{ label: string; count: number }>> {
    const groups = await this.prisma.lead.groupBy({
      by: ['product'],
      where,
      _count: { _all: true },
    });

    return [...groups]
      .sort((a, b) => Number(b._count._all) - Number(a._count._all))
      .slice(0, 5)
      .map((group) => ({
        label: (group.product || '').trim() || '—',
        count: Number(group._count._all),
      }));
  }

  private async topCampaigns(
    where: Prisma.LeadWhereInput,
  ): Promise<Array<{ label: string; count: number }>> {
    const groups = await this.prisma.lead.groupBy({
      by: ['utmCampanha'],
      where,
      _count: { _all: true },
    });

    return [...groups]
      .sort((a, b) => Number(b._count._all) - Number(a._count._all))
      .slice(0, 5)
      .map((group) => ({
        label: (group.utmCampanha || '').trim() || '—',
        count: Number(group._count._all),
      }));
  }

  private async topByRate(
    where: Prisma.LeadWhereInput,
    byField: 'utmCampanha' | 'utmGrupoAnuncio',
  ): Promise<RateBreakdown> {
    const groups = await this.prisma.lead.groupBy({
      by: [byField, 'status'],
      where,
      _count: { _all: true },
    });

    const aggregates = new Map<
      string,
      { approved: number; rejected: number }
    >();

    for (const group of groups) {
      const label = (group[byField] || '').trim();
      if (!label) continue;

      const current = aggregates.get(label) ?? { approved: 0, rejected: 0 };
      if (group.status === LeadStatus.APPROVED)
        current.approved = group._count._all;
      else if (group.status === LeadStatus.REJECTED)
        current.rejected = group._count._all;
      aggregates.set(label, current);
    }

    const items: RateItem[] = [...aggregates.entries()]
      .filter(([, agg]) => agg.approved + agg.rejected > 0)
      .map(([label, agg]) => ({
        label,
        approved: agg.approved,
        rejected: agg.rejected,
        total: agg.approved + agg.rejected,
        rate: agg.approved / (agg.approved + agg.rejected),
      }));

    const topApproval = [...items].sort((a, b) => b.rate - a.rate).slice(0, 5);
    const topRejection = [...items].sort((a, b) => a.rate - b.rate).slice(0, 5);

    return { topApproval, topRejection };
  }

  private async monthlyBuckets(
    where: Prisma.LeadWhereInput,
  ): Promise<Array<{ month: string; count: number }>> {
    const conditions: Prisma.Sql[] = [];
    if (where.userId) {
      conditions.push(Prisma.sql`"userId" = ${where.userId}`);
    }
    const whereSql =
      conditions.length > 0
        ? Prisma.join(conditions, ' AND ')
        : Prisma.sql`TRUE`;

    return this.prisma.$queryRaw<
      Array<{ month: string; count: number }>
    >(Prisma.sql`
      SELECT to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
             count(*)::int AS count
      FROM "Lead"
      WHERE ${whereSql}
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
    `);
  }

  private async byUserBreakdown(
    where: Prisma.LeadWhereInput,
  ): Promise<UserBreakdown[]> {
    const groups = await this.prisma.lead.groupBy({
      by: ['userId', 'status'],
      where,
      _count: { _all: true },
    });

    const userIds = [...new Set(groups.map((group) => group.userId))];
    const users = await this.prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const aggregates = new Map<
      string,
      { total: number; pending: number; approved: number; rejected: number }
    >();

    for (const group of groups) {
      const current = aggregates.get(group.userId) ?? {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
      current.total += group._count._all;
      if (group.status === LeadStatus.APPROVED)
        current.approved = group._count._all;
      else if (group.status === LeadStatus.PENDING)
        current.pending = group._count._all;
      else current.rejected = group._count._all;
      aggregates.set(group.userId, current);
    }

    return [...aggregates.entries()]
      .map(([userId, agg]) => ({
        userId,
        user: userMap.get(userId) ?? null,
        ...agg,
        conversionRate: agg.total > 0 ? agg.approved / agg.total : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }
}
