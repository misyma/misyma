import { FC } from 'react';

export type BaseFilterOpts = {
	id: string;
	type: FilterTypes;
	label: string;
	key: PropertyKey;
	customSlot?: FC<FilterComponentProps>;
};

export type FilterTypes = 'text' | 'select' | 'checkbox' | 'date' | 'year';

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
	| CheckboxFilterOpts;

export interface FilterComponentProps {
	filter: FilterOpts;
	className?: string;
	dialog?: boolean;
}
