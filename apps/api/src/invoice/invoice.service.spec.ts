// @ts-nocheck
import assert from 'assert';
import {
  Lease,
  generateInvoiceForDate,
  calculateTotals,
} from './invoice.utils';

async function runTests() {
  // Monthly proration tests
  {
    const lease: Lease = {
      id: 'l1',
      startDate: new Date('2024-04-10'),
      endDate: new Date('2024-06-20'),
      rentAmount: 1000,
      rentFrequency: 'monthly',
    };
    const invoice1 = generateInvoiceForDate(lease, new Date('2024-04-15'))!;
    assert.ok(Math.abs(invoice1.total - 700) < 0.01);
    const invoice2 = generateInvoiceForDate(lease, new Date('2024-06-10'))!;
    assert.ok(Math.abs(invoice2.total - (1000 * 20) / 30) < 0.01);
  }

  // Weekly proration tests
  {
    const lease: Lease = {
      id: 'l2',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'),
      rentAmount: 700,
      rentFrequency: 'weekly',
    };
    const invoice1 = generateInvoiceForDate(lease, new Date('2024-01-03'))!;
    assert.ok(Math.abs(invoice1.total - 700) < 0.01);
    const invoice2 = generateInvoiceForDate(lease, new Date('2024-01-08'))!;
    assert.ok(Math.abs(invoice2.total - 300) < 0.01);
  }

  // Line item + tax test
  {
    const totals = calculateTotals([
      { description: 'Rent', amount: 1000, taxRate: 0.1 },
      { description: 'Service', amount: 100 },
    ]);
    assert.strictEqual(totals.subtotal, 1100);
    assert.ok(Math.abs(totals.tax - 100) < 0.01);
    assert.ok(Math.abs(totals.total - 1200) < 0.01);
  }

  console.log('All tests passed');
}

runTests();
