import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookshelfState } from './bookshelvesState';

const initialState: BookshelfState = {
	editMap: {},
	creatingNew: false,
};

export const bookshelfStateSlice = createSlice({
	name: 'bookshelves',
	initialState,
	reducers: {
		setEditMap: (state, action: PayloadAction<Record<number, boolean>>) => {
			state.editMap = action.payload;
		},
		setCreatingNew: (state, action: PayloadAction<boolean>) => {
			state.creatingNew = action.payload;
		},
	},
	selectors: {
		selectEditMap: (state) => state.editMap,
		selectIsCreatingNew: (state) => state.creatingNew,
	},
});

export const bookshelfSelectors = bookshelfStateSlice.selectors;

export const setEditMap = createAction<Record<number, boolean>>(
	'bookshelves/setEditMap'
);

export const setCreatingNew = createAction<boolean>(
	'bookshelves/setCreatingNew'
);

