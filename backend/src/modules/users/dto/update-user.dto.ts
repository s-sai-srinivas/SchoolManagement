import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;
}
