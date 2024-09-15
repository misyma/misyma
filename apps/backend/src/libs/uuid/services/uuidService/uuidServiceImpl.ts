import { randomUUID } from 'node:crypto';

import { type UuidService } from './uuidService.js';

export class UuidServiceImpl implements UuidService {
  public generateUuid(): string {
    return randomUUID();
  }
}
