import { FC } from 'react';
import { Toaster } from '../../../common/components/toast/toaster';
import { Navbar } from '../../../common/components/navbar/navbar';
import { RequireAuthComponent } from '../../../core/components/requireAuth/requireAuthComponent';
export interface Props {
  children: React.ReactNode;
}

export const AuthenticatedLayout: FC<Props> = ({ children }) => {
  return (
      <RequireAuthComponent>
        <div className='grid grid-cols-1'>
          <Navbar />
          <div className="w-[1536px] md:max-w-screen-2xl mx-auto">{children}</div>
          <Toaster />
        </div>
      </RequireAuthComponent>
  );
};
