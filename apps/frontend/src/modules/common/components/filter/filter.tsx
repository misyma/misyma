import { CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { type ChangeEvent, type FC, useCallback, useEffect, useMemo, useState, memo } from 'react';

import { FilterContainer } from './filterContainer';
import { cn } from '../../lib/utils';
import { type FilterComponentProps, type SelectFilterOpts } from '../../types/filter';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { Select, SelectContent, SelectContentNoPortal, SelectItem, SelectTrigger, SelectValue } from '../select/select';
import ThreeStateCheckbox, { type ThreeStateCheckboxStates } from '../threeStatesCheckbox/ThreeStatesCheckbox';
import { YearPicker } from '../yearPicker/yearPicker';

export const TextFilter: FC<FilterComponentProps & { skipValidation?: boolean }> = memo(
  ({ filter, initialValue, onRemoveFilter, setFilterAction }) => {
    const [value, setValue] = useState(initialValue ?? '');

    const onValueChanged = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setFilterAction(newValue);
      },
      [setFilterAction],
    );

    useEffect(() => {
      setValue(initialValue ?? '');
    }, [initialValue]);

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
  },
);

TextFilter.displayName = 'TextFilter';

interface SelectFilterProps extends FilterComponentProps {
  filter: SelectFilterOpts;
}

export const SelectFilter: FC<SelectFilterProps> = memo(
  ({ filter, initialValue, onRemoveFilter, setFilterAction, dialog = false }) => {
    const filterItems = useMemo(
      () => (
        <>
          {filter.options?.map((option) => (
            <SelectItem
              className="w-full sm:w-full"
              key={option}
              value={option}
            >
              {option}
            </SelectItem>
          ))}
        </>
      ),
      [filter?.options],
    );

    const handleValueChange = useCallback(
      (value: string) => {
        setFilterAction(value);
      },
      [setFilterAction],
    );

    return (
      <FilterContainer
        slot={
          <Select
            className="w-96"
            value={initialValue ?? ''}
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="w-full sm:w-full">
              <SelectValue className="w-full sm:w-full" />
            </SelectTrigger>
            {dialog ? (
              <SelectContent className="w-full sm:w-full">{filterItems}</SelectContent>
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
  },
);

SelectFilter.displayName = 'SelectFilter';

export const ThreeStateCheckboxFilter: FC<FilterComponentProps> = memo(({ filter, initialValue, setFilterAction }) => {
  const stateMap = useMemo(
    () => ({
      ['true']: 'checked',
      ['false']: 'indeterminate',
      ['']: 'unchecked',
    }),
    [],
  );

  const value = stateMap[(initialValue as keyof typeof stateMap) ?? ''];

  const handleChange = useCallback(
    (value: string | boolean) => {
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
    },
    [setFilterAction],
  );

  return (
    <FilterContainer
      filterContainerClassName=""
      slot={
        <ThreeStateCheckbox
          value={value as ThreeStateCheckboxStates}
          onValueChanged={handleChange}
        />
      }
      filter={filter}
    />
  );
});

ThreeStateCheckboxFilter.displayName = 'ThreeStateCheckboxFilter';

const YearPickerContent = memo(
  ({
    paginatedYears,
    startYear,
    endYear,
    hoverYear,
    onYearClick,
    onYearHover,
  }: {
    paginatedYears: number[];
    startYear: number | null;
    endYear: number | null;
    hoverYear: number | null;
    onYearClick: (year: number) => void;
    onYearHover: (year: number) => void;
  }) => (
    <div className="grid grid-cols-3 gap-2">
      {paginatedYears.map((year) => {
        const isInRange =
          startYear !== null &&
          hoverYear !== null &&
          ((year >= startYear && year <= hoverYear) || (year <= startYear && year >= hoverYear));

        return (
          <button
            key={year}
            onClick={() => onYearClick(year)}
            onMouseEnter={() => onYearHover(year)}
            className={`px-2 py-1 rounded text-center ${isInRange ? 'bg-blue-200' : ''} ${
              startYear === year || endYear === year ? 'bg-blue-500 text-white' : ''
            } hover:bg-blue-300`}
          >
            {year}
          </button>
        );
      })}
    </div>
  ),
);

YearPickerContent.displayName = 'YearPickerContent';

interface YearRangeFilterProps {
  filter: { label: string };
  initialValue?: [number | null, number | null];
  onRemoveFilter?: () => void;
  setFilterAction: (value: [number | null, number | null]) => void;
}

export const YearRangeFilter = memo(
  ({ filter, initialValue = [null, null], onRemoveFilter, setFilterAction }: YearRangeFilterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [startYear, setStartYear] = useState<number | null>(initialValue[0]);
    const [endYear, setEndYear] = useState<number | null>(initialValue[1]);
    const [hoverYear, setHoverYear] = useState<number | null>(null);
    const [isSelectingStart, setIsSelectingStart] = useState(true);

    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const yearsPerPage = 15;
    const totalYears = 125;

    const years = useMemo(() => Array.from({ length: totalYears }, (_, i) => currentYear - i).reverse(), [currentYear]);

    const [currentPage, setCurrentPage] = useState(Math.ceil(years.length / yearsPerPage) - 1);

    const paginatedYears = useMemo(
      () => years.slice(currentPage * yearsPerPage, (currentPage + 1) * yearsPerPage),
      [years, currentPage],
    );

    const handleYearClick = useCallback(
      (year: number) => {
        if (isSelectingStart) {
          setStartYear(year);
          setEndYear(null);
          setIsSelectingStart(false);
          setFilterAction([year, null]);
        } else {
          const newStartYear = year < (startYear ?? 0) ? year : startYear;
          const newEndYear = year < (startYear ?? 0) ? startYear : year;

          setStartYear(newStartYear);
          setEndYear(newEndYear);
          setIsSelectingStart(true);
          setIsOpen(false);
          setFilterAction([newStartYear, newEndYear]);
        }
      },
      [isSelectingStart, startYear, setFilterAction],
    );

    const handleYearHover = useCallback(
      (year: number) => {
        if (!isSelectingStart && startYear !== null) {
          setHoverYear(year);
        }
      },
      [isSelectingStart, startYear],
    );

    const handlePageChange = useCallback(
      (direction: 'prev' | 'next') => {
        setCurrentPage((prev) => {
          if (direction === 'prev' && prev > 0) {
            return prev - 1;
          } else if (direction === 'next' && (prev + 1) * yearsPerPage < years.length) {
            return prev + 1;
          }
          return prev;
        });
      },
      [years.length],
    );

    const renderValue = useCallback(() => {
      if (!startYear && !endYear) {
        return 'Wybierz przedział lat';
      }
      if (startYear && !endYear) {
        return `${startYear} - ...`;
      }
      return `${startYear} - ${endYear}`;
    }, [startYear, endYear]);

    useEffect(() => {
      setStartYear(initialValue[0]);
      setEndYear(initialValue[1]);
    }, [initialValue]);

    return (
      <div className="flex flex-col gap-1 px-2">
        <div>{filter.label}</div>
        <div className="flex items-center gap-2 py-2">
          <Popover
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="none"
                size="custom"
                className={cn(
                  'border !flex !justify-start pl-3 text-sm bg-[#D1D5DB]/20 text-black w-60 sm:w-96 h-12',
                  !startYear && !endYear && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {renderValue()}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[35rem] p-0"
              align="start"
            >
              <div className="flex items-center justify-between border-b p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 0}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {paginatedYears[0]} - {paginatedYears[paginatedYears.length - 1]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange('next')}
                  disabled={(currentPage + 1) * yearsPerPage >= years.length}
                  className="h-7 w-7"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                {paginatedYears.map((year) => {
                  const isInRange =
                    startYear !== null &&
                    hoverYear !== null &&
                    ((year >= startYear && year <= hoverYear) || (year <= startYear && year >= hoverYear));

                  return (
                    <Button
                      key={year}
                      onClick={() => handleYearClick(year)}
                      onMouseEnter={() => handleYearHover(year)}
                      variant={startYear === year || endYear === year ? 'default' : 'ghost'}
                      className={cn('h-8 w-full p-0 font-normal', isInRange && 'bg-muted hover:bg-muted')}
                    >
                      {year}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          {onRemoveFilter && (startYear || endYear) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveFilter}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Clear year range</span>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  },
);

YearRangeFilter.displayName = 'YearRangeFilter';

export const YearFilter: FC<FilterComponentProps> = ({ filter, initialValue, onRemoveFilter, setFilterAction }) => {
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
