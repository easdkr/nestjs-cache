import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CacheableMetadataAccessor } from './metadata-accessor';
import { RefreshableExplorer } from './refreshable.explore';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [CacheableMetadataAccessor, RefreshableExplorer],
})
export class CacheableModule {}
