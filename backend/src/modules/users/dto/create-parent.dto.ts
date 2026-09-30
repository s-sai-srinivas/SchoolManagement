import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class CreateParentDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsUUID()
    schoolId: string;
}
