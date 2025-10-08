import { Module, Global } from '@nestjs/common';
import { CacheUtil } from './cache-util.service';

@Global() // <-- esto lo hace visible en toda la app
@Module({
  providers: [CacheUtil],
  exports: [CacheUtil],
})
export class CacheToolsModule {}
