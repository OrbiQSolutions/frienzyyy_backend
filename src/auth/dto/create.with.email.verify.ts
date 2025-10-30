import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength
} from "class-validator";

export class CreateWithEmailVerify {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @MinLength(4, { message: 'OTP must be 4 digits' })
  otp: string;
}