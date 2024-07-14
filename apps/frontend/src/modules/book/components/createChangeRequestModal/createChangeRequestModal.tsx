import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/ui/dialog';
import { CreateChangeRequestForm } from '../createChangeRequestForm/createChangeRequestForm';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { BookDetailsChangeRequestProvider } from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';

interface Props {
  bookId: string;
}

export const CreateChangeRequestModal: FC<Props> = ({ bookId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <BookDetailsChangeRequestProvider>
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);
        }}
      >
        <DialogTrigger asChild>
          <HiArrowsRightLeft className="cursor-pointer text-primary h-8 w-8" />
        </DialogTrigger>
        <DialogContent className="p-16">
          <>
            <DialogHeader className="flex justify-center items-center text-xl font-semibold">
              Prośba o zmianę danych w bazie
            </DialogHeader>
            <CreateChangeRequestForm
              bookId={bookId}
              onCancel={() => setIsOpen(false)}
              onSubmit={() => setIsOpen(false)}
            />
          </>
        </DialogContent>
      </Dialog>
    </BookDetailsChangeRequestProvider>
  );
};
