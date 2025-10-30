import {
  MinLength,
  IsString,
  IsNotEmpty
} from "class-validator";

export class PasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}