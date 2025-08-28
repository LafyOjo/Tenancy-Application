import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NoticeRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.NoticeCreateInput) {
    return this.prisma.notice.create({ data });
  }

  update(id: string, data: Prisma.NoticeUpdateInput) {
    return this.prisma.notice.update({ where: { id }, data });
  }

  findById(id: string) {
    return this.prisma.notice.findUnique({ where: { id } });
  }
}
