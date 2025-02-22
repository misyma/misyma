import { type Dispatch, type ReactNode, createContext, useContext, useReducer } from 'react';

import { type BookFormat, type Language } from '@common/contracts';

export interface BookDetailsChangeRequestState {
  isbn: string;
  title: string;
  authorIds: string[];
  releaseYear: undefined;
  publisher: string;
  language: Language;
  translator: string;
  format: BookFormat;
  pages: undefined;
}

export enum BookDetailsChangeRequestAction {
  setValues = 1,
  resetContext = 2,
}

type ResetContextValues = {
  type: BookDetailsChangeRequestAction.resetContext;
};

type SetContextValuesAction = {
  type: BookDetailsChangeRequestAction.setValues;
  values: Partial<BookDetailsChangeRequestState>;
};

type Actions = ResetContextValues | SetContextValuesAction;

const defaultValues: BookDetailsChangeRequestState = {
  authorIds: [],
  format: '' as BookFormat,
  isbn: '',
  language: '' as Language,
  pages: undefined,
  publisher: '',
  title: '',
  translator: '',
  releaseYear: undefined,
};

const BookDetailsChangeRequestContext = createContext<BookDetailsChangeRequestState>(defaultValues);

const BookDetailsChangeRequestDispatchContext = createContext(null as unknown as Dispatch<Actions>);

export function BookDetailsChangeRequestProvider({ children }: { children: ReactNode }): JSX.Element {
  const [bookDetailsChangeRequest, dispatch] = useReducer(bookDetailsChangeRequestReducer, defaultValues);

  return (
    <BookDetailsChangeRequestContext.Provider value={bookDetailsChangeRequest}>
      <BookDetailsChangeRequestDispatchContext.Provider value={dispatch}>
        {children}
      </BookDetailsChangeRequestDispatchContext.Provider>
    </BookDetailsChangeRequestContext.Provider>
  );
}

export function useBookDetailsChangeRequestContext(): BookDetailsChangeRequestState {
  return useContext(BookDetailsChangeRequestContext);
}

export function useBookDetailsChangeRequestDispatch() {
  return useContext(BookDetailsChangeRequestDispatchContext);
}

function bookDetailsChangeRequestReducer(state: BookDetailsChangeRequestState, action: Actions) {
  if (action.type === BookDetailsChangeRequestAction.resetContext) {
    return {
      authorIds: [],
      authorName: undefined,
      format: '' as BookFormat,
      isbn: '',
      language: '' as Language,
      pages: undefined,
      publisher: '',
      title: '',
      translator: '',
      releaseYear: undefined,
    };
  }

  return {
    ...state,
    ...action.values,
  };
}
