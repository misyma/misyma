import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { Button } from '../../../common/components/button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';
import { AdminEditBookForm } from '../adminEditBookForm/adminEditBookForm';
import { ImQuill } from 'react-icons/im';
import {
  AdminEditBookAction,
  AdminEditBookProvider,
  useAdminEditBookDispatch,
} from '../../context/adminEditBookContext/adminEditBookContext';

interface Props {
  bookId: string;
}

export const AdminEditBookModal: FC<Props> = ({ bookId }) => {
  return (
    <AdminEditBookProvider>
      <InnerContainer bookId={bookId} />
    </AdminEditBookProvider>
  );
};

const InnerContainer: FC<Props> = ({ bookId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dispatch = useAdminEditBookDispatch();

  const resetModalState = () => {
    setIsOpen(false);
    dispatch({
      type: AdminEditBookAction.resetContext,
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
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="icon"
              >
                <ImQuill className="cursor-pointer text-primary h-8 w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edytuj książkę</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
        omitCloseButton={true}
      >
        <DialogHeader className="flex justify-center items-center text-xl font-semibold">
          <DialogTitle>Edytuj książkę</DialogTitle>
        </DialogHeader>
        <AdminEditBookForm
          bookId={bookId}
          onCancel={() => {
            resetModalState();
          }}
          onSubmit={() => {
            resetModalState();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
