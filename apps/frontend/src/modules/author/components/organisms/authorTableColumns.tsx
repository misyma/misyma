import { useNavigate } from '@tanstack/react-router';
import { type CellContext, type ColumnDef } from '@tanstack/react-table';
import { type FC } from 'react';
import { HiBookOpen, HiPencil } from 'react-icons/hi2';

import { type Author } from '@common/contracts';

import { ChangeAuthorStatusModal } from './changeAuthorStatusModal';
import { DeleteAuthorModal } from './deleteAuthorModal';
import { UpdateAuthorModal } from './updateAuthorModal';
import { Button } from '../../../common/components/button/button';
import { TableHeader } from '../../../common/components/tableHeader/tableHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';

const ActionsCell: FC<CellContext<Author, unknown>> = ({ row }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() =>
                navigate({
                  to: '/admin/tabs/books',
                  search: {
                    authorIds: row.original.id,
                    page: 1,
                    pageSize: 10,
                  },
                })
              }
              variant="none"
              size="custom"
            >
              <HiBookOpen className="w-8 h-8 text-primary"></HiBookOpen>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zobacz książki tego Autora</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <UpdateAuthorModal
        trigger={<HiPencil className="text-primary text-3xl" />}
        authorId={row.original.id}
        authorName={row.original.name}
        isApproved={row.original.isApproved}
        onMutated={() => {}}
      />
      <DeleteAuthorModal
        authorId={row.original.id}
        authorName={row.original.name}
      />
    </div>
  );
};

export const authorTableColumns: ColumnDef<Author>[] = [
  {
    header: () => <TableHeader label="Imię i nazwisko" />,
    accessorKey: 'name',
    size: 500,
    minSize: 150,
    maxSize: 700,
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex flex-col py-4 gap-2">
          <div className="flex items-center gap-1">
            <p className="text-base">{row.original.name}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Status" />,
    accessorKey: 'isApproved',
    minSize: 75,
    size: 125,
    maxSize: 150,
    cell: ({ row }): JSX.Element => {
      return (
        <div className="flex justify-center items-center max-w-16">
          <ChangeAuthorStatusModal
            authorId={row.original.id}
            authorName={row.original.name}
            page={1}
            status={row.original.isApproved}
          />
        </div>
      );
    },
  },
  {
    header: () => <TableHeader label="Akcje" />,
    accessorKey: 'actions',
    minSize: 75,
    size: 125,
    maxSize: 150,
    cell: ActionsCell,
  },
];
