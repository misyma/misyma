import { BookFormat, Language } from '@common/contracts';
import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';

export interface BookDetailsChangeRequestState {
  isbn: string;
  title: string;
  authorIds: string | undefined;
  authorName: string | undefined;
  releaseYear: undefined;
  publisher: string;
  language: Language;
  translator: string;
  format: BookFormat;
  pages: undefined;
}

export enum BookDetailsChangeRequestAction {
  setValues = 1,
}

type SetContextValuesAction = {
  type: BookDetailsChangeRequestAction;
  values: Partial<BookDetailsChangeRequestState>;
};

const defaultValues: BookDetailsChangeRequestState = {
  authorIds: undefined,
  authorName: undefined,
  format: BookFormat.paperback,
  isbn: '',
  language: Language.English,
  pages: undefined,
  publisher: '',
  title: '',
  translator: '',
  releaseYear: undefined,
};

const BookDetailsChangeRequestContext = createContext<BookDetailsChangeRequestState>(defaultValues);

const BookDetailsChangeRequestDispatchContext = createContext(null as unknown as Dispatch<SetContextValuesAction>);

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

function bookDetailsChangeRequestReducer(state: BookDetailsChangeRequestState, action: SetContextValuesAction) {
  return {
    ...state,
    ...action.values,
  };
}
