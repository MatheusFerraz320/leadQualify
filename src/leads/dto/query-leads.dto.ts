import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadStatus } from '../../generated/prisma/enums.js';

export class QueryLeadsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(LeadStatus, { message: 'status inválido' })
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
