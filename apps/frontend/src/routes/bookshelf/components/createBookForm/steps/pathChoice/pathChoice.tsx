import { FC, useState } from 'react';
import { Button } from '../../../../../../components/ui/button';
import {
  BookCreationActionType,
  useBookCreation,
  useBookCreationDispatch,
} from '../../context/bookCreationContext/bookCreationContext';
import { IsbnPathForm } from './isbnPathForm';
import { ManualPathForm } from './manualPathForm';

export const ChoosePathStep: FC = () => {
  const bookCreation = useBookCreation();

  const [hasChosenISBN, setHasChosenISBN] = useState<boolean>(bookCreation.isbnPath);

  const dispatch = useBookCreationDispatch();

  return (
    <div className="flex flex-col gap-8">
      <p className="text-3xl font-semibold">Czy książka, którą chcesz dodać, posiada number ISBN?</p>
      <div className="flex flex-1 gap-4">
        <Button
          className={
            hasChosenISBN ? 'bg-primary' : 'bg-transparent text-primary border-primary border-solid border-[1px]'
          }
          onClick={() => {
            setHasChosenISBN(true);

            dispatch({
              type: BookCreationActionType.chooseIsbnPath,
            });
          }}
        >
          Tak
        </Button>
        <Button
          className={
            hasChosenISBN
              ? 'bg-transparent text-primary border-primary border-[1px] border-solid'
              : 'bg-primary border-primary'
          }
          onClick={() => {
            setHasChosenISBN(false);

            dispatch({
              type: BookCreationActionType.chooseNonIsbnPath,
            });
          }}
        >
          Nie
        </Button>
      </div>
      <div>
        {hasChosenISBN ? (
          <>
            <IsbnPathForm />
          </>
        ) : (
          <>
            <ManualPathForm />
          </>
        )}
      </div>
    </div>
  );
};
