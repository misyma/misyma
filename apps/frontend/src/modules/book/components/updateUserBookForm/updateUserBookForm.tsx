import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { type FC, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { type UserBook } from '@common/contracts';

import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { getGenresQueryOptions } from '../../../../modules/genres/api/queries/getGenresQuery/getGenresQueryOptions';
import { Button } from '../../../common/components/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { FileInput } from '../../../common/components/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { useUploadBookImageMutation } from '../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';

const changeUserBookDataSchema = z.object({
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

interface Props {
  bookId: string;
  userBook: UserBook | undefined;
  onSubmit: () => void;
  onCancel: () => void;
}

export const UpdateUserBookForm: FC<Props> = ({ bookId, userBook, onSubmit, onCancel }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | undefined>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (file) {
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(file);

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, [file]);

  const { mutateAsync: updateUserBook, isPending: isUpdatePending } = useUpdateUserBookMutation({});
  const { mutateAsync: uploadBookImageMutation, isPending: isImageUploadPending } = useUploadBookImageMutation({});

  const eitherMutationPending = isUpdatePending || isImageUploadPending;

  const onSubmitChangeMyBookDataForm = async (values: z.infer<typeof changeUserBookDataSchema>) => {
    if (values.image) {
      await uploadBookImageMutation({
        bookId,
        file: values.image as unknown as File,
        accessToken: accessToken as string,
      });
    }

    if (values.genre) {
      await updateUserBook({
        userBookId: bookId,
        genreId: values.genre,
        accessToken: accessToken as string,
      });
    }

    await Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findUserBookById && query.queryKey[1] === bookId,
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === userBook?.bookshelfId,
      }),
    ]);
  };

  const changeUserBookDataForm = useForm<z.infer<typeof changeUserBookDataSchema>>({
    resolver: zodResolver(changeUserBookDataSchema),
    defaultValues: {
      image: undefined,
      genre: '',
    },
  });

  const { data: genresData } = useErrorHandledQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
  );

  return (
    <Form {...changeUserBookDataForm}>
      <form
        className="flex flex-col space-y-4 items-center"
        onSubmit={changeUserBookDataForm.handleSubmit(async (data) => {
          await onSubmitChangeMyBookDataForm({
            ...data,
            image: file,
          });
          onSubmit();
        })}
      >
        <FormField
          name="image"
          control={changeUserBookDataForm.control}
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Obrazek</FormLabel>
              <FormControl>
                <FileInput
                  {...fieldProps}
                  type="file"
                  accept="image/jpeg"
                  fileName={(value as unknown as File)?.name}
                  onChange={(event) => {
                    onChange(event.target.files && event.target.files[0]);

                    setFile(event.target.files ? (event.target?.files[0] ?? undefined) : undefined);
                  }}
                  ref={fileInputRef}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="genre"
          control={changeUserBookDataForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      className="w-40"
                      placeholder={<span className="text-muted-foreground">Kategoria</span>}
                    />
                    <SelectContent>
                      {Object.values(genresData?.data ?? []).map((genre) => (
                        <SelectItem value={genre.id}>{genre.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectTrigger>
                </FormControl>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button
            className="w-40 text-primary bg-transparent"
            onClick={onCancel}
          >
            Wróć
          </Button>
          <Button
            className="w-40"
            type="submit"
            disabled={!changeUserBookDataForm.formState.isDirty || eitherMutationPending}
          >
            {!eitherMutationPending && 'Zapisz'}
            {eitherMutationPending && <LoadingSpinner size={24} />}
          </Button>
        </div>
      </form>
    </Form>
  );
};
