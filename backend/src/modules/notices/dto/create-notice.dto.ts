import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateNoticeDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description: string;
}
