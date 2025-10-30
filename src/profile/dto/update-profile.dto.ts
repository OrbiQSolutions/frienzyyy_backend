import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}
