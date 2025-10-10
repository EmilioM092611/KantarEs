import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { commonProviders } from '../../test/utils/mocks';

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductosService, ...commonProviders()],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
