import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type UserBook } from '@common/contracts';

import { getGenresQueryOptions } from '../../../../../modules/genres/api/queries/getGenresQuery/getGenresQueryOptions';
import { Button } from '../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { FileInput } from '../../../../common/components/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../common/components/select/select';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { useUpdateUserBook } from '../../../hooks/updateUserBook/updateUserBook';

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

export const UpdateUserBookForm: FC<Props> = ({ bookId, onSubmit, onCancel }) => {
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

  const { update, isUpdatePending, isImageUploadPending } = useUpdateUserBook(bookId);

  const eitherMutationPending = isUpdatePending || isImageUploadPending;

  const onSubmitChangeMyBookDataForm = async (values: z.infer<typeof changeUserBookDataSchema>) => {
    await update({
      genre: values.genre,
      image: values.image as unknown as File,
    });
  };

  const changeUserBookDataForm = useForm<z.infer<typeof changeUserBookDataSchema>>({
    resolver: zodResolver(changeUserBookDataSchema),
    defaultValues: {
      image: undefined,
      genre: '',
    },
  });

  const { data: genresData } = useErrorHandledQuery(getGenresQueryOptions({}));

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
