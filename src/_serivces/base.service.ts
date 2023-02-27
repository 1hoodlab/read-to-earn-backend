import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * with ProxyService, CacheService
 */
@Injectable()
export abstract class BaseService {
  @Inject(CACHE_MANAGER)
  protected readonly cacheManager: Cache;

  constructor() {
    // NOTE: here in constructor, services is not injected yet
  }

  /**
   *
   * @param liveValueOfDataAfterFetching
   * @returns number of seconds to live, zero to live forever
   */
  defaultTtlFunction(liveValueOfDataAfterFetching) {
    if (liveValueOfDataAfterFetching?.length > 100) {
      return 60;
    } else {
      return 30;
    }
  }

  /**
   * @param cacheKey
   * @param rawFetchingFunction async function that return data to be cached.
   * @param ttlFunction? number of seconds to live, zero to live forever
   * @returns undefined if error
   */
  async fetchCacheable<T>(
    cacheKey: string,
    rawFetchingFunction: () => T,
    ttlFunction?: number,
  ) {
    return await this.cacheManager.wrap(
      cacheKey,
      async () => {
        try {
          return await rawFetchingFunction();
        } catch (error) {
          console.error(
            '====== ERROR BaseService.fetchCacheable() while getting data from rawFetchingFunction()',
          );
          console.error(error);
          throw error;
        }
      },
      // Note: ttl is optional in wrap()
      ttlFunction ? ttlFunction : this.defaultTtlFunction(100),
    );
  }
}
