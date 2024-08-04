import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { FC, ReactNode, useMemo } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FindBookChangeRequestByIdQueryOptions } from '../../../../modules/bookChangeRequests/api/admin/queries/findBookChangeRequestById/findBookChangeRequestByIdQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { FindBookByIdQueryOptions } from '../../../../modules/book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { Button } from '../../../../modules/common/components/button/button';
import { LoadingSpinner } from '../../../../modules/common/components/spinner/loading-spinner';
import { ReversedLanguages } from '../../../../modules/common/constants/languages';
import { BookFormat } from '../../../../modules/common/constants/bookFormat';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem } from '../../../../modules/common/components/form/form';
import { Switch } from '../../../../modules/common/components/switch/switch';
import { useUpdateBookMutation } from '../../../../modules/book/api/admin/mutations/updateBookMutation/updateBookMutation';
import { useDeleteBookChangeRequestMutation } from '../../../../modules/bookChangeRequests/api/admin/mutations/deleteBookChangeRequest/deleteBookChangeRequest';
import { BookApiError } from '../../../../modules/book/errors/bookApiError';
import { useToast } from '../../../../modules/common/components/toast/use-toast';
import { BookApiQueryKeys } from '../../../../modules/book/api/user/queries/bookApiQueryKeys';
import { useFindAuthorsQuery } from '../../../../modules/author/api/user/queries/findAuthorsQuery/findAuthorsQuery';

type ChangeKeys =
  | 'format'
  | 'isbn'
  | 'language'
  | 'releaseYear'
  | 'title'
  | 'translator'
  | 'publisher'
  | 'pages'
  | 'authorIds';

type ChangeArguments = {
  current: string;
  desired: string;
  mapping?: Record<string, string>;
};

const schema = z.object({
  format: z.boolean().default(false),
  isbn: z.boolean().default(false),
  language: z.boolean().default(false),
  releaseYear: z.boolean().default(false),
  title: z.boolean().default(false),
  translator: z.boolean().default(false),
  publisher: z.boolean().default(false),
  pages: z.boolean().default(false),
  authorIds: z.boolean().default(false),
});

export const ChangeRequestView: FC = () => {
  const { id } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const { data: changeRequestData, isFetched: isChangeRequestFetched } = useQuery(
    FindBookChangeRequestByIdQueryOptions({
      accessToken: accessToken as string,
      id,
    }),
  );

  const { data: bookData, isFetched: isBookDataFetched } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: changeRequestData?.data?.bookId ?? '',
    }),
  );

  const { data: authorsResponse, isFetching: isFetchingAuthors } = useFindAuthorsQuery({
    ids: [...(bookData?.authors.map((author) => author.id) ?? []), ...(changeRequestData?.data?.authorIds ?? [])],
  });

  const { mutateAsync: updateBook } = useUpdateBookMutation({});

  const { mutateAsync: deleteBookChangeRequest } = useDeleteBookChangeRequestMutation({});

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      format: false,
      isbn: false,
      language: false,
      releaseYear: false,
      title: false,
      translator: false,
      publisher: false,
      pages: false,
      authorIds: false,
    },
  });

  const desiredAuthors = useMemo(() => {
    return authorsResponse?.data
      .filter((author) => changeRequestData?.data?.authorIds?.includes(author.id))
      .map((author) => author.name)
      .join(',');
  }, [authorsResponse?.data, changeRequestData?.data]);

  if (isChangeRequestFetched && !changeRequestData?.data) {
    return <Navigate to={'/admin/tabs/changeRequests'} />;
  }

  if (!isChangeRequestFetched || !isBookDataFetched || isFetchingAuthors) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  const buildDifferencesView = () => {
    const components: ReactNode[] = [];

    const changeNameMap: Record<ChangeKeys, ChangeArguments> = {
      format: {
        current: 'Obecny format',
        desired: 'Pożądany format',
        mapping: BookFormat,
      },
      isbn: {
        current: 'Obecny isbn',
        desired: 'Pożądany isbn',
      },
      language: {
        current: 'Obecny język',
        desired: 'Pożądany język',
        mapping: ReversedLanguages,
      },
      releaseYear: {
        current: 'Obecna data wydania',
        desired: 'Pożądana data wydania',
      },
      title: {
        current: 'Obecny tytuł',
        desired: 'Pożądany tytuł',
      },
      translator: {
        current: 'Obecny przekład',
        desired: 'Pożądany przekład',
      },
      pages: {
        current: 'Obecna ilość stron',
        desired: 'Pożądana ilość strong',
      },
      publisher: {
        current: 'Obecne wydawnictwo',
        desired: 'Pożądane wydawnictwo',
      },
      authorIds: {
        current: 'Obecni autorzy',
        desired: 'Pożądani autorzy',
      },
    } as const;

    if (changeRequestData?.data && bookData) {
      (Object.entries(changeRequestData?.data) as Array<[ChangeKeys, string | number]>).forEach(([key, value]) => {
        const changeValues = changeNameMap[key];

        if (!changeValues) {
          return;
        }

        if (changeValues.mapping && key !== 'authorIds') {
          components.push(
            <FormField
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 w-full">
                  <p>
                    {changeValues.current}: {changeValues?.mapping![bookData[key] as string]}
                  </p>
                  <p>
                    {changeValues.desired}: {changeValues?.mapping![value]}
                  </p>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormItem>
              )}
            />,
          );
          return;
        }

        if (key === 'authorIds') {
          components.push(
            <FormField
              control={form.control}
              name={'authorIds'}
              render={({ field }) => (
                <FormItem className="grid grid-cols-3 w-full">
                  <p>
                    {changeValues.current}: {bookData['authors'].map((val) => val.name)}
                  </p>
                  <p>
                    {changeValues.desired}: {desiredAuthors}
                  </p>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormItem>
              )}
            />,
          );

          return;
        }

        components.push(
          <FormField
            control={form.control}
            name={key}
            render={({ field }) => (
              <FormItem className="grid grid-cols-3 w-full">
                <p>
                  {changeValues.current}: {bookData[key]}
                </p>
                <p>
                  {changeValues.desired}: {value}
                </p>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormItem>
            )}
          />,
        );
      });
    }

    return components;
  };

  const onRejectAll = (): void => {
    Object.keys(changeRequestData?.data ?? {}).forEach((key) => {
      form.setValue(key as ChangeKeys, false);
    });
  };

  const onAcceptAll = (): void => {
    Object.keys(changeRequestData?.data ?? {}).forEach((key) => {
      form.setValue(key as ChangeKeys, true);
    });
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const payload = Object.entries(changeRequestData!.data!).reduce<Record<string, unknown>>(
      (aggregate, [key, value]) => {
        if (values[key as keyof typeof values]) {
          aggregate[key] = value;

          return aggregate;
        }

        return aggregate;
      },
      {} as Record<string, unknown>,
    );

    try {
      await updateBook({
        accessToken: accessToken as string,
        bookId: bookData?.id as string,
        ...payload,
      });

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBookById && query.queryKey[1] === bookData?.id,
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        toast({
          title: 'Coś poszło nie tak podczas aktualizowania książki...',
          description: error.context.message,
        });

        return;
      }

      throw error;
    }

    try {
      await deleteBookChangeRequest({
        accessToken: accessToken as string,
        bookChangeRequestId: changeRequestData?.data?.id as string,
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        toast({
          title: 'Coś poszło nie tak przy usuwaniu prośby o zmianę...',
          description: error.context.message,
        });
      }

      throw error;
    }

    navigate({
      to: '/admin/tabs/changeRequests',
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-8 py-4">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex justify-end gap-2">
            <Button
              size="xl"
              onClick={onRejectAll}
              variant="outline"
            >
              Odrzuć wszystkie
            </Button>
            <Button
              size="xl"
              onClick={onAcceptAll}
              className="bg-green-500"
            >
              Zaakceptuj wszystkie
            </Button>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-3 w-full">
                  <div></div>
                  <div></div>
                  <div>Zmiana zaakceptowana</div>
                </div>
                {...buildDifferencesView()}

                <Button size="xl">Zapisz zmiany</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

const changeRequestSearchSchema = z.object({
  id: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/admin/tabs/changeRequests/$id')({
  parseParams: changeRequestSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/admin/tabs/changeRequests'} />;
  },
  component: () => {
    return (
      <RequireAdmin>
        <ChangeRequestView />
      </RequireAdmin>
    );
  },
});
