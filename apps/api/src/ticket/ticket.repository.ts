import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from '../common/base.repository';

/** Repository for Ticket model scoped by organization. */
@Injectable({ scope: Scope.REQUEST })
export class TicketRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService, @Inject(REQUEST) request: Request) {
    super(prisma, request);
    this.model = prisma.ticket;
  }
}
