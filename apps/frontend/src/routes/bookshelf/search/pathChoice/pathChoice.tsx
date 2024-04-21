import { FC, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Label } from '../../../../components/ui/label';

interface Props {
  initialValue: 'isbn' | 'title';
}

export const ChoosePathStep: FC<Props> = ({ initialValue = 'isbn' }: Props) => {
  const [chosenSearch, setChosenSearch] = useState<'isbn' | 'title'>(initialValue);

  const navigate = useNavigate();

  const onProceed = () => {
    navigate({
      to: 'search',
      search: {
        type: chosenSearch,
        next: 1,
      },
    });
  };

  return (
    <div className="flex flex-col-reverse sm:px-10 pt-8 sm:pt-24 sm:flex-row gap-10 sm:gap-20 md:gap-30 lg:gap-60 max-w-[15rem] sm:max-w-[unset]">
      <div className="flex flex-col gap-8 max-w-md pt-[2.5rem] w-60 sm:w-[30rem]">
        <p className="sm:text-3xl text-xl font-semibold">W jaki sposób chcesz wyszukać książkę??</p>
        <RadioGroup
          defaultValue="isbn"
          onValueChange={(val) => {
            setChosenSearch(val as 'isbn' | 'title');
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="isbn"
              id="isbn-option"
            />
            <Label
              className="text-lg sm:text-xl"
              htmlFor="isbn-option"
            >
              chcę wpisać ISBN
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="title"
              id="title-option"
            />
            <Label
              className="text-lg sm:text-xl"
              htmlFor="title-option"
            >
              chcę wpisać tytuł
            </Label>
          </div>
        </RadioGroup>
        <div>
          <Button
            className="w-full"
            onClick={onProceed}
          >
            Przejdź dalej
          </Button>
        </div>
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
