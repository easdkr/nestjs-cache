/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REFRESHABLE_METADATA } from './cacheable.contant';
import { RefreshableOptions } from './refreshable.decorator';

type Target = Function | Type<any>;

@Injectable()
export class CacheableMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  public isRefreshable(target: Target) {
    return this.reflector.get<boolean>(REFRESHABLE_METADATA, target);
  }

  public getRefreshableMetadata(target: Target): RefreshableOptions {
    return this.reflector.get<RefreshableOptions>(REFRESHABLE_METADATA, target);
  }
}
