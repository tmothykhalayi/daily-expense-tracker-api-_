import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CachingService } from './caching.service';
import { CreateCachingDto } from './dto/createCachingDto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('caching')
@Controller('caching')
export class CachingController {
  constructor(private readonly cachingService: CachingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cache entry' })
  @ApiResponse({ status: 201, description: 'Cache entry created successfully' })
  create(@Body() createCachingDto: CreateCachingDto) {
    return this.cachingService.create(createCachingDto);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get cache value by key' })
  @ApiResponse({ status: 200, description: 'Returns the cached value' })
  get(@Param('key') key: string) {
    return this.cachingService.get(key);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Remove cache entry by key' })
  @ApiResponse({ status: 200, description: 'Cache entry removed successfully' })
  remove(@Param('key') key: string) {
    return this.cachingService.remove(key);
  }
}
