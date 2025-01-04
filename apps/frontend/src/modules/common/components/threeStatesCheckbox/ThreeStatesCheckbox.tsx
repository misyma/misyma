import { type FC, useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { HiCheck } from 'react-icons/hi2';

import { Button } from '../button/button.js';

export type ThreeStateCheckboxStates = 'unchecked' | 'checked' | 'indeterminate';

interface ThreeStateCheckboxProps {
  value: ThreeStateCheckboxStates;
  onValueChanged: (value: ThreeStateCheckboxStates) => void;
}

const ThreeStateCheckbox: FC<ThreeStateCheckboxProps> = ({ onValueChanged, value }) => {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (value !== state) {
      setState(value);
    }
  }, [value, state]);

  const handleClick = () => {
    const getNextState = (currentState: ThreeStateCheckboxStates): ThreeStateCheckboxStates => {
      switch (currentState) {
        case 'unchecked':
          return 'checked';

        case 'checked':
          return 'indeterminate';

        case 'indeterminate':
          return 'unchecked';

        default:
          return 'checked';
      }
    };

    const nextState = getNextState(state);

    setState(nextState);

    onValueChanged(nextState);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="custom"
        variant="outline"
        id="three-state-checkbox"
        onClick={handleClick}
        className="h-12 w-12"
      >
        {state === 'indeterminate' && <HiX className="w-12 h-12"></HiX>}
        {state === 'checked' && <HiCheck className="w-12 h-12"></HiCheck>}
      </Button>
    </div>
  );
};

export default ThreeStateCheckbox;
