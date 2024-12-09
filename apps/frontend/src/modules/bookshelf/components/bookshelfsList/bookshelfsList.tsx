import { ScrollArea } from '../../../common/components/scrollArea/scroll-area';
import { cn } from '../../../common/lib/utils';
import styles from './index.module.css';
import { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../common/components/toast/use-toast';
import { ShelfApiError } from '../../api/errors/shelfApiError';
import { useUpdateBookshelfMutation } from '../../api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { z } from 'zod';
import { useCreateBookshelfMutation } from '../../api/mutations/createBookshelfMutation/createBookshelfMutation';
import { BookshelfActionButtons } from './bookshelfActionButtons';
import { BookshelfName } from './bookshelfName';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../core/store/store';
import { setEditMap } from '../../../core/store/states/bookshelvesState/bookshelfStateSlice';
import { Bookshelf } from '@common/contracts';
import { BookshelvesApiQueryKeys } from '../../api/queries/bookshelvesApiQueryKeys';

const bookshelfNameSchema = z
  .string()
  .min(1, {
    message: `Nazwa jest zbyt krotka.`,
  })
  .max(64, {
    message: `Nazwa jest zbyt długa.`,
  });

interface Props {
  currentPage: number;
  searchedName: string;
  onCreatingNew: (val: boolean) => void;
  onCancelEdit: (index: number) => void;
  bookshelves: Bookshelf[];
  setBookshelves: (bookshelves: Bookshelf[]) => void;
}
export const BookshelfsList: FC<Props> = ({
  bookshelves,
  onCreatingNew,
  onCancelEdit,
  setBookshelves,
}) => {
  const perPage = 7;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const queryClient = useQueryClient();

  const editMap = useSelector<RootState, Record<number, boolean>>(
    (state) => state.bookshelves.editMap
  );

  const { toast } = useToast();

  const { mutateAsync: updateBookshelf } = useUpdateBookshelfMutation({});
  const createBookshelfMutation = useCreateBookshelfMutation({});

  const startEdit = (index: number): void => {
    dispatch(
      setEditMap({
        ...editMap,
        [index]: true,
      })
    );
  };

  const onCancelEditInternal = (index: number): void => {
    onCancelEdit(index);
    dispatch(
      setEditMap({
        ...editMap,
        [index]: false,
      })
    );

    if (!bookshelves || bookshelves.length === 0) {
      return;
    }

    const element = bookshelves[index];
    if (element.id === '') {
      const updatedBookshelves = bookshelves.slice(1);

      setBookshelves([...updatedBookshelves]);

      onCreatingNew(false);
    }
  };

  const onCreateNew = async (index: number): Promise<void> => {
    const input = document.querySelector(`[id="${index}-bookshelf"]`) as
      | HTMLInputElement
      | undefined;

    if (!input) {
      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy tworzeniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });

      return;
    }

    const bookshelfName = input?.value;

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
      })
    );

    onCreatingNew(false);

    try {
      await createBookshelfMutation.mutateAsync({
        name: bookshelfName,
      });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'findUserBookshelfs',
      });

      toast({
        title: `Półka została stworzona.`,
        description: `Stworzono półkę o nazwie: ${bookshelfName}`,
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof ShelfApiError) {
        if (error.context.statusCode === 409) {
          toast({
            title: 'Wystąpił błąd',
            description: 'Półka o podanej przez Ciebie nazwie już istnieje.',
            variant: `destructive`,
          });

          setBookshelves(
            bookshelves?.filter((bookshelf) => bookshelf.id !== '')
          );

          return;
        }
      }

      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy tworzeniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });
    }
  };

  const onSaveEdit = async (index: number): Promise<void> => {
    const input = document.querySelector(`[id="${index}-bookshelf"]`) as
      | HTMLInputElement
      | undefined;

    if (!input) {
      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy aktualizowaniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });

      return;
    }

    const newName = input?.value;

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
      })
    );

    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
    });

    try {
      const oldName = bookshelves[index].name as string;

      await updateBookshelf({
        bookshelfId: bookshelves[index].id as string,
        name: newName,
      });

      await toast({
        title: `Nazwa półki zmieniona.`,
        description: `Półka ${oldName} to teraz ${newName}`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy aktualizowaniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });
    }
  };

  return (
    <ScrollArea className={cn(styles['shelves-scroll-area'], 'w-full')}>
      <div className={styles['shelves-container']}>
        {bookshelves?.map((bookshelf, index) => (
          <div
            className={cn(index > perPage - 1 ? 'hidden' : '')}
            key={`${bookshelf.id ?? 'temporary' + '-' + index}-container`}
          >
            <div key={`${bookshelf.id}`} className={styles['shelf']}>
              <div
                onClick={() => {
                  if (bookshelf.id) {
                    navigate({
                      to: `/shelves/bookshelf/${bookshelf.id}`,
                    });
                  }
                }}
                className={cn('absolute w-full h-[100%]', {
                  ['cursor-pointer']: bookshelf.id ? true : false,
                })}
              >
                &nbsp;
              </div>
              <div className="flex flex-col w-full">
                <div className="flex items-center h-full border-t-primary border-t-2 rounded-sm justify-between w-full top-0 pointer-events-none">
                  <BookshelfName
                    bookshelfId={bookshelf.id}
                    name={bookshelf.name}
                    index={index}
                    editMap={editMap}
                    onSave={(index) => {
                      if (bookshelves && bookshelves[index]?.id === '') {
                        return onCreateNew(index);
                      }
                      onSaveEdit(index);
                    }}
                  />
                  <BookshelfActionButtons
                    bookshelfId={bookshelf.id}
                    editMap={editMap}
                    index={index}
                    name={bookshelf.name}
                    onCancelEdit={(val) => onCancelEditInternal(val)}
                    onSave={(val) => {
                      if (bookshelves && bookshelves[val]?.id === '') {
                        return onCreateNew(val);
                      }

                      onSaveEdit(val);
                    }}
                    onStartEdit={(val) => startEdit(val)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
