import { useQueryClient } from '@tanstack/react-query';
import { type FC, useState } from 'react';

import {
  BookCreationActionType,
  useBookCreationDispatch,
} from '../../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { Button } from '../../../../common/components/button/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../../../common/components/dialog/dialog';
import { BookApiQueryKeys } from '../../../api/user/queries/bookApiQueryKeys';
import { AdminCreateBookForm } from '../adminCreateBookForm/adminCreateBookForm';

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
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
        >
          Stwórz książkę
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        omitCloseButton={true}
      >
        <DialogTitle className="text-center py-2">Stwórz książkę</DialogTitle>
        <AdminCreateBookForm onSubmit={onSubmit}></AdminCreateBookForm>
      </DialogContent>
    </Dialog>
  );
};
