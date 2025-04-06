import { beforeEach, expect, it, vi } from 'vitest';
import { useToastMock } from '../../common/components/toast/__mocks__/use-toast.mocks';
import { createMutationMock } from '../../../tests/mocks/mutationMock';
import { renderHook } from '@testing-library/react';
import { useCreateBookshelf } from './useCreateBookshelf';

vi.mock('../../common/components/toast/use-toast', () => ({
  useToast: vi.fn().mockImplementation(() => useToastMock),
}));

const createBookshelfMock = createMutationMock();

vi.mock('../api/mutations/createBookshelfMutation/createBookshelfMutation', () => ({
  useCreateBookshelfMutation: vi.fn().mockImplementation(() => createBookshelfMock),
}));

const uploadBookshelfImageMock = createMutationMock();

vi.mock('../api/mutations/uploadBookshelfImageMutation/uploadBookshelfImageMutation', () => ({
  useUploadBookshelfImageMutation: vi.fn().mockImplementation(() => uploadBookshelfImageMock),
}));

const onSuccessStub = vi.fn();

const renderTestedHook = () => {
  const {
    result: {
      current: { create, isProcessing },
    },
    rerender,
    unmount,
  } = renderHook(() =>
    useCreateBookshelf({
      onSuccess: onSuccessStub,
    }),
  );

  return {
    rerender,
    unmount,
    create,
    isProcessing,
  };
};

beforeEach(() => vi.clearAllMocks());

it('Stops processing - on bookshelf creation error', async () => {
  const { create } = renderTestedHook();

  createBookshelfMock.mutateAsync.mockRejectedValueOnce(new Error('Oh noes'));

  await create({
    name: 'Mein name',
    image: new File([], 'No'),
  });

  expect(useToastMock.toast).not.toHaveBeenCalled();
});

it('Stops processing - on image upload error', async () => {
  const { create } = renderTestedHook();

  uploadBookshelfImageMock.mutateAsync.mockRejectedValueOnce(new Error('Oh noes'));

  await create({
    name: 'Mein name',
    image: new File([], 'No'),
  });

  expect(useToastMock.toast).not.toHaveBeenCalled();
});

it('Invokes onSuccess', async () => {
  const { create } = renderTestedHook();

  createBookshelfMock.mutateAsync.mockResolvedValueOnce({
    bookshelfId: 'MeinId',
  });

  await create({
    name: 'Mein name',
    image: new File([], 'No'),
  });

  expect(onSuccessStub).toHaveBeenCalled();
});

it('Adds success toast', async () => {
  const { create } = renderTestedHook();

  createBookshelfMock.mutateAsync.mockResolvedValueOnce({
    bookshelfId: 'MeinId',
  });

  await create({
    name: 'Mein name',
    image: new File([], 'No'),
  });

  expect(useToastMock.toast).toHaveBeenCalledWith({
    title: 'Półka: Mein name została stworzona :)',
    variant: 'success',
  });
});
