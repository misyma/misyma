import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../context/bookCreationContext/bookCreationContext';
import { ReadingStatus } from '@common/contracts';
import { useForm } from 'react-hook-form';
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

const stepThreeFormSchema = z.object({
  status: z.nativeEnum(ReadingStatus),
  image: z.string().min(1),
});

export const ManualStepThreeForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    values: {
      status: bookCreation.stepThreeDetails?.status,
      image: bookCreation.stepThreeDetails?.image,
    },
  });

  const onSubmit = () => {};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input
                  placeholder="Status"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setStatus,
                      status: e.currentTarget.value as ReadingStatus,
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obrazek</FormLabel>
              <FormControl>
                <Input
                  placeholder="Obrazek"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setImage,
                      image: e.currentTarget.value,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full gap-4">
          <Button
            className="border border-primary w-full"
            onClick={() => {
              dispatch({
                type: BookCreationActionType.setStep,
                step: NonIsbnCreationPathStep.inputSecondDetails,
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
            Dodaj książkę
          </Button>
        </div>
      </form>
    </Form>
  );
};
