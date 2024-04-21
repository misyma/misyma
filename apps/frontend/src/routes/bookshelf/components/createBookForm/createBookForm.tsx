import { FC, useCallback } from 'react';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from './context/bookCreationContext/bookCreationContext';
import { ManualStepOneForm } from './steps/stepOne/manualStepOneForm';
import { ManualStepTwoForm } from './steps/stepTwo/manualStepTwoForm';
import { ManualStepThreeForm } from './steps/stepThree/manualStepThreeForm';
import { cn } from '../../../../lib/utils';

interface CreateBookProps {
  bookshelfId: string;
}

export const CreateBookForm: FC<CreateBookProps> = ({ bookshelfId }) => {
  const steps = {
    [NonIsbnCreationPathStep.inputFirstDetails]: ManualStepOneForm,
    [NonIsbnCreationPathStep.inputSecondDetails]: ManualStepTwoForm,
    [NonIsbnCreationPathStep.inputThirdDetail]: ManualStepThreeForm,
  };

  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const renderStep = useCallback(() => {
    if (!bookCreation.isbnPath && bookCreation.step > 0) {
      const Component = steps[bookCreation.step as NonIsbnCreationPathStep];
      return <Component bookshelfId={bookshelfId} />;
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookCreation.step, bookCreation.isbnPath]);

  const setNthSelected = (n: number): string => {
    return bookCreation.step === n ? ' font-semibold bg-primary text-white border-primary' : '';
  };
  const canNavigateToSecond = useCallback(() => {
    return (
      bookCreation.stepOneDetails?.author &&
      bookCreation.stepOneDetails?.genre &&
      bookCreation.stepOneDetails?.publisher &&
      bookCreation.stepOneDetails?.title
    );
  }, [bookCreation.stepOneDetails]);

  const canNavigateToThird = useCallback(() => {
    return (
      bookCreation.stepTwoDetails?.format &&
      bookCreation.stepTwoDetails?.language &&
      bookCreation.stepTwoDetails?.pagesCount &&
      bookCreation.stepTwoDetails?.translator
    );
  }, [bookCreation.stepTwoDetails]);

  const navigateToStep = (step: number) => {
    switch (step) {
      case NonIsbnCreationPathStep.inputFirstDetails:
        dispatch({
          type: BookCreationActionType.setStep,
          step: NonIsbnCreationPathStep.inputFirstDetails,
        });

        break;

      case NonIsbnCreationPathStep.inputSecondDetails:
        if (canNavigateToSecond()) {
          dispatch({
            type: BookCreationActionType.setStep,
            step: NonIsbnCreationPathStep.inputSecondDetails,
          });
        }

        break;

      case NonIsbnCreationPathStep.inputThirdDetail:
        if (canNavigateToThird()) {
          dispatch({
            type: BookCreationActionType.setStep,
            step: NonIsbnCreationPathStep.inputThirdDetail,
          });
        }
    }
  };

  return (
    <div className="flex flex-col-reverse sm:px-10 pt-8 sm:pt-24 sm:flex-row gap-10 sm:gap-20 md:gap-30 lg:gap-60 max-w-[15rem] sm:max-w-[unset]">
      <div className="sm:min-h-[40rem]">
        {!bookCreation.isbnPath && bookCreation.step > 0 ? (
          <Breadcrumbs
            crumbs={{
              [NonIsbnCreationPathStep.inputFirstDetails]: (
                <div
                  className={cn(
                    'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl cursor-pointer' +
                      setNthSelected(NonIsbnCreationPathStep.inputFirstDetails),
                  )}
                  onClick={() => {
                    navigateToStep(1);
                  }}
                >
                  1
                </div>
              ),
              [NonIsbnCreationPathStep.inputSecondDetails]: (
                <div
                  className={cn(
                    'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl ' +
                      setNthSelected(NonIsbnCreationPathStep.inputSecondDetails),
                    canNavigateToSecond() ? 'cursor-pointer' : '',
                  )}
                  onClick={() => {
                    navigateToStep(2);
                  }}
                >
                  2
                </div>
              ),
              [NonIsbnCreationPathStep.inputThirdDetail]: (
                <div
                  className={cn(
                    'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl ' +
                      setNthSelected(NonIsbnCreationPathStep.inputThirdDetail),
                    canNavigateToThird() ? 'cursor-pointer' : '',
                  )}
                  onClick={() => {
                    navigateToStep(3);
                  }}
                >
                  3
                </div>
              ),
            }}
          />
        ) : (
          <></>
        )}
        {renderStep()}
      </div>
      <div className="flex max-w-[250px] w-full sm:max-w-[500px] sm:min-h-[550px] justify-center items-center">
        <img
          src="/books.png"
          alt="Books image"
          className="object-contain"
        />
      </div>
    </div>
  );
};
