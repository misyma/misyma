import { FC, useMemo } from 'react';
import { useFilterContext } from '../../contexts/filterContext';
import { FilterOpts, SelectFilterOpts } from '../../types/filter';
import { Button } from '../button/button';
import { Input } from '../input/input';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select/select';
import { HiTrash } from 'react-icons/hi';

interface FilterComponentProps {
  filter: FilterOpts;
  className?: string;
  dialog?: boolean;
}

const TextFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { removeFilter, updateFilterValue, filterValues } = useFilterContext();

  const handleChange = (value: string) => {
    updateFilterValue(filter.id, value);
  };

  return (
    <div className="flex items-center w-full justify-between space-x-4">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center">
        <Input
          placeholder={`Podaj ${filter.label.toLowerCase()}`}
          value={filterValues[filter.id] || ''}
          iSize="lg"
          type="text"
          onChange={(e) => handleChange(e.target.value)}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={() => removeFilter(filter.id)}
        >
          <HiTrash></HiTrash>
        </Button>
      </div>
    </div>
  );
};

interface SelectFilterProps extends FilterComponentProps {
  filter: SelectFilterOpts;
}

const SelectFilter: FC<SelectFilterProps> = ({ filter, dialog = false }) => {
  const { removeFilter, updateFilterValue, filterValues } = useFilterContext();

  const handleChange = (value: string) => {
    updateFilterValue(filter.id, value);
  };

  const filterItems = useMemo(() => {
    return (
      <>
        {filter.options?.map((option) => (
          <SelectItem className="w-48 sm:w-72" key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </>
    );
  }, [filter?.options]);

  return (
    <div className="flex items-center justify-between space-x-4 w-full">
      <label>{filter.label}</label>
      <div className='flex gap-2 items-center'>
        <Select
          value={filterValues[filter.id] || ''}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-48 sm:w-72">
            <SelectValue className="w-48 sm:w-72">
            </SelectValue>
          </SelectTrigger>
          {dialog && (
            <SelectContent className="w-48 sm:w-72">{filterItems}</SelectContent>
          )}
          {!dialog && (
            <SelectContentNoPortal>{filterItems}</SelectContentNoPortal>
          )}
        </Select>
        <Button
          size="icon"
          variant="outline"
          onClick={() => removeFilter(filter.id)}
        >
          <HiTrash></HiTrash>
        </Button>
      </div>
    </div>
  );
};

export const FilterComponent: FC<FilterComponentProps> = ({ filter }) => {
  switch (filter.type) {
    case 'text':
      return <TextFilter filter={filter} />;
    case 'select':
      return <SelectFilter filter={filter} />;
    default:
      return null;
  }
};
