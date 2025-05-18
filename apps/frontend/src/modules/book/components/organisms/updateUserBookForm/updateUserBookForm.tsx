import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type UserBook } from '@common/contracts';

import { Button } from '../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { ImageFileInput } from '../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
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
      image: values.image as unknown as File,
    });
  };

  const changeUserBookDataForm = useForm<z.infer<typeof changeUserBookDataSchema>>({
    resolver: zodResolver(changeUserBookDataSchema),
    defaultValues: {
      image: undefined,
    },
  });

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
                <ImageFileInput
                  {...fieldProps}
                  type="file"
                  fileName={(value as unknown as File)?.name}
                  onFileInput={(file) => {
                    onChange(file);
                    setFile(file ?? undefined);
                  }}
                />
              </FormControl>
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
