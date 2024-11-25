import { Bookshelf } from '@common/contracts';

export interface BookshelfState {
	editMap: Record<number, boolean>;
	bookshelves: Bookshelf[];
}
