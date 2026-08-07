import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../generated/prisma/enums.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email inválido' })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role inválida' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'password deve ter no mínimo 8 caracteres' })
  password?: string;
}
