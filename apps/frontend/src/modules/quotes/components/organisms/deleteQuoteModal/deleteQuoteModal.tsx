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
import { useDeleteQuoteMutation } from '../../../api/mutations/deleteQuoteMutation/deleteQuoteMutation';

interface Props {
  quoteId: string;
  userBookId: string;
  className?: string;
}

export const DeleteQuoteModal: FC<Props> = ({ quoteId, userBookId }: Props) => {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const { mutateAsync: deleteQuote, isPending: isDeleting } = useDeleteQuoteMutation({});

  const onDelete = async (): Promise<void> => {
    try {
      await deleteQuote({
        quoteId,
        userBookId,
      });

      setIsOpen(false);

      toast({
        variant: 'success',
        title: `Cytat został usunięty.`,
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
            <p>Usuń cytat</p>
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
            <DialogHeader className="font-bold">Czy na pewno chcesz usunąć cytat?</DialogHeader>
            <div>Ta akcja jest nieodwracalna.</div>
            <div className="flex w-full pt-4 gap-4 justify-center">
              <Button
                disabled={isDeleting}
                variant={isDeleting ? 'ghost' : 'outline'}
                className="w-40"
                onClick={() => setIsOpen(false)}
              >
                Nie
              </Button>
              <Button
                className="w-40"
                variant={isDeleting ? 'ghost' : 'default'}
                disabled={isDeleting}
                onClick={onDelete}
              >
                {isDeleting && <LoadingSpinner size={40} />}
                {!isDeleting && <p>Tak</p>}
              </Button>
            </div>
            {error && <p className="text-sm font-medium text-destructive">error</p>}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
