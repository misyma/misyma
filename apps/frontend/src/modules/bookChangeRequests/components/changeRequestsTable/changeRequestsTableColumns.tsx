import { type ColumnDef } from '@tanstack/react-table';
import { BookChangeRequest } from '@common/contracts';
import { formatDate } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { TableHeader } from '../../../common/components/tableHeader/tableHeader';
import { HiPencil } from 'react-icons/hi2';

const NavigateToRequest: FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate();

  return (
    <HiPencil
      onClick={() => {
        navigate({
          to: `/admin/tabs/changeRequests/${id}`,
        });
      }}
      className="cursor-pointer text-primary text-3xl"
    ></HiPencil>
  );
};

export const changeRequestsColumns: ColumnDef<BookChangeRequest>[] = [
  {
    header: () => <TableHeader label="Tytuł" />,
    accessorKey: 'name',
    minSize: 150,
    size: 200,
    maxSize: 300,
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">{row.original?.bookTitle ?? '-'}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Email użytkownika" />,
    accessorKey: 'name',
    minSize: 150,
    size: 200,
    maxSize: 300,
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">{row.original?.userEmail ?? '-'}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Data" />,
    accessorKey: 'createdAt',
    minSize: 150,
    size: 200,
    maxSize: 300,
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">
              {row.original?.createdAt
                ? formatDate(row.original?.createdAt, 'PPP', {
                    locale: pl,
                  })
                : ''}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Zmienione wartości" />,
    accessorKey: 'changedKeys',
    cell: ({ row }): JSX.Element => {
      const ignoredKeys = [
        'id',
        'bookId',
        'createdAt',
        'userId',
        'userEmail',
        'book',
      ];

      const translationMap = {
        ['isbn']: 'isbn',
        ['translator']: 'przekład',
        ['publisher']: 'wydawnictwo',
        ['title']: 'tytuł',
        ['language']: 'język',
        ['format']: 'format',
        ['pages']: 'liczba stron',
        ['authors']: 'autorzy',
        ['releaseYear']: 'data wydania',
        ['authorIds']: 'autorzy',
      } as const;

      const changedValues = Object.keys(row.original).filter(
        (value) => !ignoredKeys.includes(value)
      ) as Array<keyof typeof translationMap>;

      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">
              {changedValues.map((val) => translationMap[val]).join(', ')}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p></p>,
    accessorKey: 'navigation',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex items-center gap-2">
          <NavigateToRequest id={row.original.id} />
        </div>
      );
    },
  },
];
