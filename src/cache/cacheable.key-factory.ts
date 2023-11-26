interface CreateOptions {
  key?: string;
  instance: any;
  methodName: string;
  args?: any[];
}
export class CacheableKeyFactory {
  private static PREFIX = 'cacheable';

  public static create(options: CreateOptions) {
    return options.key
      ? `${this.PREFIX}:${options.key}`
      : `${this.PREFIX}:${options.instance.constructor.name}:${
          options.methodName
        }:${JSON.stringify(options.args)}`;
  }
}
