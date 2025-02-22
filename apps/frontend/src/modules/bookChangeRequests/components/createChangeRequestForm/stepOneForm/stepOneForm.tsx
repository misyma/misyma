import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronsUpDown } from 'lucide-react';
import { type FC, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { useFindAuthorsQuery } from '../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { AuthorFieldTooltip } from '../../../../author/components/authorFieldTooltip';
import { AuthorSearchSelector } from '../../../../author/components/authorSearchSelector/authorSearchSelector';
import { type createAuthorDraftSchema } from '../../../../author/schemas/createAuthorDraftSchema';
import { FindBookByIdQueryOptions } from '../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useBookDetailsChangeRequestContext } from '../../../../book/context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { Button } from '../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { Input } from '../../../../common/components/input/input';
import { Popover, PopoverTrigger } from '../../../../common/components/popover/popover';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../../common/lib/utils';
import { isbnSchema } from '../../../../common/schemas/isbnSchema';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../../user/api/queries/findUserQuery/findUserQuery';

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
    .string()
    .uuid({
      message: 'Brak wybranego autora.',
    })
    .or(z.literal('')),
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
    .or(z.literal('')),
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
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData, isFetched: isUserDataFetched } = useFindUserQuery();

  const { data: userBookData, isFetched: isUserBookDataFetched } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { isFetched: isBookDataFetched } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

  if (!isUserDataFetched || !isBookDataFetched || !isUserBookDataFetched) {
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
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const context = useBookDetailsChangeRequestContext();

  const { data: userData } = useFindUserQuery();

  const { data: userBookData } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { data: bookData } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

  const [currentAuthorId, setCurrentAuthorId] = useState(context.authorIds ?? bookData?.authors[0].id ?? '');
  const [draftAuthorName, setDraftAuthorName] = useState(context.authorName ?? '');
  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const onOpenChange = (bool: boolean) => setCreateAuthorDialogVisible(bool);

  const onCreateAuthorDraft = (payload: z.infer<typeof createAuthorDraftSchema>): void => {
    setDraftAuthorName(payload.name);

    // eslint-disable-next-line
    stepOneForm.setValue('authorIds', undefined as any);

    // eslint-disable-next-line
    stepOneForm.setValue('authorName', payload.name as any, {
      shouldValidate: true,
    });

    setCreateAuthorDialogVisible(false);
  };

  const stepOneForm = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      isbn: (context.isbn || bookData?.isbn) ?? '',
      title: (context.title || bookData?.title) ?? '',
      authorIds: !draftAuthorName ? (context.authorIds ?? bookData?.authors[0].id ?? '') : '',
      authorName: draftAuthorName ?? '',
      publisher: (context.publisher || bookData?.publisher) ?? '',
      releaseYear: (context.releaseYear || bookData?.releaseYear) ?? ('' as const),
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { data: currentAuthor, isFetching: isFetchingCurrentAuthor } = useFindAuthorsQuery({
    ids: currentAuthorId ? [currentAuthorId] : [],
  });

  const authorName = useMemo(() => {
    if (draftAuthorName) {
      return draftAuthorName;
    }

    if (currentAuthor) {
      return currentAuthor.data[0].name;
    }

    return 'Wyszukaj autora';
  }, [currentAuthor, draftAuthorName]);

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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex gap-2 items-center">
                <FormLabel>Autor</FormLabel>
                <AuthorFieldTooltip />
              </div>
              <FormControl>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="link"
                        role="combobox"
                        size="xl"
                        className={cn(
                          'justify-between bg-[#D1D5DB]/20',
                          !field.value && 'text-muted-foreground',
                          draftAuthorName && 'text-black',
                          'border',
                        )}
                        style={{
                          height: '3rem',
                        }}
                      >
                        <p
                          className={cn(
                            !field.value && 'text-muted-foreground',
                            draftAuthorName && 'text-black',
                            'w-full text-start px-3',
                          )}
                        >
                          {field.value && isFetchingCurrentAuthor && <LoadingSpinner size={20} />}
                          {field.value && !isFetchingCurrentAuthor ? authorName : ''}
                        </p>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <AuthorSearchSelector
                    dialog={true}
                    createAuthorDialogVisible={createAuthorDialogVisible}
                    setAuthorSelectOpen={onOpenChange}
                    currentlySelectedAuthorId={field.value}
                    onCreateAuthorDraft={onCreateAuthorDraft}
                    onSelect={(authorId) => {
                      stepOneForm.setValue('authorIds', authorId);

                      stepOneForm.setValue('authorName', '');

                      setCurrentAuthorId(authorId);

                      setDraftAuthorName('');
                    }}
                    includeAuthorCreation={true}
                  />
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
            onClick={() => {
              stepOneForm.reset();
              onCancel();
            }}
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
