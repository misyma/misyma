import { FC } from 'react';
import { z } from 'zod';

export type BaseFilterOpts = {
	id: string;
	type: FilterTypes;
	label: string;
	key: PropertyKey;
	customSlot?: FC<FilterComponentProps>;
	schema?: z.Schema;
};

export type FilterTypes =
	| 'text'
	| 'select'
	| 'checkbox'
	| 'three-state-checkbox'
	| 'date'
	| 'year';

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

export interface FilterComponentProps {
	filter: FilterOpts;
	className?: string;
	dialog?: boolean;
	onRemoveFilter?: (name: string) => void;
}
