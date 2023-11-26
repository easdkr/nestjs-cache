import { SetMetadata, Type } from '@nestjs/common';
import { REFRESHABLE_METADATA } from './cacheable.contant';

export interface RefreshableOptions {
  /**
   * cache key
   * default : `cacheable:${className}:${methodName}:${JSON.stringify(args)}`
   */
  key?: string;

  /**
   * cron pattern
   * example : 30 0 0 * * *
   */
  cron: string;

  /**
   * if you want to get instance of class, set this option
   */
  toInstance?: Type<any>;

  /**
   * if you want to run cron on application start, set `true` this option, default is `false`
   */
  runOnStart?: boolean;

  /**
   * if you want to validate cache value, set this option
   * if validate function return `false`, cache will be refreshed
   */
  validate?: (value: any) => boolean;
}

export const Refreshable = (options: RefreshableOptions) =>
  SetMetadata(REFRESHABLE_METADATA, options);
