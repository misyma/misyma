import { FC } from 'react';
import { useToast } from '../../../common/components/toast/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { HiCheck, HiPencil } from 'react-icons/hi2';
import { cn } from '../../../common/lib/utils';
import { DeleteBookshelfModal } from '../deleteBookshelfModal/deleteBookshelfModal';
import { HiOutlineX } from 'react-icons/hi';

interface BookshelfActionButtonsProps {
  editMap: Record<number, boolean>;
  name: string;
  index: number;
  bookshelfId: string;
  onStartEdit: (index: number) => void;
  onSave: (index: number) => void;
  onCancelEdit: (index: number) => void;
}
export const BookshelfActionButtons: FC<BookshelfActionButtonsProps> = ({
  bookshelfId,
  editMap,
  name,
  index,
  onStartEdit,
  onSave,
  onCancelEdit,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="px-4 sm:px-8 flex gap-4 z-40">
      {editMap[index] !== true ? (
        <>
          <HiPencil
            className={cn(
              'text-primary pointer-events-auto h-8 w-8 cursor-pointer',
              name === 'Archiwum' || name === 'Wypożyczalnia' ? 'hidden' : ''
            )}
            onClick={() => onStartEdit(index)}
          />
          <DeleteBookshelfModal
            bookshelfId={bookshelfId}
            bookshelfName={name}
            deletedHandler={async () => {
              toast({
                title: `Półka ${name} została usunięta.`,
                variant: 'success',
              });

              await queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey[0] === 'findUserBookshelfs',
              });
            }}
            className={cn(
              name === 'Archiwum' || name === 'Wypożyczalnia'
                ? 'invisible'
                : '',
              'pointer-events-auto'
            )}
          />
        </>
      ) : (
        <>
          <HiCheck
            className="pointer-events-auto text-primary h-8 w-8 cursor-pointer"
            onClick={() => {
              onSave(index);
            }}
          />
          <HiOutlineX
            className="pointer-events-auto text-primary h-8 w-8 cursor-pointer"
            onClick={() => onCancelEdit(index)}
          />
        </>
      )}
    </div>
  );
};
