import {
    IsString,
    IsUUID,
    MinLength,
    Matches,
} from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @MinLength(3)
    admissionNo: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @Matches(/^[1-9][0-2]?$/, {
        message: 'Class must be between 1 and 12',
    })
    class: string;

    @IsString()
    @MinLength(1)
    section: string;

    @IsUUID()
    schoolId: string;
}
