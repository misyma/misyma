import { type PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

import { type BookshelfView, type PreferencesState, type UiMode } from './preferencesState';

const initialState: PreferencesState = {
  uiMode: 'light' as UiMode,
  bookshelfView: 'books',
};

interface SetUiModeActionPayload {
  uiMode: UiMode;
}

export const preferencesStateSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setUiMode: (state, action: PayloadAction<SetUiModeActionPayload>) => {
      state.uiMode = action.payload.uiMode;
    },
    setBookshelfView: (state, action: PayloadAction<BookshelfView>) => {
      state.bookshelfView = action.payload;
    },
  },
  selectors: {
    selectUiMode: (state) => state.uiMode,
    selectBookshelfView: (state) => state.bookshelfView,
  },
});

export const setBookshelfView = createAction<BookshelfView>('preferences/setBookshelfView');

export const preferencesStateActions = preferencesStateSlice.actions;
