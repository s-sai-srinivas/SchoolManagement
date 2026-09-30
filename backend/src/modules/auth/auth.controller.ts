import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /auth/register
     * Create new user (admin only)
     * No rate limit (admin action)
     */
    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    /**
     * POST /auth/login
     * User login with email and password
     * Rate limited: 5 attempts per 15 minutes
     */
    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes (900000ms)
    async login(@Body() loginDto: LoginDto, @Req() req: any) {
        const ip = req.ip || req.connection.remoteAddress;
        return this.authService.login(loginDto, ip);
    }

    /**
     * POST /auth/refresh
     * Refresh access token using refresh token
     * Rate limited: 10 requests per minute
     */
    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
    async refresh(@CurrentUser() user: any) {
        return this.authService.refreshAccessToken(
            user.userId,
            user.email,
            user.role,
            user.schoolId,
            user.refreshTokenId,
        );
    }

    /**
     * POST /auth/logout
     * Revoke refresh token
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async logout(@Body() refreshTokenDto: RefreshTokenDto) {
        await this.authService.logout(refreshTokenDto.refreshToken);
        return { message: 'Logged out successfully' };
    }

    /**
     * GET /auth/me
     * Get current user information
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@CurrentUser() user: any) {
        return this.authService.getCurrentUser(user.id);
    }
}
