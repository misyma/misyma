import { FC } from 'react';
import { AuthenticatedLayout } from '../../../auth/layouts/authenticated/authenticatedLayout';
import { Skeleton } from '../../../common/components/skeleton/skeleton';

export const ShelvesSkeleton: FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-2">
        <div className="flex flex-col w-[80vw] sm:w-[90vw] sm:px-48 items-center justify-center gap-4">
          <div className="w-full flex items-end justify-center sm:justify-end">
            <Skeleton className="h-12 w-60 sm:w-96"></Skeleton>
          </div>
            <div className="py-4 grid gap-x-16 gap-y-2 grid-cols-1 w-full min-h-16">
              {Array.from({ length: 5 })?.map((index) => (
                <div key={`${index}-skeleton-container`}>
                <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full"></Skeleton>
                    <Skeleton className="h-1 w-full flex items-start justify-end"></Skeleton>
                </div>
                  <Skeleton
                    key={`${index}`}
                    className="flex relative ml-10 mt-[-1.25rem] rounded-sm border border-spacing-2 p-4 gap-x-2 h-24"
                  >
                    <div className="flex items-center justify-between w-full pointer-events-none z-10">
                      <Skeleton className='w-10 h-5' />
                      <Skeleton className="px-4 sm:px-8 flex gap-4" />
                    </div>
                  </Skeleton>
                </div>
              ))}
            </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};
