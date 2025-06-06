import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager'; 
import { CreateCachingDto } from './dto/createCachingDto';

@Injectable()
export class CachingService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async create(createCachingDto: CreateCachingDto) {
    const { key, value, ttl } = createCachingDto;
    try {
      if (ttl) {
      
        await this.cacheManager.set(key, value, ttl);
      } else {
        await this.cacheManager.set(key, value);
      }

      return {
        success: true,
        message: `Caching created successfully with key: ${key}`,
        data: { key, value },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create caching with key: ${key}`,
        data: null,
      };
    }
  }

  async get(key: string) {
    try {
      const value = await this.cacheManager.get(key);
      if (value !== null && value !== undefined) {
        return {
          success: true,
          message: `Caching retrieved successfully for key: ${key}`,
          data: { key, value },
        };
      } else {
        return {
          success: false,
          message: `No caching found for key: ${key}`,
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve caching for key: ${key}`,
        data: null,
      };
    }
  }

  async remove(key: string) {
    try {
      await this.cacheManager.del(key);
      return {
        success: true,
        message: `Caching removed successfully for key: ${key}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to remove caching for key: ${key}`,
      };
    }
  }
}
