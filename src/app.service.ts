import { Injectable } from '@nestjs/common';
import { Refreshable } from './cache/refreshable.decorator';

@Injectable()
export class AppService {
  @Refreshable({
    cron: '*/1 * * * * *',
    key: 'hello',
    runOnStart: true,
  })
  getHello(): string {
    return 'Hello World!';
  }
}
