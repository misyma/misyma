import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MyBooksFilterState } from './myBooksFilterState';

const initialState: MyBooksFilterState = {
	language: '',
	releaseYearAfter: undefined,
	releaseYearBefore: undefined,
	title: '',
	filterVisible: false,
	genreId: '',
	status: '',
	isFavorite: '',
	authorId: '',
};

export const myBooksFilterStateSlice = createSlice({
	name: 'myBooksFilter',
	initialState,
	reducers: {
		setLanguage: (state, action: PayloadAction<string | undefined>) => {
			state.language = action.payload;
		},
		setTitle: (state, action: PayloadAction<string | undefined>) => {
			state.title = action.payload;
		},
		setReleaseYearAfter: (state, action: PayloadAction<number | undefined>) => {
			state.releaseYearAfter = action.payload;
		},
		setReleaseYearBefore: (state, action: PayloadAction<number | undefined>) => {
			state.releaseYearBefore = action.payload;
		},
		setFilterVisible: (state, action: PayloadAction<boolean>) => {
			state.filterVisible = action.payload;
		},
		resetAllFilters: (state) => {
			state.language = '';
			state.title = '';
			state.releaseYearAfter = undefined;
		},
		setGenreId: (state, action: PayloadAction<string>) => {
			state.genreId = action.payload;
		},
		setStatus: (state, action: PayloadAction<string>) => {
			state.status = action.payload;
		},
		setIsFavorite: (state, action: PayloadAction<string | undefined>) => {
			state.isFavorite = action.payload;
		},
		setAuthorId: (state, action: PayloadAction<string | undefined>) => {
			state.authorId = action.payload;
		},
	},
	selectors: {
		getFilterVisibility: (state) => state.filterVisible,
		getLanguage: (state) => state.language,
		getTitle: (state) => state.title,
		getReleaseYearAfter: (state) => state.releaseYearAfter,
		getGenreId: (state) => state.genreId,
		getStatus: (state) => state.status,
		getIsFavorite: (state) => state.authorId,
		getAuthorId: (state) => state.authorId,
	},
});

export const myBooksStateSelectors = myBooksFilterStateSlice.selectors;

export const {
	resetAllFilters,
	setFilterVisible,
	setLanguage,
	setReleaseYearAfter,
	setReleaseYearBefore,
	setTitle,
	setGenreId,
	setStatus,
	setIsFavorite,
	setAuthorId
} = myBooksFilterStateSlice.actions;
