import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Google OAuth Guard
 * Initiates Google OAuth flow
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
