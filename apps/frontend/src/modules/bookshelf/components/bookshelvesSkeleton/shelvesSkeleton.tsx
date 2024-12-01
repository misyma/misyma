import { FC } from 'react';
import { Skeleton } from '../../../common/components/skeleton/skeleton';

import styles from '../../../../routes/mybooks/index.module.css';
import { cn } from '../../../common/lib/utils';

export interface ShelvesSkeletonProps {
  skeletonColor?: string;
}

export const ShelvesSkeleton: FC<ShelvesSkeletonProps> = ({
  skeletonColor,
}) => {
  return (
    <div className={styles['page-container']}>
      <div
        className={cn(
          styles['action-bar-container'],
          'flex justify-between w-full'
        )}
      >
        <Skeleton
          style={{
            background: skeletonColor,
          }}
          className="h-12 w-60 sm:w-96"
        ></Skeleton>
        <Skeleton className="h-12 w-80 sm:w-96" />
      </div>
      <div
        className={cn(styles['shelves-container'], 'w-full max-w-screen-2xl')}
      >
        {Array.from({ length: 7 })?.map((_, index) => (
          <div key={`${index}-skeleton-container`} className={styles['shelf']}>
            <div className="flex items-center w-full"></div>
            <Skeleton
              key={`${index}`}
              style={{
                background: skeletonColor,
              }}
              className="flex relative w-full rounded-sm border h-20"
            >
              <div className="flex items-center justify-between w-full pointer-events-none z-10">
                <Skeleton
                  style={{
                    background: skeletonColor,
                  }}
                  className="w-10 h-5"
                />
                <Skeleton
                  style={{
                    background: skeletonColor,
                  }}
                  className="px-4 sm:px-8 flex gap-4"
                />
              </div>
            </Skeleton>
          </div>
        ))}
      </div>
    </div>
  );
};
