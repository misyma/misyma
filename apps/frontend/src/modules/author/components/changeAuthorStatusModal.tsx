import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { DialogTitle } from '@radix-ui/react-dialog';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useToast } from '../../common/components/toast/use-toast';
import { useUpdateAuthorMutation } from '../api/admin/mutations/updateAuthorMutation/updateAuthorMutation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../common/components/dialog/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../common/components/tooltip/tooltip';
import { Button } from '../../common/components/button/button';
import { AuthorsApiQueryKeys } from '../api/user/queries/authorsApiQueryKeys';

interface Props {
  authorId: string;
  authorName: string;
  status: boolean;
  page: number;
}

export const ChangeAuthorStatusModal: FC<Props> = ({
  authorId,
  authorName,
  status,
}: Props) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: updateAuthor } = useUpdateAuthorMutation({});

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onCreate = async () => {
    await updateAuthor({
      accessToken,
      authorId: authorId,
      isApproved: !status,
    });

    setIsOpen(false);

    toast({
      variant: 'success',
      title: 'Status autora: ' + authorName + ' został zmieniony.',
    });

    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
    });
  };

  const StatusIcon = useMemo(() => {
    if (status) {
      return <HiCheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <HiXCircle className="h-6 w-6 text-red-500" />;
  }, [status]);

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
              <p>Zmień status autora</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent
        aria-describedby="Author status change dialog"
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        <DialogDescription className="hidden">
        Author status change dialog
        </DialogDescription>
        <DialogTitle className="hidden">
          Czy na pewno chcesz zmienić status widoczności autora?
        </DialogTitle>
        <DialogHeader
          aria-label="Change book visibility status."
          className="font-semibold text-center flex justify-center items-center"
        >
          Zmień status autora
        </DialogHeader>
        <div className="flex items-center justify-center text-center">
          {status
            ? 'Czy na pewno chcesz ukryć tego autora? Użytkownicy nie będą mogli go już wyszukać i użyć do dodania książek na półkę.'
            : 'Czy na pewno chcesz ujawnić tego autora? Użytkownicy będą mogli go wyszukać i użyć do dodania książek na półkę.'}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" type="button">
            Anuluj
          </Button>
          <Button onClick={onCreate} type="button">
            {status ? 'Ukryj' : 'Pokazuj'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
