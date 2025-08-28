export interface User {
  id: string;
  email: string;
}

export type NoticeType = 'section21' | 'hud';

export interface Notice {
  id: string;
  leaseId: string;
  type: NoticeType;
  pdfUrl: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface LateFeePolicy {
  /** Amount applied when invoice is 3 days overdue */
  firstLateFee: number;
  /** Amount applied when invoice is 7 days overdue */
  secondLateFee: number;
}

export interface LedgerEntry {
  id: string;
  orgId: string;
  leaseId?: string;
  date: Date;
  description?: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

export interface SublettingApproval {
  id: string;
  orgId: string;
  leaseId: string;
  revenueShare: number;
  createdAt: Date;
}

export interface AirbnbIntegration {
  id: string;
  orgId: string;
  listingId: string;
  active: boolean;
  createdAt: Date;
}

export interface SublettingPayout {
  id: string;
  orgId: string;
  approvalId: string;
  amount: number;
  platformFee: number;
  createdAt: Date;
}
