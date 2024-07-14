import { useEffect } from 'react';
import * as React from 'react';
import { Input, InputProps } from '../input/input';

export const AutoselectedInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

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
  },
);
