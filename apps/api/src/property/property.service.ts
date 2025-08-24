import { Injectable, Scope } from '@nestjs/common';
import { PropertyRepository } from './property.repository';

/** Service demonstrating organization scoped queries using BaseRepository. */
@Injectable({ scope: Scope.REQUEST })
export class PropertyService {
  constructor(private readonly repo: PropertyRepository) {}

  list() {
    return this.repo.findMany();
  }
}
