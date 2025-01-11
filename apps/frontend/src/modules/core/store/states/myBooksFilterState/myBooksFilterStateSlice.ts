import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type MyBooksFilterState } from './myBooksFilterState';

const initialState: MyBooksFilterState = {
  filterVisible: false,
};

export const myBooksFilterStateSlice = createSlice({
  name: 'myBooksFilter',
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

export const myBooksStateSelectors = myBooksFilterStateSlice.selectors;

export const { setFilterVisible } = myBooksFilterStateSlice.actions;
