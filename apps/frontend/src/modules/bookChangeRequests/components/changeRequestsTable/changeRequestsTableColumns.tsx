import { type ColumnDef } from '@tanstack/react-table';
import { BookChangeRequest } from '@common/contracts';
import { formatDate } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from '@tanstack/react-router';
import { ImQuill } from 'react-icons/im';
import { FC } from 'react';

const NavigateToRequest: FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate();

  return (
    <ImQuill
      onClick={() => {
        navigate({
          to: `/admin/tabs/changeRequests/${id}`,
        });
      }}
      className="cursor-pointer text-primary text-3xl"
    ></ImQuill>
  );
};

export const changeRequestsColumns: ColumnDef<BookChangeRequest>[] = [
  {
    header: () => <p>ID</p>,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{row.original.id}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <p>Stworzone dnia</p>,
    accessorKey: 'createdAt',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">
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
    header: () => <p>Zmienione wartości</p>,
    accessorKey: 'changedKeys',
    cell: ({ row }): JSX.Element => {
      const ignoredKeys = ['id', 'bookId', 'createdAt', 'userId'];

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

      const changedValues = Object.keys(row.original).filter((value) => !ignoredKeys.includes(value)) as Array<
        keyof typeof translationMap
      >;

      return (

        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-lg">{changedValues.map((val) => translationMap[val]).join(', ')}</p>
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
