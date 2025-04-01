import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';

import { type BookFormat as ContractBookFormat } from '@common/contracts';

import {
  BookCreationActionType,
  type BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { Button } from '../../../../../../common/components/button/button';
import { Checkbox } from '../../../../../../common/components/checkbox/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../../common/components/form/form';
import { Input } from '../../../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../../../common/components/spinner/loading-spinner';
import { type Languages } from '../../../../../../common/constants/languages';
import { useAdminCreateBook } from '../../../../../hooks/adminCreateBook/adminCreateBook';
import { type CreateBookStepTwo, createBookStepTwoSchema } from '../../../../../schemas/createBookSchemas';
import LanguageSelect from '../../../../molecules/languageSelect/languageSelect';
import BookFormatSelect from '../../../../organisms/bookFormatSelect/bookFormatSelect';
import GenreSelect from '../../../../molecules/genreSelect/genreSelect';
import { useErrorHandledQuery } from '../../../../../../common/hooks/useErrorHandledQuery';
import { getGenresQueryOptions } from '../../../../../../genres/api/queries/getGenresQuery/getGenresQueryOptions';

interface Props {
  onSubmit: () => void;
}

export const ManualStepTwoForm: FC<Props> = ({ onSubmit: onSubmitCb }) => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const dispatch = useBookCreationDispatch();

  const [isOriginalLanguage, setIsOriginalLanguage] = useState(bookCreation.isOriginal);

  const form = useForm({
    resolver: zodResolver(createBookStepTwoSchema),
    defaultValues: {
      language: bookCreation.stepTwoDetails?.language ?? '',
      translator: bookCreation.stepTwoDetails?.translator ?? '',
      form: bookCreation.stepTwoDetails?.format ?? '',
      pagesCount: Number.isNaN(bookCreation.stepTwoDetails?.pagesCount)
        ? ''
        : (bookCreation.stepTwoDetails?.pagesCount ?? ''),
      imageUrl: '',
      genreId: '',
    },
    mode: 'onChange',
  });

  const { create, isProcessing } = useAdminCreateBook({
    onOperationError: setSubmissionError,
  });

  const onLanguageSelected = (val: string) => {
    dispatch({
      type: BookCreationActionType.setLanguage,
      language: val as Languages,
    });
  };

  const { data: genres } = useErrorHandledQuery(getGenresQueryOptions({}));

  const onSubmit = async (values: CreateBookStepTwo): Promise<void> => {
    await create({
      authorPayload: {
        authorIds: bookCreation.stepOneDetails?.authorIds,
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
        publisher: bookCreation.stepOneDetails?.publisher === '' ? undefined : bookCreation.stepOneDetails?.publisher,
        imageUrl: values.imageUrl,
        genreId: values.genreId,
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
        <FormField
          control={form.control}
          name="genreId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria</FormLabel>
              <GenreSelect
                genres={genres?.data ?? []}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setGenre,
                    genre: val,
                  });
                }}
                {...field}
              />
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
