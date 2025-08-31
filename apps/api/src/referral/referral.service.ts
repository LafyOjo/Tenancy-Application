import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ReferralLink,
  ReferralAttribution,
  PayoutLedgerEntry,
} from '@tenancy/types';
import { UtilityProviderService } from '../utility-provider/utility-provider.service';

@Injectable()
export class ReferralService {
  private links: ReferralLink[] = [];
  private attributions: ReferralAttribution[] = [];
  private ledger: PayoutLedgerEntry[] = [];

  constructor(private readonly providerService: UtilityProviderService) {}

  generateLink(providerId: string): ReferralLink {
    const code = randomUUID().slice(0, 8);
    const url = `${process.env.WEB_URL || 'http://localhost:3000'}/ref/${code}`;
    const link: ReferralLink = { code, providerId, url };
    this.links.push(link);
    return link;
  }

  trackReferral(code: string): ReferralAttribution | undefined {
    const link = this.links.find((l) => l.code === code);
    if (!link) return undefined;
    const provider = this.providerService
      .listProviders()
      .find((p) => p.id === link.providerId);
    if (!provider) return undefined;
    const commission = provider.estimatedSavings * 0.1;
    const attribution: ReferralAttribution = {
      id: randomUUID(),
      providerId: link.providerId,
      code: link.code,
      commission,
      createdAt: new Date(),
    };
    this.attributions.push(attribution);
    const payout: PayoutLedgerEntry = {
      id: randomUUID(),
      referralId: attribution.id,
      amount: commission,
      paid: false,
      createdAt: new Date(),
    };
    this.ledger.push(payout);
    return attribution;
  }

  getLedger(): PayoutLedgerEntry[] {
    return this.ledger;
  }
}
