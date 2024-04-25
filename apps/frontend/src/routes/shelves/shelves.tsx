/* eslint-disable react-refresh/only-export-components */
import { FC, useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { useFindUserBookshelfsQuery } from '../../api/bookshelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { HiPencil } from 'react-icons/hi';
import { IoMdEye } from 'react-icons/io';
import { HiCheck, HiOutlineX } from 'react-icons/hi';
import { useUpdateBookshelfMutation } from '../../api/bookshelf/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useToast } from '../../components/ui/use-toast';
import { AutoselectedInput } from './components/autoselectedInput/autoselectedInput';
import { z } from 'zod';
import { useCreateBookshelfMutation } from '../../api/bookshelf/mutations/createBookshelfMutation/createBookshelfMutation';
import { Bookmark } from '../../components/bookmark/bookmark';
import { Paginator } from '../../components/paginator/paginator';

const bookshelfNameSchema = z
  .string()
  .min(1, {
    message: `Nazwa jest zbyt krotka.`,
  })
  .max(64, {
    message: `Nazwa jest zbyt długa.`,
  });

export const ShelvesPage: FC = () => {
  const { data: user } = useFindUserQuery();

  const {
    data: bookshelvesData,
    refetch: refetchBookshelves,
    isFetching,
    isFetched,
  } = useFindUserBookshelfsQuery(user?.id);

  useEffect(() => {
    setBookshelves(bookshelvesData?.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  const { mutateAsync: updateBookshelf } = useUpdateBookshelfMutation({});

  const createBookshelfMutation = useCreateBookshelfMutation({});

  const perPage = 5;

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [bookshelves, setBookshelves] = useState(bookshelvesData?.data);

  const visibleBookshelves = useMemo(() => {
    return bookshelves?.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [bookshelves, currentPage, perPage]);

  const { toast } = useToast();

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelvesData?.data?.length ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelvesData, isFetched]);

  const navigate = useNavigate();

  const [editMap, setEditMap] = useState<Record<number, boolean>>({});

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
    }
  };

  const onCreateNew = async (index: number): Promise<void> => {
    const input = document.querySelector(`[id="${index}-bookshelf"]`) as HTMLInputElement | undefined;

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

    try {
      await createBookshelfMutation.mutateAsync({
        name: bookshelfName,
        userId: user?.id as string,
      });

      await refetchBookshelves();

      toast({
        title: `Nazwa półki zmieniona.`,
        description: `Stworzono półkę o nazwie: ${bookshelfName}`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: `Wystąpił błąd.`,
        description: `Coś poszło nie tak przy tworzeniu twojej półki. Spróbuj ponownie.`,
        variant: `destructive`,
      });
    }
  };

  const onSaveEdit = async (index: number): Promise<void> => {
    const input = document.querySelector(`[id="${index}-bookshelf"]`) as HTMLInputElement | undefined;

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

  const onAddNewBookshelf = (): void => {
    bookshelves?.unshift({
      id: '',
      name: '',
      userId: user?.id as string,
    });

    setBookshelves([...(bookshelves ? bookshelves : [])]);

    setEditMap({
      ...editMap,
      [0]: true,
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-4">
        <div className="flex flex-col w-[80vw] sm:w-[90vw] sm:px-48 items-center justify-center gap-4">
          <div className="w-full flex items-end justify-center sm:justify-end">
            <Button
              className="text-lg px-24 w-60 sm:w-96"
              onClick={() => onAddNewBookshelf()}
            >
              Dodaj nową półkę
            </Button>
          </div>
          <ScrollArea className="w-full h-[70vh]">
            <div className="py-8 grid gap-x-16 gap-y-2 grid-cols-1 w-full min-h-16">
              {visibleBookshelves?.map((bookshelf, index) => (
                <div>
                  <Bookmark />
                  <div
                    key={`${bookshelf.id}`}
                    className="flex ml-10 mt-[-1.25rem] rounded-sm border border-spacing-2 p-4 gap-x-2 h-24 border-transparent bg-primaryBackground"
                  >
                    <div className="flex items-center justify-between w-full">
                      <h2
                        className="pl-0 md:pl-4 lg:pl-12 text-lg sm:text-2xl truncate"
                        key={`${bookshelf.id}-${bookshelf.name}`}
                      >
                        {editMap[index] !== true ? (
                          bookshelf.name
                        ) : (
                          <AutoselectedInput
                            type="text"
                            maxLength={64}
                            includeQuill={false}
                            // eslint-disable-next-line
                            id={`${index}-bookshelf`}
                            className="bg-none text-lg  sm:text-2xl px-0 w-40 sm:w-72"
                            containerClassName="bg-transparent w-40 sm:w-72"
                            defaultValue={bookshelf.name}
                          />
                        )}
                      </h2>
                      <div className="px-4 sm:px-8 flex gap-4">
                        {editMap[index] !== true ? (
                          <>
                            <HiPencil
                              className="text-primary h-8 w-8 cursor-pointer"
                              onClick={() => startEdit(index)}
                            />
                            <IoMdEye
                              className="text-primary h-8 w-8 cursor-pointer"
                              onClick={() =>
                                navigate({
                                  to: `/bookshelf/${bookshelf.id}`,
                                })
                              }
                            />
                          </>
                        ) : (
                          <>
                            <HiCheck
                              className="text-primary h-8 w-8 cursor-pointer"
                              onClick={() => {
                                if (bookshelves && bookshelves[index]?.id === '') {
                                  onCreateNew(index);
                                }

                                onSaveEdit(index);
                              }}
                            />
                            <HiOutlineX
                              className="text-primary h-8 w-8 cursor-pointer"
                              onClick={() => onCancelEdit(index)}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {bookshelves && bookshelves.length > perPage ? (
            <>
              <Paginator
                pagesCount={pagesCount}
                onPageChange={(currentPage) => setCurrentPage(currentPage)}
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const shelvesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shelves',
  component: () => {
    return (
      <RequireAuthComponent>
        <ShelvesPage />
      </RequireAuthComponent>
    );
  },
});
