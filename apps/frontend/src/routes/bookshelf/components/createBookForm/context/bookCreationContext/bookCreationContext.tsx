/* eslint-disable react-refresh/only-export-components */
import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';
import { ReadingStatus } from '@common/contracts';

const BookCreationContext = createContext<BookCreationState<true>>(null as unknown as BookCreationState<true>);

const BookDispatchContext = createContext<Dispatch<BookCreationAction>>(
  null as unknown as Dispatch<BookCreationAction>,
);

export enum NonIsbnCreationPathStep {
  inputFirstDetails = 1,
  inputSecondDetails = 2,
  inputThirdDetail = 3,
}

export enum BookCreationActionType {
  chooseIsbnPath = 0,
  chooseNonIsbnPath = 1,
  setIsbn = 2,
  setYearOfIssue = 3,
  nonIsbnStepOneDetails = 4,
  nonIsbnStepTwoDetails = 5,
  nonIsbnStepThreeDetails = 6,
  setTitle = 7,
  setAuthor = 8,
  setPublisher = 9,
  setGenre = 10,
  setLanguage = 11,
  setTranslator = 12,
  setForm = 13,
  setPagesCount = 14,
  setStatus = 15,
  setImage = 16,
  setStep = 17,
}

type SetStep = {
  type: BookCreationActionType.setStep;
  step: 0 | NonIsbnCreationPathStep;
};

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

type SetTitle = {
  type: BookCreationActionType.setTitle;
  title: string;
};

type SetAuthor = {
  type: BookCreationActionType.setAuthor;
  author: string;
};

type SetPublisher = {
  type: BookCreationActionType.setPublisher;
  publisher: string;
};

type SetGenre = {
  type: BookCreationActionType.setGenre;
  genre: string;
};

type SetNonIsbnStepTwoDetails = {
  type: BookCreationActionType.nonIsbnStepTwoDetails;
  language: string;
  translator: string;
  form: string;
  pagesCount: number;
};

type SetLanguage = {
  type: BookCreationActionType.setLanguage;
  language: string;
};

type SetTranslator = {
  type: BookCreationActionType.setTranslator;
  translator: string;
};

type SetForm = {
  type: BookCreationActionType.setForm;
  form: string;
};

type SetPagesCount = {
  type: BookCreationActionType.setPagesCount;
  pagesCount: number;
};

type SetNonIsbnStepThreeDetails = {
  type: BookCreationActionType.nonIsbnStepThreeDetails;
  status: ReadingStatus;
  image: string;
};

type SetStatus = {
  type: BookCreationActionType.setStatus;
  status: ReadingStatus;
};

type SetImage = {
  type: BookCreationActionType.setImage;
  image: string;
};

export type BookCreationAction =
  | ChooseIsbnPathAction
  | ChooseNonIsbnPath
  | SetIsbnAction
  | SetYearOfIssueAction
  | SetNonIsbnStepOneDetails
  | SetNonIsbnStepTwoDetails
  | SetNonIsbnStepThreeDetails
  | SetTitle
  | SetAuthor
  | SetPublisher
  | SetGenre
  | SetLanguage
  | SetTranslator
  | SetForm
  | SetPagesCount
  | SetStatus
  | SetImage
  | SetStep;

export interface BookCreationIsbnState<T extends boolean = true> {
  isbnPath: T;
  step: 0 | 1;
  isbn?: string;
}

export interface BookCreationNonIsbnState<T extends boolean = false> {
  isbnPath: T;
  step: 0 | NonIsbnCreationPathStep;
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

function bookCreationReducer<T extends boolean = true>(
  state: BookCreationState<T>,
  action: BookCreationAction,
): BookCreationState<T> {
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

    case BookCreationActionType.setAuthor:
      return {
        ...state,
        stepOneDetails: {
          ...(state as BookCreationNonIsbnState).stepOneDetails,
          author: action.author,
        } as BookCreationNonIsbnState['stepOneDetails'],
      };

    case BookCreationActionType.setGenre:
      return {
        ...state,
        stepOneDetails: {
          ...(state as BookCreationNonIsbnState).stepOneDetails,
          genre: action.genre,
        } as BookCreationNonIsbnState['stepOneDetails'],
      };

    case BookCreationActionType.setPublisher:
      return {
        ...state,
        stepOneDetails: {
          ...(state as BookCreationNonIsbnState).stepOneDetails,
          publisher: action.publisher,
        } as BookCreationNonIsbnState['stepOneDetails'],
      };

    case BookCreationActionType.setTitle:
      return {
        ...state,
        stepOneDetails: {
          ...(state as BookCreationNonIsbnState).stepOneDetails,
          title: action.title,
        } as BookCreationNonIsbnState['stepOneDetails'],
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

    case BookCreationActionType.setForm:
      return {
        ...state,
        isbnPath: false as T,
        stepTwoDetails: {
          ...(state as BookCreationNonIsbnState).stepTwoDetails,
          form: action.form,
        } as BookCreationNonIsbnState['stepTwoDetails'],
      };

    case BookCreationActionType.setLanguage:
      return {
        ...state,
        isbnPath: false as T,
        stepTwoDetails: {
          ...(state as BookCreationNonIsbnState).stepTwoDetails,
          language: action.language,
        } as BookCreationNonIsbnState['stepTwoDetails'],
      };

    case BookCreationActionType.setPagesCount:
      return {
        ...state,
        isbnPath: false as T,
        stepTwoDetails: {
          ...(state as BookCreationNonIsbnState).stepTwoDetails,
          pagesCount: action.pagesCount,
        } as BookCreationNonIsbnState['stepTwoDetails'],
      };

    case BookCreationActionType.setTranslator:
      return {
        ...state,
        isbnPath: false as T,
        stepTwoDetails: {
          ...(state as BookCreationNonIsbnState).stepTwoDetails,
          translator: action.translator,
        } as BookCreationNonIsbnState['stepTwoDetails'],
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

    case BookCreationActionType.setImage:
      return {
        ...state,
        isbnPath: false as T,
        stepThreeDetails: {
          ...(state as BookCreationNonIsbnState).stepThreeDetails,
          image: action.image,
        } as Omit<SetNonIsbnStepThreeDetails, 'type'>,
      };

    case BookCreationActionType.setStatus:
      return {
        ...state,
        isbnPath: false as T,
        stepThreeDetails: {
          ...(state as BookCreationNonIsbnState).stepThreeDetails,
          status: action.status,
        } as Omit<SetNonIsbnStepThreeDetails, 'type'>,
      };

    case BookCreationActionType.setIsbn:
      return {
        ...state,
        step: 0,
        isbnPath: true as T,
        isbn: action.isbn,
      };

    case BookCreationActionType.setYearOfIssue:
      return {
        ...state,
        isbnPath: false as T,
        yearOfIssue: action.yearOfIssue,
      };

    case BookCreationActionType.setStep:
      return {
        ...state,
        step: action.step,
      };
  }
}

const initialState: BookCreationState<true> = {
  isbn: undefined,
  step: 0,
  isbnPath: true,
};
