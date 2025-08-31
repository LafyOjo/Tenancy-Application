import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface MarketRecord {
  area: string;
  yield: number;
  vacancy: number;
}

@Injectable()
export class MarketDataService {
  private cache: MarketRecord[] | null = null;

  private async load(): Promise<MarketRecord[]> {
    if (!this.cache) {
      const file = await readFile(join(__dirname, 'market-data.json'), 'utf8');
      this.cache = JSON.parse(file) as MarketRecord[];
    }
    return this.cache;
  }

  async compare(area: string, localYield: number, localVacancy: number) {
    const data = await this.load();
    const yields = data.map((d) => d.yield);
    const vacancies = data.map((d) => d.vacancy);
    const yieldPercentile = this.percentileRank(yields, localYield);
    const vacancyPercentile = this.percentileRank(vacancies, localVacancy);
    const region = data.find((d) => d.area === area);
    return {
      area,
      marketYield: region?.yield ?? null,
      marketVacancy: region?.vacancy ?? null,
      yieldPercentile,
      vacancyPercentile,
    };
  }

  private percentileRank(values: number[], value: number) {
    const sorted = [...values].sort((a, b) => a - b);
    const below = sorted.filter((v) => v <= value).length;
    return Math.round((below / sorted.length) * 100);
  }
}
