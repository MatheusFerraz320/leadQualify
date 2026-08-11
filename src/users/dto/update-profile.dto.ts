import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Match } from '../../common/decorators/match.decorator.js';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email inválido' })
  email?: string;

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
