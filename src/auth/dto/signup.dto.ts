import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../generated/prisma/enums.js';
import { Match } from '../../common/decorators/match.decorator.js';

export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: 'name é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password é obrigatório' })
  @MinLength(8, { message: 'password deve ter no mínimo 8 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'confirme sua senha' })
  @Match('password')
  confirm_password: string;

  @IsEnum(UserRole, { message: 'role inválida' })
  role: UserRole;
}
