import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/dialog/dialog';
import { HiTrash } from 'react-icons/hi';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../common/errors/apiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { Button } from '../../../common/components/button/button';
import { useToast } from '../../../common/components/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { BookReadingsApiQueryKeys } from '../../api/queries/bookReadingsApiQueryKeys';
import { useDeleteBookReadingMutation } from '../../api/mutations/bookReadings/deleteBookReadingMutation/deleteBookReadingMutation';

interface Props {
  readingId: string;
  userBookId: string;
  className?: string;
}

export const DeleteBookReadingModal: FC<Props> = ({ readingId, userBookId }: Props) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const { mutateAsync: deleteBookReading, isPending: isDeleting } = useDeleteBookReadingMutation({});

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBookReading({
        readingId,
        userBookId,
        accessToken: accessToken ?? '',
      });

      setIsOpen(false);

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === BookReadingsApiQueryKeys.findBookReadings,
      });

      toast({
        variant: 'success',
        title: `Ocena została usunięta.`,
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
                variant="ghost"
                size="icon"
              >
                <HiTrash className="h-8 w-8 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Usuń ocenę</p>
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
          <DialogHeader className="font-bold">Usunięcia oceny jest nieodwracalne!</DialogHeader>
          <div>Czy jesteś tego pewien?</div>
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
  );
};
