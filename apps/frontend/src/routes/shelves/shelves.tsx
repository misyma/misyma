/* eslint-disable react-refresh/only-export-components */
import { FC, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { useFindUserBookshelfsQuery } from '../../api/bookshelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { Button } from '../../components/ui/button';
import { CreateBookshelfForm } from './components/createBookshelfForm/createBookshelfForm';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { HiPencil } from 'react-icons/hi';
import { IoMdEye } from 'react-icons/io';
import { HiCheck, HiOutlineX } from 'react-icons/hi';
import { useUpdateBookshelfMutation } from '../../api/bookshelf/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useToast } from '../../components/ui/use-toast';
import { AutoselectedInput } from './components/autoselectedInput/autoselectedInput';
import { z } from 'zod';

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

  const [createBookshelfFormVisible, setCreateBookshelfFormVisible] = useState<boolean>(false);

  const { data: bookshelves, refetch: refetchBookshelves, isFetched } = useFindUserBookshelfsQuery(user?.id);

  const { mutateAsync: updateBookshelf } = useUpdateBookshelfMutation({});

  const { toast } = useToast();

  const perPage = 5;

  const pagesCount = useMemo(() => {
    const bookshelvesCount = bookshelves?.data?.length ?? 0;

    return Math.ceil(bookshelvesCount / perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelves, isFetched]);

  const [currentPage, setCurrentPage] = useState<number>(1);

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

  const goToPreviousPage = (): void => {
    if (previousPage) {
      setCurrentPage(previousPage);
    }
  };

  const goToNextPage = (): void => {
    if (currentPage + 1 <= pagesCount) {
      setCurrentPage(currentPage + 1);
    }
  };

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
        variant: 'destructive'
      });

      return;
    }

    setEditMap({
      ...editMap,
      [index]: false,
    });

    try {
      const oldName = bookshelves?.data[index].name as string;

      await updateBookshelf({
        bookshelfId: bookshelves?.data[index].id as string,
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
    <AuthenticatedLayout>
      <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-4">
        {createBookshelfFormVisible ? (
          <>
            <div className="sm:py-16 flex flex-col-reverse sm:flex-1 sm:flex-row w-[100%] gap-8 sm:gap-32 items-center sm:items-start justify-center">
              <CreateBookshelfForm
                onGoBack={(created) => {
                  setCreateBookshelfFormVisible(false);

                  if (created) {
                    refetchBookshelves();
                  }
                }}
              />
              <div className="flex-1 max-h-[250px] max-w-[250px] sm:max-h-[500px] sm:max-w-[500px] flex justify-center">
                <img
                  src="/bookshelfImage.png"
                  alt="Bookshelf image"
                  className="object-fit aspect-square"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col w-[80vw] sm:w-[90vw] sm:px-48 items-center justify-center gap-4">
              <div className="w-full flex items-end justify-center sm:justify-end">
                <Button
                  className="text-lg px-24 w-60 sm:w-96"
                  onClick={() => setCreateBookshelfFormVisible(true)}
                >
                  Dodaj nową półkę
                </Button>
              </div>
              <ScrollArea className="w-full h-[70vh]">
                <div className="py-8 grid gap-x-16 gap-y-2 grid-cols-1 w-full min-h-16">
                  {bookshelves?.data
                    .slice((currentPage - 1) * perPage, currentPage * perPage)
                    .map((bookshelf, index) => (
                      <div>
                        <div className="flex items-center">
                          <div className="bg-primary h-10 w-10 rounded-full"></div>
                          <div className="bg-primary h-1 w-full flex items-start justify-end"></div>
                        </div>
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
                                    onClick={() => onSaveEdit(index)}
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
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      hasPrevious={currentPage !== 1}
                      onClick={goToPreviousPage}
                    />
                  </PaginationItem>
                  <PaginationItem
                    className={previousPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                  >
                    <PaginationLink
                      className={
                        previousPage === undefined ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''
                      }
                      onClick={goToPreviousPage}
                      isActive={previousPage === undefined}
                    >
                      {previousPage !== undefined && currentPage === pagesCount
                        ? currentPage - 2
                        : previousPage !== undefined
                          ? previousPage
                          : currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={currentPage !== 1 && currentPage !== pagesCount}
                      onClick={() => {
                        if (currentPage === 1) {
                          return setCurrentPage(currentPage + 1);
                        }
                      }}
                    >
                      {currentPage !== 1
                        ? currentPage === pagesCount
                          ? pagesCount - 1
                          : currentPage
                        : currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      isActive={nextPage === undefined && currentPage !== 1 && currentPage === pagesCount}
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
                  <PaginationItem
                    className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                  >
                    <PaginationNext
                      hasNext={currentPage !== pagesCount}
                      className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''}
                      onClick={goToNextPage}
                    />
                  </PaginationItem>
                </PaginationContent>{' '}
              </Pagination>
            </div>
          </>
        )}
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
