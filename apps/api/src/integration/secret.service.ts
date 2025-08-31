import { Injectable } from '@nestjs/common';

@Injectable()
export class SecretService {
  private store = new Map<string, string>();

  get(key: string): string | undefined {
    return this.store.get(key) || process.env[key];
  }

  set(key: string, value: string) {
    this.store.set(key, value);
  }
}
