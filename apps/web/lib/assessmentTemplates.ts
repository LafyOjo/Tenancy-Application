export type AssessmentItem = {
  id: string;
  description: string;
};

export type AssessmentTemplate = {
  id: string;
  name: string;
  items: AssessmentItem[];
};

export const assessmentTemplates: AssessmentTemplate[] = [
  {
    id: 'minor-damage',
    name: 'Minor Damage',
    items: [
      { id: 'walls', description: 'Check walls for cracks or marks' },
      { id: 'fixtures', description: 'Inspect fixtures for damage' },
      { id: 'appliances', description: 'Ensure appliances are functional' },
    ],
  },
  {
    id: 'cleanliness',
    name: 'Cleanliness',
    items: [
      { id: 'kitchen', description: 'Kitchen surfaces are clean' },
      { id: 'bathroom', description: 'Bathroom is sanitized' },
      { id: 'flooring', description: 'Floors are free of debris' },
    ],
  },
];

export function getTemplate(id: string): AssessmentTemplate | undefined {
  return assessmentTemplates.find((t) => t.id === id);
}
