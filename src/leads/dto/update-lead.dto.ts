import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeadStatus } from '../../generated/prisma/enums.js';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'finality não pode ser vazio' })
  finality?: string;

  @IsOptional()
  @IsEnum(LeadStatus, { message: 'status inválido' })
  status?: LeadStatus;
}
