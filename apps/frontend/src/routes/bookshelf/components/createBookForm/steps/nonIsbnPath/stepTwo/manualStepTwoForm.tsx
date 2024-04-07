import { useForm } from 'react-hook-form';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../context/bookCreationContext/bookCreationContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../../../components/ui/form';
import { Input } from '../../../../../../../components/ui/input';
import { Button } from '../../../../../../../components/ui/button';

// todo: error messages
const stepTwoSchema = z.object({
  language: z // todo: enum
    .string({
      required_error: 'Język jest wymagany.',
    })
    .min(1)
    .max(64),
  translator: z
    .string({
      required_error: 'Tłumacz jest wymagany.',
    })
    .min(1, {
      message: 'Tłumacz jest zbyt krótki.',
    })
    .max(64, {
      message: 'Tłumacz może mieć maksymalnei 64 znaki.',
    }),
  form: z.string().min(1).max(64), // todo: enum
  pagesCount: z
    .number({
      required_error: 'Ilość stron jest wymagana.',
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
    values: {
      language: bookCreation.stepTwoDetails?.language,
      translator: bookCreation.stepTwoDetails?.translator,
      form: bookCreation.stepTwoDetails?.format,
      pagesCount: bookCreation.stepTwoDetails?.pagesCount,
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
              <FormControl>
                <Input
                  placeholder="Język"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setLanguage,
                      language: e.currentTarget.value,
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
          name="form"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <FormControl>
                <Input //change to dropdown :)
                  placeholder="text"
                  type="Format"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setForm,
                      format: e.currentTarget.value,
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
          name="translator"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tłumacz</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tłumacz"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setTranslator,
                      translator: e.currentTarget.value,
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
