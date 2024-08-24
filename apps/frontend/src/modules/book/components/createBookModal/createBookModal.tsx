import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../../../common/components/dialog/dialog';
import { Button } from '../../../common/components/button/button';
import { BookDetailsChangeRequestProvider } from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import {
  BookCreationActionType,
  useBookCreationDispatch,
} from '../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { AdminCreateBookForm } from '../adminCreateBookForm/adminCreateBookForm';

export const CreateBookModal: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dispatch = useBookCreationDispatch();

  const resetModalState = () => {
    setIsOpen(false);
    dispatch({
      type: BookCreationActionType.WipeData,
      wipe: true,
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
          <Button>Stwórz książkę</Button>
        </DialogTrigger>
        <DialogContent
          style={{
            borderRadius: '40px',
          }}
          className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
          omitCloseButton={true}
        >
          <AdminCreateBookForm
            onSubmit={() => {
              resetModalState();
            }}
          ></AdminCreateBookForm>
        </DialogContent>
      </Dialog>
    </BookDetailsChangeRequestProvider>
  );
};
