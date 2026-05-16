import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId') || 'dummy',
      clientSecret: configService.get<string>('google.clientSecret') || 'dummy',
      callbackURL: configService.get<string>('google.callbackUrl') || 'http://localhost:4000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });

    if (!configService.get<string>('google.clientId')) {
      this.logger.warn('Google OAuth not configured - using dummy credentials');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      googleId: profile.id,
      name: name.givenName + ' ' + name.familyName,
      avatarUrl: photos[0]?.value,
    };
    done(null, user);
  }
}
