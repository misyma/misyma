import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { type FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { AuthenticatedLayout } from '../../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { useFindAuthorsQuery } from '../../../../modules/author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { FindBookByIdQueryOptions } from '../../../../modules/book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { useApplyBookChangeRequestMutation } from '../../../../modules/bookChangeRequests/api/admin/mutations/applyBookChangeRequest/applyBookChangeRequest';
import { useDeleteBookChangeRequestMutation } from '../../../../modules/bookChangeRequests/api/admin/mutations/deleteBookChangeRequest/deleteBookChangeRequest';
import { BookChangeRequestApiAdminQueryKeys } from '../../../../modules/bookChangeRequests/api/admin/queries/bookChangeRequestApiAdminQueryKeys';
import { FindBookChangeRequestByIdQueryOptions } from '../../../../modules/bookChangeRequests/api/admin/queries/findBookChangeRequestById/findBookChangeRequestByIdQueryOptions';
import { ChangeRequestTable } from '../../../../modules/bookChangeRequests/components/changeRequestTable/changeRequestTable';
import {
  type BookChangeRequestRow,
  changeRequestColumns,
} from '../../../../modules/bookChangeRequests/components/changeRequestTable/changeRequestTableColumns';
import { Button } from '../../../../modules/common/components/button/button';
import { Form } from '../../../../modules/common/components/form/form';
import { LoadingSpinner } from '../../../../modules/common/components/spinner/loading-spinner';
import { BookFormat } from '../../../../modules/common/constants/bookFormat';
import { ReversedLanguages } from '../../../../modules/common/constants/languages';
import { useErrorHandledQuery } from '../../../../modules/common/hooks/useErrorHandledQuery';
import { RequireAdmin } from '../../../../modules/core/components/requireAdmin/requireAdmin';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';

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

  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: changeRequestData, isFetched: isChangeRequestFetched } = useErrorHandledQuery(
    FindBookChangeRequestByIdQueryOptions({
      accessToken: accessToken as string,
      id,
    }),
  );

  const { data: bookData, isFetched: isBookDataFetched } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: changeRequestData?.data?.bookId ?? '',
    }),
  );

  const { data: authorsResponse, isFetching: isFetchingAuthors } = useFindAuthorsQuery({
    ids: [...(bookData?.authors.map((author) => author.id) ?? []), ...(changeRequestData?.data?.authorIds ?? [])],
  });

  const { mutateAsync: deleteBookChangeRequest, isPending: isDeletePending } = useDeleteBookChangeRequestMutation({});

  const { mutateAsync: applyBookChangeRequest, isPending: isApplyPending } = useApplyBookChangeRequestMutation({});

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

  const changeTranslatedKeysMap: Record<ChangeKeys, string> = useMemo(
    () => ({
      format: 'Format',
      isbn: 'Numer isbn',
      language: 'Język',
      releaseYear: 'Data wydania',
      title: 'Tytuł',
      translator: 'Przekład',
      pages: 'Liczba stron',
      publisher: 'Wydawnictwo',
      authorIds: 'Autorzy',
    }),
    [],
  );

  const changeValues = useMemo(() => {
    const rows: BookChangeRequestRow[] = [];

    (Object.entries(changeRequestData?.data ?? {}) as Array<[ChangeKeys, string | number]>).forEach(([key, value]) => {
      const changeTranslatedKey = changeTranslatedKeysMap[key];

      if (!changeTranslatedKey) {
        return;
      }

      if (key === 'language') {
        return rows.push({
          key: changeTranslatedKey,
          currentValue: bookData ? `${ReversedLanguages[bookData[key] as keyof typeof ReversedLanguages]}` : '',
          proposedValue: ReversedLanguages[value as keyof typeof ReversedLanguages],
        });
      }

      if (key === 'format') {
        return rows.push({
          key: changeTranslatedKey,
          currentValue: bookData ? `${BookFormat[bookData[key]]}` : '',
          proposedValue: `${BookFormat[value as keyof typeof BookFormat]}`,
        });
      }

      if (key !== 'authorIds') {
        return rows.push({
          key: changeTranslatedKey,
          currentValue: bookData ? `${bookData[key] ?? '-'}` : '',
          proposedValue: `${value}`,
        });
      }

      if (key === 'authorIds') {
        return rows.push({
          key: changeTranslatedKey,
          currentValue: bookData ? bookData['authors'].map((val) => val.name).join(',') : '',
          proposedValue: desiredAuthors ?? '',
        });
      }
    });

    return rows;
  }, [bookData, desiredAuthors, changeTranslatedKeysMap, changeRequestData?.data]);

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

    await Promise.all([
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === BookChangeRequestApiAdminQueryKeys.findBookChangeRequests,
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === BookChangeRequestApiAdminQueryKeys.findBookChangeRequestById && queryKey[1] === id,
      }),
    ]);

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
                className="space-y-4 w-full md:max-w-screen-xl"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="w-full flex justify-end gap-2 items-end">
                  <Button
                    type="button"
                    disabled={isApplyPending || isDeletePending}
                    onClick={onDecline}
                    size="lg"
                    variant="outline"
                  >
                    {isDeletePending && <LoadingSpinner size={20} />}
                    {!isDeletePending && <>Odrzuć</>}
                  </Button>
                  <Button
                    disabled={isApplyPending || isDeletePending}
                    type="submit"
                    size="lg"
                  >
                    {isApplyPending && <LoadingSpinner size={20} />}
                    {!isApplyPending && <>Potwierdź</>}
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

export const Route = createLazyFileRoute('/admin/tabs/changeRequests/$id')({
  component: () => {
    return (
      <RequireAdmin>
        <ChangeRequestView />
      </RequireAdmin>
    );
  },
});
