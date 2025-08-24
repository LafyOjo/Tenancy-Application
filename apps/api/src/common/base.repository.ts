import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

/**
 * BaseRepository provides reusable helpers for scoping queries to the
 * current organization and performing soft deletes. All extending
 * repositories are request scoped so that the orgId can be resolved
 * from the current request.
 */
@Injectable({ scope: Scope.REQUEST })
export abstract class BaseRepository<T> {
  /** Underlying Prisma model delegate (e.g. prisma.property). */
  protected model: any;

  constructor(
    protected readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /** Convenience accessor for the organization id on the request. */
  protected get orgId(): string {
    return (this.request as any).orgId;
  }

  /** Find many records scoped to the current organization. */
  findMany(args: any = {}) {
    return this.model.findMany({
      ...args,
      where: { ...(args.where || {}), orgId: this.orgId, deletedAt: null },
    });
  }

  /** Find a single record by id within the organization scope. */
  findUnique(id: string, args: any = {}) {
    return this.model.findFirst({
      ...args,
      where: { ...(args.where || {}), id, orgId: this.orgId, deletedAt: null },
    });
  }

  /** Create a new record tied to the current organization. */
  create(data: any) {
    return this.model.create({
      data: { ...data, orgId: this.orgId },
    });
  }

  /** Update a record by id within the organization scope. */
  update(id: string, data: any) {
    return this.model.updateMany({
      where: { id, orgId: this.orgId },
      data,
    });
  }

  /** Soft delete a record by setting deletedAt instead of removing. */
  softDelete(id: string) {
    return this.model.updateMany({
      where: { id, orgId: this.orgId },
      data: { deletedAt: new Date() },
    });
  }
}
