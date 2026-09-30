import { IsOptional, IsString } from 'class-validator';

export class QueryHomeworkDto {
    @IsOptional()
    @IsString()
    class?: string;

    @IsOptional()
    @IsString()
    section?: string;

    @IsOptional()
    @IsString()
    subject?: string;
}
