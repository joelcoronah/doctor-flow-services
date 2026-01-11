import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Facebook OAuth Guard
 * Initiates Facebook OAuth flow
 */
@Injectable()
export class FacebookOAuthGuard extends AuthGuard('facebook') {}
