import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../common/components/button/button.js';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../common/components/form/form.js';
import { Input } from '../../../common/components/input/input.js';
import { useSearchBookContextDispatch } from '../../context/searchCreateBookContext/searchCreateBookContext.js';

const stepOneIsbnSchema = z.object({
  title: z
    .string({
      required_error: 'Tytuł jest wymagany.',
    })
    .min(3, {
      message: 'Tytuł jest zbyt krótki.',
    }),
});

interface Props {
  bookshelfId: string;
}

export const TitleSearchForm = ({ bookshelfId }: Props): JSX.Element => {
  const searchBookDispatch = useSearchBookContextDispatch();

  const byTitleForm = useForm({
    resolver: zodResolver(stepOneIsbnSchema),
    values: {
      title: '',
    },
    reValidateMode: 'onChange',
  });

  const navigate = useNavigate();

  const onFormSubmit = (values: Partial<z.infer<typeof stepOneIsbnSchema>>) => {
    if (!values.title) {
      return;
    }

    searchBookDispatch({
      searchQuery: values.title,
    });

    navigate({
      to: '/shelves/bookshelf/search/result',
      search: {
        title: values.title,
        isbn: '',
        bookshelfId,
        searchBy: 'title',
      },
    });
  };

  return (
    <Form {...byTitleForm}>
      <form
        onSubmit={byTitleForm.handleSubmit(onFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={byTitleForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tytuł"
                  type="text"
                  maxLength={64}
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!byTitleForm.formState.isValid}
          size="xl"
        >
          Pobierz dane
        </Button>
      </form>
    </Form>
  );
};
