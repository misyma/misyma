import { MockedObject, vi } from 'vitest';
import { UseErrorHandledMutation } from '../../modules/common/hooks/useErrorHandledMutation';

const mutationMock: MockedObject<UseErrorHandledMutation<unknown, unknown, unknown>> = {
  context: {},
  data: {},
  error: {},
  failureCount: 0,
  failureReason: '',
  isError: false,
  isIdle: false,
  isPaused: false,
  isPending: false,
  isSuccess: false,
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  status: 'pending',
  submittedAt: 0,
  variables: {},
};

export const createMutationMock = () => ({ ...mutationMock });

