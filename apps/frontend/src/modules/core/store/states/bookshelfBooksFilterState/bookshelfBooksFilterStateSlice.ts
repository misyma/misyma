import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type BookshelfBooksFilterState } from './bookshelfBooksFilterState';

const initialState: BookshelfBooksFilterState = {
  filterVisible: false,
};

export const bookshelfBooksFilterStateSlice = createSlice({
  name: 'bookshelfBooksFilter',
  initialState,
  reducers: {
    setFilterVisible: (state, action: PayloadAction<boolean>) => {
      state.filterVisible = action.payload;
    },
  },
  selectors: {
    getFilterVisibility: (state) => state.filterVisible,
  },
});

export const bookshelfBooksFilterStateSelectors = bookshelfBooksFilterStateSlice.selectors;

export const { setFilterVisible } = bookshelfBooksFilterStateSlice.actions;
