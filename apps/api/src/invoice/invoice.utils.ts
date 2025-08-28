export interface Lease {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  rentAmount: number;
  rentFrequency: 'weekly' | 'monthly';
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
  taxRate?: number;
}

export interface InvoiceData {
  leaseId: string;
  periodStart: Date;
  periodEnd: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export function calculateTotals(lineItems: InvoiceLineItem[]) {
  let subtotal = 0;
  let tax = 0;
  for (const item of lineItems) {
    subtotal += item.amount;
    if (item.taxRate) tax += item.amount * item.taxRate;
  }
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function prorateMonthly(amount: number, start: Date, end: Date): number {
  const daysInPeriod = (end.getTime() - start.getTime()) / 86400000 + 1;
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  return (amount * daysInPeriod) / daysInMonth;
}

/** Generate invoice for the period containing `date` without persistence. */
export function generateInvoiceForDate(
  lease: Lease,
  date: Date,
  extraItems: InvoiceLineItem[] = [],
): InvoiceData | null {
  if (lease.rentFrequency === 'monthly') {
    const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    if (periodEnd < lease.startDate) return null;
    if (lease.endDate && periodStart > lease.endDate) return null;
    const start = lease.startDate > periodStart ? lease.startDate : periodStart;
    const end = lease.endDate && lease.endDate < periodEnd ? lease.endDate : periodEnd;
    const amount = prorateMonthly(lease.rentAmount, start, end);
    const lineItems = [{ description: 'Rent', amount }, ...extraItems];
    const totals = calculateTotals(lineItems);
    return { leaseId: lease.id, periodStart: start, periodEnd: end, lineItems, ...totals };
  } else {
    const diff = Math.floor((date.getTime() - lease.startDate.getTime()) / 86400000);
    if (diff < 0) return null;
    const periodIndex = Math.floor(diff / 7);
    const periodStart = new Date(lease.startDate.getTime() + periodIndex * 7 * 86400000);
    let periodEnd = new Date(periodStart.getTime() + 6 * 86400000);
    if (lease.endDate && periodStart > lease.endDate) return null;
    if (lease.endDate && periodEnd > lease.endDate) periodEnd = lease.endDate;
    const days = (periodEnd.getTime() - periodStart.getTime()) / 86400000 + 1;
    const amount = lease.rentAmount * (days / 7);
    const lineItems = [{ description: 'Rent', amount }, ...extraItems];
    const totals = calculateTotals(lineItems);
    return { leaseId: lease.id, periodStart, periodEnd, lineItems, ...totals };
  }
}
