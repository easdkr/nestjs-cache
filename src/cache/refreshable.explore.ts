/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { CacheableMetadataAccessor } from './metadata-accessor';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheableKeyFactory } from './cacheable.key-factory';
import { plainToInstance } from 'class-transformer';
import { CronJob } from 'cron';
import { RefreshableOptions } from './refreshable.decorator';

const INF = 999999999;

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
            const options = this.metadataAccessor.getRefreshableMetadata(
              instance[methodName],
            );
            return {
              instance,
              methodName,
              options,
            };
          });
      })
      .forEach(({ instance, methodName, options }) => {
        const originalMethod = instance[methodName];
        const key = CacheableKeyFactory.create({
          instance,
          methodName,
          key: options.key,
        });

        // replace original method
        instance[methodName] = async () => {
          // if cache exists, return cached value
          const cachedValue = await this.getCachedValue(key, options);
          if (cachedValue !== undefined) return cachedValue;

          const result = await originalMethod.apply(instance);

          await this.setCache(key, result);

          // register cron
          this.registerCron({
            key,
            job: originalMethod.bind(instance),
            cron: options.cron,
            validate: options.validate,
          });

          return result;
        };

        // run cron on application start
        if (options.runOnStart) {
          this.registerCron({
            key,
            job: originalMethod.bind(instance),
            cron: options.cron,
            validate: options.validate,
          });
        }
      });
  }

  private async getCachedValue(key: string, options: RefreshableOptions) {
    const cachedValue = await this.cacheManager.get(key);
    if (cachedValue) {
      if (cachedValue === 'null') {
        return null;
      } else if (options && options.toInstance) {
        return plainToInstance(options.toInstance, cachedValue);
      } else {
        return cachedValue;
      }
    }
    return null; // 혹은 적절한 기본값 반환
  }

  private async setCache(key: string, value: any): Promise<void> {
    await this.cacheManager.set(key, value === null ? 'null' : value, INF);
  }

  private async registerCron(options: {
    key: string;
    job: Function;
    cron: string;
    validate?: (value: any) => boolean;
  }) {
    new CronJob(options.cron, async () => {
      try {
        const jobResult = await options.job();
        if (!options.validate) {
          await this.cacheManager.set(options.key, jobResult, INF);
          return;
        }

        if (options.validate(jobResult))
          await this.cacheManager.set(options.key, jobResult, INF);
        else await this.cacheManager.del(options.key);
      } catch (e) {
        console.error(e);
      }
    }).start();
  }
}
