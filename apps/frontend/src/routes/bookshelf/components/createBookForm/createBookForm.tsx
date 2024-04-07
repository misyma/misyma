import { FC, useCallback } from 'react';
import { AuthenticatedLayout } from '../../../../layouts/authenticated/authenticatedLayout';
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
    return bookCreation.step === n ? 'font-semibold' : '';
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col">
        {!bookCreation.isbnPath && bookCreation.step > 0 ? (
          <Breadcrumbs
            crumbs={{
              [NonIsbnCreationPathStep.inputFirstDetails]: (
                <p className={setNthSelected(NonIsbnCreationPathStep.inputFirstDetails)}>Krok 1</p>
              ),
              [NonIsbnCreationPathStep.inputSecondDetails]: (
                <p className={setNthSelected(NonIsbnCreationPathStep.inputSecondDetails)}>Krok 2</p>
              ),
              [NonIsbnCreationPathStep.inputThirdDetail]: (
                <p className={setNthSelected(NonIsbnCreationPathStep.inputThirdDetail)}>Krok 3</p>
              ),
            }}
          />
        ) : (
          <></>
        )}
        <div className='flex flex-col-reverse sm:flex-row'>
          <div>
            {bookCreation.step === 0 ? <ChoosePathStep></ChoosePathStep> : <></>}
            {renderStep()}
          </div>
          <div className="flex-1 max-h-[250px] max-w-[250px] sm:max-h-[500px] sm:max-w-[500px] flex justify-center">
            <img
              src="/books.png"
              alt="Bookshelf image"
              className="object-fit aspect-square"
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
