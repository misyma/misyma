import { HiOutlineInformationCircle } from 'react-icons/hi';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { Input } from '../../../../common/components/input/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import { DialogPopoverContent, Popover, PopoverTrigger } from '../../../../common/components/popover/popover';
import { Button } from '../../../../common/components/button/button';
import { cn } from '../../../../common/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../common/components/command/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../common/components/dialog/dialog';
import { CommandLoading } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { isbnSchema } from '../../../../common/schemas/isbnSchema';
import { z } from 'zod';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFindUserQuery } from '../../../../user/api/queries/findUserQuery/findUserQuery';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { useFindAuthorsQuery } from '../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { FindBookByIdQueryOptions } from '../../../api/user/queries/findBookById/findBookByIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';

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

export const StepOneForm: FC<Props> = ({ bookId, onCancel, onSubmit }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData, isFetched: isUserDataFetched } = useFindUserQuery();

  const { data: userBookData, isFetched: isUserBookDataFetched } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { isFetched: isBookDataFetched } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

  if (!isUserDataFetched) {
    return <LoadingSpinner />;
  }

  if (!isBookDataFetched) {
    return <LoadingSpinner />;
  }

  if (!isUserBookDataFetched) {
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

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);

  const [draftAuthorName, setDraftAuthorName] = useState('');

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const onOpenChange = (bool: boolean) => setCreateAuthorDialogVisible(bool);

  const {
    data: authors,
    isFetched,
    isLoading: loading,
  } = useFindAuthorsQuery({
    name: searchedName,
  });

  const { data: userData } = useFindUserQuery();

  const { data: userBookData } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const createAuthorDraftForm = useForm({
    resolver: zodResolver(createAuthorDraftSchema),
    values: {
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { data: bookData } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

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
      isbn: bookData?.isbn ?? '',
      title: bookData?.title ?? '',
      authorIds: bookData?.authors[0].id ?? '',
      authorName: '',
      publisher: bookData?.publisher ?? '',
      releaseYear: bookData?.releaseYear ?? undefined,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  console.log(stepOneForm.getValues())

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
                          {field.value
                            ? authors?.data.find((author) => author.id === field.value)?.name
                              ? authors?.data.find((author) => author.id === field.value)?.name || 'Wyszukaj autora'
                              : draftAuthorName || bookData?.authors[0]?.name || 'Wyszukaj autora'
                            : draftAuthorName || bookData?.authors[0]?.name || 'Wyszukaj autora'}
                        </p>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <DialogPopoverContent className="w-60 sm:w-96 p-0">
                    <Command>
                      <CommandInput
                        disabled={false}
                        placeholder="Wyszukaj autora..."
                        onValueChange={setSearchedName}
                      />
                      <CommandList>
                        {isFetched && authors?.data.length === 0 && (
                          <CommandEmpty className="flex flex-col px-4 py-4 gap-4">
                            {/* <p>Nie znaleziono autora - {searchedName} </p> */}
                            <>
                              <Dialog
                                modal={true}
                                open={createAuthorDialogVisible}
                                onOpenChange={(val) => {
                                  onOpenChange(val);

                                  createAuthorDraftForm.setValue('name', searchedName ?? '');
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button className="bg-slate-100 text-black hover:bg-slate-300">Dodaj</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md z-[100]">
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
                              stepOneForm.setValue('authorIds', author.id);

                              stepOneForm.setValue('authorName', '');

                              setDraftAuthorName('');
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
                  </DialogPopoverContent>
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
