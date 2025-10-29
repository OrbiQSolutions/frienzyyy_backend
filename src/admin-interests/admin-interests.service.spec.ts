import { Test, TestingModule } from '@nestjs/testing';
import { AdminInterestsService } from './admin-interests.service';

describe('AdminInterestsService', () => {
  let service: AdminInterestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminInterestsService],
    }).compile();

    service = module.get<AdminInterestsService>(AdminInterestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
