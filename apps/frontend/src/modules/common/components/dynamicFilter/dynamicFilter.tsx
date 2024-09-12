import { FC, forwardRef, useMemo, useState } from 'react';
import { FilterComponent } from '../filter/filter';
import { useFilterContext } from '../../contexts/filterContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../select/select';
import { FilterOpts } from '../../types/filter';
import { Separator } from '../separator/separator';
import { HiPlus } from 'react-icons/hi2';
import { Button } from '../button/button';

const CustomButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>(({ children, ...props }, ref) => (
  <Button ref={ref} size="base" variant="outline" {...props}>
    {children}
  </Button>
));
export const DynamicFilter: FC = () => {
  const { filters, addFilter, allowedValues } = useFilterContext();

  const handleAddFilter = (key: string) => {
    const correspondingFilter = allowedValues.find((el) => el.key === key);

    const filterPayload: Omit<FilterOpts, 'type'> = {
      id: `filter-${filters.length + 1}-${key}`,
      label: correspondingFilter?.label as string,
      key: key,
    };

    switch (correspondingFilter?.type) {
      case 'select': {
        return addFilter({
          ...filterPayload,
          type: 'select',
          options: correspondingFilter.options,
        });
      }
      case 'checkbox': {
        addFilter({
          ...filterPayload,
          type: 'checkbox',
        });
        break;
      }
      case 'text':
      default: {
        addFilter({
          ...filterPayload,
          type: 'text',
        });
        break;
      }
    }
  };

  const [open, setOpen] = useState(false);
  const [selectValue] = useState('');

  const filtersChoice = useMemo(
    () =>
      allowedValues.filter(
        (allowedValue) => !filters.find((e) => e.key === allowedValue.key)
      ),
    [filters, allowedValues]
  );

  return (
    <div className="space-y-4">
      {filters.map((filter) => (
        <div className="grid gap-4">
          <FilterComponent key={filter.id} filter={filter} />
          <Separator></Separator>
        </div>
      ))}
      <Select
        className="flex items-center justify-center"
        open={open}
        value={selectValue}
        onOpenChange={(e) => setOpen(e)}
        onValueChange={(e) => handleAddFilter(e)}
      >
        {filtersChoice.length > 0 && (
          <SelectTrigger
            asChild
            ignoreIcons
            className="w-16 sm:w-16 bg-transparent border-none flex items-center justify-center"
          >
            <CustomButton>
              <HiPlus className="h-8 w-8 border-2 rounded-xl text-primary"></HiPlus>
            </CustomButton>
          </SelectTrigger>
        )}
        <SelectContent className="w-60">
          {filtersChoice.length > 0 &&
            filtersChoice.map((value, index) => (
              <SelectItem
                skipCheckIcon
                key={`${String(value.key)}-${index}`}
                value={`${String(value.key)}`}
                onClick={() => console.log('BOOP')}
              >
                {value.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
