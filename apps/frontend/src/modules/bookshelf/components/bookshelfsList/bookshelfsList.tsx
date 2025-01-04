import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type FC, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';

import { BookshelfActionButtons } from './bookshelfActionButtons';
import { BookshelfName } from './bookshelfName';
import { useBookshelves } from './hooks/useBookshelves';
import styles from './index.module.css';
import { ScrollArea } from '../../../common/components/scrollArea/scroll-area';
import { useToast } from '../../../common/components/toast/use-toast';
import { cn } from '../../../common/lib/utils';
import { setCreatingNew, setEditMap } from '../../../core/store/states/bookshelvesState/bookshelfStateSlice';
import { type AppDispatch } from '../../../core/store/store';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { ShelfApiError } from '../../api/errors/shelfApiError';
import { BookshelvesApiQueryKeys } from '../../api/queries/bookshelvesApiQueryKeys';

interface BookshelfNavigationAreaProps {
  bookshelfId: string;
}
const BookshelfNavigationArea: FC<BookshelfNavigationAreaProps> = ({ bookshelfId }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        if (bookshelfId) {
          navigate({
            to: `/shelves/bookshelf/${bookshelfId}`,
          });
        }
      }}
      className={cn('absolute w-full h-[100%]', {
        ['cursor-pointer']: bookshelfId ? true : false,
      })}
    >
      &nbsp;
    </div>
  );
};

interface Props {
  page: number;
  perPage: number;
  name: string | undefined;
  onCancelEdit: (index: number) => void;
}
export const BookshelfsList: FC<Props> = ({ page, perPage, name, onCancelEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const queryClient = useQueryClient();

  const { data: user } = useFindUserQuery();

  const {
    creatingNew,
    bookshelves,
    editMap,
    createBookshelfDraft,
    onUpdateBookshelfName,
    onCreateBookshelf,
    startEdit,
    setBookshelves,
  } = useBookshelves({
    name,
    page,
    pageSize: perPage,
  });

  const { toast } = useToast();

  useLayoutEffect(() => {
    if (creatingNew === true) {
      setBookshelves([createBookshelfDraft(), ...bookshelves]);

      return;
    }

    if (creatingNew === false && bookshelves[0]?.id === '') {
      setBookshelves([...bookshelves.slice(1)]);

      return;
    }
    // Add 'bookshelves' and watch your browser burn due to an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatingNew, user?.id]);

  const onCancelEditInternal = (index: number): void => {
    onCancelEdit(index);

    dispatch(
      setEditMap({
        ...editMap,
        [index]: false,
      }),
    );

    if (!bookshelves || bookshelves.length === 0) {
      return;
    }

    const element = bookshelves[index];

    if (element.id === '') {
      const updatedBookshelves = bookshelves.slice(1);

      setBookshelves([...updatedBookshelves]);

      dispatch(setCreatingNew(false));
    }
  };

  const getBookshelfInputByQuerySelector = (index: number) => {
    return document.querySelector(`[id="${index}-bookshelf"]`) as HTMLInputElement | undefined;
  };

  const onCreateNew = async (index: number): Promise<void> => {
    const input = getBookshelfInputByQuerySelector(index);

    if (!input) {
      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy tworzeniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });

      return;
    }

    const bookshelfName = input?.value;

    try {
      await onCreateBookshelf(index, bookshelfName);

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'findUserBookshelfs',
      });
    } catch (error) {
      if (error instanceof ShelfApiError) {
        if (error.context.statusCode === 409) {
          toast({
            title: 'Wystąpił błąd',
            description: 'Półka o podanej przez Ciebie nazwie już istnieje.',
            variant: `destructive`,
          });

          setBookshelves(bookshelves?.filter((bookshelf) => bookshelf.id !== ''));

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
    const input = getBookshelfInputByQuerySelector(index);

    if (!input) {
      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy aktualizowaniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });

      return;
    }

    try {
      await onUpdateBookshelfName(index, bookshelves[index]?.id as string, input?.value, bookshelves[index]?.name);

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
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
            <div
              key={`${bookshelf.id}`}
              className={styles['shelf']}
            >
              <BookshelfNavigationArea bookshelfId={bookshelf.id} />
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
