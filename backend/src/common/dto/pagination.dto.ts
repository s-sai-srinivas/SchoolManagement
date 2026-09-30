import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    skip?: number = 0;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    take?: number = 10;
}
