import { vi } from 'vitest';

export const queryClientMock = {
  invalidateQueries: vi.fn(),
  getDefaultOptions: vi.fn().mockImplementation(() => ({})),
};
