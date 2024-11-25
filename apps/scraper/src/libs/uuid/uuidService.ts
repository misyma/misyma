import { v7 as uuidv7 } from 'uuid';

export class UuidService {
  public generateUuid(): string {
    return uuidv7();
  }
}
