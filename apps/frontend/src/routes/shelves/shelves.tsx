/* eslint-disable react-refresh/only-export-components */
import { FC, useState } from 'react';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';
import { useFindUserBookshelfsQuery } from '../../api/shelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useFindUserQuery } from '../../api/user/queries/findUserQuery/findUserQuery';
import { Button } from '../../components/ui/button';
import { CreateBookshelfForm } from './components/createBookshelfForm/createBookshelfForm';
import { ScrollArea } from '../../components/ui/scroll-area';

export const ShelvesPage: FC = () => {
  const { data: user } = useFindUserQuery();

  const [createBookshelfFormVisible, setCreateBookshelfFormVisible] = useState<boolean>(false);

  const { data: bookshelves, refetch: refetchBookshelves } = useFindUserBookshelfsQuery(user?.id);

  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="flex w-100% px-8 py-1 sm:py-4">
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
            <div className="flex flex-col w-[100%] items-center justify-center">
              <Button
                className="text-lg px-24"
                onClick={() => setCreateBookshelfFormVisible(true)}
              >
                Dodaj nową półkę
              </Button>
              <ScrollArea className='w-[90%] md:w-[60%] h-[700px] pt-8'>
                <div className="py-8 grid gap-x-16 gap-y-8 grid-cols-1 sm:grid-cols-2 w-full min-h-32">
                  {bookshelves?.data.map((bookshelf) => (
                    <div>
                      <div className="flex items-center">
                        <div className="bg-primary h-10 w-10 rounded-full"></div>
                        <div className="bg-primary h-1 w-full flex items-start justify-end">
                          <Button> Edytuj </Button>
                        </div>
                      </div>
                      <div
                        key={`${bookshelf.id}`}
                        className="flex ml-10 mt-[-1.25rem] rounded-sm border border-spacing-2 p-4 gap-x-2 h-60 border-transparent bg-primaryBackground"
                        onClick={() =>
                          navigate({
                            to: `/bookshelf/${bookshelf.id}`,
                          })
                        }
                      >
                        <div
                          className="flex items-center"
                          onClick={() => {
                            navigate({});
                          }}
                        >
                          <h2 className='pl-0 md:pl-4 lg:pl-12 text-2xl' key={`${bookshelf.id}-${bookshelf.name}`}>{bookshelf.name}</h2>
                          {/* <p key={`${bookshelf.id}-${bookshelf.addressId}`}>
                          {bookshelf.addressId}
                          {'  '}
                          {!bookshelf.addressId && 'Brak adresu'}
                        </p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
