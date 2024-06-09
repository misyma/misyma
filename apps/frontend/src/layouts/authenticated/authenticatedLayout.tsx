import { FC } from 'react';
import { Toaster } from '../../modules/common/components/ui/toaster';
import { Navbar } from '../../modules/common/components/navbar/navbar';

export interface Props {
  children: React.ReactNode;
}

export const AuthenticatedLayout: FC<Props> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="pt-24 sm:pt-32 max-w-screen-2xl mx-auto">{children}</div>
      <Toaster />
    </>
  );
};
