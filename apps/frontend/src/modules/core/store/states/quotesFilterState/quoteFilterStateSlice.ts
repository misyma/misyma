import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type QuoteFilterState } from './quoteFilterState';

const initialState: QuoteFilterState = {
  filterVisible: false,
};

export const quoteFilterStateSlice = createSlice({
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

export const quoteStateSelectors = quoteFilterStateSlice.selectors;

export const { setFilterVisible } = quoteFilterStateSlice.actions;
