import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheableModule } from './cache/cache.module';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const host = 'localhost';
        const port = 6379;
        return { store: redisStore, socket: { host, port } };
      },
      isGlobal: true,
    }),
    CacheableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
