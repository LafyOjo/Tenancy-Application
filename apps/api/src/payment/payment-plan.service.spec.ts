// @ts-nocheck
import assert from 'assert';
import { PaymentPlanService } from './payment-plan.service';

async function runTests() {
  const service = new PaymentPlanService();
  const start = new Date('2024-01-01');
  const schedule = service.generateSchedule(1000, 0.1, 2, start);
  assert.strictEqual(schedule.length, 2);
  assert.ok(Math.abs(schedule[0].amount - 550) < 0.01);
  assert.strictEqual(schedule[0].dueDate.getMonth(), 0);
  assert.strictEqual(schedule[1].dueDate.getMonth(), 1);

  service.autoDebitDuePayments(schedule, new Date('2024-01-15'));
  assert.ok(schedule[0].paid);

  service.markMissedAsDunning(schedule, new Date('2024-02-15'));
  assert.ok(schedule[1].inDunning);

  console.log('PaymentPlanService tests passed');
}

runTests();
