import { IsOptional, IsString, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiProperty({
      description: 'The name of the category',
      minLength: 3,
      maxLength: 50,
      required: false
    })
    @IsOptional()
    @IsString()
    @Length(3, 50)
    name?: string;
}



