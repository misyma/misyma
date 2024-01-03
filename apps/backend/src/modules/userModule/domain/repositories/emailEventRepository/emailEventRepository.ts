export interface FindAllCreatedAfterPayload {
  after: Date;
}

export interface UpdateStatusPayload {
  id: string;
  status: string;
}

export interface EmailEventRepository {
  findAllCreatedAfter(payload: FindAllCreatedAfterPayload): Promise<unknown[]>;
  findAllUnprocessed(): Promise<unknown[]>;
  updateStatus(payload: UpdateStatusPayload): Promise<void>;
  deleteProcessed(): Promise<void>;
}
