import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/form/form';
import { Input } from '../../../../../common/components/input/input';
import { Button } from '../../../../../common/components/button/button';
import {
  Popover,
  PopoverTrigger,
} from '../../../../../common/components/popover/popover';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../../../common/lib/utils';
import { useCallback as useMemo, useState } from 'react';
import { isbnSchema } from '../../../../../common/schemas/isbnSchema';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../../common/components/tooltip/tooltip';
import { useFindAuthorsQuery } from '../../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { findUserBooksBy } from '../../../../api/user/queries/findUserBookBy/findUserBooksBy';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { toast } from '../../../../../common/components/toast/use-toast';
import { BookApiError } from '../../../../errors/bookApiError';
import { LoadingSpinner } from '../../../../../common/components/spinner/loading-spinner';
import { createAuthorDraftSchema } from '../../../../../author/schemas/createAuthorDraftSchema';
import { AuthorSearchSelector } from '../../../../../auth/components/authorSearchSelector/authorSearchSelector';

const stepOneSchema = z
  .object({
    isbn: isbnSchema.or(z.literal('')),
    title: z
      .string()
      .min(1, {
        message: 'Tytuł musi mieć co najmniej jeden znak.',
      })
      .max(256, {
        message: 'Tytuł może mieć maksymalnie 256 znaków.',
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
        })
      ),
    authorName: z
      .string({
        required_error: 'Wymagany',
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
    yearOfIssue: z
      .number({
        invalid_type_error: 'Rok wydania musi być liczbą.',
        required_error: 'Rok wyadania musi być liczbą.',
        coerce: true,
      })
      .min(1, {
        message: 'Rok wydania musi być wcześniejszy niż 1',
      })
      .max(2100, {
        message: 'Rok wydania nie może być późniejszy niż 2100',
      })
      .or(z.literal('')),
  })
  .refine((data) => !!data.author || data.authorName, 'Autor jest wymagany.');

export const ManualStepOneForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const [submitError, setSubmitError] = useState('');
  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] =
    useState(false);
  const [draftAuthorName, setDraftAuthorName] = useState(
    bookCreation.stepOneDetails?.authorName
  );
  const [authorSelectOpen, setAuthorSelectOpen] = useState(false);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const dispatch = useBookCreationDispatch();

  const form = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      isbn: bookCreation.stepOneDetails?.isbn ?? '',
      title: bookCreation.stepOneDetails?.title ?? '',
      author: bookCreation.stepOneDetails?.author ?? '',
      authorName: bookCreation.stepOneDetails?.authorName ?? undefined,
      publisher: bookCreation.stepOneDetails?.publisher ?? '',
      yearOfIssue: bookCreation.stepOneDetails?.yearOfIssue
        ? bookCreation.stepOneDetails?.yearOfIssue
        : '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const onCreateAuthorDraft = (
    payload: z.infer<typeof createAuthorDraftSchema>
  ): void => {
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
    if (form.formState.touchedFields.title) {
      form.trigger('authorName', {});
    }

    setCreateAuthorDialogVisible(false);
  };

  const onOpenChange = (bool: boolean) => setCreateAuthorDialogVisible(bool);

  const onSubmit = async (
    values: Partial<z.infer<typeof stepOneSchema>> & {
      yearOfIssue: number | string;
    }
  ) => {
    const vals = values as z.infer<typeof stepOneSchema>;

    if (vals.isbn) {
      try {
        const exists = await findUserBooksBy({
          accessToken: accessToken as string,
          isbn: vals.isbn,
        });

        if (exists.data.length > 0) {
          toast({
            title: 'Posiadasz już książkę z tym numerem isbn!',
            variant: 'destructive',
          });

          return;
        }
      } catch (error) {
        if (error instanceof BookApiError) {
          setSubmitError(error.message);
        }
      }
    }

    dispatch({
      type: BookCreationActionType.nonIsbnStepOneDetails,
      author: vals.author as string,
      authorName: bookCreation.stepOneDetails?.authorName || vals?.authorName,
      isbn: vals.isbn,
      publisher: vals.publisher,
      title: vals.title,
      yearOfIssue: vals.yearOfIssue as unknown as number,
    });

    dispatch({
      type: BookCreationActionType.setStep,
      step: NonIsbnCreationPathStep.inputSecondDetails,
    });
  };

  const { data: currentAuthor, isFetching: isFetchingCurrentAuthor } =
    useFindAuthorsQuery({
      ids: bookCreation.stepOneDetails?.author
        ? [bookCreation.stepOneDetails?.author]
        : [],
    });

  const authorName = useMemo(() => {
    if (currentAuthor) {
      return currentAuthor.data[0].name;
    }

    if (!draftAuthorName) {
      return 'Wyszukaj autora';
    }

    return draftAuthorName;
  }, [currentAuthor, draftAuthorName]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(
            // eslint-disable-next-line
            values as any
          )
        )}
        className="space-y-4"
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
                  maxLength={257}
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
                        Imię i nazwisko autora musi mieć minimum 3 znaki
                        <br></br> i zawierać spację oddzielającą imię i
                        nazwisko.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Popover
                  open={authorSelectOpen}
                  onOpenChange={setAuthorSelectOpen}
                >
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
                          'border h-12'
                        )}
                        style={{
                          height: '3rem',
                        }}
                      >
                        <p
                          className={cn(
                            !field.value && 'text-muted-foreground',
                            draftAuthorName && 'text-black',
                            'w-full text-start px-3 py-2'
                          )}
                        >
                          {field.value && isFetchingCurrentAuthor && (
                            <LoadingSpinner size={20} />
                          )}
                          {draftAuthorName}
                          {field.value && !isFetchingCurrentAuthor
                            ? authorName()
                            : ''}
                        </p>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <AuthorSearchSelector
                    createAuthorDialogVisible={createAuthorDialogVisible}
                    setAuthorSelectOpen={onOpenChange}
                    currentlySelectedAuthorId={field.value}
                    onCreateAuthorDraft={onCreateAuthorDraft}
                    onSelect={(authorId) => {
                      form.setValue('author', authorId);
                      form.setValue('authorName', '');
                      setDraftAuthorName('');

                      dispatch({
                        type: BookCreationActionType.setAuthor,
                        author: authorId,
                      });

                      form.trigger('author');
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
        <div className="flex flex-col w-full justify-between gap-4">
          <Button
            size="xl"
            className="border border-primary w-full"
            disabled={!form.formState.isValid}
            type="submit"
          >
            Kontynuuj
          </Button>
          {submitError && <div>XD</div>}
        </div>
      </form>
    </Form>
  );
};
