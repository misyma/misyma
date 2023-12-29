export type CachedValue = {
  key: string;
};

export interface SetPayload<T extends CachedValue> {
  value: T;
}

export interface GetPayload {
  key: string;
}

export interface CacheProvider<T extends CachedValue> {
  get(payload: GetPayload): Promise<T | null>;
  set(payload: SetPayload<T>): Promise<void>;
  purge(): Promise<void>;
}
