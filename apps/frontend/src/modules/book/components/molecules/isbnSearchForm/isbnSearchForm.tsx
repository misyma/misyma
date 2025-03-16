import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { MdOutlineCancel } from 'react-icons/md';
import { z } from 'zod';

import { useSearchBookContextDispatch } from '../../../../bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { Button } from '../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { Input } from '../../../../common/components/input/input';
import { Breadcrumbs, NumericBreadcrumb } from '../../../../common/components/ui/breadcrumbs';
import { isbnSchema } from '../../../../common/schemas/isbnSchema';
import { BookNavigationFromEnum } from '../../../constants';

const stepOneIsbnSchema = z.object({
  isbn: isbnSchema,
});

interface Props {
  bookshelfId: string;
}

export const IsbnSearchForm = ({ bookshelfId }: Props): JSX.Element => {
  const searchBookDispatch = useSearchBookContextDispatch();

  const isbnForm = useForm({
    resolver: zodResolver(stepOneIsbnSchema),
    values: {
      isbn: '',
    },
    reValidateMode: 'onChange',
  });

  const navigate = useNavigate();

  const router = useRouter();

  const from = router.latestLocation.href.includes('/mybooks')
    ? BookNavigationFromEnum.books
    : BookNavigationFromEnum.shelves;

  const url = from === BookNavigationFromEnum.shelves ? '/shelves/bookshelf/search/result' : '/mybooks/search/result';

  const onFormSubmit = (values: Partial<z.infer<typeof stepOneIsbnSchema>>) => {
    if (!values.isbn) {
      return;
    }

    searchBookDispatch({
      isbn: values.isbn,
    });

    navigate({
      to: url,
      search: {
        isbn: values.isbn,
        bookshelfId,
        title: '',
        searchBy: 'isbn',
      },
    });
  };

  return (
    <div>
      <div className="font-semibold text-xl sm:text-2xl">
        <Breadcrumbs
          className="pb-16"
          crumbs={{
            [1]: (
              <NumericBreadcrumb
                className={'font-semibold bg-primary text-white border-primary'}
                index={1}
              >
                1
              </NumericBreadcrumb>
            ),
            [2]: <NumericBreadcrumb index={2}>2</NumericBreadcrumb>,
            [3]: <NumericBreadcrumb index={3}>3</NumericBreadcrumb>,
          }}
        />
        Wyszukaj książkę po ISBN
      </div>
      <Form {...isbnForm}>
        <form
          onSubmit={isbnForm.handleSubmit(onFormSubmit)}
          className="space-y-4 pt-8"
        >
          <FormField
            control={isbnForm.control}
            name="isbn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ISBN"
                    type="text"
                    maxLength={64}
                    includeQuill={false}
                    otherIcon={
                      isbnForm.formState.isValid ? (
                        <IoMdCheckmarkCircle className="text-green-500 text-2xl" />
                      ) : isbnForm.formState.dirtyFields.isbn ? (
                        <MdOutlineCancel className="text-red-500 text-2xl" />
                      ) : (
                        <></>
                      )
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!isbnForm.formState.isValid}
            size="xl"
          >
            Pobierz dane
          </Button>
        </form>
      </Form>
    </div>
  );
};
