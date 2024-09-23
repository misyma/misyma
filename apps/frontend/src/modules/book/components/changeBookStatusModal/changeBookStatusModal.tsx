import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { DialogTitle } from '@radix-ui/react-dialog';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useToast } from '../../../common/components/toast/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { Button } from '../../../common/components/button/button';
import { Book } from '@common/contracts';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';
import { useUpdateBookMutation } from '../../api/admin/mutations/updateBookMutation/updateBookMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';

interface Props {
  book: Book;
  page: number;
}

export const ChangeBookStatusModal: FC<Props> = ({ book }: Props) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: updateBook } = useUpdateBookMutation({});

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onCreate = async () => {
    await updateBook({
      accessToken: accessToken as string,
      bookId: book.id,
      isApproved: !book.isApproved,
    });

    setIsOpen(false);

    toast({
      variant: 'success',
      title: 'Status książki: ' + book.title + ' został zmieniony.',
    });

    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === BookApiQueryKeys.findBooksAdmin,
    });
  };

  const StatusIcon = useMemo(() => {
    if (book.isApproved) {
      return <HiCheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <HiXCircle className="h-6 w-6 text-red-500" />;
  }, [book.isApproved]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="custom"
                variant="none"
              >
                {StatusIcon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zmień status książki</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent
        aria-describedby="Author creation dialog"
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        <DialogDescription className="hidden">
          Author creation dialog
        </DialogDescription>
        <DialogTitle className="hidden">
          Czy na pewno chcesz zmienić status widoczności książki?
        </DialogTitle>
        <DialogHeader
          aria-label="Change book visibility status."
          className="font-semibold text-center flex justify-center items-center"
        >
          Zmień status książki
        </DialogHeader>
        <div className="flex items-center justify-center text-center">
          {book.isApproved
            ? 'Czy na pewno chcesz ukryć te książkę? Użytkownicy nie będą mogli jej już wyszukać i użyć do dodania książek na półkę.'
            : 'Czy na pewno chcesz ujawnić te książkę? Użytkownicy będą mogli ją wyszukać i użyć do dodania książek na półkę.'}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" type="button">
            Anuluj
          </Button>
          <Button onClick={onCreate} type="button">
            {book.isApproved ? 'Ukryj' : 'Pokazuj'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
