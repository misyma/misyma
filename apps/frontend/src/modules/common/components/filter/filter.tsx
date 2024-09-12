import { FC, useCallback, useMemo, useState } from 'react';
import { useFilterContext } from '../../contexts/filterContext';
import {
  DateFilterOpts,
  FilterOpts,
  SelectFilterOpts,
} from '../../types/filter';
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
import { Checkbox } from '../checkbox/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { pl } from 'date-fns/locale';
import { formatDate } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../calendar/calendar';

interface FilterComponentProps {
  filter: FilterOpts;
  className?: string;
  dialog?: boolean;
}

const RemoveFilterButton: FC<{ filterId: string }> = ({ filterId }) => {
  const { removeFilter } = useFilterContext();

  return (
    <Button
      size="big-icon"
      variant="outline"
      onClick={() => removeFilter(filterId)}
    >
      <HiTrash></HiTrash>
    </Button>
  );
};

const TextFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useFilterContext();

  const handleChange = (value: string) => {
    updateFilterValue(filter.id, value);
  };

  return (
    <div className="flex items-center w-full justify-between space-x-4">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center">
        <Input
          placeholder={`Podaj ${filter.label.toLowerCase()}`}
          value={(filterValues[filter.id] as string) || ''}
          iSize="lg"
          type="text"
          onChange={(e) => handleChange(e.target.value)}
        />
        <RemoveFilterButton filterId={filter.id} />
      </div>
    </div>
  );
};

interface SelectFilterProps extends FilterComponentProps {
  filter: SelectFilterOpts;
}

const SelectFilter: FC<SelectFilterProps> = ({ filter, dialog = false }) => {
  const { updateFilterValue, filterValues } = useFilterContext();

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
      <div className="flex gap-2 items-center">
        <Select
          value={(filterValues[filter.id] as string) || ''}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-48 sm:w-72">
            <SelectValue className="w-48 sm:w-72"></SelectValue>
          </SelectTrigger>
          {dialog && (
            <SelectContent className="w-48 sm:w-72">
              {filterItems}
            </SelectContent>
          )}
          {!dialog && (
            <SelectContentNoPortal>{filterItems}</SelectContentNoPortal>
          )}
        </Select>
        <RemoveFilterButton filterId={filter.id} />
      </div>
    </div>
  );
};

export const CheckboxFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useFilterContext();

  const handleChange = (value: string | boolean) => {
    updateFilterValue(filter.id, value);
  };

  const filterValue = useMemo(
    () => filterValues[filter.id],
    [filterValues, filter.id]
  );

  return (
    <div className="flex items-center w-full justify-between space-x-4">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center">
        <Checkbox
          size="xxl"
          checked={!!filterValue}
          onCheckedChange={handleChange}
        />
        <RemoveFilterButton filterId={filter.id} />
      </div>
    </div>
  );
};

interface DateFilterComponentProps extends FilterComponentProps {
  filter: DateFilterOpts;
}
export const DateFilter: FC<DateFilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useFilterContext();

  const handleChange = (value: string | boolean | Date | undefined) => {
    updateFilterValue(filter.id, value);
  };

  const filterValue = useMemo(
    () => filterValues[filter.id],
    [filterValues, filter.id]
  );
  const [calendarVisible, onOpenChange] = useState(false);

  const siblingValue = useMemo(() => {
    const siblingValuePresent = filterValues[filter.dateRangeSiblingId];
    if (!siblingValuePresent) {
      return null;
    }

    return siblingValuePresent;
  }, [filterValues, filter.dateRangeSiblingId]);

  const isSiblingBefore = useCallback(() => {
    if (siblingValue === null || filter.isBeforeFilter) {
      return false;
    }

    return true;
  }, [siblingValue, filter.isBeforeFilter]);

  const isSiblingAfter = useCallback(() => {
    if (siblingValue === null || filter.isAfterFilter) {
      return false;
    }

    return true;
  }, [siblingValue, filter.isAfterFilter]);

  const getDisabledValues = useCallback(
    (date: Date) =>
      date > new Date() ||
      date < new Date('1900-01-01') ||
      (isSiblingAfter() && date < (siblingValue as Date)) ||
      (isSiblingBefore() && date > (siblingValue as Date)),
    [isSiblingAfter, isSiblingBefore, siblingValue]
  );

  return (
    <div className="flex items-center w-full justify-between space-x-4">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center">
        <Popover
          modal={true}
          open={calendarVisible}
          onOpenChange={onOpenChange}
        >
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              type="button"
              className={'w-48 sm:min-w-72 pl-3 text-left font-normal'}
            >
              {filterValue ? (
                formatDate(filterValue as Date, 'PPP', {
                  locale: pl,
                })
              ) : (
                <span>DD-MM-RRRR</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filterValue as Date}
              onSelect={handleChange}
              disabled={getDisabledValues}
              initialFocus
            />
          </PopoverContent>
        </Popover>{' '}
        <RemoveFilterButton filterId={filter.id} />
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
    case 'checkbox':
      return <CheckboxFilter filter={filter} />;
    case 'date':
      return <DateFilter filter={filter} />;
    default:
      return null;
  }
};
