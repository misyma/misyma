import { FC, PropsWithChildren } from 'react';
import { Card } from '../../../../common/components/card';

export const BookPageContentCard: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return <Card className="h-[30rem] p-6 bg-background shadow-md overflow-visible">{children}</Card>;
};
