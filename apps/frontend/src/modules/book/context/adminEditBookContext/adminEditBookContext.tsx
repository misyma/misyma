import { type Dispatch, type ReactNode, createContext, useContext, useReducer } from 'react';

import { BookFormat, Language } from '@common/contracts';

export interface AdminEditBookState {
  isbn: string;
  title: string;
  authorIds: string | undefined;
  authorName: string | undefined;
  releaseYear: undefined;
  publisher: string;
  language: Language;
  translator: string;
  format: BookFormat;
  pages: number | undefined;
  genre?: string | undefined;
  imageUrl?: string | undefined;
}

export enum AdminEditBookAction {
  setValues = 1,
  resetContext = 2,
}

type ResetContextValues = {
  type: AdminEditBookAction.resetContext;
};

type SetContextValuesAction = {
  type: AdminEditBookAction.setValues;
  values: Partial<AdminEditBookState>;
};

type Actions = ResetContextValues | SetContextValuesAction;

const defaultValues: AdminEditBookState = {
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
  genre: undefined,
  imageUrl: undefined,
};

const AdminEditBookContext = createContext<AdminEditBookState>(defaultValues);

const AdminEditBookDispatchContext = createContext(null as unknown as Dispatch<Actions>);

export function AdminEditBookProvider({ children }: { children: ReactNode }): JSX.Element {
  const [bookDetailsChangeRequest, dispatch] = useReducer(adminEditBookReducer, defaultValues);

  return (
    <AdminEditBookContext.Provider value={bookDetailsChangeRequest}>
      <AdminEditBookDispatchContext.Provider value={dispatch}>{children}</AdminEditBookDispatchContext.Provider>
    </AdminEditBookContext.Provider>
  );
}

export function useAdminEditBookContext(): AdminEditBookState {
  return useContext(AdminEditBookContext);
}

export function useAdminEditBookDispatch() {
  return useContext(AdminEditBookDispatchContext);
}

function adminEditBookReducer(state: AdminEditBookState, action: Actions) {
  if (action.type === AdminEditBookAction.resetContext) {
    return {
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
  }

  return {
    ...state,
    ...action.values,
  };
}
