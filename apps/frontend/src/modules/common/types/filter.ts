export type BaseFilterOpts = {
	id: string;
	type: FilterTypes;
	label: string;
	key: PropertyKey;
};

export type FilterTypes = 'text' | 'select' | 'checkbox' | 'date';

export type TextFilterOpts = BaseFilterOpts & {
	type: 'text';
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
	| TextFilterOpts
	| DateFilterOpts
	| SelectFilterOpts
	| CheckboxFilterOpts;
