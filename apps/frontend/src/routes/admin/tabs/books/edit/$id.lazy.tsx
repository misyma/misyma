import { zodResolver } from '@hookform/resolvers/zod';
import { createLazyFileRoute } from '@tanstack/react-router';
import { CommandLoading } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type FindBookResponseBody, Language, type UpdateBookRequestBody } from '@common/contracts';

import { Route } from './$id';
import { AuthenticatedLayout } from '../../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { useFindAdminAuthorsQuery } from '../../../../../modules/author/api/admin/queries/findAdminAuthorsQuery/findAdminAuthorsQuery';
import { AuthorFieldTooltip } from '../../../../../modules/author/components/organisms/authorFieldTooltip';
import { createAuthorDraftSchema } from '../../../../../modules/author/schemas/createAuthorDraftSchema';
import { useUpdateBookMutation } from '../../../../../modules/book/api/admin/mutations/updateBookMutation/updateBookMutation';
import { FindBookByIdQueryOptions } from '../../../../../modules/book/api/user/queries/findBookById/findBookByIdQueryOptions';
import LanguageSelect from '../../../../../modules/book/components/molecules/languageSelect/languageSelect';
import { BookApiError } from '../../../../../modules/book/errors/bookApiError';
import { Button } from '../../../../../modules/common/components/button/button';
import { Checkbox } from '../../../../../modules/common/components/checkbox/checkbox';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../../modules/common/components/command/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../modules/common/components/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../modules/common/components/form/form';
import { Input } from '../../../../../modules/common/components/input/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../modules/common/components/popover/popover';
import { LoadingSpinner } from '../../../../../modules/common/components/spinner/loading-spinner';
import { useToast } from '../../../../../modules/common/components/toast/use-toast';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../../../../modules/common/contexts/breadcrumbKeysContext';
import { useErrorHandledQuery } from '../../../../../modules/common/hooks/useErrorHandledQuery';
import { cn } from '../../../../../modules/common/lib/utils';
import { isbnSchema } from '../../../../../modules/common/schemas/isbnSchema';
import { RequireAdmin } from '../../../../../modules/core/components/requireAdmin/requireAdmin';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type WriteablePayload = Writeable<UpdateBookRequestBody>;

const editBookFormSchema = z.object({
  isbn: isbnSchema.or(z.literal('')),
  title: z
    .string()
    .min(1, {
      message: 'Tytuł musi mieć co najmniej jeden znak.',
    })
    .max(256, {
      message: 'Tytuł może mieć maksymalnie 256 znaków.',
    })
    .optional(),
  author: z
    .string({
      required_error: 'Wymagany',
    })
    .uuid({
      message: 'Brak wybranego autora.',
    })
    .or(
      z.literal('', {
        required_error: 'Wymagany',
      }),
    ),
  authorName: z
    .string({
      required_error: 'Wymagany',
    })
    .regex(/\s/)
    .optional(),
  publisher: z
    .string()
    .min(1, {
      message: 'Nazwa wydawnictwa powinna mieć co namniej 1 znak.',
    })
    .max(128, {
      message: 'Nazwa wydawnictwa powinna mieć co najwyżej 128 znaków.',
    })
    .optional(),
  releaseYear: z
    .number({
      invalid_type_error: 'Rok wydania musi być liczbą.',
      required_error: 'Rok wyadania musi być liczbą.',
      coerce: true,
    })
    .min(1, {
      message: 'Rok wydania musi być późniejszy niż 1800',
    })
    .max(2100, {
      message: 'Rok wydania nie może być późniejszy niż 2100',
    }),
  language: z.enum(Object.values(Language) as unknown as [string, ...string[]]),
  translator: z
    .string({
      required_error: 'Przekład jest wymagany.',
    })
    .min(1, {
      message: 'Przekład jest zbyt krótki.',
    })
    .max(64, {
      message: 'Przekład może mieć maksymalnie 64 znaki.',
    })
    .or(z.literal('')),
  isApproved: z.boolean().optional(),
  // todo: validation
  // genre: z.string().min(1, {
  //   message: 'Niewłaściwa wartość',
  // }),
});

interface FormProps {
  data: FindBookResponseBody;
}

const BookEditForm: FC<FormProps> = ({ data }) => {
  const editBookForm = useForm<z.infer<typeof editBookFormSchema>>({
    resolver: zodResolver(editBookFormSchema),
    defaultValues: {
      isbn: data?.isbn ?? '',
      author: data?.authors[0]?.id ?? '',
      language: data?.language ?? '',
      publisher: data?.publisher,
      translator: data?.translator ?? '',
      title: data?.title,
      releaseYear: data?.releaseYear,
      isApproved: data?.isApproved,
    },
  });

  const { toast } = useToast();

  const { id } = Route.useParams();

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);

  const onOpenChange = (bool: boolean) => setCreateAuthorDialogVisible(bool);

  const [draftAuthorName, setDraftAuthorName] = useState('');

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const [authorSelectOpen, setAuthorSelectOpen] = useState(false);

  const { mutateAsync: updateBook } = useUpdateBookMutation({});

  const createAuthorDraftForm = useForm({
    resolver: zodResolver(createAuthorDraftSchema),
    values: {
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const {
    data: authors,
    isFetched,
    isLoading: loading,
  } = useFindAdminAuthorsQuery({
    name: searchedName,
  });

  const onSubmit = async (values: z.infer<typeof editBookFormSchema>) => {
    if (
      data?.isApproved === values.isApproved &&
      data?.title === values.title &&
      data?.releaseYear === values.releaseYear &&
      data?.language === values.language &&
      data?.translator === values.translator &&
      data?.isbn === values.isbn &&
      data.isApproved === values.isApproved
    ) {
      return;
    }

    try {
      const payload = (Object.entries(values) as [keyof WriteablePayload, string | number | boolean][]).reduce(
        (agg, [key, value]) => {
          if (value && key) {
            agg[key as keyof WriteablePayload] = value;

            return agg;
          }

          if (typeof value === 'boolean' && key) {
            agg[key as keyof WriteablePayload] = value;

            return agg;
          }

          return agg;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      ) as WriteablePayload;

      await updateBook({
        ...payload,
        bookId: id,
      });

      toast({
        title: 'Książka została zaaktualizowana.',
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        toast({
          title: 'Coś poszło nie tak...',
          description: error.context.message,
          variant: 'destructive',
        });
      }

      if (error instanceof Error) {
        toast({
          title: 'Coś poszło nie tak...',
          description: error.message,
        });

        return;
      }

      throw error;
    }
  };

  const onCreateAuthorDraft = (payload: z.infer<typeof createAuthorDraftSchema>): void => {
    setDraftAuthorName(payload.name);

    editBookForm.setValue('author', '', {
      shouldValidate: false,
    });

    editBookForm.setValue('authorName', payload.name, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true,
    });

    editBookForm.trigger('authorName', {});

    setCreateAuthorDialogVisible(false);
  };

  return (
    <Form {...editBookForm}>
      <form
        className="space-y-2"
        onSubmit={editBookForm.handleSubmit(onSubmit)}
      >
        <FormField
          name="isbn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input
                  placeholder="isbn"
                  type="text"
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={editBookForm.control}
          name="title"
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
          name="author"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2 items-center">
                <FormLabel>Autor</FormLabel>
                <AuthorFieldTooltip />
              </div>
              <FormControl>
                <Popover
                  open={authorSelectOpen}
                  onOpenChange={setAuthorSelectOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        size="xl"
                        className={cn(
                          'justify-between bg-[#D1D5DB]/20',
                          !field.value && 'text-muted-foreground',
                          draftAuthorName && 'text-black',
                        )}
                      >
                        {field.value
                          ? authors?.data.find((author) => author.id === field.value)?.name
                            ? authors?.data.find((author) => author.id === field.value)?.name || 'Wyszukaj autora'
                            : draftAuthorName || 'Wyszukaj autora'
                          : draftAuthorName || 'Wyszukaj autora'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 sm:w-96 p-0">
                    <Command>
                      <CommandInput
                        placeholder="Wyszukaj autora..."
                        onValueChange={setSearchedName}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            setAuthorSelectOpen(false);
                          }
                        }}
                      />

                      <CommandList>
                        {isFetched && authors?.data.length === 0 && (
                          <CommandEmpty className="flex flex-col px-4 py-4 gap-4">
                            {/* <p>Nie znaleziono autora - {searchedName} </p> */}
                            <>
                              <Dialog
                                open={createAuthorDialogVisible}
                                onOpenChange={(val) => {
                                  onOpenChange(val);

                                  createAuthorDraftForm.setValue('name', searchedName ?? '');
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button className="bg-slate-100 text-black hover:bg-slate-300">Dodaj</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Stwórz autora</DialogTitle>
                                  </DialogHeader>
                                  <Form {...createAuthorDraftForm}>
                                    <form
                                      className="flex flex-col gap-8 py-4"
                                      onSubmit={createAuthorDraftForm.handleSubmit(onCreateAuthorDraft)}
                                    >
                                      <FormField
                                        name="name"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Imię i nazwisko</FormLabel>
                                            <FormControl>
                                              <Input
                                                min={1}
                                                max={128}
                                                type="text"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage></FormMessage>
                                          </FormItem>
                                        )}
                                      />
                                      <Button
                                        disabled={!createAuthorDraftForm.formState.isValid}
                                        type="button"
                                        onClick={() => onCreateAuthorDraft(createAuthorDraftForm.getValues())}
                                      >
                                        Stwórz
                                      </Button>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                            </>
                          </CommandEmpty>
                        )}
                        {loading && <CommandLoading>Wyszukuję autorów</CommandLoading>}
                        {authors?.data.map((author) => (
                          <CommandItem
                            key={`author-${author.id}`}
                            value={author.name}
                            onSelect={() => {
                              editBookForm.setValue('author', author.id);

                              editBookForm.setValue('authorName', undefined);

                              setDraftAuthorName('');

                              editBookForm.trigger('author');
                            }}
                          >
                            <Check
                              className={cn('mr-2 h-4 w-4', author.id === field.value ? 'opacity-100' : 'opacity-0')}
                            />
                            {author.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="publisher"
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
        <FormField
          name="releaseYear"
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
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Język</FormLabel>
              <LanguageSelect
                type="form"
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="translator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Przekład</FormLabel>
              <FormControl>
                <Input
                  placeholder="Przekład"
                  type="text"
                  includeQuill={false}
                  {...field}
                  onChange={(val) => {
                    field.onChange(val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="isApproved"
          render={({ field }) => (
            <FormItem className="flex gap-2 pb-2">
              <FormLabel>Zaakceptowana?</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Zapisz</Button>
        {/* <FormField
      name="genre"
      render={({ field }) => (
        <FormItem>
          <FormLabel></FormLabel>
          <FormControl>
            <Input></Input>
          </FormControl>
        </FormItem>
      )}
    /> */}
      </form>
    </Form>
  );
};

const BooksEdit: FC = () => {
  const { id } = Route.useParams();

  const dispatch = useBreadcrumbKeysDispatch();

  const breadcrumbKeys = useBreadcrumbKeysContext();

  const { data, isFetching, isRefetching } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      bookId: id,
    }),
  );

  if (isFetching && !isRefetching) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  if (!breadcrumbKeys['$bookId']) {
    dispatch({
      key: '$bookId',
      value: id,
    });
  }

  if (data?.title && !breadcrumbKeys['$bookName']) {
    dispatch({
      key: '$bookName',
      value: data?.title,
    });
  }

  return (
    <AuthenticatedLayout>
      <div className="w-full flex items-center justify-center pt-4">
        <BookEditForm data={data as FindBookResponseBody}></BookEditForm>
      </div>
    </AuthenticatedLayout>
  );
};

export const LazyRoute = createLazyFileRoute('/admin/tabs/books/edit/$id')({
  component: () => {
    return (
      <RequireAdmin>
        <BooksEdit />
      </RequireAdmin>
    );
  },
});
