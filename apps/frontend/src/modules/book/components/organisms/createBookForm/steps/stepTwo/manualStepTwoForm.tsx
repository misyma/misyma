import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useCallback, useState } from 'react';
import { type ControllerRenderProps, useForm } from 'react-hook-form';
import { z } from 'zod';

import { BookFormat as ContractBookFormat, Language } from '@common/contracts';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../common/components/select/select';
import { BookFormat } from '../../../../../../common/constants/bookFormat';
import { type Languages } from '../../../../../../common/constants/languages';
import LanguageSelect from '../../../../molecules/languageSelect/languageSelect';

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
  form: z.nativeEnum(ContractBookFormat).optional(),
  pagesCount: z
    .number({
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
      form: bookCreation.stepTwoDetails?.format,
      pagesCount: bookCreation.stepTwoDetails?.pagesCount ?? '',
    },
  });

  const onLanguageSelected = (val: string) => {
    dispatch({
      type: BookCreationActionType.setLanguage,
      language: val as Languages,
    });
  };

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
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="form"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span>Format</span> <span className="text-gray-500">(opcjonalne)</span>
              </FormLabel>
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
                onValueChange={onLanguageSelected}
                type="form"
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
                <FormLabel>
                  <span>Przekład</span> <span className="text-gray-500">(opcjonalne)</span>
                </FormLabel>
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
            variant="outline"
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
