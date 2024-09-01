import { FC, memo, useCallback, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { BookFormat } from '../../../common/constants/bookFormat';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { BookFormat as ContractBookFormat } from '@common/contracts';
import { FormControl } from '../../../common/components/form/form';

interface BookFormatSelectProps extends ControllerRenderProps {
  onValueChange: (val: ContractBookFormat) => void;
  dialog?: boolean;
}

const BookFormatSelect: FC<BookFormatSelectProps> = ({
  onValueChange,
  dialog = false,
  ...field
}) => {
  const [formatSelectOpen, setFormatSelectOpen] = useState(false);

  const renderBookFormatSelectItems = useCallback(
    () =>
      Object.entries(BookFormat).map(([key, language]) => (
        <SelectItem
          key={`${key}-${language}`}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setFormatSelectOpen(false);
            }
          }}
          value={key}
        >
          {language}
        </SelectItem>
      )),
    []
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
        <SelectTrigger>
          <SelectValue
            placeholder={<span className="text-muted-foreground">Format</span>}
          />
          {dialog && (
            <SelectContentNoPortal>
              {renderBookFormatSelectItems()}
            </SelectContentNoPortal>
          )}
          {!dialog && (
            <SelectContent>{renderBookFormatSelectItems()}</SelectContent>
          )}
        </SelectTrigger>
      </FormControl>
    </Select>
  );
};

export default memo(BookFormatSelect);
