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

interface Props {
  bookId: string;
}

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

  return (
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
        <DialogHeader className="flex justify-center items-center text-xl font-semibold">
          Zmiana danych dla mojej książki
        </DialogHeader>
        <UpdateUserBookForm
          onCancel={() => setIsOpen(false)}
          onSubmit={onSubmitChangeMyBookDataForm}
        />
      </DialogContent>
    </Dialog>
  );
};
