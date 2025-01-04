export interface AdminBookFilterState {
  title?: string;
  authorId?: string;
  isbn?: string;
  releaseYearAfter?: number;
  language?: string;
  isApproved?: string;
  filterVisible?: boolean;
}
