import { ControllerRenderProps, useForm } from 'react-hook-form';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../context/bookCreationContext/bookCreationContext';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../common/components/ui/select';
import { BookFormat as ContractBookFormat } from '@common/contracts';
import { BookFormat } from '../../../../../common/constants/bookFormat';
import { Language } from '@common/contracts';
import { FC, useCallback, useState } from 'react';
import { Checkbox } from '../../../../../common/components/ui/checkbox';
import LanguageSelect from '../../../../../book/components/languageSelect/languageSelect';

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
    .max(10000, {
      message: 'Za dużo stron.',
    })
    .or(z.literal('')),
});

const BookFormatSelect: FC<ControllerRenderProps> = (field) => {
  const dispatch = useBookCreationDispatch();

  const [formatSelectOpen, setFormatSelectOpen] = useState(false);

  const renderBookFormatSelectItems = useCallback(
    () =>
      Object.entries(BookFormat).map(([key, language]) => (
        <SelectItem
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setFormatSelectOpen(false);
            }
          }}
          value={key}
        >
          {language}
        </SelectItem>
      )),
    [],
  );

  return (
    <Select
      open={formatSelectOpen}
      onOpenChange={setFormatSelectOpen}
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
  );
};

export const ManualStepTwoForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const [isOriginalLanguage, setIsOriginalLanguage] = useState(bookCreation.isOriginal);

  const form = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: bookCreation.stepTwoDetails?.language ?? '',
      translator: bookCreation.stepTwoDetails?.translator ?? '',
      form: bookCreation.stepTwoDetails?.format ?? '',
      pagesCount: bookCreation.stepTwoDetails?.pagesCount ?? '',
    },
  });

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
              <LanguageSelect {...field} />
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
              <BookFormatSelect {...field} />
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
        {!isOriginalLanguage && (
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
        )}
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
