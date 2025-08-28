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
