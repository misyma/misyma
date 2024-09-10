import { FC, useMemo, useState } from 'react';
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

export const DynamicFilter: FC = () => {
  const { filters, addFilter, allowedValues } = useFilterContext();

  const handleAddFilter = (key: string) => {
    const correspondingFilter = allowedValues.find((el) => el.key === key);

    const filterPayload: Omit<FilterOpts, 'type'> = {
      id: `filter-${filters.length + 1}-${key}`,
      label: correspondingFilter?.label as string,
      key: key,
    };

    if (correspondingFilter?.type === 'select') {
      return addFilter({
        ...filterPayload,
        type: 'select',
        options: correspondingFilter.options,
      });
    }

    addFilter({
      ...filterPayload,
      type: 'text',
    });
  };

  const [open, setOpen] = useState(false);

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
        className='flex items-center justify-center'
        open={open}
        onOpenChange={(e) => setOpen(e)}
        onValueChange={(e) => handleAddFilter(e)}
      >
        {filtersChoice.length > 0 && (
          <SelectTrigger
            ignoreIcons
            className="w-16 sm:w-16 bg-transparent border-none flex items-center justify-center"
          >
            <HiPlus className="h-8 w-8 border-2 rounded-xl text-primary"></HiPlus>
          </SelectTrigger>
        )}
        <SelectContent className="w-60">
          {filtersChoice.length > 0 &&
            filtersChoice.map((value, index) => (
              <SelectItem
                key={`${String(value.key)}-${index}`}
                value={`${String(value.key)}`}
              >
                {value.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
