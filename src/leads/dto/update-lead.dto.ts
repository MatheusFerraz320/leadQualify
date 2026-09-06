import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadStatus } from '../../generated/prisma/enums.js';
import { Transform } from 'class-transformer';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email inválido' })
  @Transform(({ value }: { value: string | undefined }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  finality?: string;

  @IsOptional()
  @IsEnum(LeadStatus, { message: 'status inválido' })
  status?: LeadStatus;
}
