export interface MyBooksFilterState {
  title?: string;
  language?: string;
  releaseYearAfter?: number;
  releaseYearBefore?: number;

  filterVisible: boolean;
  genreId?: string;
  status?: string;
  isFavorite?: string;
  authorId?: string;
}
