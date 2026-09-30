import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
    sub: string; // userId
    email: string;
    role: string;
    schoolId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        // Verify user still exists and is not deleted
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException('User not found or deleted');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
        };
    }
}
