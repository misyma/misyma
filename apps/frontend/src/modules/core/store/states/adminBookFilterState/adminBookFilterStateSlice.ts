import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminBookFilterState } from './adminBookFilterState';

const initialState: AdminBookFilterState = {
	authorId: '',
	isApproved: '',
	isbn: '',
	language: '',
	releaseYearAfter: undefined,
	title: '',
	filterVisible: false,
};

export const adminBookFilterStateSlice = createSlice({
	name: 'adminBookFilter',
	initialState,
	reducers: {
		setAuthorId: (state, action: PayloadAction<string | undefined>) => {
			state.authorId = action.payload;
		},
		setIsApproved: (state, action: PayloadAction<string | undefined>) => {
			state.isApproved = action.payload;
		},
		setIsbn: (state, action: PayloadAction<string | undefined>) => {
			state.isbn = action.payload;
		},
		setLanguage: (state, action: PayloadAction<string | undefined>) => {
			state.language = action.payload;
		},
		setReleaseYearAfter: (state, action: PayloadAction<number | undefined>) => {
			state.releaseYearAfter = action.payload;
		},
		setTitle: (state, action: PayloadAction<string | undefined>) => {
			state.title = action.payload;
		},
		setFilterVisible: (state, action: PayloadAction<boolean>) => {
			state.filterVisible = action.payload;
		},
	},
	selectors: {
		getAuthorId: (state) => state.authorId,
		getIsApproved: (state) => state.isApproved,
		getIsbn: (state) => state.isbn,
		getLanguage: (state) => state.language,
		getReleaseYearAfter: (state) => state.releaseYearAfter,
		getTitle: (state) => state.title,
		getFilterVisible: (state) => state.filterVisible,
	},
});

export const adminBookFilterStateSelectors =
	adminBookFilterStateSlice.selectors;

export const adminBookFilterStateActions = adminBookFilterStateSlice.actions;
