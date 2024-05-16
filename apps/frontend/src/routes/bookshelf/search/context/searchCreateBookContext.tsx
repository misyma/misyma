/* eslint-disable react-refresh/only-export-components */
import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';

const initialState = {
  step: 1,
  bookId: '',
  title: '',
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

export type BookCreationSearchActions =
  | BookCreationSearchSetStepAction
  | SetChosenSearchBookId
  | SetChosenSearchBookTitle;

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

  return {
    ...state,
    bookId: action.bookId,
  };
}
