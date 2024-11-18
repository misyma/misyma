import { FC, forwardRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { HiTrash } from 'react-icons/hi';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../common/errors/apiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { Button } from '../../../common/components/button/button';
import { useToast } from '../../../common/components/toast/use-toast';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { useDeleteUserBookMutation } from '../../api/user/mutations/deleteUserBookMutation/deleteUserBookMutation';
import { useNavigate } from '@tanstack/react-router';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';

const DeleteUserBookIcon = forwardRef<
  HTMLButtonElement,
  { onClick: () => void }
>(({ onClick }, ref) => {
  return (
    <Button ref={ref} onClick={onClick} variant="ghost" size="icon">
      <HiTrash className="w-full h-full text-primary" />
    </Button>
  );
});

interface Props {
  bookId: string;
  bookshelfId: string;
  bookName: string;
  className?: string;
}
export const DeleteUserBookModal: FC<Props> = ({
  bookId,
  bookshelfId,
  bookName,
}: Props) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const navigate = useNavigate();

  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const { mutateAsync: deleteBook } = useDeleteUserBookMutation({});

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBook({
        userBookId: bookId,
        accessToken: accessToken ?? '',
      });

      setIsOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBookById &&
            query.queryKey[1] === bookId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId,
        }),
      ]);

      toast({
        variant: 'success',
        title: `Książka: ${bookName} została usunięta.`,
      });

      navigate({
        to: `/bookshelf/${bookshelfId}`,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return setError(error.message);
      }

      if (error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);

          setError('');
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <DeleteUserBookIcon onClick={() => setIsOpen(true)} />
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Usuń książkę</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent
          style={{
            borderRadius: '40px',
          }}
          className="max-w-xl py-16"
          omitCloseButton={true}
        >
          <div className="flex flex-col items-center gap-8">
            <DialogHeader className="font-bold">
              Usunięcia książki jest nieodwracalne!
            </DialogHeader>
            <div>Czy jesteś tego pewien?</div>
            <div className="flex w-full pt-4 gap-4 justify-center">
              <Button className="w-40" onClick={() => setIsOpen(false)}>
                Nie
              </Button>
              <Button className="w-40" onClick={onDelete}>
                Tak
              </Button>
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">error</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
