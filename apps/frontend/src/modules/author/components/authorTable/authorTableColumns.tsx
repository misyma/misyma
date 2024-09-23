import { CellContext, type ColumnDef } from '@tanstack/react-table';
import { Author } from '@common/contracts';
import { HiCheckCircle } from 'react-icons/hi';
import { HiXCircle } from 'react-icons/hi';
import { DeleteAuthorModal } from '../deleteAuthorModal/deleteAuthorModal';
import { UpdateAuthorModal } from '../updateAuthorModal/updateAuthorModal';
import { TableHeader } from '../../../common/components/tableHeader/tableHeader';
import { HiBookOpen, HiPencil } from 'react-icons/hi2';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';
import { Button } from '../../../common/components/button/button';
import { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';

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

export const columns: ColumnDef<Author>[] = [
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
        <div className="flex max-w-16 justify-center items-center gap-1">
          {row.original.isApproved ? (
            <HiCheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <HiXCircle className="h-6 w-6 text-red-500" />
          )}
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
