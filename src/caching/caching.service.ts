import { Injectable } from '@nestjs/common';
import { CreateCachingDto } from './dto/create-caching.dto';
import { UpdateCachingDto } from './dto/update-caching.dto';

@Injectable()
export class CachingService {
  create(createCachingDto: CreateCachingDto) {
    return 'This action adds a new caching';
  }

  findAll() {
    return `This action returns all caching`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caching`;
  }

  update(id: number, updateCachingDto: UpdateCachingDto) {
    return `This action updates a #${id} caching`;
  }

  remove(id: number) {
    return `This action removes a #${id} caching`;
  }
}
