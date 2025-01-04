import { type Meta } from '@storybook/react';
import { createRootRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';

import { Navbar } from './navbar';
import { QueryClientProvider } from '../../../core/components/providers/queryClientProvider/queryClientProvider';
import { MockStoreProvider } from '../../../core/components/providers/storeProvider/mockStoreProvider';

const Route = createRootRoute({
  component: () => <Outlet></Outlet>,
  notFoundComponent: () => <p>XD</p>,
});

const meta: Meta<typeof Navbar> = {
  component: Navbar,
  decorators: (Story) => {
    const dummyRouter = createRouter({
      notFoundMode: 'root',
      routeTree: Route.addChildren({}),
    });

    return (
      <MockStoreProvider>
        <QueryClientProvider>
          <RouterProvider
            //   eslint-disable-next-line @typescript-eslint/no-explicit-any
            router={dummyRouter as any}
            InnerWrap={Story}
          />
        </QueryClientProvider>
      </MockStoreProvider>
    );
  },
};

export default meta;

export const Default = {};
