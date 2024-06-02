import { BookFormat as ContractBookFormat, Language } from '@common/contracts';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Languages } from '../../../../common/constants/languages';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { FindBookByIdQueryOptions } from '../../../../api/books/queries/findBookById/findBookByIdQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { useFindUserBookQuery } from '../../../../api/books/queries/findUserBook/findUserBookQuery';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery';
import { StepOneForm } from './stepOneForm/stepOneForm';
import { BookFormat } from '../../../../common/constants/bookFormat';
import { useUpdateBookMutation } from '../../../../api/books/mutations/updateBookMutation/updateBookMutation';
import {
  BookDetailsChangeRequestAction,
  useBookDetailsChangeRequestContext,
  useBookDetailsChangeRequestDispatch,
} from '../../contexts/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';

interface Props {
  bookId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const stepTwoSchema = z.object({
  language: z.nativeEnum(Language),
  translator: z
    .string({
      required_error: 'Tłumacz jest wymagany.',
    })
    .min(1, {
      message: 'Tłumacz jest zbyt krótki.',
    })
    .max(64, {
      message: 'Tłumacz może mieć maksymalnie 64 znaki.',
    })
    .optional(),
  format: z.nativeEnum(ContractBookFormat),
  pagesCount: z
    .number({
      required_error: 'Ilość stron jest wymagana.',
      coerce: true,
    })
    .int({
      message: 'Ilość stron musi być wartością całkowitą.',
    })
    .min(1, {
      message: 'Książka nie może mieć mniej niż jedną stronę.',
    })
    .max(10000, {
      message: 'Za dużo stron.',
    }),
});

export const UpdateBookRequestForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const context = useBookDetailsChangeRequestContext();

  const dispatch = useBookDetailsChangeRequestDispatch();

  const { data: userData } = useFindUserQuery();

  const { data: userBookData } = useFindUserBookQuery({
    userBookId: bookId,
    userId: userData?.id ?? '',
  });

  const { data: bookData } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

  const { mutateAsync: updateBook } = useUpdateBookMutation({});

  const [currentStep, setCurrentStep] = useState<number>(1);

  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: bookData?.language,
      translator: bookData?.translator,
      format: bookData?.format,
      pagesCount: bookData?.pages,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  // eslint-disable-next-line
  const onProceedToNextStep = (vals: any) => {
    stepTwoForm.trigger('format');

    dispatch({
      type: BookDetailsChangeRequestAction.setValues,
      values: {
        ...vals,
      },
    });

    setCurrentStep(2);
  };

  const onUpdate = async (values: z.infer<typeof stepTwoSchema>) => {
    await updateBook({
      ...context,
      ...(context?.author
        ? {
            authorIds: [context.author],
          }
        : {}),
      ...values,
      accessToken: accessToken as string,
      bookId: bookData?.id as string,
    });

    onSubmit();
  };

  return (
    <>
      {currentStep === 1 ? (
        <StepOneForm
          onCancel={onCancel}
          bookId={bookId}
          onSubmit={onProceedToNextStep}
        />
      ) : (
        <Form {...stepTwoForm}>
          <form
            //   eslint-disable-next-line
            onSubmit={stepTwoForm.handleSubmit(async (data) => await onUpdate(data as any))}
            className="space-y-8"
          >
            <FormField
              control={stepTwoForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Język</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={<span className="text-muted-foreground">Język</span>} />
                        <SelectContent>
                          {Object.entries(Languages).map(([key, language]) => (
                            // todo: potentially fix :)
                            // eslint-disable-next-line
                            // @ts-ignore
                            <SelectItem value={Language[key]}>{language}</SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="translator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tłumacz</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tłumacz"
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
              control={stepTwoForm.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={<span className="text-muted-foreground">Format</span>} />
                        <SelectContent defaultValue={field.value}>
                          {Object.entries(BookFormat).map(([key, language]) => (
                            <SelectItem value={key}>{language}</SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="pagesCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ilość stron</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ilość stron"
                      type="number"
                      includeQuill={false}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between w-full gap-4">
              <Button
                onClick={() => setCurrentStep(1)}
                className="border border-primary w-full bg-transparent text-primary"
              >
                Wróć
              </Button>
              <Button
                className="border border-primary w-full"
                disabled={!stepTwoForm.formState.isValid}
                type="submit"
              >
                Prześlij prośbę
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};
