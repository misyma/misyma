import { v7 as uuidv7 } from 'uuid';

import { type UuidService } from './uuidService.js';

export class UuidServiceImpl implements UuidService {
  public generateUuid(): string {
    return uuidv7();
  }
}
