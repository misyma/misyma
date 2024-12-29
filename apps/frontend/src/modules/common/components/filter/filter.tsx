import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DateFilterOpts,
  FilterComponentProps,
  SelectFilterOpts,
} from '../../types/filter';
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
import { FilterContainer } from './filterContainer';
import { YearPicker } from '../yearPicker/yearPicker';
import ThreeStateCheckbox, {
  ThreeStateCheckboxStates,
} from '../threeStatesCheckbox/ThreeStatesCheckbox';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { Button } from '../button/button';
import { CalendarIcon } from 'lucide-react';

// Adjust in admin books filtering

export const TextFilter: FC<
  FilterComponentProps & { skipValidation?: boolean }
> = ({ filter, initialValue, onRemoveFilter, setFilterAction }) => {
  const [value, setValue] = useState(initialValue ?? '');

  useEffect(() => {
    if (initialValue === undefined) {
      setValue('');
    } else {
      setValue(initialValue);
    }
  }, [initialValue]);

  const onValueChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setFilterAction(newValue);
  };

  return (
    <FilterContainer
      slot={
        <Input
          containerClassName="sm:w-96"
          placeholder={`Podaj ${filter.label.toLowerCase()}`}
          value={value}
          iSize="custom"
          className="sm:w-96"
          type="text"
          onChange={onValueChanged}
        />
      }
      filter={filter}
      onRemoveFilter={onRemoveFilter}
    />
  );
};

interface SelectFilterProps extends FilterComponentProps {
  filter: SelectFilterOpts;
}

export const SelectFilter: FC<SelectFilterProps> = ({
  filter,
  initialValue,
  onRemoveFilter,
  setFilterAction,
  dialog = false,
}) => {
  const filterItems = useMemo(
    () => (
      <>
        {filter.options?.map((option) => (
          <SelectItem className="w-full sm:w-full" key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </>
    ),
    [filter?.options]
  );

  return (
    <FilterContainer
      slot={
        <Select
          className="w-96"
          value={initialValue ?? ''}
          onValueChange={setFilterAction}
        >
          <SelectTrigger className="w-full sm:w-full">
            <SelectValue className="w-full sm:w-full" />
          </SelectTrigger>
          {dialog ? (
            <SelectContent className="w-full sm:w-full">
              {filterItems}
            </SelectContent>
          ) : (
            <SelectContentNoPortal>{filterItems}</SelectContentNoPortal>
          )}
        </Select>
      }
      filter={filter}
      hasValue={!!initialValue}
      onRemoveFilter={onRemoveFilter}
    />
  );
};

export const CheckboxFilter: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  onRemoveFilter,
  setFilterAction,
}) => (
  <FilterContainer
    slot={
      <Checkbox
        size="xxl"
        checked={!!initialValue}
        onCheckedChange={setFilterAction}
      />
    }
    filter={filter}
    onRemoveFilter={onRemoveFilter}
  />
);
export const ThreeStateCheckboxFilter: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  setFilterAction,
}) => {
  const stateMap = {
    ['true']: 'checked',
    ['false']: 'indeterminate',
    ['']: 'unchecked',
  };
  const value = stateMap[(initialValue as keyof typeof stateMap) ?? ''];

  const handleChange = (value: string | boolean) => {
    switch (value) {
      case 'checked':
        setFilterAction(true);
        break;

      case 'indeterminate':
        setFilterAction(false);
        break;

      default:
        setFilterAction(undefined);
        break;
    }
  };

  return (
    <FilterContainer
      filterContainerClassName=""
      slot={
        <ThreeStateCheckbox
          value={value as ThreeStateCheckboxStates}
          onValueChanged={(val) => handleChange(val as string)}
        />
      }
      filter={filter}
    />
  );
};
interface DateFilterComponentProps extends FilterComponentProps {
  filter: DateFilterOpts;
}
export const YearFilter: FC<DateFilterComponentProps> = ({
  filter,
  initialValue,
  onRemoveFilter,
  setFilterAction,
}) => {
  const [calendarVisible, onOpenChange] = useState(false);

  return (
    <FilterContainer
      hasValue={!!initialValue}
      slot={
        <YearPicker
          value={initialValue as unknown as number}
          open={calendarVisible}
          onOpenChange={onOpenChange}
          onValueChange={setFilterAction}
        />
      }
      filter={filter}
      onRemoveFilter={onRemoveFilter}
    ></FilterContainer>
  );
};

export const YearRangeFilter: FC<
  FilterComponentProps<[number, number] | [number, null] | [null, null]>
> = ({
  filter,
  initialValue = [null, null],
  onRemoveFilter,
  setFilterAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startYear, setStartYear] = useState<number | null>(initialValue[0]);
  const [endYear, setEndYear] = useState<number | null>(initialValue[1]);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  const currentYear = new Date().getFullYear();
  const yearsPerPage = 15;
  const totalYears = 125;
  const years = Array.from(
    { length: totalYears },
    (_, i) => currentYear - i
  ).reverse();

  const [currentPage, setCurrentPage] = useState(
    Math.ceil(years.length / yearsPerPage) - 1
  );

  const paginatedYears = years.slice(
    currentPage * yearsPerPage,
    (currentPage + 1) * yearsPerPage
  );

  useEffect(() => {
    setStartYear(initialValue[0]);
    setEndYear(initialValue[1]);
  }, [initialValue])

  const handleYearClick = (year: number) => {
    if (isSelectingStart) {
      setStartYear(year);
      setEndYear(null);
      setIsSelectingStart(false);
      setFilterAction([year, null]);
    } else {
      if (year < (startYear ?? 0)) {
        setEndYear(startYear);
        setStartYear(year);
      } else {
        setEndYear(year);
      }
      setIsSelectingStart(true);
      setIsOpen(false);
      setFilterAction([startYear, year]);
    }
  };

  const handleYearHover = (year: number) => {
    if (!isSelectingStart && startYear !== null) {
      setHoverYear(year);
    }
  };

  const handlePageChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else if (
        direction === 'next' &&
        (currentPage + 1) * yearsPerPage < years.length
      ) {
        setCurrentPage(currentPage + 1);
      }
    },
    [currentPage, years.length]
  );

  const renderPlaceholder = useCallback(() => {
    if (!startYear && !endYear) {
      return `Wybierz zakres lat`;
    }
    if (startYear && !endYear) {
      return `${startYear} - ...`;
    }
    return `${startYear} - ${endYear}`;
  }, [startYear, endYear]);

  const onRemoveFilterInternal = useCallback(() => {
    setStartYear(null);
    setEndYear(null);
    if (onRemoveFilter) {
      onRemoveFilter();
    }
  }, [onRemoveFilter]);

  return (
    <FilterContainer
      filter={filter}
      onRemoveFilter={onRemoveFilter ? onRemoveFilterInternal : undefined}
      hasValue={!!(startYear || endYear)}
      slot={
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="xl"
              variant="secondary"
              className="w-full flex items-start text-left border text-gray-500"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-black">{renderPlaceholder()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
                className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                ←
              </button>
              <span className="text-sm text-gray-500 font-medium">
                {paginatedYears[0]} -{' '}
                {paginatedYears[paginatedYears.length - 1]}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={(currentPage + 1) * yearsPerPage >= years.length}
                className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {paginatedYears.map((year) => {
                const isInRange =
                  startYear !== null &&
                  hoverYear !== null &&
                  ((year >= startYear && year <= hoverYear) ||
                    (year <= startYear && year >= hoverYear));
                return (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    onMouseEnter={() => handleYearHover(year)}
                    className={`px-2 py-1 rounded text-center ${
                      isInRange ? 'bg-blue-200' : ''
                    } ${
                      startYear === year || endYear === year
                        ? 'bg-blue-500 text-white'
                        : ''
                    } hover:bg-blue-300`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      }
    />
  );
};

export const FilterComponent: FC<FilterComponentProps> = ({
  filter,
  onRemoveFilter,
  setFilterAction,
}) => {
  if (filter.customSlot) {
    return (
      <filter.customSlot
        setFilterAction={setFilterAction}
        onRemoveFilter={onRemoveFilter}
        filter={filter}
      />
    );
  }

  switch (filter.type) {
    case 'text':
      return (
        <TextFilter
          setFilterAction={setFilterAction}
          onRemoveFilter={onRemoveFilter}
          filter={filter}
        />
      );
    case 'select':
      return (
        <SelectFilter
          setFilterAction={setFilterAction}
          onRemoveFilter={onRemoveFilter}
          filter={filter}
        />
      );
    case 'checkbox':
      return (
        <CheckboxFilter
          setFilterAction={setFilterAction}
          onRemoveFilter={onRemoveFilter}
          filter={filter}
        />
      );

    case 'three-state-checkbox':
      return (
        <ThreeStateCheckboxFilter
          filter={filter}
          setFilterAction={setFilterAction}
        />
      );
    case 'year':
      return (
        <YearFilter
          setFilterAction={setFilterAction}
          onRemoveFilter={onRemoveFilter}
          // eslint-disable-next-line
          filter={filter as any}
        />
      );
    default:
      return null;
  }
};
