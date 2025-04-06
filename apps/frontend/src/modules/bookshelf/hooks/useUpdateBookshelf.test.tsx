import { beforeEach, expect, it, vi } from 'vitest';
import { useToastMock } from '../../common/components/toast/__mocks__/use-toast.mocks';
import { createMutationMock } from '../../../tests/mocks/mutationMock';
import { renderHook } from '@testing-library/react';
import { useUpdateBookshelf } from './useUpdateBookshelf';

vi.mock('../../common/components/toast/use-toast', () => ({
  useToast: vi.fn().mockImplementation(() => useToastMock),
}));

const updateBookshelfMock = createMutationMock();

vi.mock(import('../api/mutations/updateBookshelfMutation/updateBookshelfMutation'), async (original) => {
  const actual = await original();
  return {
    updateBookshelfSchema: actual.updateBookshelfSchema,
    useUpdateBookshelfMutation: vi.fn().mockImplementation(() => updateBookshelfMock),
  };
});

const uploadBookshelfImageMock = createMutationMock();

vi.mock('../api/mutations/uploadBookshelfImageMutation/uploadBookshelfImageMutation', () => ({
  useUploadBookshelfImageMutation: vi.fn().mockImplementation(() => uploadBookshelfImageMock),
}));

const onSuccessStub = vi.fn();

const renderTestedHook = () => {
  const {
    result: {
      current: { update, isProcessing },
    },
    rerender,
    unmount,
  } = renderHook(() =>
    useUpdateBookshelf({
      bookshelfName: 'XD',
      onSuccess: onSuccessStub,
    }),
  );

  return {
    rerender,
    unmount,
    update,
    isProcessing,
  };
};

beforeEach(() => vi.clearAllMocks());

it('Stops processing - on bookshelf name update error', async () => {
  const { update } = renderTestedHook();

  updateBookshelfMock.mutateAsync.mockRejectedValueOnce(new Error('Oh noes'));

  await update({
    bookshelfId: 'yolo',
    name: 'Mein name',
  });

  expect(useToastMock.toast).not.toHaveBeenCalled();
});

it('Stops processing - on image upload error', async () => {
  const { update } = renderTestedHook();

  uploadBookshelfImageMock.mutateAsync.mockRejectedValueOnce(new Error('Oh noes'));

  await update({
    name: 'Mein name',
    bookshelfId: 'yolo',
    image: new File([], 'Image'),
  });

  expect(useToastMock.toast).not.toHaveBeenCalled();
});

it('Invokes onSuccess', async () => {
  const { update } = renderTestedHook();

  await update({
    name: 'Mein name',
    bookshelfId: 'yolo',
  });

  expect(onSuccessStub).toHaveBeenCalled();
});

it('Adds success toast', async () => {
  const { update } = renderTestedHook();

  await update({
    name: 'Mein AAA',
    bookshelfId: 'yolo',
  });

  expect(useToastMock.toast).toHaveBeenCalledWith({
    title: 'Półka: Mein AAA została zaktualizowana :)',
    variant: 'success',
  });
});
