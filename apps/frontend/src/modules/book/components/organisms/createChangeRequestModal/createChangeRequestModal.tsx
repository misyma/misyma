import { type FC, useState } from 'react';
import { HiArrowsRightLeft } from 'react-icons/hi2';

import { CreateChangeRequestForm } from '../../../../bookChangeRequests/components/organisms/createChangeRequestForm/createChangeRequestForm';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../../common/components/dialog/dialog';
import { BookDetailsChangeRequestProvider } from '../../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { ScrollArea } from '../../../../common/components/scrollArea/scroll-area';

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
              Prośba o zmianę danych w bazie XD2
            </DialogHeader>
            <ScrollArea className='w-full h-[300px] sm:h-[500px] md:h-[700px]'>
              <CreateChangeRequestForm
                bookId={bookId}
                onCancel={() => setIsOpen(false)}
                onSubmit={() => setIsOpen(false)}
              />
            </ScrollArea>
          </>
        </DialogContent>
      </Dialog>
    </BookDetailsChangeRequestProvider>
  );
};
