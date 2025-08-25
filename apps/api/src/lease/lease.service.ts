import { Injectable, Scope } from '@nestjs/common';
import { LeaseRepository } from './lease.repository';

@Injectable({ scope: Scope.REQUEST })
export class LeaseService {
  constructor(private readonly repo: LeaseRepository) {}

  create(data: {
    unitId: string;
    householdId: string;
    startDate: Date;
    endDate?: Date;
    rentAmount: number;
    rentFrequency: string;
    depositAmount?: number;
    utilityAllowances?: any;
    autoRenew?: boolean;
    breakClause?: string;
    status?: string;
  }) {
    return this.repo.create({
      ...data,
      autoRenew: data.autoRenew ?? false,
      status: data.status ?? 'draft',
    });
  }
}

