import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { useSelector } from 'react-redux';

import { AuthorMultiCombobox } from '../../../../../author/components/authorMultiCombobox/authorMultiCombobox';
import {
  BookCreationActionType,
  type BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../../bookshelf/context/bookCreationContext/bookCreationContext';
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
import { toast } from '../../../../../common/components/toast/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../../common/components/tooltip/tooltip';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { findUserBooksBy } from '../../../../api/user/queries/findUserBookBy/findUserBooksBy';
import { BookApiError } from '../../../../errors/bookApiError';
import { type CreateBookStepOne, createBookStepOneSchema } from '../../../../schemas/createBookSchemas';

export const ManualStepOneForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const [submitError, setSubmitError] = useState('');

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const dispatch = useBookCreationDispatch();

  const form = useForm({
    resolver: zodResolver(createBookStepOneSchema),
    defaultValues: {
      isbn: bookCreation.stepOneDetails?.isbn ?? '',
      title: bookCreation.stepOneDetails?.title ?? '',
      authorIds: bookCreation.stepOneDetails?.authorIds ?? '',
      publisher: bookCreation.stepOneDetails?.publisher ?? '',
      releaseYear: bookCreation.stepOneDetails?.releaseYear,
    },
    reValidateMode: 'onBlur',
    mode: 'onChange',
  });

  const onOpenChange = (bool: boolean) => setCreateAuthorDialogVisible(bool);

  const onSubmit = async (
    values: Partial<CreateBookStepOne> & {
      releaseYear: number | string;
    },
  ) => {
    const vals = values as CreateBookStepOne;

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
      authorIds: vals.authorIds,
      isbn: vals.isbn,
      publisher: vals.publisher,
      title: vals.title,
      releaseYear: vals.releaseYear as number,
    });

    dispatch({
      type: BookCreationActionType.setStep,
      step: NonIsbnCreationPathStep.inputSecondDetails,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(
            // eslint-disable-next-line
            values as any,
          ),
        )}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="isbn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span>ISBN</span> <span className="text-gray-500">(opcjonalne)</span>
              </FormLabel>
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
          name="authorIds"
          render={({}) => (
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
                        setAuthorSelectOpen={onOpenChange}
                        placeholder="Wybierz autorów"
                        onValueChange={(v) => {
                          form.setValue(
                            'authorIds',
                            v.map((v) => v.value),
                          );

                          form.trigger('authorIds');
                        }}
                        defaultValue={bookCreation.stepOneDetails?.authorIds ?? []}
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
          control={form.control}
          name="releaseYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span>Rok wydania</span>{' '}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="1939"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setYearOfIssue,
                      releaseYear: Number(e.currentTarget.value),
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
              <FormLabel>
                <span>Wydawnictwo</span> <span className="text-gray-500">(opcjonalne)</span>
              </FormLabel>
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
