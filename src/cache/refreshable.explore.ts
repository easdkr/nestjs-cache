import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { CacheableMetadataAccessor } from './metadata-accessor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshableExplorer implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly metadataAccessor: CacheableMetadataAccessor,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public onModuleInit() {
    return this.discoveryService

      .getProviders()
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter(({ instance }) => !!instance && Object.getPrototypeOf(instance))
      .flatMap(({ instance }) => {
        return this.metadataScanner
          .getAllMethodNames(instance)
          .filter((methodName) =>
            this.metadataAccessor.isRefreshable(instance[methodName]),
          )
          .map((methodName) => {
            const metadata = this.metadataAccessor.getRefreshableMetadata(
              instance[methodName],
            );
            return {
              instance,
              methodName,
              metadata,
            };
          });
      })
      .forEach(({ instance, methodName, metadata }) => {
        console.log('instance', instance);
        console.log('methodName', methodName);
        console.log('metadata', metadata);
      });
  }
}
