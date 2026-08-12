import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedRequest } from '../common/guards/auth.guard.js';
import { DashboardService } from './dashboard.service.js';
import { QuerySummaryDto } from './dto/query-summary.dto.js';

@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(
    @Req() request: AuthenticatedRequest,
    @Query() query: QuerySummaryDto,
  ) {
    return this.dashboardService.summary(
      request.user,
      query.userId,
      query.month,
    );
  }
}
