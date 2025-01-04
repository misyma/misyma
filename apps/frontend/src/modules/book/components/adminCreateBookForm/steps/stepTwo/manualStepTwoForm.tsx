import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { BookFormat as ContractBookFormat, Language } from '@common/contracts';

import { useFindAuthorsQuery } from '../../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import {
  BookCreationActionType,
  type BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { Button } from '../../../../../common/components/button/button';
import { Checkbox } from '../../../../../common/components/checkbox/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/form/form';
import { Input } from '../../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../../common/components/spinner/loading-spinner';
import { type Languages } from '../../../../../common/constants/languages';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { useAdminCreateBook } from '../../../../hooks/adminCreateBook/adminCreateBook';
import BookFormatSelect from '../../../bookFormatSelect/bookFormatSelect';
import LanguageSelect from '../../../languageSelect/languageSelect';

const stepTwoSchema = z.object({
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
  form: z.nativeEnum(ContractBookFormat),
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
    .max(5000, {
      message: 'Za dużo stron. Maksymalnie 5000 jest dopuszczalnych.',
    })
    .or(z.literal('')),
  imageUrl: z
    .string({
      message: 'Niepoprawna wartość.',
    })
    .url({
      message: 'Podana wartość nie jest prawidłowym linkiem.',
    })
    .or(z.literal('')),
});

interface Props {
  onSubmit: () => void;
}

export const ManualStepTwoForm: FC<Props> = ({ onSubmit: onSubmitCb }) => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const dispatch = useBookCreationDispatch();

  const [isOriginalLanguage, setIsOriginalLanguage] = useState(bookCreation.isOriginal);

  const form = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: bookCreation.stepTwoDetails?.language ?? '',
      translator: bookCreation.stepTwoDetails?.translator ?? '',
      form: bookCreation.stepTwoDetails?.format ?? '',
      pagesCount: Number.isNaN(bookCreation.stepTwoDetails?.pagesCount)
        ? ''
        : (bookCreation.stepTwoDetails?.pagesCount ?? ''),
      imageUrl: '',
    },
    mode: 'onChange',
  });

  const { refetch } = useFindAuthorsQuery({
    name: bookCreation.stepOneDetails?.authorName,
    enabled: false,
  });

  const { create, isProcessing } = useAdminCreateBook({
    onAuthorCreationError: async () => {
      const result = await refetch();

      return result.data;
    },
    onOperationError: setSubmissionError,
  });

  const onLanguageSelected = (val: string) => {
    dispatch({
      type: BookCreationActionType.setLanguage,
      language: val as Languages,
    });
  };

  const onSubmit = async (values: z.infer<typeof stepTwoSchema>): Promise<void> => {
    await create({
      authorPayload: {
        authorId: bookCreation.stepOneDetails?.author,
        name: bookCreation.stepOneDetails?.authorName,
      },
      bookPayload: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        format: bookCreation.stepTwoDetails?.format as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        language: bookCreation.stepTwoDetails?.language as any,
        title: bookCreation.stepOneDetails?.title as string,
        translator: bookCreation.stepTwoDetails?.translator,
        pages: bookCreation.stepTwoDetails?.pagesCount,
        ...(bookCreation.stepTwoDetails as Required<BookCreationNonIsbnState['stepTwoDetails']>),
        ...(bookCreation.stepOneDetails as Required<BookCreationNonIsbnState['stepOneDetails']>),
        isbn: bookCreation.stepOneDetails?.isbn === '' ? undefined : bookCreation.stepOneDetails?.isbn,
        releaseYear: bookCreation.stepOneDetails?.releaseYear as number,
        accessToken: accessToken as string,
        publisher: bookCreation.stepOneDetails?.publisher === '' ? undefined : bookCreation.stepOneDetails?.publisher,
        imageUrl: values.imageUrl,
      },
    });

    onSubmitCb();
  };

  return (
    <Form {...form}>
      {}
      <form
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="form"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <BookFormatSelect
                dialog={true}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setFormat,
                    format: val as ContractBookFormat,
                  });
                }}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pagesCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span>Ilość stron</span> <span className="text-gray-500">(opcjonalne)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ilość stron"
                  type="number"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setPagesCount,
                      pagesCount: e.currentTarget.valueAsNumber,
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
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Język</FormLabel>
              <LanguageSelect
                dialog={true}
                type={'form'}
                onValueChange={onLanguageSelected}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {!isOriginalLanguage && (
          <FormField
            control={form.control}
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
                      dispatch({
                        type: BookCreationActionType.setTranslator,
                        translator: val.currentTarget.value,
                      });

                      field.onChange(val);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span>Link do obrazka</span> <span className="text-gray-500">(opcjonalne)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Link do obrazka"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setPagesCount,
                      pagesCount: e.currentTarget.valueAsNumber,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <Checkbox
            checked={isOriginalLanguage}
            onClick={() => {
              setIsOriginalLanguage(!isOriginalLanguage);

              dispatch({
                type: BookCreationActionType.setIsOriginal,
                isOriginal: !isOriginalLanguage,
              });
            }}
          ></Checkbox>
          <p>Język oryginalny</p>
        </div>
        <div className="flex justify-between w-full gap-4">
          <Button
            variant={isProcessing ? 'ghost' : 'outline'}
            disabled={isProcessing}
            size="lg"
            onClick={() => {
              dispatch({
                type: BookCreationActionType.setStep,
                step: NonIsbnCreationPathStep.inputFirstDetails,
              });
            }}
          >
            Wróć
          </Button>
          <Button
            size="lg"
            className="border border-primary w-full"
            variant={isProcessing ? 'ghost' : 'default'}
            disabled={!form.formState.isValid || isProcessing}
            type="submit"
          >
            {isProcessing && <LoadingSpinner size={40} />}
            {!isProcessing && <>Dodaj książkę</>}
          </Button>
        </div>
        {submissionError ? <p className="text-red-500">{submissionError}</p> : <></>}
      </form>
    </Form>
  );
};
