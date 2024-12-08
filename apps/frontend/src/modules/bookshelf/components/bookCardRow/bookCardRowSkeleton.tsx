import { Skeleton } from '../../../common/components/skeleton/skeleton';

export const BookCardRowSkeleton = () => {
  return (
    <div className="grid grid-cols-6 gap-4 pt-2 w-full px-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton
          key={`book-card-skeleton-${idx}`}
          className="w-full aspect-[2/3] max-h-[344px]"
        />
      ))}
    </div>
  );
};
