export interface MyBooksFilterState {
	title?: string;
	language?: string;
	releaseYearAfter?: number;

	filterVisible: boolean;
	genreId?: string;
	status?: string;
	isFavorite?: string;
	authorId?: string;
}
