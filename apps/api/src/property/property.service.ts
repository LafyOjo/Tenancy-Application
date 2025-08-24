import { Injectable, Scope } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
import { S3Service } from '../s3.service';
import { UnitRepository } from '../unit/unit.repository';

@Injectable({ scope: Scope.REQUEST })
export class PropertyService {
  constructor(
    private readonly repo: PropertyRepository,
    private readonly s3: S3Service,
    private readonly unitRepo: UnitRepository,
  ) {}

  list() {
    return this.repo.findMany({ include: { units: true } });
  }

  get(id: string) {
    return this.repo.findUnique(id, { include: { units: true } });
  }

  create(data: { name: string; address?: string }) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.softDelete(id);
  }

  async createPhotoUpload(id: string, filename: string, contentType: string) {
    const key = `properties/${id}/${Date.now()}-${filename}`;
    const signed = await this.s3.getSignedUploadUrl(key, contentType);
    await this.repo.update(id, { imageUrl: signed.url });
    return signed;
  }

  /** Convert properties and units to CSV string. */
  async exportCsv() {
    const properties = await this.repo.findMany({ include: { units: true } });
    const lines = ['propertyName,propertyAddress,unitName'];
    for (const p of properties) {
      if (p.units.length === 0) {
        lines.push(`${this.escape(p.name)},${this.escape(p.address || '')},`);
      }
      for (const u of p.units) {
        lines.push(
          `${this.escape(p.name)},${this.escape(p.address || '')},${this.escape(u.name)}`,
        );
      }
    }
    return lines.join('\n');
  }

  /** Import properties and units from CSV. */
  async importCsv(csv: string, commit = false) {
    const { headers, rows } = this.parseCsv(csv);
    const required = ['propertyName', 'unitName'];
    const missing = required.filter((h) => !headers.includes(h));
    if (missing.length) {
      return { preview: [], errors: [{ row: 1, message: `Missing headers: ${missing.join(', ')}` }] };
    }

    const errors: any[] = [];
    const valid: any[] = [];
    rows.forEach((row, idx) => {
      if (!row.propertyName || !row.unitName) {
        errors.push({ row: idx + 2, message: 'propertyName and unitName are required' });
      } else {
        valid.push(row);
      }
    });

    if (!commit) {
      return { preview: valid, errors };
    }

    const propertyMap = new Map<string, any>();
    for (const row of valid) {
      let property = propertyMap.get(row.propertyName);
      if (!property) {
        property = await this.repo.create({
          name: row.propertyName,
          address: row.propertyAddress || undefined,
        });
        propertyMap.set(row.propertyName, property);
      }
      await this.unitRepo.create({ name: row.unitName, propertyId: property.id });
    }

    return { imported: valid.length, errors };
  }

  private parseCsv(text: string) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines.shift()?.split(',') || [];
    const rows = lines
      .filter((l) => l.trim().length > 0)
      .map((line) => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((h, i) => (row[h] = values[i] || ''));
        return row;
      });
    return { headers, rows };
  }

  private escape(value: string) {
    if (value === undefined || value === null) return '';
    if (/[",\n]/.test(value)) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }
}
