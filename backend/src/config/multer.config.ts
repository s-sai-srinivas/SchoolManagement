import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads/homework',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `homework-${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return cb(
                new BadRequestException('Only JPG and PNG files are allowed'),
                false,
            );
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
};
