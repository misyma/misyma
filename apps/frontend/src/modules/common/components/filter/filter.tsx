import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';
import {
  DateFilterOpts,
  FilterComponentProps,
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
import { Checkbox } from '../checkbox/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { pl } from 'date-fns/locale';
import { formatDate } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../calendar/calendar';
import { FilterContainer } from './filterContainer';
import { YearPicker } from '../yearPicker/yearPicker';
import ThreeStateCheckbox, {
  ThreeStateCheckboxStates,
} from '../threeStatesCheckbox/threeStatesCheckbox';

const TextFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const handleChange = (value: string) => {
    updateFilterValue(filter.key, value);
  };

  return (
    <FilterContainer
      slot={
        <Input
          placeholder={`Podaj ${filter.label.toLowerCase()}`}
          value={(filterValues[filter.key as string] as string) || ''}
          iSize="custom"
          className="w-full"
          type="text"
          onChange={(e) => handleChange(e.target.value)}
        />
      }
      filter={filter}
    ></FilterContainer>
  );
};

interface SelectFilterProps extends FilterComponentProps {
  filter: SelectFilterOpts;
}

const SelectFilter: FC<SelectFilterProps> = ({ filter, dialog = false }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const handleChange = (value: string) => {
    updateFilterValue(filter.key, value);
  };

  const filterItems = useMemo(() => {
    return (
      <>
        {filter.options?.map((option) => (
          <SelectItem className="w-full sm:w-full" key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </>
    );
  }, [filter?.options]);

  return (
    <FilterContainer
      slot={
        <Select
          value={(filterValues[filter.key as string] as string) || ''}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-full sm:w-full">
            <SelectValue className="w-full sm:w-full"></SelectValue>
          </SelectTrigger>
          {dialog && (
            <SelectContent className="w-full sm:w-full">
              {filterItems}
            </SelectContent>
          )}
          {!dialog && (
            <SelectContentNoPortal>{filterItems}</SelectContentNoPortal>
          )}
        </Select>
      }
      filter={filter}
    ></FilterContainer>
  );
};

export const CheckboxFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const handleChange = (value: string | boolean) => {
    if (value === true) {
      updateFilterValue(filter.key, value);
      return;
    }

    updateFilterValue(filter.key, undefined);
  };

  const filterValue = filterValues[filter.key as string];

  return (
    <FilterContainer
      slot={
        <Checkbox
          size="xxl"
          checked={!!filterValue}
          onCheckedChange={handleChange}
        />
      }
      filter={filter}
    ></FilterContainer>
  );
};

export const ThreeStateCheckboxFilter: FC<FilterComponentProps> = ({
  filter,
}) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const [internalValue, setInternalValue] = useState('unchecked');

  useEffect(() => {
    const filterValue = filterValues[filter.key as string];
    if (filterValue === true) {
      setInternalValue('checked');
    } else if (filterValue === false) {
      setInternalValue('indeterminate');
    } else {
      setInternalValue('unchecked');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, filter.key, filterValues[filter.key as string]]);
  const handleChange = (value: string | boolean) => {
    if (value === 'checked') {
      updateFilterValue(filter.key, true);
      return;
    } else if (value === 'indeterminate') {
      updateFilterValue(filter.key, false);
      return;
    }

    updateFilterValue(filter.key, undefined);
  };

  return (
    <FilterContainer
      slot={
        <ThreeStateCheckbox
          value={internalValue as ThreeStateCheckboxStates}
          onValueChanged={(val) => handleChange(val as string)}
        />
      }
      filter={filter}
    ></FilterContainer>
  );
};

interface DateFilterComponentProps extends FilterComponentProps {
  filter: DateFilterOpts;
}
export const DateFilter: FC<DateFilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const handleChange = (value: string | boolean | Date | undefined) => {
    updateFilterValue(filter.key, value);
  };

  const filterValue = filterValues[filter.key as string];
  const siblingFilterValue = filterValues[filter.dateRangeSiblingId];

  const [calendarVisible, onOpenChange] = useState(false);

  const siblingValue = useMemo(() => {
    if (!siblingFilterValue) {
      return null;
    }

    return siblingFilterValue;
  }, [siblingFilterValue]);

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
    <FilterContainer
      slot={
        <Popover
          modal={true}
          open={calendarVisible}
          onOpenChange={onOpenChange}
        >
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              type="button"
              size="custom"
              className={'w-full truncate h-10 pl-3 text-left font-normal'}
            >
              {filterValue ? (
                formatDate(filterValue as Date, 'PPP', {
                  locale: pl,
                })
              ) : (
                <>DD-MM-RRRR</>
              )}
              {!filterValue && (
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              )}
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
        </Popover>
      }
      filter={filter}
    ></FilterContainer>
  );
};

export const YearFilter: FC<DateFilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const handleChange = (
    value: string | boolean | Date | number | undefined
  ) => {
    updateFilterValue(filter.key, value);
  };

  const filterValue = filterValues[filter.key as string];

  const [calendarVisible, onOpenChange] = useState(false);

  return (
    <FilterContainer
      slot={
        <YearPicker
          value={filterValue as unknown as number}
          open={calendarVisible}
          onOpenChange={onOpenChange}
          onValueChange={handleChange}
        />
      }
      filter={filter}
    ></FilterContainer>
  );
};

export const FilterComponent: FC<FilterComponentProps> = ({ filter }) => {
  if (filter.customSlot) {
    return <filter.customSlot filter={filter} />;
  }

  switch (filter.type) {
    case 'text':
      return <TextFilter filter={filter} />;
    case 'select':
      return <SelectFilter filter={filter} />;
    case 'checkbox':
      return <CheckboxFilter filter={filter} />;

    case 'three-state-checkbox':
      return <ThreeStateCheckboxFilter filter={filter} />;
    case 'date':
      return <DateFilter filter={filter} />;
    case 'year':
      // eslint-disable-next-line
      return <YearFilter filter={filter as any} />;
    default:
      return null;
  }
};
