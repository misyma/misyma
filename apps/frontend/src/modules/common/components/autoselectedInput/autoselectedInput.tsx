import { useEffect, useRef, type FC } from 'react';

import { Input, type InputProps } from '../input/input';

export const AutoselectedInput: FC<InputProps> = (props: InputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = inputRef.current;

    if (input) {
      input.select();
    }
  }, []);

  return (
    <Input
      {...props}
      ref={inputRef}
    />
  );
};
