import { Injectable, Scope } from '@nestjs/common';
import { LeaseRepository } from '../lease/lease.repository';
import { GreenScoreRepository } from '../green/green-score.repository';

@Injectable({ scope: Scope.REQUEST })
export class PricingService {
  constructor(
    private readonly leases: LeaseRepository,
    private readonly greenScores: GreenScoreRepository,
  ) {}

  /**
   * Compute suggested rent for a unit using simple factors.
   * Currently uses local yield, occupancy and seasonality constants.
   */
  async suggest(unitId: string) {
    const [lease] = await this.leases.findMany({
      where: { unitId },
      orderBy: { startDate: 'desc' },
      take: 1,
    });
    const currentRent = lease?.rentAmount ?? 0;
    const baseRent = this.computeSuggested(currentRent);
    const [gs] = await this.greenScores.findMany({
      where: { unitId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    const premium = gs?.score ?? 0;
    const suggestedRent = Math.round(baseRent * (1 + premium / 1000));
    return { leaseId: lease?.id, currentRent, suggestedRent };
  }

  /** Basic formula for suggested rent. */
  private computeSuggested(current: number) {
    const LOCAL_YIELD = 1.05; // 5% increase
    const OCCUPANCY = 0.95; // 95% occupancy factor
    const SEASONALITY = 1.1; // 10% seasonal uplift
    return Math.round(current * LOCAL_YIELD * OCCUPANCY * SEASONALITY);
  }
}
