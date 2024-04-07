import { FC, useCallback } from 'react';
import { ChoosePathStep } from './steps/pathChoice/pathChoice';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import {
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
} from './context/bookCreationContext/bookCreationContext';
import { ManualStepOneForm } from './steps/nonIsbnPath/stepOne/manualStepOneForm';
import { ManualStepTwoForm } from './steps/nonIsbnPath/stepTwo/manualStepTwoForm';
import { ManualStepThreeForm } from './steps/nonIsbnPath/stepThree/manualStepThreeForm';
import { IsbnPathForm } from './steps/pathChoice/isbnPathForm';
import { cn } from '../../../../lib/utils';

export const CreateBookForm: FC = () => {
  const steps = {
    1: IsbnPathForm,
    0: {
      [NonIsbnCreationPathStep.inputFirstDetails]: ManualStepOneForm,
      [NonIsbnCreationPathStep.inputSecondDetails]: ManualStepTwoForm,
      [NonIsbnCreationPathStep.inputThirdDetail]: ManualStepThreeForm,
    },
  };

  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const renderStep = useCallback(() => {
    if (bookCreation.isbnPath && bookCreation.step === 1) {
      // const Component = steps[1]

      return <div>HELLO FROM THE OTHER SIDE</div>;
    } else if (!bookCreation.isbnPath && bookCreation.step > 0) {
      const Component = steps[0][bookCreation.step as NonIsbnCreationPathStep];
      return <Component />;
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookCreation.step, bookCreation.isbnPath]);

  const setNthSelected = (n: number): string => {
    return bookCreation.step === n ? 'font-semibold bg-primary text-white border-primary' : '';
  };

  return (
    <div className="flex flex-col pt-24">
      <div className="flex flex-col-reverse sm:flex-row gap-60">
        <div>
          {!bookCreation.isbnPath && bookCreation.step > 0 ? (
            <Breadcrumbs
              crumbs={{
                [NonIsbnCreationPathStep.inputFirstDetails]: (
                  <div
                    className={cn(
                      'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl ' +
                        setNthSelected(NonIsbnCreationPathStep.inputFirstDetails),
                    )}
                  >
                    1
                  </div>
                ),
                [NonIsbnCreationPathStep.inputSecondDetails]: (
                  <div
                    className={cn(
                      'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl ' +
                        setNthSelected(NonIsbnCreationPathStep.inputSecondDetails),
                    )}
                  >
                    2
                  </div>
                ),
                [NonIsbnCreationPathStep.inputThirdDetail]: (
                  <div
                    className={cn(
                      'rounded-full border border-solid border-black h-10 w-10 flex items-center justify-center text-2xl ' +
                        setNthSelected(NonIsbnCreationPathStep.inputThirdDetail),
                    )}
                  >
                    3
                  </div>
                ),
              }}
            />
          ) : (
            <></>
          )}
          {bookCreation.step === 0 ? <ChoosePathStep></ChoosePathStep> : <></>}
          {renderStep()}
        </div>
        <div className="flex-1 max-w-[250px] sm:max-w-[500px] flex justify-center">
          <img
            src="/books.png"
            alt="Books image"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};
