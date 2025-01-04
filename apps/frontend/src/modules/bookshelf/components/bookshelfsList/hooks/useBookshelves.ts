import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { BookshelfType } from '@common/contracts';

import { useToast } from '../../../../common/components/toast/use-toast';
import {
  bookshelfSelectors,
  setCreatingNew,
  setEditMap,
} from '../../../../core/store/states/bookshelvesState/bookshelfStateSlice';
import { type AppDispatch, type RootState } from '../../../../core/store/store';
import { useFindUserQuery } from '../../../../user/api/queries/findUserQuery/findUserQuery';
import { useCreateBookshelfMutation } from '../../../api/mutations/createBookshelfMutation/createBookshelfMutation';
import { useUpdateBookshelfMutation } from '../../../api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useFindUserBookshelfsQuery } from '../../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

const bookshelfNameSchema = z
  .string()
  .min(1, {
    message: `Nazwa jest zbyt krotka.`,
  })
  .max(64, {
    message: `Nazwa jest zbyt długa.`,
  });

interface UseBookshelvesProps {
  pageSize: number;
  page: number;
  name: string | undefined;
}
export const useBookshelves = ({ name, page, pageSize }: UseBookshelvesProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const { toast } = useToast();

  const creatingNew = useSelector(bookshelfSelectors.selectIsCreatingNew);

  const editMap = useSelector<RootState, Record<number, boolean>>((state) => state.bookshelves.editMap);

  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize,
    page,
    name,
  });

  const [bookshelves, setBookshelves] = useState(bookshelvesData?.data ?? []);

  const { mutateAsync: updateBookshelf } = useUpdateBookshelfMutation({});

  const { mutateAsync: createBookshelfMutation } = useCreateBookshelfMutation({});

  useEffect(() => {
    if (bookshelvesData?.data) {
      setBookshelves(bookshelvesData.data);
    }
  }, [bookshelvesData?.data]);

  const startEdit = (index: number): void => {
    dispatch(
      setEditMap({
        ...editMap,
        [index]: true,
      }),
    );
  };

  const createBookshelfDraft = () => {
    return {
      id: '',
      createdAt: new Date().toISOString(),
      name: '',
      type: BookshelfType.standard,
      userId: user?.id as string,
    };
  };

  const onCreateBookshelf = async (index: number, bookshelfName: string) => {
    const validatedBookshelfName = bookshelfNameSchema.safeParse(bookshelfName);

    if (!validatedBookshelfName.success) {
      toast({
        title: 'Niepoprawna nazwa.',
        description: validatedBookshelfName.error.errors[0].message,
        variant: 'destructive',
      });

      return;
    }

    dispatch(
      setEditMap({
        ...editMap,
        [index]: false,
      }),
    );

    dispatch(setCreatingNew(false));

    await createBookshelfMutation({
      name: bookshelfName,
    });

    toast({
      title: `Półka została stworzona.`,
      description: `Stworzono półkę o nazwie: ${bookshelfName}`,
      variant: 'success',
    });
  };

  const onUpdateBookshelfName = async (index: number, id: string, newName: string, oldName: string): Promise<void> => {
    const validatedNewName = bookshelfNameSchema.safeParse(newName);

    if (!validatedNewName.success) {
      toast({
        title: 'Niepoprawna nazwa.',
        description: validatedNewName.error.errors[0].message,
        variant: 'destructive',
      });

      return;
    }

    dispatch(
      setEditMap({
        ...editMap,
        [index]: false,
      }),
    );

    await updateBookshelf({
      bookshelfId: id,
      name: newName,
    });

    toast({
      title: `Nazwa półki zmieniona.`,
      description: `Półka ${oldName} to teraz ${newName}`,
      variant: 'success',
    });

    return;
  };

  return {
    bookshelves,
    creatingNew,
    editMap,
    setBookshelves,
    startEdit,
    createBookshelfDraft,
    onUpdateBookshelfName,
    onCreateBookshelf,
  };
};
