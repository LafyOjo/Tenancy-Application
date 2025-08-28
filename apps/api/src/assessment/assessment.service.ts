import { Injectable } from '@nestjs/common';

interface AssessmentItem {
  id: string;
  status: 'pass' | 'fail';
  photo?: string;
}

interface AssessmentData {
  templateId: string;
  items: Record<string, AssessmentItem>;
}

let counter = 1;

@Injectable()
export class AssessmentService {
  private assessments: any[] = [];

  create(data: AssessmentData) {
    const needsReview = Object.values(data.items).some(
      (item) => item.status === 'fail' || !item.photo,
    );
    const assessment = {
      id: String(counter++),
      ...data,
      needsReview,
    };
    this.assessments.push(assessment);
    return { id: assessment.id, needsReview };
  }
}
