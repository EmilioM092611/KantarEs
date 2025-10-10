import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { commonProviders } from '../../test/utils/mocks';

describe('UsuariosService (unit)', () => {
  let service: UsuariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosService, ...commonProviders()],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Cuando confirmemos el nombre real de los métodos,
  // añadimos asserts reales (findOne/findById/etc.).
});
