import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateHomeworkDto {
    @IsString()
    @IsNotEmpty()
    class: string;

    @IsString()
    @IsNotEmpty()
    section: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    description: string;
}
