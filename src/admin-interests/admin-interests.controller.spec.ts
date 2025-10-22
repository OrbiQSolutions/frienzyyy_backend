import { Test, TestingModule } from '@nestjs/testing';
import { AdminInterestsController } from './admin-interests.controller';
import { AdminInterestsService } from './admin-interests.service';

describe('AdminInterestsController', () => {
  let controller: AdminInterestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminInterestsController],
      providers: [AdminInterestsService],
    }).compile();

    controller = module.get<AdminInterestsController>(AdminInterestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
