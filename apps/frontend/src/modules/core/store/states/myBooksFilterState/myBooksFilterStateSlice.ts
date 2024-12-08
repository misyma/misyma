import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MyBooksFilterState } from './myBooksFilterState';

const initialState: MyBooksFilterState = {
	language: '',
	releaseAfter: undefined,
	title: '',
	filterVisible: false,
};

export const myBooksFilterStateSlice = createSlice({
	name: 'myBooksFilter',
	initialState,
	reducers: {
		setLanguage: (state, action: PayloadAction<string>) => {
			state.language = action.payload;
		},
		setTitle: (state, action: PayloadAction<string>) => {
			state.title = action.payload;
		},
		setReleasedAfter: (state, action: PayloadAction<Date>) => {
			state.releaseAfter = action.payload;
		},
		setFilterVisible: (state, action: PayloadAction<boolean>) => {
			state.filterVisible = action.payload;
		},
		resetAllFilters: (state) => {
			state.language = '';
			state.title = '';
			state.releaseAfter = undefined;
		},
	},
	selectors: {
		getFilterVisibility: (state) => state.filterVisible,
		getLanguage: (state) => state.language,
		getTitle: (state) => state.title,
		getReleaseAfter: (state) => state.releaseAfter,
	},
});

export const setLanguage = createAction<string>('myBooksFilter/setLanguage');

export const setTitle = createAction<string>('myBooksFilter/setTitle');

export const setReleasedAfter = createAction<Date>(
	'myBooksFilter/setReleasedAfter'
);

export const setFilterVisible = createAction<boolean>(
	'myBooksFilter/setFilterVisible'
);

export const resetAllFilters = createAction<void>(
	'myBooksFilter/resetAllFilters'
);

export const myBooksStateSelectors = myBooksFilterStateSlice.selectors;
