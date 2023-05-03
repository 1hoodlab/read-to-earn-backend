import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

const ttlDefault = 5 * 1000 * 60;
@Injectable()
export abstract class BaseService {
  @Inject(CACHE_MANAGER)
  protected readonly cacheManager: Cache;

  constructor() {
    // NOTE: here in constructor, services is not injected yet
  }

  /**
   * @param cacheKey
   * @param rawFetchingFunction async function that return data to be cached.
   * @param ttlFunction? number of seconds to live, zero to live forever
   * @returns undefined if error
   */
  async fetchCacheable<T>(cacheKey: string, rawFetchingFunction: () => T, ttlFunction?: number) {
    return await this.cacheManager.wrap(
      cacheKey,
      async () => {
        try {
          return rawFetchingFunction();
        } catch (error) {
          console.error('====== ERROR BaseService.fetchCacheable() while getting data from rawFetchingFunction()');
          console.error(error);
          throw error;
        }
      },
      // Note: ttl is optional in wrap()
      ttlFunction ? ttlFunction : ttlDefault,
    );
  }
}
