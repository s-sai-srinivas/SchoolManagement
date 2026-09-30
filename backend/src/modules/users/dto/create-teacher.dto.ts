import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class CreateTeacherDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsUUID()
    schoolId: string;
}
