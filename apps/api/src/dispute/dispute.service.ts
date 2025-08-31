import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Dispute } from '@tenancy/types';

@Injectable()
export class DisputeService {
  private disputes: Dispute[] = [
    {
      id: randomUUID(),
      claimant: 'Tenant A',
      respondent: 'Landlord B',
      issue: 'Late deposit',
      status: 'open',
      createdAt: new Date(),
    },
  ];

  list(): Dispute[] {
    return this.disputes;
  }
}
