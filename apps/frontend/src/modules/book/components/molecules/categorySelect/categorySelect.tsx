import { type FC, memo, useState } from 'react';
import { type ControllerRenderProps } from 'react-hook-form';

import { type Category } from '@common/contracts';

import { FormControl } from '../../../../common/components/form/form';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../common/components/select/select';

interface CategorySelectProps extends ControllerRenderProps {
  onValueChange: (val: string) => void;
  categories: Category[];
  dialog?: boolean;
}

export const CategorySelectDataTestIds = {
  trigger: 'category-select-trigger',
  content: 'category-select-content',
} as const;

const CategorySelect: FC<CategorySelectProps> = ({ onValueChange, categories, dialog = false, ...field }) => {
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);

  return (
    <Select
      open={categorySelectOpen}
      onOpenChange={setCategorySelectOpen}
      onValueChange={(val) => {
        onValueChange(val);

        field.onChange(val);
      }}
      defaultValue={field.value}
    >
      <FormControl>
        <SelectTrigger data-testid={CategorySelectDataTestIds.trigger}>
          <SelectValue placeholder={<span className="text-muted-foreground">Kategoria</span>} />
          {dialog && (
            <SelectContentNoPortal data-testid={CategorySelectDataTestIds.content}>
              {Object.values(categories ?? []).map((category) => (
                <SelectItem
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setCategorySelectOpen(false);
                    }
                  }}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContentNoPortal>
          )}
          {!dialog && (
            <SelectContent data-testid={CategorySelectDataTestIds.content}>
              {Object.values(categories ?? []).map((category) => (
                <SelectItem
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setCategorySelectOpen(false);
                    }
                  }}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </SelectTrigger>
      </FormControl>
    </Select>
  );
};

export default memo(CategorySelect);
