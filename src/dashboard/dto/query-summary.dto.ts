import { IsOptional, IsString } from 'class-validator';

export class QuerySummaryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
