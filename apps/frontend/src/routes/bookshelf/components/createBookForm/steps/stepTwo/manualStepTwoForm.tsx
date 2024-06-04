import { useForm } from 'react-hook-form';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../context/bookCreationContext/bookCreationContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import { Languages } from '../../../../../../common/constants/languages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { BookFormat as ContractBookFormat } from '@common/contracts';
import { BookFormat } from '../../../../../../common/constants/bookFormat';
import { Language } from '@common/contracts';
import { useCallback } from 'react';

const stepTwoSchema = z.object({
  language: z.enum(Object.values(Language) as unknown as [string, ...string[]]),
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
    .max(10000, {
      message: 'Za dużo stron.',
    }),
});

export const ManualStepTwoForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const form = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: bookCreation.stepTwoDetails?.language ?? '',
      translator: bookCreation.stepTwoDetails?.translator ?? '',
      form: bookCreation.stepTwoDetails?.format ?? '',
      pagesCount: bookCreation.stepTwoDetails?.pagesCount ?? '',
    },
  });

  const renderBookFormatSelectItems = useCallback(
    () => Object.entries(BookFormat).map(([key, language]) => <SelectItem value={key}>{language}</SelectItem>),
    [],
  );

  const renderLanguageSelectItems = useCallback(
    () =>
      Object.entries(Languages).map(([key, language]) => (
        // todo: potentially fix :)
        // eslint-disable-next-line
        // @ts-ignore
        <SelectItem value={Language[key]}>{language}</SelectItem>
      )),
    [],
  );

  const onSubmit = () => {
    dispatch({
      type: BookCreationActionType.setStep,
      step: NonIsbnCreationPathStep.inputThirdDetail,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Język</FormLabel>
              <Select
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setLanguage,
                    language: val as Languages,
                  });

                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={<span className="text-muted-foreground">Język</span>} />
                    <SelectContent>{renderLanguageSelectItems()}</SelectContent>
                  </SelectTrigger>
                </FormControl>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
        <FormField
          control={form.control}
          name="form"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setFormat,
                    format: val as ContractBookFormat,
                  });

                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={<span className="text-muted-foreground">Format</span>} />
                    <SelectContent>{renderBookFormatSelectItems()}</SelectContent>
                  </SelectTrigger>
                </FormControl>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pagesCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ilość stron</FormLabel>
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
        <div className="flex justify-between w-full gap-4">
          <Button
            className="border border-primary w-full"
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
