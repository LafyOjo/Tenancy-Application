export type ChecklistItem = {
  id: string;
  description: string;
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  items: ChecklistItem[];
};

export const inspectionTemplates: ChecklistTemplate[] = [
  {
    id: 'fire-safety',
    name: 'Fire Safety',
    items: [
      { id: 'smoke-detectors', description: 'Smoke detectors operational' },
      { id: 'fire-extinguishers', description: 'Fire extinguishers accessible' },
      { id: 'exits-clear', description: 'Exits are clear and marked' },
    ],
  },
  {
    id: 'mold',
    name: 'Mold',
    items: [
      { id: 'visible-mold', description: 'No visible mold present' },
      { id: 'ventilation', description: 'Adequate ventilation in rooms' },
      { id: 'moisture', description: 'No signs of moisture or leaks' },
    ],
  },
];

export function getTemplate(id: string): ChecklistTemplate | undefined {
  return inspectionTemplates.find((t) => t.id === id);
}
