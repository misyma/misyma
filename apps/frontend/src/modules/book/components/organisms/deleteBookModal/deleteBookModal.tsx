import { type FC, useState } from 'react';
import { HiTrash } from 'react-icons/hi';

import { Button } from '../../../../common/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../../common/components/dialog/dialog';
import { useToast } from '../../../../common/components/toast/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import { ApiError } from '../../../../common/errors/apiError';
import { cn } from '../../../../common/lib/utils';
import { useDeleteBookMutation } from '../../../api/admin/mutations/deleteBookMutation/deleteBookMutation';

interface Props {
  bookId: string;
  bookName: string;
  className?: string;
}

export const DeleteBookModal: FC<Props> = ({ bookId, bookName, className }: Props) => {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const { mutateAsync: deleteBook } = useDeleteBookMutation({
    onSuccess: () => setIsOpen(false),
  });

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBook({
        bookId,
      });

      toast({
        variant: 'success',
        title: `Książka: ${bookName} została usunięta.`,
      });
    } catch (error) {
      if (error instanceof ApiError || error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);

        setError('');
      }}
    >
      <DialogTrigger asChild>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="custom"
                variant="none"
              >
                <HiTrash className={cn('text-primary h-8 w-8 cursor-pointer', className)} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Usuń książkę</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
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
  );
};
