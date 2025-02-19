import { type FC } from 'react';

export type BaseFilterOpts = {
  id: string;
  initialValue?: string;
  type: FilterTypes;
  label: string;
  key: PropertyKey;
  customSlot?: FC<FilterComponentProps>;
};

export type FilterTypes = 'text' | 'select' | 'checkbox' | 'three-state-checkbox' | 'date' | 'year';

export type TextFilterOpts = BaseFilterOpts & {
  type: 'text';
};

export type YearFilerOpts = BaseFilterOpts & {
  type: 'year';
  dateRangeSiblingId: string;
  isAfterFilter: boolean;
  isBeforeFilter: boolean;
};

export type CheckboxFilterOpts = BaseFilterOpts & {
  type: 'checkbox';
};

export type ThreeStateCheckboxFilterOpts = BaseFilterOpts & {
  type: 'three-state-checkbox';
};

export type DateFilterOpts = BaseFilterOpts & {
  type: 'date';
  dateRangeSiblingId: string;
  isAfterFilter: boolean;
  isBeforeFilter: boolean;
};

export type SelectFilterOpts = BaseFilterOpts & {
  type: 'select';
  options: string[];
};

export type FilterOpts =
  | YearFilerOpts
  | TextFilterOpts
  | DateFilterOpts
  | SelectFilterOpts
  | CheckboxFilterOpts
  | ThreeStateCheckboxFilterOpts;

export interface FilterComponentProps<V = string> {
  filter: FilterOpts;
  className?: string;
  dialog?: boolean;
  onRemoveFilter?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFilterAction: (value: any) => void;
  initialValue?: V;
  size?: string;
}
