import { Injectable } from '@nestjs/common';
import { UtilityProvider, ReferralCommission } from '@tenancy/types';

@Injectable()
export class UtilityProviderService {
  private providers: UtilityProvider[] = [
    { id: '1', name: 'PowerCo', rate: 0.15, estimatedSavings: 100 },
    { id: '2', name: 'EnergyHub', rate: 0.13, estimatedSavings: 150 },
    { id: '3', name: 'GreenEnergy', rate: 0.17, estimatedSavings: 80 },
  ];

  private commissions: Record<string, number> = {};

  listProviders(): UtilityProvider[] {
    return this.providers;
  }

  switchProvider(providerId: string): void {
    this.commissions[providerId] = (this.commissions[providerId] || 0) + 50;
  }

  getReferralCommissions(): ReferralCommission[] {
    return Object.entries(this.commissions).map(([providerId, amount]) => ({
      providerId,
      amount,
    }));
  }
}
