import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums.js';
import { LeadsService } from './leads.service.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { QueryLeadsDto } from './dto/query-leads.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthenticatedRequest } from '../common/guards/auth.guard.js';

@Controller('leads')
@UseGuards(AuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest, @Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(request.user, query);
  }

  @Get('by-user')
  @Roles(UserRole.ADMIN)
  findByUser() {
    return this.leadsService.findByUser();
  }

  @Get(':id')
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.leadsService.findOne(id, request.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, request.user, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.leadsService.remove(id, request.user);
  }
}
