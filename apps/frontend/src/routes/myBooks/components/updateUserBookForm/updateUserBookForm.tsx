import { FC, useEffect, useRef, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../modules/common/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { FileInput } from '../../../../modules/common/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../modules/common/components/ui/select';
import { Button } from '../../../../modules/common/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { getGenresQueryOptions } from '../../../../api/genres/queries/getGenresQuery/getGenresQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';

const changeUserBookDataSchema = z.object({
  image: z.optional(
    z.object(
      {},
      {
        required_error: 'Wymagany.',
      },
    ),
  ),
  genre: z.string().min(1, {
    message: 'Niewłaściwa wartość',
  }),
});

interface Props {
  onSubmit: (values: z.infer<typeof changeUserBookDataSchema>) => Promise<void>;
  onCancel: () => void;
}

export const UpdateUserBookForm: FC<Props> = ({ onSubmit, onCancel }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

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

  const changeUserBookDataForm = useForm<z.infer<typeof changeUserBookDataSchema>>({
    resolver: zodResolver(changeUserBookDataSchema),
    defaultValues: {
      image: undefined,
      genre: '',
    },
  });

  const { data: genresData } = useQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
  );

  return (
    <Form {...changeUserBookDataForm}>
      <form
        className="flex flex-col space-y-4 items-center"
        onSubmit={changeUserBookDataForm.handleSubmit(async (data) => {
          await onSubmit({
            ...data,
            image: file,
          });
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

                    setFile(event.target.files ? event.target?.files[0] ?? undefined : undefined);
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
          >
            Zapisz
          </Button>
        </div>
      </form>
    </Form>
  );
};
