import { type FC, useState } from 'react';
import { HiTrash } from 'react-icons/hi';

import { Button } from '../../../../common/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../../common/components/dialog/dialog';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { useToast } from '../../../../common/components/toast/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import { ApiError } from '../../../../common/errors/apiError';
import { useDeleteBookReadingMutation } from '../../../api/mutations/bookReadings/deleteBookReadingMutation/deleteBookReadingMutation';

interface Props {
  readingId: string;
  userBookId: string;
  className?: string;
}

export const DeleteBookReadingModal: FC<Props> = ({ readingId, userBookId }: Props) => {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const { mutateAsync: deleteBookReading, isPending: isDeleting } = useDeleteBookReadingMutation({
    onSuccess: () => setIsOpen(false),
  });

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBookReading({
        readingId,
        userBookId,
      });

      toast({
        variant: 'success',
        title: `Ocena została usunięta.`,
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
                <HiTrash className="h-8 w-8 text-primary" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Usuń ocenę</p>
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
            <DialogHeader className="font-bold">Czy na pewno chcesz usunąć ocenę?</DialogHeader>
            <div>Ta akcja jest nieodwracalna.</div>
            <div className="flex w-full pt-4 gap-4 justify-center">
              <Button
                disabled={isDeleting}
                variant={isDeleting ? 'ghost' : 'outline'}
                className="w-40"
                onClick={() => setIsOpen(false)}
              >
                Anuluj
              </Button>
              <Button
                className="w-40"
                variant={isDeleting ? 'ghost' : 'default'}
                onClick={onDelete}
              >
                {isDeleting && <LoadingSpinner size={40} />}
                {!isDeleting && <p>Potwierdź</p>}
              </Button>
            </div>
            {error && <p className="text-sm font-medium text-destructive">error</p>}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
