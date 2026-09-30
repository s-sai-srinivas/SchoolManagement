import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface RefreshTokenPayload {
    sub: string; // userId
    email: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
            passReqToCallback: true,
        } as any);
    }

    async validate(req: any, payload: RefreshTokenPayload) {
        const refreshToken = req.body?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not provided');
        }

        // Find the hashed token in database
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        const storedToken = await this.prisma.refreshToken.findFirst({
            where: {
                userId: payload.sub,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Verify the token matches (compare hashed tokens)
        const isValid = await bcrypt.compare(refreshToken, storedToken.token);

        if (!isValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Verify user still exists
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
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            refreshTokenId: storedToken.id,
        };
    }
}
