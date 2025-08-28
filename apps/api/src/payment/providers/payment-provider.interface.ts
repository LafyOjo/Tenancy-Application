export interface PaymentProvider {
  name: string;
  createMandate(leaseId: string): Promise<{ id: string; url: string }>;
  createOneOffLink(invoiceId: string): Promise<{ url: string }>;
  createSubscription(plan: string): Promise<{ url: string }>;
  parseWebhook(payload: any): Promise<{ id: string; invoiceId: string; amount: number; type: string }>;
}
