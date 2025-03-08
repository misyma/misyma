import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { HiPencil } from 'react-icons/hi';
import { z } from 'zod';

import { CreateChangeRequestForm } from '../../../bookChangeRequests/components/createChangeRequestForm/createChangeRequestForm';
import { Button } from '../../../common/components/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/dialog/dialog';
import { RadioGroup, RadioGroupItem } from '../../../common/components/radioGroup/radio-group';
import { useToast } from '../../../common/components/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import {
  BookDetailsChangeRequestAction,
  BookDetailsChangeRequestProvider,
  useBookDetailsChangeRequestDispatch,
} from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { UpdateUserBookForm } from '../updateUserBookForm/updateUserBookForm';

interface Props {
  bookId: string;
}

type BookEditType = 'dbChangeRequest' | 'myBookChange';

const changeMyBookDataSchema = z.object({
  image: z.optional(
    z.object(
      {},
      {
        required_error: 'Wymagany.',
      },
    ),
  ),
  genre: z
    .string()
    .min(1, {
      message: 'Niewłaściwa wartość',
    })
    .or(z.literal('')),
});

const InnerModal: FC<Props> = ({ bookId }) => {
  const { toast } = useToast();

  const [bookEditType, setBookEditType] = useState<BookEditType | undefined>('myBookChange');
  const [actionChosen, setActionChosen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dispatch = useBookDetailsChangeRequestDispatch();

  const { data } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const resetModalState = () => {
    setIsOpen(false);
    setActionChosen(false);
  };

  const changeMyBookDataForm = useForm<z.infer<typeof changeMyBookDataSchema>>({
    resolver: zodResolver(changeMyBookDataSchema),
    defaultValues: {
      image: undefined,
      genre: '',
    },
  });

  const onSubmitChangeMyBookDataForm = async () => {
    flushSync(() => {
      resetModalState();

      changeMyBookDataForm.reset();

      toast({
        title: 'Zaaktualizowano książkę',
        variant: 'success',
      });
    });
  };

  const renderContents = () => {
    if (actionChosen && bookEditType === 'myBookChange') {
      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            Zmiana danych dla mojej książki
          </DialogHeader>
          <UpdateUserBookForm
            bookId={bookId}
            userBook={data}
            onCancel={() => {
              setActionChosen(false);

              setBookEditType('myBookChange');
            }}
            onSubmit={onSubmitChangeMyBookDataForm}
          />
        </>
      );
    } else if (actionChosen && bookEditType === 'dbChangeRequest') {
      return (
        <>
          <DialogHeader className="flex justify-center items-center text-xl font-semibold">
            Prośba o zmianę danych w bazie
          </DialogHeader>
          <CreateChangeRequestForm
            bookId={bookId}
            onCancel={() => {
              setActionChosen(false);
            }}
            onSubmit={() => {
              resetModalState();
              toast({
                variant: 'success',
                title: 'Stworzono prośbę o zmianę danych',
              });
            }}
          />
        </>
      );
    }

    return (
      <>
        <DialogHeader className="flex justify-center items-center text-xl font-semibold">
          W jaki sposób chcesz edytować książkę?
        </DialogHeader>
        <RadioGroup
          defaultValue={bookEditType}
          onValueChange={(val) => setBookEditType(val as BookEditType)}
        >
          <div className="flex gap-4">
            <RadioGroupItem
              type="button"
              value="myBookChange"
            ></RadioGroupItem>
            <p>zmiana danych dla mojej książki</p>
          </div>
          <div className="flex gap-4">
            <RadioGroupItem
              type="button"
              value="dbChangeRequest"
            ></RadioGroupItem>
            <p>prośba o zmianę danych w bazie </p>
          </div>
        </RadioGroup>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => resetModalState()}
          >
            Wróć
          </Button>
          <Button
            type="submit"
            onClick={() => {
              setActionChosen(true);
            }}
          >
            Przejdź dalej
          </Button>
        </div>{' '}
      </>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (val === false) {
          dispatch({
            type: BookDetailsChangeRequestAction.resetContext,
          });

          resetModalState();
        }

        setIsOpen(val);
      }}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="icon"
              >
                <HiPencil className="cursor-pointer text-primary h-8 w-8" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edytuj książkę</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
        omitCloseButton={true}
      >
        {renderContents()}
      </DialogContent>
    </Dialog>
  );
};

export const EditBookModal: FC<Props> = ({ bookId }) => {
  return (
    <BookDetailsChangeRequestProvider>
      <InnerModal bookId={bookId} />
    </BookDetailsChangeRequestProvider>
  );
};
