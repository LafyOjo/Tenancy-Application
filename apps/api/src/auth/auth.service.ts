import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as speakeasy from 'speakeasy';

type RequestWithUser = Request & { user?: unknown };

@Injectable()
export class AuthService {
  googleLogin(req: RequestWithUser) {
    return req.user;
  }

  setupMfa() {
    const secret = speakeasy.generateSecret();
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
  }

  verifyMfa(token: string, secret: string) {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
    return { verified };
  }
}
