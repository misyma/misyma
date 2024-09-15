import { FC, useEffect, useState } from 'react';
import { Button } from '../button/button';
import { HiCheck } from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';

export type ThreeStateCheckboxStates = 'unchecked' | 'checked' | 'indeterminate';

interface ThreeStateCheckboxProps {
  value: ThreeStateCheckboxStates;
  onValueChanged: (value: ThreeStateCheckboxStates) => void;
}

const ThreeStateCheckbox: FC<ThreeStateCheckboxProps> = ({
  onValueChanged,
  value,
}) => {
  const [state, setState] = useState(value);
  useEffect(() => {
    setState(value);
  }, [value]);
  const handleClick = () => {
    setState((prevState) => {
      if (prevState === 'unchecked') {
        onValueChanged('checked');
        return 'checked';
      }
      if (prevState === 'checked') {
        onValueChanged('indeterminate');
        return 'indeterminate';
      }
      onValueChanged('unchecked');
      return 'unchecked';
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="big-icon"
        variant="outline"
        id="three-state-checkbox"
        onClick={handleClick}
        className="h-10 w-10"
      >
        {state === 'indeterminate' && <HiX className="w-10 h-10"></HiX>}
        {state === 'checked' && <HiCheck className="w-10 h-10"></HiCheck>}
      </Button>
    </div>
  );
};

export default ThreeStateCheckbox;
