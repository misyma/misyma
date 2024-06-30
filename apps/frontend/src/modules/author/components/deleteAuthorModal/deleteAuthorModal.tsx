import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/ui/dialog';
import { HiTrash } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../common/errors/apiError';
import { useDeleteAuthorMutation } from '../../api/admin/mutations/deleteAuthorMutation/deleteAuthorMutation';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { AuthorsApiQueryKeys } from '../../api/user/queries/authorsApiQueryKeys';
import { Button } from '../../../common/components/ui/button';
import { useToast } from '../../../common/components/ui/use-toast';

interface Props {
  authorId: string;
  authorName: string;
  className?: string;
}

export const DeleteAuthorModal: FC<Props> = ({ authorId, authorName, className }: Props) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const { mutateAsync: deleteAuthor } = useDeleteAuthorMutation({});

  const onDelete = async (): Promise<void> => {
    try {
      await deleteAuthor({
        authorId,
        accessToken: accessToken ?? '',
      });

      setIsOpen(false);

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
      });

      toast({
        variant: 'success',
        title: `Autor: ${authorName} został usunięty.`,
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
        <HiTrash className={cn('text-primary h-8 w-8 cursor-pointer', className)} />
      </DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        <div className="flex flex-col items-center gap-8">
          <DialogHeader className="font-bold">Usunięcia autora jest nieodwracalne!</DialogHeader>
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
