import { Injectable, Scope } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { S3Service } from '../s3.service';

@Injectable({ scope: Scope.REQUEST })
export class UnitService {
  constructor(
    private readonly repo: UnitRepository,
    private readonly s3: S3Service,
  ) {}

  list(propertyId: string) {
    return this.repo.findMany({ where: { propertyId } });
  }

  get(id: string) {
    return this.repo.findUnique(id);
  }

  create(data: {
    name: string;
    propertyId: string;
    virtualTourEmbedUrl?: string;
  }) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.softDelete(id);
  }

  async createPhotoUpload(id: string, filename: string, contentType: string) {
    const key = `units/${id}/${Date.now()}-${filename}`;
    const signed = await this.s3.getSignedUploadUrl(key, contentType);
    await this.repo.update(id, { imageUrl: signed.url });
    return signed;
  }

  async createVirtualTourImageUpload(
    id: string,
    filename: string,
    contentType: string,
  ) {
    const key = `units/${id}/virtual-tours/${Date.now()}-${filename}`;
    const signed = await this.s3.getSignedUploadUrl(key, contentType);
    await this.repo.update(id, {
      virtualTourImages: { push: signed.url },
    });
    return signed;
  }
}

