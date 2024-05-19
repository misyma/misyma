/* eslint-disable react-refresh/only-export-components */
import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';

const initialState = {
  step: 1,
  bookId: '',
  title: '',
  searchQuery: '',
  isbn: '',
};

const SearchCreateBookContext = createContext<BookCreationSearchState>(initialState);

const SearchCreateBookDispatchContext = createContext<Dispatch<BookCreationSearchActions>>(
  null as unknown as Dispatch<BookCreationSearchActions>,
);

export enum BookCreationSearchStep {
  searchMethod = 1,
  searchResult = 2,
  finalCreation = 3,
}

export interface BookCreationSearchState {
  step: BookCreationSearchStep;
  bookId: string;
  title: string;
  searchQuery?: string;
  isbn?: string;
}

export type BookCreationSearchSetStepAction = {
  step: BookCreationSearchStep;
};

export type SetChosenSearchBookId = {
  bookId: string;
};

export type SetChosenSearchBookTitle = {
  title: string;
};

export type SetSearchQuery = {
  searchQuery: string;
};

export type SetSearchIsbn = {
  isbn: string;
};

export type BookCreationSearchActions =
  | BookCreationSearchSetStepAction
  | SetChosenSearchBookId
  | SetChosenSearchBookTitle
  | SetSearchQuery
  | SetSearchIsbn;

export function SearchCreateBookProvider({ children }: { children: ReactNode }): JSX.Element {
  const [searchContext, dispatch] = useReducer(searchCreateBookContextReducer, initialState);

  return (
    <SearchCreateBookContext.Provider value={searchContext}>
      <SearchCreateBookDispatchContext.Provider value={dispatch}>{children}</SearchCreateBookDispatchContext.Provider>
    </SearchCreateBookContext.Provider>
  );
}

export function useSearchBookContext() {
  return useContext(SearchCreateBookContext);
}

export function useSearchBookContextDispatch() {
  return useContext(SearchCreateBookDispatchContext);
}

function searchCreateBookContextReducer(state: BookCreationSearchState, action: BookCreationSearchActions) {
  if ('step' in action) {
    return {
      ...state,
      step: action.step,
    };
  }

  if ('title' in action) {
    return {
      ...state,
      title: action.title,
    };
  }

  if ('searchQuery' in action) {
    return {
      ...state,
      searchQuery: action.searchQuery,
    };
  }

  if ('isbn' in action) {
    return {
      ...state,
      isbn: action.isbn,
    };
  }

  return {
    ...state,
    bookId: action.bookId,
  };
}
