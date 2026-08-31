import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../generated/prisma/enums.js';
import { Match } from '../../common/decorators/match.decorator.js';

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

  @ValidateIf(
    (object: { password?: string }) =>
      object.password !== undefined && object.password !== '',
  )
  @IsString()
  @IsNotEmpty({ message: 'confirme sua senha' })
  @Match('password')
  confirm_password?: string;
}
