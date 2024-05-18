export interface UpdateUserBooksRequestBody {
  readonly data: {
    readonly userBookId: string;
    readonly bookshelfId: string;
  }[];
}
