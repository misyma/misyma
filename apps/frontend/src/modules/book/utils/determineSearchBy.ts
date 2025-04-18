export const determineSearchBy = (search: string): 'isbn' | 'title' => {
  const trimmedSearch = search?.trim() ?? "";

  const cleanedSearch = trimmedSearch.replace(/[-\s]/g, '').replace(/^ISBN/i, '');

  const isIsbn10 = /^\d{9}[\dX]$/.test(cleanedSearch);
  const isIsbn13 = /^\d{13}$/.test(cleanedSearch);

  return isIsbn10 || isIsbn13 ? 'isbn' : 'title';
};
