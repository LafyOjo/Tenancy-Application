interface PaymentScheduleItem {
  dueDate: Date;
  amount: number;
  paid?: boolean;
  inDunning?: boolean;
}

export class PaymentPlanService {
  generateSchedule(
    principal: number,
    interestRate: number,
    installments: number,
    startDate: Date,
  ): PaymentScheduleItem[] {
    const totalInterest = principal * interestRate;
    const total = principal + totalInterest;
    const installmentAmount = Math.round((total / installments) * 100) / 100;
    const schedule: PaymentScheduleItem[] = [];
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({ dueDate, amount: installmentAmount, paid: false });
    }
    return schedule;
  }

  autoDebitDuePayments(schedule: PaymentScheduleItem[], today = new Date()): void {
    schedule.forEach((item) => {
      if (!item.paid && item.dueDate <= today) {
        item.paid = true;
      }
    });
  }

  markMissedAsDunning(schedule: PaymentScheduleItem[], today = new Date()): void {
    schedule.forEach((item) => {
      if (!item.paid && item.dueDate < today) {
        item.inDunning = true;
      }
    });
  }
}
