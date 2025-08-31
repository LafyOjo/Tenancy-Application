import { Injectable, Scope } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { UtilityReadingRepository } from '../utility/utility-reading.repository';
import { GreenScoreRepository } from './green-score.repository';

@Injectable({ scope: Scope.REQUEST })
export class GreenService {
  constructor(
    private readonly readings: UtilityReadingRepository,
    private readonly scores: GreenScoreRepository,
  ) {}

  /**
   * Get the latest green score and trend for a unit.
   * If no score exists, one will be computed from recent utility readings.
   */
  async getScore(unitId: string) {
    const [latest] = await this.scores.findMany({
      where: { unitId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    const score = latest ? latest.score : await this.recordScore(unitId);
    const history = await this.scores.findMany({
      where: { unitId },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });
    return { score, trend: history.map((h) => h.score) };
  }

  /**
   * Compute a new green score from recent utility readings and persist it.
   * A simple formula inversely relates consumption to score.
   */
  async recordScore(unitId: string) {
    const readings = await this.readings.findMany({
      where: { unitId },
      orderBy: { recordedAt: 'desc' },
      take: 5,
    });
    const avg = readings.length
      ? readings.reduce((s, r) => s + r.reading, 0) / readings.length
      : 0;
    const score = Math.max(0, 100 - avg);
    await this.scores.create({ unitId, score });
    return score;
  }

  /** Generate a PDF report with the current score and basic tips. */
  async generateReport(unitId: string) {
    const { score, trend } = await this.getScore(unitId);
    const doc = new PDFDocument();
    doc.fontSize(20).text('Energy Efficiency Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Unit ID: ${unitId}`);
    doc.text(`Green score: ${score.toFixed(1)}`);
    doc.text(`Trend: ${trend.join(' -> ')}`);
    doc.moveDown();
    doc.text('Tips to improve efficiency:');
    doc.list([
      'Install LED lighting and smart thermostats.',
      'Improve insulation and seal drafts.',
    ]);
    doc.end();
    const chunks: Buffer[] = [];
    return await new Promise<Buffer>((resolve) => {
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
