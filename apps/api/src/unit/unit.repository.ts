import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from '../common/base.repository';

@Injectable({ scope: Scope.REQUEST })
export class UnitRepository extends BaseRepository<any> {
  constructor(
    prisma: PrismaService,
    @Inject(REQUEST) request: Request,
  ) {
    super(prisma, request);
    this.model = prisma.unit;
  }
}

