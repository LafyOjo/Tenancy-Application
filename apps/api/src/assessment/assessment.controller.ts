import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AssessmentService } from './assessment.service';

const ItemSchema = z.object({
  status: z.enum(['pass', 'fail']),
  photo: z.string().optional(),
});

const AssessmentCreate = z.object({
  templateId: z.string(),
  items: z.record(ItemSchema),
});

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly service: AssessmentService) {}

  @Post()
  create(@Body() body: any) {
    const data = AssessmentCreate.parse(body);
    return this.service.create(data);
  }
}
