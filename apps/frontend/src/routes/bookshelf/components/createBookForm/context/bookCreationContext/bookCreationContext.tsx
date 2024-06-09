import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';
import { BookFormat, ReadingStatus } from '@common/contracts';
import { Languages } from '../../../../../../modules/common/constants/languages';

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
  setFormat = 13,
  setPagesCount = 14,
  setStatus = 15,
  setImage = 16,
  setStep = 17,
  setBookshelfId = 18,
  setAuthorName = 19,
}

type SetStep = {
  type: BookCreationActionType.setStep;
  step: NonIsbnCreationPathStep;
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
  isbn: string;
  title: string;
  author: string;
  authorName?: string;
  publisher: string;
  yearOfIssue: number;
};

type SetTitle = {
  type: BookCreationActionType.setTitle;
  title: string;
};

type SetAuthorName = {
  type: BookCreationActionType.setAuthorName;
  authorName: string;
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
  language: Languages;
  translator: string;
  format: string;
  pagesCount: number;
};

type SetLanguage = {
  type: BookCreationActionType.setLanguage;
  language: Languages;
};

type SetTranslator = {
  type: BookCreationActionType.setTranslator;
  translator: string;
};

type SetFormat = {
  type: BookCreationActionType.setFormat;
  format: BookFormat;
};

type SetPagesCount = {
  type: BookCreationActionType.setPagesCount;
  pagesCount: number;
};

type SetNonIsbnStepThreeDetails = {
  type: BookCreationActionType.nonIsbnStepThreeDetails;
  status: ReadingStatus;
  image: string;
  bookshelfId: string;
  genre: string;
};

type SetStatus = {
  type: BookCreationActionType.setStatus;
  status: ReadingStatus;
};

type SetImage = {
  type: BookCreationActionType.setImage;
  image: string;
};

type SetBookshelfId = {
  type: BookCreationActionType.setBookshelfId;
  bookshelfId: string;
};

export type BookCreationAction =
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
  | SetFormat
  | SetPagesCount
  | SetStatus
  | SetImage
  | SetStep
  | SetBookshelfId
  | SetAuthorName;

export interface BookCreationNonIsbnState<T extends boolean = false> {
  isbnPath: T;
  step: NonIsbnCreationPathStep;
  yearOfIssue?: number;
  stepOneDetails?: {
    isbn: string;
    title: string;
    author: string;
    authorName?: string;
    publisher: string;
    yearOfIssue: number;
  };
  stepTwoDetails?: {
    language: string;
    translator: string;
    format: string;
    pagesCount: number;
  };
  stepThreeDetails?: {
    status: ReadingStatus;
    image: string;
    bookshelfId: string;
    genre: string;
  };
}

type BookCreationState<T extends boolean> = BookCreationNonIsbnState<T>;

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
    case BookCreationActionType.nonIsbnStepOneDetails:
      return {
        ...state,
        isbnPath: false as T,
        stepOneDetails: {
          ...state.stepOneDetails,
          isbn: action.isbn,
          author: action.author,
          publisher: action.publisher,
          title: action.title,
          yearOfIssue: action.yearOfIssue,
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
        stepThreeDetails: {
          ...(state as BookCreationNonIsbnState).stepOneDetails,
          genre: action.genre,
        } as BookCreationNonIsbnState['stepThreeDetails'],
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
          format: action.format,
          language: action.language,
          pagesCount: action.pagesCount,
          translator: action.translator,
        } as Omit<SetNonIsbnStepTwoDetails, 'type'>,
      };

    case BookCreationActionType.setFormat:
      return {
        ...state,
        isbnPath: false as T,
        stepTwoDetails: {
          ...(state as BookCreationNonIsbnState).stepTwoDetails,
          format: action.format,
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
          bookshelfId: action.bookshelfId,
          genre: action.genre,
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
        stepOneDetails: {
          ...(state as BookCreationNonIsbnState).stepOneDetails,
          isbn: action.isbn,
        } as Omit<SetNonIsbnStepOneDetails, 'type'>,
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

    case BookCreationActionType.setBookshelfId:
      return {
        ...state,
        isbnPath: false as T,
        stepThreeDetails: {
          ...(state as BookCreationNonIsbnState).stepThreeDetails,
          bookshelfId: action.bookshelfId,
        } as Omit<SetNonIsbnStepThreeDetails, 'type'>,
      };

    case BookCreationActionType.setAuthorName:
      return {
        ...state,
        stepOneDetails: {
          ...state.stepOneDetails,
          authorName: action.authorName,
        } as Omit<SetNonIsbnStepOneDetails, 'type'>,
      };
  }
}

const initialState: BookCreationState<false> = {
  step: NonIsbnCreationPathStep.inputFirstDetails,
  isbnPath: false,
};
