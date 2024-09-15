import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { Button } from '../../../common/components/button/button';
import { BookDetailsChangeRequestProvider } from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import {
  BookCreationActionType,
  useBookCreationDispatch,
} from '../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { AdminCreateBookForm } from '../adminCreateBookForm/adminCreateBookForm';
import { HiPlus } from 'react-icons/hi2';
import { useQueryClient } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';

export const CreateBookModal: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const dispatch = useBookCreationDispatch();

  const resetModalState = () => {
    setIsOpen(false);
    dispatch({
      type: BookCreationActionType.WipeData,
      wipe: true,
    });
  };

  const onSubmit = async () => {
    resetModalState();

    await queryClient.invalidateQueries({
      predicate: (q) => q.queryKey[0] === BookApiQueryKeys.findBooksAdmin,
    });
  };

  return (
    <BookDetailsChangeRequestProvider>
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          if (val === false) {
            resetModalState();
          }

          setIsOpen(val);
        }}
      >
        <DialogTrigger asChild>
          <Button size="big-icon">
            <HiPlus className="w-8 h-8"></HiPlus>
          </Button>
        </DialogTrigger>
        <DialogContent
          style={{
            borderRadius: '40px',
          }}
          className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
          omitCloseButton={true}
        >
          <DialogTitle>Stwórz książkę</DialogTitle>
          <AdminCreateBookForm
            onSubmit={onSubmit}
          ></AdminCreateBookForm>
        </DialogContent>
      </Dialog>
    </BookDetailsChangeRequestProvider>
  );
};
