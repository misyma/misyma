type BaseFilterOpts = {
	id: string;
	type: FilterTypes;
	label: string;
	key: PropertyKey;
};

export type FilterTypes = 'text' | 'select';

export type TextFilterOpts = BaseFilterOpts & {
	type: 'text';
};

export type SelectFilterOpts = BaseFilterOpts & {
	type: 'select';
	options: string[];
};

export type FilterOpts = TextFilterOpts | SelectFilterOpts;
