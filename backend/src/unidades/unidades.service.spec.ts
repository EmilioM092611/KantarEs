import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesService } from './unidades.service';

describe('UnidadesService', () => {
  let service: UnidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnidadesService],
    }).compile();

    service = module.get<UnidadesService>(UnidadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
