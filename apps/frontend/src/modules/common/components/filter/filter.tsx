import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
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
// export const DateFilter: FC<DateFilterComponentProps> = ({
//   filter,
//   setFilterAction,
// }) => {
//   const handleChange = (value: string | boolean | Date | undefined) => {
//     updateFilterValue(filter.key, value);
//     if (setFilterAction) {
//       setFilterAction(value);
//     }
//   };

//   const filterValue = filterValues[filter.key as string];
//   const siblingFilterValue = filterValues[filter.dateRangeSiblingId];

//   const [calendarVisible, onOpenChange] = useState(false);

//   const siblingValue = useMemo(() => {
//     if (!siblingFilterValue) {
//       return null;
//     }

//     return siblingFilterValue;
//   }, [siblingFilterValue]);

//   const isSiblingBefore = useCallback(() => {
//     if (siblingValue === null || filter.isBeforeFilter) {
//       return false;
//     }

//     return true;
//   }, [siblingValue, filter.isBeforeFilter]);

//   const isSiblingAfter = useCallback(() => {
//     if (siblingValue === null || filter.isAfterFilter) {
//       return false;
//     }

//     return true;
//   }, [siblingValue, filter.isAfterFilter]);

//   const getDisabledValues = useCallback(
//     (date: Date) =>
//       date > new Date() ||
//       date < new Date('1900-01-01') ||
//       (isSiblingAfter() && date < (siblingValue as Date)) ||
//       (isSiblingBefore() && date > (siblingValue as Date)),
//     [isSiblingAfter, isSiblingBefore, siblingValue]
//   );

//   return (
//     <FilterContainer
//       slot={
//         <Popover
//           modal={true}
//           open={calendarVisible}
//           onOpenChange={onOpenChange}
//         >
//           <PopoverTrigger asChild>
//             <Button
//               variant={'outline'}
//               type="button"
//               size="custom"
//               className={'w-full truncate h-10 pl-3 text-left font-normal'}
//             >
//               {filterValue ? (
//                 formatDate(filterValue as Date, 'PPP', {
//                   locale: pl,
//                 })
//               ) : (
//                 <>DD-MM-RRRR</>
//               )}
//               {!filterValue && (
//                 <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//               )}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" align="start">
//             <Calendar
//               mode="single"
//               selected={filterValue as Date}
//               onSelect={handleChange}
//               disabled={getDisabledValues}
//               initialFocus
//             />
//           </PopoverContent>
//         </Popover>
//       }
//       filter={filter}
//     ></FilterContainer>
//   );
// };

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
