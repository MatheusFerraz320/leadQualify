import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}
