export type UiMode = 'light' | 'dark';

export type BookshelfView = 'books' | 'shelves';

export interface PreferencesState {
  uiMode: UiMode;
  bookshelfView: BookshelfView;
}
