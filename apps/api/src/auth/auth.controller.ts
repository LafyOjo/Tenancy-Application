import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Post('mfa/setup')
  @UseGuards(AuthGuard('jwt'))
  setupMfa() {
    return this.authService.setupMfa();
  }

  @Post('mfa/verify')
  @UseGuards(AuthGuard('jwt'))
  verifyMfa(@Body('token') token: string, @Body('secret') secret: string) {
    return this.authService.verifyMfa(token, secret);
  }
}
