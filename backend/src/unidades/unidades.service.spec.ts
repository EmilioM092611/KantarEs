import { Test, TestingModule } from '@nestjs/testing';
import { UnidadesService } from './unidades.service';
import { commonProviders } from '../../test/utils/mocks';

describe('UnidadesService', () => {
  let service: UnidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnidadesService, ...commonProviders()],
    }).compile();

    service = module.get<UnidadesService>(UnidadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
