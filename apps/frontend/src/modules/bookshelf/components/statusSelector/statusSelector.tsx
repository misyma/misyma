import { type FC, type ReactNode, useState } from 'react';

import { type ReadingStatus as ContractReadingStatus } from '@common/contracts';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { ReadingStatus } from '../../../common/constants/readingStatus';

type RendererProps = {
  children: FC;
};

interface StatusSelector {
  renderer: (props: RendererProps) => ReactNode;
  onValueChange: (val: string) => void;
  defaultValue: ContractReadingStatus | undefined;
}
export const StatusSelector: FC<StatusSelector> = ({ renderer, onValueChange, defaultValue }) => {
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);

  const children = () => {
    return (
      <SelectTrigger>
        <SelectValue
          placeholder="Status"
          className="bg-red-500"
        />
        <SelectContent>
          {Object.entries(ReadingStatus).map(([key, status]) => (
            <SelectItem
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setStatusSelectOpen(false);
                }
              }}
              value={key}
            >
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectTrigger>
    );
  };

  return (
    <Select
      open={statusSelectOpen}
      onOpenChange={setStatusSelectOpen}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
    >
      {renderer({ children })}
    </Select>
  );
};
