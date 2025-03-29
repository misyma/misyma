import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { z } from 'zod';

import { AuthorMultiCombobox } from '../../../../../author/components/organisms/authorMultiCombobox/authorMultiCombobox';
import { FindBookByIdQueryOptions } from '../../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { Button } from '../../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/form/form';
import { Input } from '../../../../../common/components/input/input';
import { Popover, PopoverTrigger } from '../../../../../common/components/popover/popover';
import { LoadingSpinner } from '../../../../../common/components/spinner/loading-spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../../common/components/tooltip/tooltip';
import { useErrorHandledQuery } from '../../../../../common/hooks/useErrorHandledQuery';
import { isbnSchema } from '../../../../../common/schemas/isbnSchema';
import { useAdminEditBookContext } from '../../../../context/adminEditBookContext/adminEditBookContext';

const stepOneSchema = z.object({
  isbn: isbnSchema.optional().or(z.literal('')),
  title: z
    .string()
    .min(1, {
      message: 'Tytuł musi mieć co najmniej jeden znak.',
    })
    .max(128, {
      message: 'Tytuł może mieć maksymalnie 64 znaki.',
    })
    .or(z.literal('')),
  authorIds: z
    .array(
      z
        .string({
          required_error: 'Wymagany',
        })
        .uuid({
          message: 'Brak wybranego autora.',
        }),
    )
    .min(1, {
      message: 'Wymagany jest co najmniej jeden autor.',
    }),
  authorName: z.string().min(1).max(64).optional(),
  releaseYear: z
    .number({
      coerce: true,
    })
    .min(1, {
      message: 'Rok wydania musi być wcześniejszy niż 1',
    })
    .max(2100, {
      message: 'Rok wydania nie może być późniejszy niż 2100',
    })
    .or(z.undefined()),
  publisher: z
    .string()
    .min(1, {
      message: 'Nazwa wydawnictwa powinna mieć co namniej 1 znak.',
    })
    .max(128, {
      message: 'Nazwa wydawnictwa powinna mieć co najwyżej 128 znaków.',
    })
    .or(z.literal('')),
});

interface Props {
  onCancel: () => void;
  onSubmit: (values: z.infer<typeof stepOneSchema>) => void;
  bookId: string;
}

export const StepOneForm: FC<Props> = ({ bookId, onCancel, onSubmit }) => {
  const { isFetched: isBookDataFetched } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      bookId,
    }),
  );

  if (!isBookDataFetched) {
    return <LoadingSpinner />;
  }

  return (
    <ModalForm
      bookId={bookId}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
};

const ModalForm: FC<Props> = ({ bookId, onSubmit, onCancel }) => {
  const { authorIds } = useAdminEditBookContext();

  const { data: bookData } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      bookId,
    }),
  );

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const stepOneForm = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      isbn: bookData?.isbn ?? '',
      title: bookData?.title ?? '',
      authorIds: authorIds ?? bookData?.authors[0].id ?? '',
      publisher: bookData?.publisher ?? '',
      releaseYear: bookData?.releaseYear,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  return (
    <Form {...stepOneForm}>
      <form
        onSubmit={stepOneForm.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          name="isbn"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input
                  placeholder="111-11-1111-111-1"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="title"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tytuł"
                  type="text"
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="authorIds"
          control={stepOneForm.control}
          render={() => (
            <FormItem className="flex flex-col">
              <div className="flex gap-2 items-center">
                <FormLabel>Autor</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <HiOutlineInformationCircle className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Prosimy, podaj nazwisko i imię autora w<br></br> następującym formacie: "Rowling, J. K."
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <AuthorMultiCombobox
                        createAuthorDialogVisible={createAuthorDialogVisible}
                        onValueChange={(v) => {
                          stepOneForm.setValue(
                            'authorIds',
                            v.map((v) => v.value),
                          );

                          stepOneForm.trigger('authorIds');

                          setCreateAuthorDialogVisible(false);
                        }}
                        defaultValue={bookData?.authors.map((a) => a.id)}
                        setAuthorSelectOpen={setCreateAuthorDialogVisible}
                      />
                    </FormControl>
                  </PopoverTrigger>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="releaseYear"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rok wydania</FormLabel>
              <FormControl>
                <Input
                  placeholder="1939"
                  type="text"
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="publisher"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wydawnictwo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wydawnictwo"
                  type="text"
                  maxLength={128}
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row w-full justify-between gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={onCancel}
            className="border border-primary w-full bg-transparent text-primary"
          >
            Wróć
          </Button>
          <Button
            type="submit"
            size="lg"
            className="border border-primary w-full"
            onClick={() => {
              onSubmit(stepOneForm.getValues());
            }}
          >
            Kontynuuj
          </Button>
        </div>
      </form>
    </Form>
  );
};
