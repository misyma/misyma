import { type Language, type BookFormat } from '@common/contracts';

import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type Author } from '../author/author.js';
import { type Category } from '../category/category.js';

export interface BookDraft {
  readonly id: string;
  readonly categoryId: string;
  readonly category: Category;
  readonly title: string;
  readonly isbn?: string | undefined | null;
  readonly publisher?: string | undefined | null;
  readonly releaseYear: number;
  readonly language: Language;
  readonly translator?: string | undefined | null;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined | null;
  readonly authors: Author[];
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined | null;
  readonly createdAt: Date;
}

export interface BookState {
  title: string;
  isbn?: string | undefined | null;
  publisher?: string | undefined | null;
  releaseYear: number;
  language: Language;
  translator?: string | undefined | null;
  format?: BookFormat | undefined;
  pages?: number | undefined | null;
  isApproved: boolean;
  imageUrl?: string | undefined | null;
  authors: Author[];
  categoryId: string;
  categoryName?: string;
  readonly createdAt: Date;
}

export interface SetTitlePayload {
  readonly title: string;
}

export interface SetIsbnPayload {
  readonly isbn: string | null;
}

export interface SetPublisherPayload {
  readonly publisher: string | null;
}

export interface SetReleaseYearPayload {
  readonly releaseYear: number;
}

export interface SetLanguagePayload {
  readonly language: Language;
}

export interface SetTranslatorPayload {
  readonly translator: string | null;
}

export interface SetFormatPayload {
  readonly format: BookFormat;
}

export interface SetPagesPayload {
  readonly pages: number | null;
}

export interface SetAuthorsPayload {
  readonly authors: Author[];
}

export interface SetIsApprovedPayload {
  readonly isApproved: boolean;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string | null;
}

export interface SetCategoryPayload {
  readonly categoryId: string;
}

export class Book {
  private readonly id: string;
  private readonly state: BookState;

  public constructor(draft: BookDraft) {
    const {
      id,
      categoryId,
      category,
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      authors,
      isApproved,
      imageUrl,
      createdAt,
    } = draft;

    this.id = id;

    this.state = {
      categoryId,
      categoryName: category.getName(),
      title,
      language,
      format,
      authors,
      isApproved,
      createdAt,
      releaseYear,
    };

    if (isbn) {
      this.state.isbn = isbn;
    }

    if (publisher) {
      this.state.publisher = publisher;
    }

    if (translator) {
      this.state.translator = translator;
    }

    if (pages) {
      this.state.pages = pages;
    }

    if (imageUrl) {
      this.state.imageUrl = imageUrl;
    }
  }

  public getState(): BookState {
    return this.state;
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.state.title;
  }

  public getIsbn(): string | undefined | null {
    return this.state.isbn;
  }

  public getPublisher(): string | undefined | null {
    return this.state.publisher;
  }

  public getReleaseYear(): number {
    return this.state.releaseYear;
  }

  public getLanguage(): Language {
    return this.state.language;
  }

  public getTranslator(): string | undefined | null {
    return this.state.translator;
  }

  public getFormat(): BookFormat | undefined {
    return this.state.format;
  }

  public getPages(): number | undefined | null {
    return this.state.pages;
  }

  public getAuthors(): Author[] {
    return this.state.authors;
  }

  public getIsApproved(): boolean {
    return this.state.isApproved;
  }

  public getImageUrl(): string | undefined | null {
    return this.state.imageUrl;
  }

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }

  public getCategoryId(): string {
    return this.state.categoryId;
  }

  public getCategoryName(): string {
    return this.state.categoryName ?? ('' as const);
  }

  public setTitle(payload: SetTitlePayload): void {
    const { title } = payload;

    this.state.title = title;
  }

  public setIsbn(payload: SetIsbnPayload): void {
    const { isbn } = payload;

    this.state.isbn = isbn;
  }

  public setPublisher(payload: SetPublisherPayload): void {
    const { publisher } = payload;

    this.state.publisher = publisher;
  }

  public setCategory(categoryId: string): void {
    this.state.categoryId = categoryId;
  }

  public setReleaseYear(payload: SetReleaseYearPayload): void {
    const { releaseYear } = payload;

    this.state.releaseYear = releaseYear;
  }

  public setLanguage(payload: SetLanguagePayload): void {
    const { language } = payload;

    this.state.language = language;
  }

  public setTranslator(payload: SetTranslatorPayload): void {
    const { translator } = payload;

    this.state.translator = translator;
  }

  public setFormat(payload: SetFormatPayload): void {
    const { format } = payload;

    this.state.format = format;
  }

  public setPages(payload: SetPagesPayload): void {
    const { pages } = payload;

    this.state.pages = pages;
  }

  public setIsApproved(payload: SetIsApprovedPayload): void {
    const { isApproved } = payload;

    this.state.isApproved = isApproved;
  }

  public setImageUrl(payload: SetImageUrlPayload): void {
    const { imageUrl } = payload;

    this.state.imageUrl = imageUrl;
  }

  public setAuthors(authors: Author[]): void {
    this.state.authors = authors;
  }

  public addAuthor(author: Author): void {
    const authorId = author.getId();

    const authorExists = this.state.authors.some((author) => author.getId() === authorId);

    if (authorExists) {
      throw new OperationNotValidError({
        reason: 'Author is already assigned to this book.',
        value: authorId,
      });
    }

    this.state.authors = [...this.state.authors, author];
  }

  public deleteAuthor(author: Author): void {
    const authorId = author.getId();

    const authorIndex = this.state.authors.findIndex((author) => author.getId() === authorId);

    if (authorIndex < 0) {
      throw new OperationNotValidError({
        reason: 'Author is not assigned to this book.',
        value: authorId,
      });
    }

    this.state.authors.splice(authorIndex, 1);
  }
}
