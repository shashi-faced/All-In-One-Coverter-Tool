import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name || dto.email.split('@')[0],
        subscription: {
          create: {
            planId: 'free',
            tier: 'FREE',
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            dailyConversionLimit: 10,
            maxFileSize: BigInt(104857600),
            storageLimit: BigInt(500000000),
          },
        },
      },
    });

    const tokens = await this.generateTokens(user);

    this.logger.log(`New user registered: ${user.email}`);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async loginAndGenerateApiKey(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if an active API key already exists
    let apiKey = await this.prisma.apiKey.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!apiKey) {
      // Create a new one
      const keyStr = `cf_${crypto.randomBytes(32).toString('hex')}`;
      apiKey = await this.prisma.apiKey.create({
        data: {
          userId: user.id,
          name: 'Programmatic API Key',
          key: keyStr,
        },
      });
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      apiKey: apiKey.key,
      createdAt: apiKey.createdAt,
    };
  }

  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.googleId, avatarUrl: googleUser.avatarUrl },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            googleId: googleUser.googleId,
            name: googleUser.name,
            avatarUrl: googleUser.avatarUrl,
            emailVerified: true,
            subscription: {
              create: {
                planId: 'free',
                tier: 'FREE',
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                dailyConversionLimit: 10,
                maxFileSize: BigInt(104857600),
                storageLimit: BigInt(500000000),
              },
            },
          },
        });
      }
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.usageLog.create({
      data: {
        userId: 'system',
        action: 'SEND_OTP',
        resource: email,
        metadata: { otp, expiresAt },
      },
    });

    this.logger.log(`OTP sent to ${email}: ${otp}`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string, name?: string) {
    const log = await this.prisma.usageLog.findFirst({
      where: {
        action: 'SEND_OTP',
        resource: email,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!log || (log.metadata as any)?.['otp'] !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          emailVerified: true,
          subscription: {
            create: {
              planId: 'free',
              tier: 'FREE',
              currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              dailyConversionLimit: 10,
              maxFileSize: BigInt(104857600),
              storageLimit: BigInt(500000000),
            },
          },
        },
      });
      }

      const tokens = await this.generateTokens(user);
      return { user: this.sanitizeUser(user), ...tokens };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
