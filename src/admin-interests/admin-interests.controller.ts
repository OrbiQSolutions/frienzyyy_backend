import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminInterestsService } from './admin-interests.service';
import { CreateAdminInterestDto } from './dto/create-admin-interest.dto';
import { UpdateAdminInterestDto } from './dto/update-admin-interest.dto';

@Controller('admin/interests')
export class AdminInterestsController {
  constructor(private readonly adminInterestsService: AdminInterestsService) { }

  @Post()
  async create(@Body() createAdminInterestDto: CreateAdminInterestDto) {
    return await this.adminInterestsService.create(createAdminInterestDto);
  }

  @Get()
  findAll() {
    return this.adminInterestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminInterestsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminInterestDto: UpdateAdminInterestDto) {
    return this.adminInterestsService.update(+id, updateAdminInterestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminInterestsService.remove(+id);
  }
}
