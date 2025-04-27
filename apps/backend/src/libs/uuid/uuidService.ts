import { v7 as uuid } from 'uuid';

export class UuidService {
  public generateUuid(): string {
    return uuid();
  }
}
