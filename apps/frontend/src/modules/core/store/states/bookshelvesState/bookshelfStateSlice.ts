import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookshelfState } from './bookshelvesState';
import { Bookshelf } from '@common/contracts';

const initialState: BookshelfState = {
	bookshelves: [],
	editMap: {},
};

export const bookshelfStateSlice = createSlice({
	name: 'bookshelves',
	initialState,
	reducers: {
		setBookshelves: (state, action: PayloadAction<Bookshelf[]>) => {
			state.bookshelves = action.payload;
		},
		setEditMap: (state, action: PayloadAction<Record<number, boolean>>) => {
			state.editMap = action.payload;
		},
	},
	selectors: {
		selectBookshelves: (state) => state.bookshelves,
		selectEditMap: (state) => state.editMap,
	},
});

export const setBookshelves = createAction<Bookshelf[]>(
	'bookshelves/setBookshelves'
);

export const setEditMap = createAction<Record<number, boolean>>(
	'bookshelves/setEditMap'
);
