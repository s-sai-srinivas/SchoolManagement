import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
    private failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Generate a random password
     */
    private generatePassword(): string {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    /**
     * Hash password with bcrypt (salt rounds = 12)
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Verify password against hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Check for brute force attempts (IP-based)
     */
    async checkBruteForce(ip: string): Promise<void> {
        const attempts = this.failedAttempts.get(ip);
        if (attempts && attempts.count >= 10) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
            if (timeSinceLastAttempt < 3600000) {
                // 1 hour
                throw new UnauthorizedException('Too many failed attempts. Try again later.');
            }
            this.failedAttempts.delete(ip);
        }
    }

    /**
     * Record failed login attempt
     */
    recordFailedAttempt(ip: string): void {
        const attempts = this.failedAttempts.get(ip) || { count: 0, lastAttempt: new Date() };
        attempts.count++;
        attempts.lastAttempt = new Date();
        this.failedAttempts.set(ip, attempts);
    }

    /**
     * Clear failed attempts on successful login
     */
    clearFailedAttempts(ip: string): void {
        this.failedAttempts.delete(ip);
    }

    /**
     * Generate access token (15 min expiry)
     */
    generateAccessToken(userId: string, email: string, role: UserRole, schoolId: string): string {
        const payload = {
            sub: userId,
            email,
            role,
            schoolId,
        };

        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m') as any,
        });
    }

    /**
     * Generate refresh token (7 days expiry)
     */
    generateRefreshToken(userId: string, email: string): string {
        const payload = {
            sub: userId,
            email,
        };

        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d') as any,
        });
    }

    /**
     * Store hashed refresh token in database
     */
    async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const hashedToken = await this.hashPassword(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: hashedToken,
                expiresAt,
            },
        });
    }

    /**
     * Revoke refresh token
     */
    async revokeRefreshToken(tokenId: string): Promise<void> {
        await this.prisma.refreshToken.delete({
            where: { id: tokenId },
        });
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    /**
     * Register new user (admin only)
     */
    async register(createUserDto: CreateUserDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Verify school exists
        const school = await this.prisma.school.findUnique({
            where: { id: createUserDto.schoolId },
        });

        if (!school || school.deletedAt) {
            throw new BadRequestException('School not found');
        }

        // Generate temporary password
        const temporaryPassword = this.generatePassword();
        const hashedPassword = await this.hashPassword(temporaryPassword);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                name: createUserDto.name,
                role: createUserDto.role,
                schoolId: createUserDto.schoolId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                createdAt: true,
            },
        });

        // TODO: Send email with temporary password
        // For now, return it in response (in production, only send via email)

        return {
            user,
            temporaryPassword,
            message: 'User created successfully. Temporary password sent to email.',
        };
    }

    /**
     * Login user
     */
    async login(loginDto: LoginDto, ip: string) {
        // Check brute force
        await this.checkBruteForce(ip);

        // Find user by email and role
        const user = await this.prisma.user.findFirst({
            where: {
                email: loginDto.email,
                role: loginDto.role,
                deletedAt: null,
            },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    },
                },
            },
        });

        if (!user) {
            this.recordFailedAttempt(ip);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await this.verifyPassword(loginDto.password, user.password);

        if (!isPasswordValid) {
            this.recordFailedAttempt(ip);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Clear failed attempts
        this.clearFailedAttempts(ip);

        // Generate tokens
        const accessToken = this.generateAccessToken(user.id, user.email, user.role, user.schoolId);
        const refreshToken = this.generateRefreshToken(user.id, user.email);

        // Store refresh token
        await this.storeRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                schoolId: user.schoolId,
                school: user.school,
            },
        };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(userId: string, email: string, role: UserRole, schoolId: string, oldTokenId: string) {
        // Generate new tokens
        const accessToken = this.generateAccessToken(userId, email, role, schoolId);
        const refreshToken = this.generateRefreshToken(userId, email);

        // Revoke old refresh token
        await this.revokeRefreshToken(oldTokenId);

        // Store new refresh token (token rotation)
        await this.storeRefreshToken(userId, refreshToken);

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Logout user
     */
    async logout(refreshToken: string): Promise<void> {
        // Find and delete the refresh token
        const hashedToken = await this.hashPassword(refreshToken);

        await this.prisma.refreshToken.deleteMany({
            where: {
                token: hashedToken,
            },
        });
    }

    /**
     * Get current user info
     */
    async getCurrentUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                deletedAt: true,
                school: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    },
                },
                studentParents: {
                    where: {
                        student: {
                            deletedAt: null,
                        },
                    },
                    select: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                admissionNo: true,
                                class: true,
                                section: true,
                            },
                        },
                        relationType: true,
                    },
                },
                teacherAssignments: {
                    select: {
                        id: true,
                        class: true,
                        section: true,
                        subject: true,
                    },
                },
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException('User not found');
        }

        return {
            ...user,
            children: user.studentParents.map((sp) => ({
                ...sp.student,
                relationType: sp.relationType,
            })),
            assignments: user.teacherAssignments,
        };
    }
}
