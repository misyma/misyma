export const sortOrders = {
  asc: 'asc',
  desc: 'desc',
} as const;

export type SortOrder = (typeof sortOrders)[keyof typeof sortOrders];
