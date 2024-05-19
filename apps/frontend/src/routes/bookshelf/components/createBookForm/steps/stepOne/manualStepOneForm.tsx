import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../context/bookCreationContext/bookCreationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../../components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../../../../../../components/ui/command';
import { cn } from '../../../../../../lib/utils';
import { useFindAuthorsQuery } from '../../../../../../api/authors/queries/findAuthorsQuery/findAuthorsQuery';
import { useState } from 'react';
import { CommandLoading } from 'cmdk';
import { isbnSchema } from '../../../../../../common/schemas/isbnSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../../components/ui/dialog';
import { useCreateAuthorDraftMutation } from '../../../../../../api/authors/mutations/createAuthorDraftMutation/createAuthorDraftMutation';

const stepOneSchema = z.object({
  isbn: isbnSchema,
  title: z
    .string()
    .min(1, {
      message: 'Tytuł musi mieć co najmniej jeden znak.',
    })
    .max(64, {
      message: 'Tytuł może mieć maksymalnie 64 znaki.',
    }),
  author: z.string().uuid({
    message: 'Brak wybranego autora.',
  }),
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
      coerce: true,
    })
    .min(1800, {
      message: 'Rok wydania musi być późniejszy niż 1800',
    })
    .max(2500, {
      message: 'Rok wydania nie może być późniejszy niż 2500',
    }),
});

const createAuthorDraftSchema = z.object({
  name: z
    .string({
      required_error: 'Imię jest wymagane.',
    })
    .min(1, {
      message: 'Imię autora musi miec co najmniej jeden znak.',
    })
    .max(128, {
      message: 'Imię autora może mieć maksymalnie 128 znaków.',
    }),
});

export const ManualStepOneForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);

  const [draftAuthorId, setDraftAuthorId] = useState<string | null>(null);

  const [draftAuthorName, setDraftAuthorName] = useState<string | null>(null);

  const { mutateAsync: createAuthorDraft } = useCreateAuthorDraftMutation({});

  const form = useForm({
    resolver: zodResolver(stepOneSchema),
    values: {
      isbn: bookCreation.stepOneDetails?.isbn ?? '',
      title: bookCreation.stepOneDetails?.title ?? '',
      author: bookCreation.stepOneDetails?.author ?? '',
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

  const onCreateAuthorDraft = async (payload: z.infer<typeof createAuthorDraftSchema>): Promise<void> => {
    const response = await createAuthorDraft({
      name: payload.name,
    });

    setDraftAuthorId(response.id);

    setDraftAuthorName(response.name);

    form.setValue('author', response.id);

    dispatch({
      type: BookCreationActionType.setAuthor,
      author: response.id,
    });

    form.trigger('author');

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
      author: vals.author,
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
            values as Partial<z.infer<typeof stepOneSchema>> & {
              yearOfIssue: number | string;
            },
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
              <FormLabel>Autor</FormLabel>
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
                        )}
                      >
                        {field.value
                          ? draftAuthorId && draftAuthorName
                            ? draftAuthorName
                            : authors?.data.find((author) => author.id === field.value)?.name ?? 'Wyszukaj autora'
                          : 'Wyszukaj autora'}
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
