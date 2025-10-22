import { PartialType } from '@nestjs/swagger';
import { CreateAdminInterestDto } from './create-admin-interest.dto';

export class UpdateAdminInterestDto extends PartialType(CreateAdminInterestDto) {}
