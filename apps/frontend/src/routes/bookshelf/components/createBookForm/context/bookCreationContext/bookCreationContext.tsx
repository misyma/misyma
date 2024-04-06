/* eslint-disable react-refresh/only-export-components */
import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';
import { ReadingStatus } from '@common/contracts';

const BookCreationContext = createContext<BookCreationState<true>>(null as unknown as BookCreationState<true>);

const BookDispatchContext = createContext<Dispatch<BookCreationAction>>(null as unknown as Dispatch<BookCreationAction>);

export enum BookCreationActionType {
  chooseIsbnPath = 0,
  chooseNonIsbnPath = 1,
  setIsbn = 2,
  setYearOfIssue = 3,
  nonIsbnStepOneDetails = 4,
  nonIsbnStepTwoDetails = 5,
  nonIsbnStepThreeDetails = 6,
}

type ChooseIsbnPathAction = {
  type: BookCreationActionType.chooseIsbnPath;
};

type ChooseNonIsbnPath = {
  type: BookCreationActionType.chooseNonIsbnPath;
};

type SetIsbnAction = {
  type: BookCreationActionType.setIsbn;
  isbn: string;
};

type SetYearOfIssueAction = {
  type: BookCreationActionType.setYearOfIssue;
  yearOfIssue: number;
};

type SetNonIsbnStepOneDetails = {
  type: BookCreationActionType.nonIsbnStepOneDetails;
  title: string;
  author: string;
  publisher: string;
  genre: string;
};

type SetNonIsbnStepTwoDetails = {
  type: BookCreationActionType.nonIsbnStepTwoDetails;
  language: string;
  translator: string;
  form: string;
  pagesCount: number;
};

type SetNonIsbnStepThreeDetails = {
  type: BookCreationActionType.nonIsbnStepThreeDetails;
  status: ReadingStatus;
  image: string;
};

export type BookCreationAction =
  | ChooseIsbnPathAction
  | ChooseNonIsbnPath
  | SetIsbnAction
  | SetYearOfIssueAction
  | SetNonIsbnStepOneDetails
  | SetNonIsbnStepTwoDetails
  | SetNonIsbnStepThreeDetails;

export interface BookCreationIsbnState<T extends boolean = true> {
  isbnPath: T;
  isbn?: string;
}

export interface BookCreationNonIsbnState<T extends boolean = false> {
  isbnPath: T;
  yearOfIssue?: number;
  stepOneDetails?: {
    title: string;
    author: string;
    publisher: string;
    genre: string;
  };
  stepTwoDetails?: {
    language: string;
    translator: string;
    form: string;
    pagesCount: number;
  };
  stepThreeDetails?: {
    status: ReadingStatus;
    image: string;
  };
}

type BookCreationState<T extends boolean> = BookCreationIsbnState<T> | BookCreationNonIsbnState<T>;

export function BookCreationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [bookCreation, dispatch] = useReducer(bookCreationReducer, initialState);

  return (
    <BookCreationContext.Provider value={bookCreation as unknown as BookCreationState<true>}>
      <BookDispatchContext.Provider value={dispatch}>{children}</BookDispatchContext.Provider>
    </BookCreationContext.Provider>
  );
}

export function useBookCreation<T extends boolean = true>(): BookCreationState<T> {
  return useContext(BookCreationContext) as BookCreationState<T>;
}

export function useBookCreationDispatch() {
  return useContext(BookDispatchContext);
}

function bookCreationReducer<T extends boolean = true>(state: BookCreationState<T>, action: BookCreationAction): BookCreationState<T> {
  switch (action.type) {
    case BookCreationActionType.chooseIsbnPath:
      return {
        ...state,
        isbnPath: true as T,
      };

    case BookCreationActionType.chooseNonIsbnPath:
      return {
        ...state,
        isbnPath: false as T,
      };

    case BookCreationActionType.nonIsbnStepOneDetails:
      return {
        ...state,
        isbnPath: false as T,
        stepOneDetails: {
          author: action.author,
          genre: action.genre,
          publisher: action.publisher,
          title: action.title,
        } as Omit<SetNonIsbnStepOneDetails, 'type'>,
      };

    case BookCreationActionType.nonIsbnStepTwoDetails:
      return {
        ...state,
        isbnPath: false as T,
        stepTwoDetails: {
          form: action.form,
          language: action.language,
          pagesCount: action.pagesCount,
          translator: action.translator,
        } as Omit<SetNonIsbnStepTwoDetails, 'type'>,
      };

    case BookCreationActionType.nonIsbnStepThreeDetails:
      return {
        ...state,
        isbnPath: false as T,
        stepThreeDetails: {
          image: action.image,
          status: action.status,
        } as Omit<SetNonIsbnStepThreeDetails, 'type'>,
      };

    case BookCreationActionType.setIsbn:
      return {
        ...state,
        isbnPath: true as T,
        isbn: action.isbn,
      };

    case BookCreationActionType.setYearOfIssue:
      return {
        ...state,
        isbnPath: false as T,
        yearOfIssue: action.yearOfIssue,
      };
  }
}

const initialState: BookCreationState<true> = {
  isbn: undefined,
  isbnPath: true,
};
