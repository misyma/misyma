import { FC, ReactNode, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { ReadingStatus } from '../../../common/constants/readingStatus';
import { ReadingStatus as ContractReadingStatus } from '@common/contracts';

type RendererProps = {
  children: FC;
};

interface GenreSelector {
  renderer: (props: RendererProps) => ReactNode;
  onValueChange: (val: string) => void;
  defaultValue: ContractReadingStatus | undefined;
}
export const GenreSelector: FC<GenreSelector> = ({
  renderer,
  onValueChange,
  defaultValue
}) => {
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);

  const children = () => {
    return (
      <SelectTrigger>
        <SelectValue placeholder="Status" className="bg-red-500" />
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
