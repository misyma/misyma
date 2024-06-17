import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../context/bookCreationContext/bookCreationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/ui/form';
import { Input } from '../../../../../common/components/ui/input';
import { Button } from '../../../../../common/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../common/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../../common/components/ui/command';
import { cn } from '../../../../../common/lib/utils';
import { useState } from 'react';
import { CommandLoading } from 'cmdk';
import { isbnSchema } from '../../../../../common/schemas/isbnSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../common/components/ui/dialog';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../../common/components/ui/tooltip';
import { useFindAuthorsQuery } from '../../../../../author/api/queries/findAuthorsQuery/findAuthorsQuery';

const pattern = /^[A-Z][^\\x00-\\x7F]*, [A-Z]\. [A-Z]\.$/;

const stepOneSchema = z
  .object({
    isbn: isbnSchema.or(z.literal('')),
    title: z
      .string()
      .min(1, {
        message: 'Tytuł musi mieć co najmniej jeden znak.',
      })
      .max(64, {
        message: 'Tytuł może mieć maksymalnie 64 znaki.',
      }),
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
      .regex(pattern)
      .optional(),
    publisher: z
      .string()
      .min(1, {
        message: 'Nazwa wydawnictwa powinna mieć co namniej 1 znak.',
      })
      .max(64, {
        message: 'Nazwa wydawnictwa powinna mieć co najwyżej 64 znaki.',
      }),
    yearOfIssue: z
      .number({
        invalid_type_error: 'Rok wydania musi być liczbą.',
        required_error: 'Rok wyadania musi być liczbą.',
        coerce: true,
      })
      .min(1800, {
        message: 'Rok wydania musi być późniejszy niż 1800',
      })
      .max(2500, {
        message: 'Rok wydania nie może być późniejszy niż 2500',
      }),
  })
  .refine((data) => !!data.author || data.authorName, 'Autor jest wymagany.');

const createAuthorDraftSchema = z.object({
  name: z
    .string({
      required_error: 'Imię jest wymagane.',
    })
    .min(1, {
      message: 'Imię autora musi miec co najmniej jeden znak.',
    })
    .regex(pattern, 'Błędny format.'),
});

export const ManualStepOneForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);

  const [draftAuthorName, setDraftAuthorName] = useState(bookCreation.stepOneDetails?.authorName);

  const form = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      isbn: bookCreation.stepOneDetails?.isbn ?? '',
      title: bookCreation.stepOneDetails?.title ?? '',
      author: bookCreation.stepOneDetails?.author ?? '',
      authorName: bookCreation.stepOneDetails?.authorName ?? undefined,
      publisher: bookCreation.stepOneDetails?.publisher ?? '',
      yearOfIssue: bookCreation.stepOneDetails?.yearOfIssue ?? '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const createAuthorDraftForm = useForm({
    resolver: zodResolver(createAuthorDraftSchema),
    values: {
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const onCreateAuthorDraft = (payload: z.infer<typeof createAuthorDraftSchema>): void => {
    setDraftAuthorName(payload.name);

    dispatch({
      type: BookCreationActionType.setAuthorName,
      authorName: payload.name,
    });

     
    form.setValue('author', '', {
      shouldValidate: false,
    });

    form.setValue('authorName', payload.name, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (
      form.formState.touchedFields.isbn &&
      form.formState.touchedFields.publisher &&
      form.formState.touchedFields.title &&
      form.formState.touchedFields.yearOfIssue
    ) {
      form.trigger('authorName', {});
    }

    setCreateAuthorDialogVisible(false);
  };

  const onOpenChange = (bool: boolean) => setCreateAuthorDialogVisible(bool);

  const onSubmit = (
    values: Partial<z.infer<typeof stepOneSchema>> & {
      yearOfIssue: number | string;
    },
  ) => {
    const vals = values as z.infer<typeof stepOneSchema>;

    dispatch({
      type: BookCreationActionType.nonIsbnStepOneDetails,
      author: vals.author as string,
      authorName: bookCreation.stepOneDetails?.authorName || vals?.authorName,
      isbn: vals.isbn,
      publisher: vals.publisher,
      title: vals.title,
      yearOfIssue: vals.yearOfIssue,
    });

    dispatch({
      type: BookCreationActionType.setStep,
      step: NonIsbnCreationPathStep.inputSecondDetails,
    });
  };

  const {
    data: authors,
    isFetched,
    isLoading: loading,
  } = useFindAuthorsQuery({
    name: searchedName,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(
            // eslint-disable-next-line
            values as any,
          ),
        )}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="isbn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input
                  placeholder="111-11-1111-111-1"
                  type="text"
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setIsbn,
                      isbn: e.currentTarget.value,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tytuł"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setTitle,
                      title: e.currentTarget.value,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-60 sm:w-96 justify-between bg-[#D1D5DB]/20',
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
                      />

                      <CommandList>
                        {isFetched && authors?.data.length === 0 && (
                          <CommandEmpty className="flex flex-col px-4 py-4 gap-4">
                            {/* <p>Nie znaleziono autora - {searchedName} </p> */}
                            <>
                              <Dialog
                                open={createAuthorDialogVisible}
                                onOpenChange={onOpenChange}
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
                                            <FormLabel>Imię</FormLabel>
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
                                        type="submit"
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
                              form.setValue('author', author.id);

                              form.setValue('authorName', undefined);

                              setDraftAuthorName('');

                              dispatch({
                                type: BookCreationActionType.setAuthor,
                                author: author.id,
                              });
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
          control={form.control}
          name="yearOfIssue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rok wydania</FormLabel>
              <FormControl>
                <Input
                  placeholder="1939"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setYearOfIssue,
                      yearOfIssue: Number(e.currentTarget.value),
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publisher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wydawnictwo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wydawnictwo"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setPublisher,
                      publisher: e.currentTarget.value,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row w-full justify-between gap-4">
          <Button
            className="border border-primary w-full"
            disabled={!form.formState.isValid}
            type="submit"
          >
            Kontynuuj
          </Button>
        </div>
      </form>
    </Form>
  );
};
