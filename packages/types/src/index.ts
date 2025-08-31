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

export type SubscriptionPlan =
  | 'standard'
  | 'priority_support'
  | 'discounted_repairs';

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

export interface PaymentScheduleItem {
  /** Date when the installment is due */
  dueDate: Date;
  /** Amount to be charged on the due date */
  amount: number;
  /** Whether the installment has been successfully paid */
  paid: boolean;
  /** Flag indicating the installment has moved to dunning */
  inDunning?: boolean;
}

export type TicketStatus = 'open' | 'in_progress' | 'completed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketType = 'maintenance' | 'support' | 'other';
export type AssignmentStatus = 'pending' | 'accepted' | 'declined';

export interface TicketCategory {
  id: string;
  orgId: string;
  name: string;
  slaHours: number;
}

export interface TicketNote {
  id: string;
  orgId: string;
  ticketId: string;
  authorId?: string;
  content: string;
  internal: boolean;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  orgId: string;
  unitId: string;
  createdById?: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId?: string;
  assignmentStatus: AssignmentStatus;
  eta?: Date;
  partsCost: number;
  labourCost: number;
  rating?: number;
  review?: string;
  categoryId?: string;
  category?: TicketCategory;
  notes: TicketNote[];
  createdAt: Date;
}

export interface UtilityProvider {
  id: string;
  name: string;
  rate: number;
  estimatedSavings: number;
}

export interface ReferralCommission {
  providerId: string;
  amount: number;
}

export interface DepositInsuranceQuote {
  /** Amount of traditional cash deposit */
  depositAmount: number;
  /** Recurring insurance premium cost */
  cost: number;
  /** Billing frequency for the premium, e.g. monthly */
  billingFrequency: string;
  /** URL to the insurance policy document */
  policyUrl: string;
}

export interface OrganizationTheme {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  emailTemplate?: string;
}

