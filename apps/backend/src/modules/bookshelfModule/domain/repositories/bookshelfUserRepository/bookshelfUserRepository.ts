export interface ExistsPayload {
  id: string;
}

export interface BookshelfUserRepository {
  exists(payload: ExistsPayload): Promise<boolean>;
}
