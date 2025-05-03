import { setupServer } from 'msw/node';
import { ApiError, ApiErrorContext } from '../../common/errors/apiError.js';
import { ErrorCodeMessageMapper } from '../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { api, PaginatedApiResponse } from './apiClient.js';
import { http, HttpResponse } from 'msw';

const API_URL = 'https://api.misyma.com/api/test';

const server = setupServer(
  http.get(API_URL, () => HttpResponse.json({ success: true }, { status: 200 })),
  http.post(API_URL, () => HttpResponse.json({ success: true }, { status: 200 })),
  http.patch(API_URL, () => HttpResponse.json({ success: true }, { status: 200 })),
  http.delete(API_URL, () => HttpResponse.json({ success: true }, { status: 200 })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mapper = {
  map: vi.fn(() => 'Mapped error'),
} as unknown as ErrorCodeMessageMapper;

const errorResponse = () =>
  HttpResponse.json({ message: 'ERROR', context: { originalError: 'fail' } }, { status: 400 });

class TestApiError extends ApiError {
  public constructor(context: ApiErrorContext) {
    super('TestApiError', context);
  }
}

describe('api client', () => {
  it('should GET successfully', async () => {
    const res = await api.get(API_URL, { mapper, errorCtor: TestApiError });
    expect(res.data.success).toBe(true);
  });

  it('should POST successfully', async () => {
    const res = await api.post(API_URL, { key: 'value' }, { mapper, errorCtor: TestApiError });
    expect(res.data.success).toBe(true);
  });

  it('should PATCH successfully', async () => {
    const res = await api.patch(API_URL, { key: 'value' }, { mapper, errorCtor: TestApiError });
    expect(res.data.success).toBe(true);
  });

  it('should DELETE successfully', async () => {
    const res = await api.delete(API_URL, { key: 'value' }, { mapper, errorCtor: TestApiError });
    expect(res.data.success).toBe(true);
  });

  it('should fail on GET error', async () => {
    server.use(http.get(API_URL, errorResponse));
    expect.assertions(1);
    try {
      await api.get(API_URL, { mapper, errorCtor: TestApiError });
    } catch (error) {
      expect(error).toBeInstanceOf(TestApiError);
    }
  });

  it('should fail on POST error', async () => {
    server.use(http.post(API_URL, errorResponse));
    expect.assertions(1);
    try {
      await api.post(API_URL, { key: 'value' }, { mapper, errorCtor: TestApiError });
    } catch (error) {
      expect(error).toBeInstanceOf(TestApiError);
    }
  });

  it('should fail on PATCH error', async () => {
    server.use(http.patch(API_URL, errorResponse));
    expect.assertions(1);
    try {
      await api.patch(API_URL, { key: 'value' }, { mapper, errorCtor: TestApiError });
    } catch (error) {
      expect(error).toBeInstanceOf(TestApiError);
    }
  });

  it('should fail on DELETE error', async () => {
    server.use(http.delete(API_URL, errorResponse));
    expect.assertions(1);
    try {
      await api.delete(API_URL, { key: 'value' }, { mapper, errorCtor: TestApiError });
    } catch (error) {
      expect(error).toBeInstanceOf(TestApiError);
    }
  });

  it('getPreviousPageParam should return correct previous page', () => {
    const paginatedResponse: PaginatedApiResponse = {
      data: [],
      metadata: { page: 3, pageSize: 10, total: 50 },
    };
    expect(api.getPreviousPageParam(paginatedResponse)).toBe(2);
  });

  it('getPreviousPageParam should return undefined if on first page', () => {
    const paginatedResponse: PaginatedApiResponse = {
      data: [],
      metadata: { page: 1, pageSize: 10, total: 50 },
    };
    expect(api.getPreviousPageParam(paginatedResponse)).toBeUndefined();
  });
});
