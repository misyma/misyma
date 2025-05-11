import { type FC, memo, useCallback, useState } from 'react';
import { type ControllerRenderProps } from 'react-hook-form';

import { type BookFormat as ContractBookFormat } from '@common/contracts';

import { FormControl } from '../../../../common/components/form/form';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../common/components/select/select';
import { BookFormat } from '../../../../common/constants/bookFormat';

interface BookFormatSelectProps extends ControllerRenderProps {
  onValueChange: (val: ContractBookFormat) => void;
  dialog?: boolean;
}

export const BookFormatSelectDataTestIds = {
  selectContent: 'format-select-content',
  trigger: 'format-select-trigger',
} as const;

const BookFormatSelect: FC<BookFormatSelectProps> = ({ onValueChange, dialog = false, ...field }) => {
  const [formatSelectOpen, setFormatSelectOpen] = useState(false);

  const renderBookFormatSelectItems = useCallback(
    () =>
      Object.entries(BookFormat).map(([key, name]) => (
        <SelectItem
          key={`${key}-${name}`}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setFormatSelectOpen(false);
            }
          }}
          value={key}
        >
          {name}
        </SelectItem>
      )),
    [],
  );

  return (
    <Select
      open={formatSelectOpen}
      onOpenChange={setFormatSelectOpen}
      onValueChange={(val) => {
        onValueChange(val as ContractBookFormat);

        field.onChange(val);
      }}
      defaultValue={field.value}
    >
      <FormControl>
        <SelectTrigger data-testid={BookFormatSelectDataTestIds.trigger}>
          <SelectValue placeholder={<span className="text-muted-foreground">Format</span>} />
          {dialog && (
            <SelectContentNoPortal data-testid={BookFormatSelectDataTestIds.selectContent}>
              {renderBookFormatSelectItems()}
            </SelectContentNoPortal>
          )}
          {!dialog && (
            <SelectContent data-testid={BookFormatSelectDataTestIds.selectContent}>
              {renderBookFormatSelectItems()}
            </SelectContent>
          )}
        </SelectTrigger>
      </FormControl>
    </Select>
  );
};

export default memo(BookFormatSelect);
