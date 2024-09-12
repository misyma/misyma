type BaseFilterOpts = {
	id: string;
	type: FilterTypes;
	label: string;
	key: PropertyKey;
};

export type FilterTypes = 'text' | 'select' | 'checkbox';

export type TextFilterOpts = BaseFilterOpts & {
	type: 'text';
};

export type CheckboxFilterOpts = BaseFilterOpts & {
	type: 'checkbox';
};

export type SelectFilterOpts = BaseFilterOpts & {
	type: 'select';
	options: string[];
};

export type FilterOpts = TextFilterOpts | SelectFilterOpts | CheckboxFilterOpts;
