import { FC, useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { Button } from '../../modules/common/components/ui/button';
import { ScrollArea } from '../../modules/common/components/ui/scroll-area';
import { HiPencil } from 'react-icons/hi';
import { IoMdEye } from 'react-icons/io';
import { HiCheck, HiOutlineX } from 'react-icons/hi';
import { useUpdateBookshelfMutation } from '../../modules/bookshelf/api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useToast } from '../../modules/common/components/ui/use-toast';
import { AutoselectedInput } from '../../modules/common/components/autoselectedInput/autoselectedInput';
import { z } from 'zod';
import { useCreateBookshelfMutation } from '../../modules/bookshelf/api/mutations/createBookshelfMutation/createBookshelfMutation';
import { Bookmark } from '../../modules/common/components/bookmark/bookmark';
import { BookshelfType } from '@common/contracts';
import { DeleteBookshelfModal } from '../../modules/bookshelf/components/deleteBookshelfModal/deleteBookshelfModal';
import { cn } from '../../modules/common/lib/utils';
import { useFindUserBookshelfsQuery } from '../../modules/bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../modules/common/components/ui/pagination';
import { useQueryClient } from '@tanstack/react-query';
import { ShelfApiError } from '../../modules/bookshelf/api/errors/shelfApiError';
import { ShelvesSkeleton } from './shelves-skeleton';

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

  const queryClient = useQueryClient();

  const perPage = 5;

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const {
    data: bookshelvesData,
    isFetching,
    refetch: refetchBookshelves,
  } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: perPage,
    page: currentPage,
  });

  useEffect(() => {
    setBookshelves(bookshelvesData?.data);
  }, [bookshelvesData]);


  const { mutateAsync: updateBookshelf } = useUpdateBookshelfMutation({});

  const createBookshelfMutation = useCreateBookshelfMutation({});

  const [bookshelves, setBookshelves] = useState(bookshelvesData?.data);

  const { toast } = useToast();

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelvesData?.metadata?.total ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
  }, [bookshelvesData?.metadata?.total]);

  const previousPage = useMemo(() => {
    if (currentPage === 1) {
      return undefined;
    }

    return currentPage - 1;
  }, [currentPage]);

  const nextPage = useMemo(() => {
    if (currentPage === pagesCount) {
      return undefined;
    }

    if (currentPage === 1 && pagesCount > 2) {
      return currentPage + 2;
    } else if (currentPage === 1 && pagesCount <= 2) {
      return currentPage;
    }

    return currentPage + 1;
  }, [currentPage, pagesCount]);

  
  const navigate = useNavigate();

  const [editMap, setEditMap] = useState<Record<number, boolean>>({});

  if (isFetching) {
    return <ShelvesSkeleton />;
  }

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

      setIsCreatingNew(false);
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

    setIsCreatingNew(false);

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
      type: BookshelfType.standard,
    });

    setIsCreatingNew(true);

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
              disabled={isCreatingNew}
            >
              Dodaj nową półkę
            </Button>
          </div>
          <ScrollArea className="w-full h-[70vh]">
            <div className="py-8 grid gap-x-16 gap-y-2 grid-cols-1 w-full min-h-16">
              {bookshelves?.map((bookshelf, index) => (
                <div key={`${bookshelf.id}-container`}>
                  <Bookmark />
                  <div
                    key={`${bookshelf.id}`}
                    className="flex relative ml-10 mt-[-1.25rem] rounded-sm border border-spacing-2 p-4 gap-x-2 h-24 border-transparent bg-primaryBackground"
                  >
                    <div
                      onClick={() =>
                        navigate({
                          to: `/bookshelf/${bookshelf.id}`,
                        })
                      }
                      className="cursor-pointer absolute w-full h-[100%]"
                    >
                      &nbsp;
                    </div>
                    <div className="flex items-center justify-between w-full pointer-events-none z-10">
                      <h2
                        id={`name-${index}-bookshelf`}
                        onClick={() => {
                          if (editMap[index] === true) {
                            return;
                          }
                          navigate({
                            to: `/bookshelf/${bookshelf.id}`,
                          });
                        }}
                        className="cursor-pointer pl-0 md:pl-4 lg:pl-12 text-lg sm:text-2xl truncate"
                        key={`${bookshelf.id}-${bookshelf.name}`}
                      >
                        {editMap[index] !== true ? (
                          bookshelf.name
                        ) : (
                          <AutoselectedInput
                            type="text"
                            maxLength={64}
                            includeQuill={false}
                            id={`${index}-bookshelf`}
                            className="z-30 bg-none pointer-events-auto text-lg  sm:text-2xl px-0 w-40 sm:w-72"
                            containerClassName="z-30 pointer-events-auto bg-transparent w-40 sm:w-72"
                            defaultValue={bookshelf.name}
                          />
                        )}
                      </h2>
                      <div className="px-4 sm:px-8 flex gap-4">
                        {editMap[index] !== true ? (
                          <>
                            <HiPencil
                              className={cn(
                                'text-primary pointer-events-auto h-8 w-8 cursor-pointer',
                                bookshelf.name === 'Archiwum' || bookshelf.name === 'Wypożyczalnia' ? 'hidden' : '',
                              )}
                              onClick={() => startEdit(index)}
                            />
                            <IoMdEye
                              className="text-primary pointer-events-auto h-8 w-8 cursor-pointer"
                              onClick={() =>
                                navigate({
                                  to: `/bookshelf/${bookshelf.id}`,
                                })
                              }
                            />
                            <DeleteBookshelfModal
                              bookshelfId={bookshelf.id}
                              bookshelfName={bookshelf.name}
                              deletedHandler={async () => {
                                toast({
                                  title: `Półka ${bookshelf.name} została usunięta.`,
                                  variant: 'success',
                                });

                                const { data } = await refetchBookshelves();

                                const newTotalPages = Math.ceil(
                                  (data?.metadata.total ?? 0) / (data?.metadata.pageSize ?? 1),
                                );

                                queryClient.invalidateQueries({
                                  predicate: (query) => query.queryKey[0] === 'findUserBookshelfs',
                                });

                                if (currentPage > newTotalPages) {
                                  setCurrentPage(newTotalPages);
                                }
                              }}
                              className={cn(
                                bookshelf.name === 'Archiwum' || bookshelf.name === 'Wypożyczalnia' ? 'invisible' : '',
                                'pointer-events-auto',
                              )}
                            />
                          </>
                        ) : (
                          <>
                            <HiCheck
                              className="pointer-events-auto text-primary h-8 w-8 cursor-pointer"
                              onClick={() => {
                                if (bookshelves && bookshelves[index]?.id === '') {
                                  return onCreateNew(index);
                                }

                                onSaveEdit(index);
                              }}
                            />
                            <HiOutlineX
                              className="pointer-events-auto text-primary h-8 w-8 cursor-pointer"
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
          {bookshelves && (bookshelvesData?.metadata?.total ?? 0) > perPage ? (
            <>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      hasPrevious={currentPage !== 1}
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem
                    className={
                      !(currentPage > 1 && pagesCount > 1) ? 'pointer-events-none hover:text-none hover:bg-none' : ''
                    }
                  >
                    <PaginationLink
                      className={
                        !(currentPage > 1 && pagesCount > 1)
                          ? 'pointer-events-none hover:text-none hover:bg-[unset]'
                          : ''
                      }
                      onClick={() => {
                        if (previousPage === undefined) {
                          return;
                        }

                        if (previousPage - 1 === -1) {
                          return;
                        }

                        if (currentPage === pagesCount && pagesCount === 2) {
                          setCurrentPage(currentPage - 1);

                          return;
                        }

                        if (currentPage === pagesCount) {
                          setCurrentPage(currentPage - 2);

                          return;
                        }

                        setCurrentPage(previousPage);
                      }}
                      isActive={previousPage === undefined}
                    >
                      {previousPage !== undefined && currentPage === pagesCount && pagesCount > 2
                        ? currentPage - 2
                        : previousPage !== undefined
                          ? previousPage
                          : currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={
                        (currentPage !== 1 && currentPage !== pagesCount) ||
                        (pagesCount === 2 && currentPage === pagesCount)
                      }
                      onClick={() => {
                        if (currentPage === 1) {
                          return setCurrentPage(currentPage + 1);
                        }

                        if (pagesCount == currentPage && pagesCount === 2) {
                          return;
                        }

                        if (currentPage === pagesCount) {
                          return setCurrentPage(pagesCount - 1);
                        }
                      }}
                    >
                      {currentPage !== 1
                        ? currentPage === pagesCount && pagesCount > 2
                          ? pagesCount - 1
                          : currentPage
                        : currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                  {pagesCount > 2 ? (
                    <PaginationItem>
                      <PaginationLink
                        isActive={
                          nextPage === undefined && currentPage !== 1 && currentPage === pagesCount && pagesCount > 2
                        }
                        className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                        onClick={() => {
                          if (nextPage) {
                            setCurrentPage(nextPage);
                          }
                        }}
                      >
                        {nextPage === undefined ? pagesCount : nextPage}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <> </>
                  )}
                  <PaginationItem
                    className={currentPage !== pagesCount ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                  >
                    <PaginationNext
                      hasNext={currentPage !== pagesCount}
                      className={
                        !(currentPage !== pagesCount)
                          ? 'pointer-events-none hover:text-none hover:bg-[unset]'
                          : 'pointer-events-auto'
                      }
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>{' '}
              </Pagination>
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
