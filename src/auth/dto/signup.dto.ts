import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
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
  @IsNotEmpty({ message: 'confirm_password é obrigatório' })
  @Match('password')
  confirm_password: string;

  @IsString()
  @IsNotEmpty({ message: 'role é obrigatório' })
  role: string;
}
