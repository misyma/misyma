import { FC, ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/ui/dialog';
import { Button } from '../../../common/components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../../common/components/ui/radio-group';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useUploadBookImageMutation } from '../../api/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { useRouter } from '@tanstack/react-router';
import { UpdateBookRequestForm } from '../updateBookRequestForm/updateBookRequestForm';
import { BookDetailsChangeRequestProvider } from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDeleteUserBookMutation } from '../../api/mutations/deleteUserBookMutation/deleteUserBookMutation';
import { useUpdateUserBookMutation } from '../../api/mutations/updateUserBookMutation/updateUserBookMutation';
import { UpdateUserBookForm } from '../updateUserBookForm/updateUserBookForm';
import { FindUserBookQueryOptions } from '../../api/queries/findUserBook/findUserBookQueryOptions';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';

interface Props {
  userBookId: string;
  bookId: string;
}

type BookEditType = 'dbChangeRequest' | 'myBookChange';

type BaseActionType = 'edit' | 'delete';

const changeMyBookDataSchema = z.object({
  image: z.optional(
    z.object(
      {},
      {
        required_error: 'Wymagany.',
      },
    ),
  ),
  genre: z
    .string()
    .min(1, {
      message: 'Niewłaściwa wartość',
    })
    .or(z.literal('')),
});

export const EditOrDeleteBookModal: FC<Props> = ({ bookId, userBookId }) => {
  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [baseAction, setBaseAction] = useState<BaseActionType>('edit');

  const [actionChosen, setActionChosen] = useState<boolean>(false);

  const [chosenEditAction, setChosenEditAction] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [bookEditType, setBookEditType] = useState<BookEditType>('myBookChange');

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const router = useRouter();

  const { data } = useQuery(
    FindUserBookQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { mutateAsync: deleteUserBook } = useDeleteUserBookMutation({});

  const resetModalState = () => {
    setBaseAction('edit');

    setActionChosen(false);

    setChosenEditAction(false);

    setIsOpen(false);
  };

  const changeMyBookDataForm = useForm<z.infer<typeof changeMyBookDataSchema>>({
    resolver: zodResolver(changeMyBookDataSchema),
    defaultValues: {
      image: undefined,
      genre: '',
    },
  });

  const { mutateAsync: uploadBookImageMutation } = useUploadBookImageMutation({});

  const onSubmitChangeMyBookDataForm = async (values: z.infer<typeof changeMyBookDataSchema>) => {
    if (values.image) {
      await uploadBookImageMutation({
        bookId: userBookId,
        file: values.image as unknown as File,
        accessToken: accessToken as string,
      });
    }

    if (values.genre) {
      await updateUserBook({
        userBookId,
        genreIds: [values.genre],
        accessToken: accessToken as string,
      });
    }

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findUserBookById' && query.queryKey[1] === userBookId,
    });

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findBooksByBookshelfId' && query.queryKey[1] === data?.bookshelfId,
    });

    resetModalState();

    changeMyBookDataForm.reset();
  };

  const onDeleteUserBook = async (): Promise<void> => {
    await deleteUserBook({
      accessToken: accessToken as string,
      userBookId: userBookId,
    });

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findBooksByBookshelfId' && query.queryKey[1] === data?.bookshelfId,
    });

    router.history.back();
  };

  const getStateContent = (): ReactNode => {
    if (actionChosen === false) {
      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            Wybierz jedną z poniższych akcji
          </DialogHeader>
          <RadioGroup
            defaultValue="edit"
            onValueChange={(val) => setBaseAction(val as BaseActionType)}
          >
            <div className="flex gap-4">
              <RadioGroupItem value="edit" />
              <p>edytuj dane książki</p>
            </div>
            <div className="flex gap-4">
              <RadioGroupItem value="delete"></RadioGroupItem>
              <p>usuń książkę</p>
            </div>
          </RadioGroup>
          <div className="flex gap-4">
            <Button
              className="sm:w-80"
              onClick={() => setActionChosen(true)}
            >
              Przejdź dalej
            </Button>
          </div>
        </>
      );
    }

    if (baseAction === 'edit' && actionChosen === true) {
      if (chosenEditAction === true && bookEditType === 'myBookChange') {
        return (
          <>
            <DialogHeader className="flex justify-center items-center text-xl font-semibold">
              Zmiana danych dla mojej książki
            </DialogHeader>
            <UpdateUserBookForm
              onCancel={() => setChosenEditAction(false)}
              onSubmit={onSubmitChangeMyBookDataForm}
            />
          </>
        );
      } else if (chosenEditAction === true && bookEditType === 'dbChangeRequest') {
        return (
          <>
            <DialogHeader className="flex justify-center items-center text-xl font-semibold">
              Prośba o zmianę danych w bazie
            </DialogHeader>
            <UpdateBookRequestForm
              bookId={bookId}
              onCancel={() => setActionChosen(false)}
              onSubmit={() => resetModalState()}
            />
          </>
        );
      }

      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            W jaki sposób chcesz edytować książkę?
          </DialogHeader>
          <RadioGroup
            defaultValue="myBookChange"
            onValueChange={(val) => setBookEditType(val as BookEditType)}
          >
            <div className="flex gap-4">
              <RadioGroupItem value="myBookChange"></RadioGroupItem>
              <p>zmiana danych dla mojej książki</p>
            </div>
            <div className="flex gap-4">
              <RadioGroupItem value="dbChangeRequest"></RadioGroupItem>
              <p>prośba o zmianę danych w bazie </p>
            </div>
          </RadioGroup>
          <div className="flex gap-4">
            <Button
              className="w-40 text-primary bg-transparent"
              onClick={() => setActionChosen(false)}
            >
              Wróć
            </Button>
            <Button
              className="w-40"
              onClick={() => setChosenEditAction(true)}
            >
              Przejdź dalej
            </Button>
          </div>
        </>
      );
    }

    if (baseAction === 'delete' && actionChosen === true) {
      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            Czy na pewno chcesz usunąć książkę?
          </DialogHeader>
          <p className="text-center px-8 indent-4">
            Nie będziesz już mieć dostępu do <br></br> wybranej książki, chyba że dodasz ją ponownie.
          </p>
          <p className="text-center px-8 indent-4">
            Cytaty i oceny przypisane do tej książki zostaną usunięte. Akcja ta jest <b>nieodwracalna</b>.
          </p>
          <div className="flex gap-4">
            <Button
              className="w-40 bg-transparent text-primary"
              onClick={() => setActionChosen(false)}
            >
              Wróć
            </Button>
            <Button
              className="w-40"
              type="submit"
              onClick={onDeleteUserBook}
            >
              Potwierdź
            </Button>
          </div>
        </>
      );
    }
  };

  return (
    <BookDetailsChangeRequestProvider>
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          if (val === false) {
            resetModalState();
          }

          setIsOpen(val);
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-32 sm:w-96">Edytuj lub usuń książkę</Button>
        </DialogTrigger>
        <DialogContent
          style={{
            borderRadius: '40px',
          }}
          className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
          omitCloseButton={true}
        >
          {getStateContent()}
        </DialogContent>
      </Dialog>
    </BookDetailsChangeRequestProvider>
  );
};
