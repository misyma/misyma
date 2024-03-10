/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute } from '@tanstack/react-router';
import { FC, useState } from 'react';
import { rootRoute } from '../root';
import { AuthenticatedLayout } from '../../layouts/authenticated/authenticatedLayout';
import { Button } from '../../components/ui/button';
import { BookReadings } from './components/bookReadings/bookReadings';
import { Quotes } from './components/quotes/quotes';
import { AddReadingModal } from './components/addReadingModal/addReadingModal';
import { AddReadingSchemaValues } from './components/addReadingModal/schema/addReadingSchema';
import { useAddBookReadingMutation } from '../../api/books/bookReadings/addBookReadingMutation/addBookReadingMutation';
import { useToast } from '../../components/ui/use-toast';
import { z } from 'zod';

export const BookPage: FC = () => {
  const { bookId } = bookRoute.useParams();

  const book = {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description:
      "The Great Gatsby is a novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
    readings: [
      {
        id: '',
        bookId: '',
        startedAt: new Date().toISOString(),
        rating: 9,
        comment: 'Mein Gott',
      },
      {
        id: '',
        bookId: '',
        startedAt: new Date().toISOString(),
        comment: 'In Himmeln',
        rating: 7,
      },
      {
        id: '',
        bookId: '',
        startedAt: new Date().toISOString(),
        comment: 'Schoenste Hundin',
        rating: 6,
      },
    ],
    quotes: [
      {
        text: 'Good boy',
      },
    ],
  }; //on load -> fetch books from server
  const { toast } = useToast();

  const { mutate: createBookReading } = useAddBookReadingMutation({});

  const [addReadingModalOpen, setAddReadingModalOpen] = useState<boolean>(false);

  const onAddReading = async (values: AddReadingSchemaValues): Promise<void> => {
    // mutate

    createBookReading(
      {
        bookId,
        comment: values.comment,
        rating: values.rating,
        startedAt: values.startedAt,
        endedAt: values.endedAt ?? undefined,
      },
      {
        onError: () => {
          toast({
            title: 'Błąd',
            variant: 'destructive',
            description: 'Wystąpił błąd podczas dodawania oceny.',
          });
        },
        onSuccess: (data) => {
          setAddReadingModalOpen(false);

          book.readings.push(data);

          toast({
            title: 'Ocena dodana!',
            description: `Ocena została dodana do książki - ${book?.title}.`,
          });
        },
      },
    );
  };

  return (
    <AuthenticatedLayout>
    { bookId === '' ? <Navigate to={'/login'} /> : null}
      <div className="flex w-100% px-8 py-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">{book.title}</h1>
          <div className="grid grid-cols-6 justify-items-end items-start gap-y-8 gap-6 py-8">
            <img
              key={`${book.id}-img`}
              className="col-start-1 col-span-2 aspect-square-1/1 rounded-lg overflow-hidden max-h-96"
              src="https://dogtime.com/wp-content/uploads/sites/12/2020/11/GettyImages-512366437-e1688677726208.jpg?w=1024"
            />
            <div
              className="col-span-3"
              key={book.id}
            >
              <div
                key={`${book.id}-desc-container`}
                className="grid grid-cols-1 gap-4"
              >
                <p className="text-xl">Autorzy: {book.author}</p>
                <p className="text-xl">Gatunki: pies, pies, pies, pies</p>
                <p>Opis: {book.description}</p>
              </div>
              <div className="py-4 grid grid-rows-2">
                <div className="py-4 gap-x-4 grid grid-cols-4">
                  <BookReadings readings={book.readings} />
                  <Button
                    onClick={() => {
                      setAddReadingModalOpen(true);
                    }}
                    className="text-sm h-8 w-32 justify-self-end"
                  >
                    Dodaj ocenę
                  </Button>
                </div>
                <div className="py-4 gap-x-4 grid grid-cols-2">
                  <Quotes quotes={book.quotes} />
                  <Button className="text-sm h-8 w-32 justify-self-end">Dodaj cytat</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddReadingModal
        open={addReadingModalOpen}
        setOpenChange={setAddReadingModalOpen}
        onSubmit={onAddReading}
      />
    </AuthenticatedLayout>
  );
};

const bookPathParamsSchema = z.object({
  bookId: z.string().uuid().catch(''),
});

export const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$bookId',
  component: BookPage,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
  parseParams: (params) => {
    return bookPathParamsSchema.parse(params);
  },
});
