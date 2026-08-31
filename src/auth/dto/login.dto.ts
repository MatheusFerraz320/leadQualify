import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'senha é obrigatória' })
  password: string;
}
