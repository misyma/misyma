import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { FC, useMemo } from 'react';
import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
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
import { Form } from '../../../../modules/common/components/form/form';
import { useFindAuthorsQuery } from '../../../../modules/author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { ChangeRequestTable } from '../../../../modules/bookChangeRequests/components/changeRequestTable/changeRequestTable';
import {
  BookChangeRequestRow,
  changeRequestColumns,
} from '../../../../modules/bookChangeRequests/components/changeRequestTable/changeRequestTableColumns';
import { useApplyBookChangeRequestMutation } from '../../../../modules/bookChangeRequests/api/admin/mutations/applyBookChangeRequest/applyBookChangeRequest';
import { useDeleteBookChangeRequestMutation } from '../../../../modules/bookChangeRequests/api/admin/mutations/deleteBookChangeRequest/deleteBookChangeRequest';

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

  const { data: changeRequestData, isFetched: isChangeRequestFetched } =
    useQuery(
      FindBookChangeRequestByIdQueryOptions({
        accessToken: accessToken as string,
        id,
      })
    );
  const { data: bookData, isFetched: isBookDataFetched } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: changeRequestData?.data?.bookId ?? '',
    })
  );
  const { data: authorsResponse, isFetching: isFetchingAuthors } =
    useFindAuthorsQuery({
      ids: [
        ...(bookData?.authors.map((author) => author.id) ?? []),
        ...(changeRequestData?.data?.authorIds ?? []),
      ],
    });

  const { mutateAsync: deleteBookChangeRequest } =
    useDeleteBookChangeRequestMutation({});
  const { mutateAsync: applyBookChangeRequest } =
    useApplyBookChangeRequestMutation({});

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
      .filter((author) =>
        changeRequestData?.data?.authorIds?.includes(author.id)
      )
      .map((author) => author.name)
      .join(',');
  }, [authorsResponse?.data, changeRequestData?.data]);

  const changeNameMap: Record<ChangeKeys, ChangeArguments> = useMemo(
    () => ({
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
    }),
    []
  );

  const changeValues = useMemo(() => {
    const rows: BookChangeRequestRow[] = [];

    (
      Object.entries(changeRequestData?.data ?? {}) as Array<
        [ChangeKeys, string | number]
      >
    ).forEach(([key, value]) => {
      const changeValues = changeNameMap[key];

      if (!changeValues) {
        return;
      }

      if (changeValues.mapping && key !== 'authorIds') {
        return rows.push({
          key,
          currentValue: bookData ? `${bookData[key]}` : '',
          proposedValue: `${value}`,
        });
      }

      if (key === 'authorIds') {
        return rows.push({
          key,
          currentValue: bookData
            ? bookData['authors'].map((val) => val.name).join(',')
            : '',
          proposedValue: desiredAuthors ?? '',
        });
      }
    });

    return rows;
  }, [bookData, desiredAuthors, changeNameMap, changeRequestData?.data]);

  if (isChangeRequestFetched && !changeRequestData?.data) {
    return <Navigate to={'/admin/tabs/changeRequests'} />;
  }

  if (!isChangeRequestFetched || !isBookDataFetched || isFetchingAuthors) {
    return (
      <AuthenticatedLayout>
        <div className="flex w-full justify-center items-center w-100% px-8 py-4">
          <div className="flex w-full items-start justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const onSubmit = async () => {
    await applyBookChangeRequest({
      bookChangeRequestId: changeRequestData?.data?.id as string,
      accessToken: accessToken as string,
    });

    navigate({
      to: '/admin/tabs/changeRequests',
    });
  };

  const onDecline = async () => {
    await deleteBookChangeRequest({
      accessToken: accessToken as string,
      bookChangeRequestId: changeRequestData?.data?.id as string,
    });

    navigate({
      to: '/admin/tabs/changeRequests',
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex w-full justify-center items-center w-100% px-4 py-4">
        <div className="flex flex-col gap-8 w-full">
          <div className="flex items-center flex-col gap-4">
            <ChangeRequestTable
              columns={changeRequestColumns}
              data={changeValues}
            />
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="flex justify-center gap-2 items-center">
                  <Button onClick={onDecline} size="lg" variant="outline">
                    Odrzuć{' '}
                  </Button>
                  <Button onClick={onSubmit} size="lg">
                    Potwierdź
                  </Button>
                </div>
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
