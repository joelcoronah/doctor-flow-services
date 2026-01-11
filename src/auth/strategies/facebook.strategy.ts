import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    // Use placeholder values if OAuth is not configured
    const clientID = process.env.FACEBOOK_APP_ID || 'not-configured';
    const clientSecret = process.env.FACEBOOK_APP_SECRET || 'not-configured';
    
    super({
      clientID,
      clientSecret,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  /**
   * Validate Facebook OAuth profile
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      provider: 'facebook' as const,
      providerId: id,
      email: emails?.[0]?.value || `${id}@facebook.com`,
      name: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
      photo: photos?.[0]?.value,
    };
    
    done(null, user);
  }
}
