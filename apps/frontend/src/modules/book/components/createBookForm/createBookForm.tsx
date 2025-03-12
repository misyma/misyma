import { type FC, useCallback } from 'react';

import { ManualStepOneForm } from './steps/stepOne/manualStepOneForm';
import { ManualStepThreeForm } from './steps/stepThree/manualStepThreeForm';
import { ManualStepTwoForm } from './steps/stepTwo/manualStepTwoForm';
import {
  BookCreationActionType,
  type BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { Breadcrumbs, NumericBreadcrumb } from '../../../common/components/ui/breadcrumbs';
import { cn } from '../../../common/lib/utils';

interface CreateBookProps {
  bookshelfId: string;
  navigateTo: 'shelves' | 'books';
}

export const CreateBookForm: FC<CreateBookProps> = ({ bookshelfId, navigateTo }) => {
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

      return (
        <Component
          bookshelfId={bookshelfId}
          navigateTo={navigateTo}
        />
      );
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
      bookCreation?.stepOneDetails?.authorIds &&
      bookCreation?.stepOneDetails?.authorIds?.length > 0 &&
      bookCreation.stepOneDetails?.title &&
      bookCreation?.stepOneDetails?.releaseYear
    );
  }, [bookCreation.stepOneDetails]);

  const canNavigateToThird = useCallback(() => {
    return canNavigateToSecond() && bookCreation.stepTwoDetails?.format && bookCreation.stepTwoDetails?.language;
  }, [canNavigateToSecond, bookCreation.stepTwoDetails]);

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
    <div className="flex flex-col-reverse sm:px-10 pt-4 sm:flex-row gap-10 sm:gap-20 md:gap-30 lg:gap-60 max-w-[15rem] sm:max-w-[unset]">
      <div className="sm:min-h-[40rem]">
        {!bookCreation.isbnPath && bookCreation.step > 0 ? (
          <Breadcrumbs
            crumbs={{
              [NonIsbnCreationPathStep.inputFirstDetails]: (
                <NumericBreadcrumb
                  index={1}
                  className={cn(setNthSelected(NonIsbnCreationPathStep.inputFirstDetails), 'cursor-pointer')}
                  onClick={() => {
                    navigateToStep(1);
                  }}
                >
                  1
                </NumericBreadcrumb>
              ),
              [NonIsbnCreationPathStep.inputSecondDetails]: (
                <NumericBreadcrumb
                  index={2}
                  className={cn(
                    setNthSelected(NonIsbnCreationPathStep.inputSecondDetails),
                    canNavigateToSecond() ? 'cursor-pointer' : '',
                  )}
                  onClick={() => {
                    navigateToStep(2);
                  }}
                >
                  2
                </NumericBreadcrumb>
              ),
              [NonIsbnCreationPathStep.inputThirdDetail]: (
                <NumericBreadcrumb
                  index={3}
                  className={cn(
                    setNthSelected(NonIsbnCreationPathStep.inputThirdDetail),
                    canNavigateToThird() ? 'cursor-pointer' : '',
                  )}
                  onClick={() => {
                    navigateToStep(3);
                  }}
                >
                  3
                </NumericBreadcrumb>
              ),
            }}
          />
        ) : (
          <></>
        )}
        {renderStep()}
      </div>
      <div className="flex max-w-[250px] w-full sm:max-w-[500px] sm:max-h-[550px] justify-center items-center">
        <img
          src="/books.png"
          alt="Books image"
          className="object-contain"
        />
      </div>
    </div>
  );
};
