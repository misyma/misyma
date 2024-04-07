import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { AuthenticatedLayout } from '../../../../layouts/authenticated/authenticatedLayout';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../../../../components/ui/form';
import { CreateBookSchemaValues, createBookSchema } from './schemas/createBookSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../../components/ui/input';
import { ChoosePathStep } from './steps/pathChoice/pathChoice';

export const CreateBookForm: FC = () => {
  const form = useForm<CreateBookSchemaValues>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      authorIds: [],
      bookshelfId: '',
      format: undefined,
      imageUrl: undefined,
      isbn: undefined,
      language: undefined,
      pages: undefined,
      publisher: undefined,
      releaseYear: undefined,
      title: '',
      translator: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const onSubmit = () => {};

  return (
    <AuthenticatedLayout>
      <ChoosePathStep></ChoosePathStep>
      <Form {...form}>
        <form className='hidden' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="isbn"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Isbn"
                    type="range"
                    min={0}
                    max={1}
                    defaultValue={1}
                    includeQuill={false}
                    className="nice-radio"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł</FormLabel>
                <FormControl>
                  <Input
                    placeholder="title"
                    type="text"
                    min={1}
                    max={64}
                    {...field}
                  ></Input>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wydawnictwo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="publisher"
                    type="text"
                    min={1}
                    max={64}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="releaseYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data wydania</FormLabel>
                <FormControl>
                  <Input
                    placeholder="releaseYear"
                    type="number"
                    min={100}
                    max={2999}
                    defaultValue={0}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Język</FormLabel>
                <FormControl>
                  <Input
                    placeholder="language"
                    type="text"
                    // Replace with a picker
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Format</FormLabel>
                <FormControl>
                  <Input
                    placeholder="format"
                    type="text"
                    // Replace with a dropdown picker :)
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="pages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liczba stron</FormLabel>
                <FormControl>
                  <Input
                    placeholder="pages"
                    type="number"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Źródło obrazka</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Url of the image"
                    type="text"
                    min={1}
                    max={64}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Book status"
                    type="text"
                    // Replace with a picker
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* 
              TODO: Authors picker :)
            */}
        </form>
      </Form>
    </AuthenticatedLayout>
  );
};
