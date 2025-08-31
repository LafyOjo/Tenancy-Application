import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
  private allow: string[];
  private deny: string[];

  constructor() {
    this.allow =
      process.env.IP_ALLOW_LIST?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [];
    this.deny =
      process.env.IP_DENY_LIST?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [];
  }

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    if (this.deny.includes(ip)) {
      return res.status(403).send('Forbidden');
    }
    if (this.allow.length && !this.allow.includes(ip)) {
      return res.status(403).send('Forbidden');
    }
    next();
  }
}
