import { FC } from 'react';
import { Skeleton } from '../../../common/components/skeleton/skeleton';

import styles from '../../../../routes/shelves/index.module.css';

export interface ShelvesSkeletonProps {
  skeletonColor?: string;
}

export const ShelvesSkeleton: FC<ShelvesSkeletonProps> = ({ skeletonColor }) => {
  return (
    <div className="flex items-center justify-center w-100% px-8 py-1 sm:py-2">
      <div className={styles['page-container']}>
        <div className={styles['action-bar-container']}>
          <Skeleton
            style={{
              background: skeletonColor,
            }}
            className="h-12 w-60 sm:w-96"
          ></Skeleton>
        </div>
        <div className={styles['shelves-container']}>
          {Array.from({ length: 5 })?.map((_, index) => (
            <div key={`${index}-skeleton-container`}>
              <div className="flex items-center">
                <Skeleton
                  style={{
                    background: skeletonColor,
                  }}
                  className="h-10 w-10 rounded-full"
                ></Skeleton>
                <Skeleton
                  style={{
                    background: skeletonColor,
                  }}
                  className="h-1 w-full flex items-start justify-end"
                ></Skeleton>
              </div>
              <Skeleton
                key={`${index}`}
                style={{
                  background: skeletonColor,
                }}
                className="flex relative ml-10 mt-[-1.25rem] rounded-sm border border-spacing-2 p-4 gap-x-2 h-24"
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
    </div>
  );
};
