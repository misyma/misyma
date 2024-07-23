import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/dialog/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useUploadBookImageMutation } from '../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { UpdateUserBookForm } from '../updateUserBookForm/updateUserBookForm';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { HiPencil } from 'react-icons/hi';
import { CreateChangeRequestForm } from '../createChangeRequestForm/createChangeRequestForm';
import { RadioGroup, RadioGroupItem } from '../../../common/components/radioGroup/radio-group';
import { Button } from '../../../common/components/button/button';
import { BookDetailsChangeRequestProvider } from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';

interface Props {
  bookId: string;
}

type BookEditType = 'dbChangeRequest' | 'myBookChange';

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

export const EditBookModal: FC<Props> = ({ bookId }) => {
  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const [bookEditType, setBookEditType] = useState<BookEditType | undefined>('myBookChange');

  const [actionChosen, setActionChosen] = useState<boolean>(false);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const { data } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const resetModalState = () => {
    setIsOpen(false);
    setActionChosen(false);
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
        bookId: bookId,
        file: values.image as unknown as File,
        accessToken: accessToken as string,
      });
    }

    if (values.genre) {
      await updateUserBook({
        userBookId: bookId,
        genreIds: [values.genre],
        accessToken: accessToken as string,
      });
    }

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findUserBookById && query.queryKey[1] === bookId,
    });

    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === data?.bookshelfId,
    });

    resetModalState();

    changeMyBookDataForm.reset();
  };

  const renderContents = () => {
    if (actionChosen && bookEditType === 'myBookChange') {
      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            Zmiana danych dla mojej książki
          </DialogHeader>
          <UpdateUserBookForm
            onCancel={() => {
              setActionChosen(false);

              setBookEditType('myBookChange');
            }}
            onSubmit={onSubmitChangeMyBookDataForm}
          />
        </>
      );
    } else if (actionChosen && bookEditType === 'dbChangeRequest') {
      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            Prośba o zmianę danych w bazie
          </DialogHeader>
          <CreateChangeRequestForm
            bookId={bookId}
            onCancel={() => {
              setActionChosen(false);
            }}
            onSubmit={() => {
              resetModalState();
            }}
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
          defaultValue={bookEditType}
          onValueChange={(val) => setBookEditType(val as BookEditType)}
        >
          <div className="flex gap-4">
            <RadioGroupItem
              type="button"
              value="myBookChange"
            ></RadioGroupItem>
            <p>zmiana danych dla mojej książki</p>
          </div>
          <div className="flex gap-4">
            <RadioGroupItem
              type="button"
              value="dbChangeRequest"
            ></RadioGroupItem>
            <p>prośba o zmianę danych w bazie </p>
          </div>
        </RadioGroup>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => resetModalState()}
          >
            Wróć
          </Button>
          <Button
            type="submit"
            onClick={() => {
              setActionChosen(true);
            }}
          >
            Przejdź dalej
          </Button>
        </div>{' '}
      </>
    );
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
          <HiPencil className="cursor-pointer text-primary h-8 w-8" />
        </DialogTrigger>
        <DialogContent
          style={{
            borderRadius: '40px',
          }}
          className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
          omitCloseButton={true}
        >
          {renderContents()}
        </DialogContent>
      </Dialog>
    </BookDetailsChangeRequestProvider>
  );
};
