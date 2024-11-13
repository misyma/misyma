import { Bookmark } from '../../../common/components/bookmark/bookmark';
import { ScrollArea } from '../../../common/components/scrollArea/scroll-area';
import { cn } from '../../../common/lib/utils';
import styles from './index.module.css';
import { FC, useEffect, useState } from 'react';
import { useFindUserBookshelfsQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../common/components/toast/use-toast';
import { ShelfApiError } from '../../api/errors/shelfApiError';
import { useUpdateBookshelfMutation } from '../../api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { z } from 'zod';
import { useCreateBookshelfMutation } from '../../api/mutations/createBookshelfMutation/createBookshelfMutation';
import { BookshelfActionButtons } from './bookshelfActionButtons';
import { BookshelfName } from './bookshelfName';

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
}
export const BookshelfsList: FC<Props> = ({
  searchedName,
  currentPage,
  onCreatingNew,
}) => {
  const perPage = 5;
  const [editMap, setEditMap] = useState<Record<number, boolean>>({});

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: user } = useFindUserQuery();
  const { data: bookshelvesData, refetch: refetchBookshelves } =
    useFindUserBookshelfsQuery({
      userId: user?.id as string,
      pageSize: perPage,
      page: currentPage,
      name: searchedName,
    });

  const [bookshelves, setBookshelves] = useState(bookshelvesData?.data);
  const { toast } = useToast();

  useEffect(() => {
    setBookshelves(bookshelvesData?.data ?? [])
  }, [bookshelvesData])

  const { mutateAsync: updateBookshelf } = useUpdateBookshelfMutation({});
  const createBookshelfMutation = useCreateBookshelfMutation({});

  const startEdit = (index: number): void => {
    setEditMap({
      ...editMap,
      [index]: true,
    });
  };

  const onCancelEdit = (index: number): void => {
    setEditMap({
      ...editMap,
      [index]: false,
    });

    if (!bookshelves) {
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

    setEditMap({
      ...editMap,
      [index]: false,
    });

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

    setEditMap({
      ...editMap,
      [index]: false,
    });

    try {
      const oldName = bookshelvesData?.data[index].name as string;

      await updateBookshelf({
        bookshelfId: bookshelvesData?.data[index].id as string,
        name: newName,
      });

      await refetchBookshelves();

      toast({
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
    <ScrollArea className={styles['shelves-scroll-area']}>
      <div className={styles['shelves-container']}>
        {bookshelves?.map((bookshelf, index) => (
          <div
            className={cn(index > 4 ? 'hidden' : '')}
            key={`${bookshelf.id}-container`}
          >
            <Bookmark />
            <div key={`${bookshelf.id}`} className={styles['shelf']}>
              <div
                onClick={() => {
                  if (bookshelf.id) {
                    navigate({
                      to: `/bookshelf/${bookshelf.id}`,
                    });
                  }
                }}
                className={cn('absolute w-full h-[100%]', {
                  ['cursor-pointer']: bookshelf.id ? true : false,
                })}
              >
                &nbsp;
              </div>
              <div className="flex items-center justify-between w-full pointer-events-none z-10">
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
                  onCancelEdit={(val) => onCancelEdit(val)}
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
        ))}
      </div>
    </ScrollArea>
  );
};
