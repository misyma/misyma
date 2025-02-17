import { type FC } from 'react';

import { Navbar } from '../../../common/components/navbar/navbar';
import { Toaster } from '../../../common/components/toast/toaster';
import { RequireAuthComponent } from '../../../core/components/requireAuth/requireAuthComponent';
export interface Props {
  children: React.ReactNode;
}

export const AuthenticatedLayout: FC<Props> = ({ children }) => {
  return (
    <RequireAuthComponent>
      <div className="grid grid-cols-1 min-h-screen">
        <Navbar />
        <div className="w-full md:max-w-screen-2xl mx-auto flex-grow">{children}</div>
        <Toaster />
      </div>
    </RequireAuthComponent>
  );
};
