import { useNavigate } from '@tanstack/react-router';
import { type FC, useState } from 'react';
import { HiTrash } from 'react-icons/hi';

import { Button } from '../../../common/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/dialog/dialog';
import { useToast } from '../../../common/components/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { ApiError } from '../../../common/errors/apiError';
import { useDeleteUserBookMutation } from '../../api/user/mutations/deleteUserBookMutation/deleteUserBookMutation';

interface Props {
  bookId: string;
  bookshelfId: string;
  bookName: string;
  className?: string;
}
export const DeleteUserBookModal: FC<Props> = ({ bookId, bookshelfId, bookName }: Props) => {
  const navigate = useNavigate();

  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const { mutateAsync: deleteBook } = useDeleteUserBookMutation({
    onSuccess: () => setIsOpen(false),
  });

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBook({
        userBookId: bookId,
        bookshelfId,
      });

      toast({
        variant: 'success',
        title: `Książka: ${bookName} została usunięta.`,
      });

      navigate({
        to: `/shelves/bookshelf/${bookshelfId}`,
      });
    } catch (error) {
      if (error instanceof ApiError || error instanceof Error) {
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
              <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="icon"
              >
                <HiTrash className="w-full h-full text-primary" />
              </Button>
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
            <DialogHeader className="font-bold">Usunięcia książki jest nieodwracalne!</DialogHeader>
            <div>Czy jesteś tego pewien?</div>
            <div className="flex w-full pt-4 gap-4 justify-center">
              <Button
                className="w-40"
                onClick={() => setIsOpen(false)}
              >
                Nie
              </Button>
              <Button
                className="w-40"
                onClick={onDelete}
              >
                Tak
              </Button>
            </div>
            {error && <p className="text-sm font-medium text-destructive">error</p>}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
