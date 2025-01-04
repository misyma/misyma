import { createRouter } from '@tanstack/react-router';

import { routeTree } from '../../../routeTree.gen';
import { NotFoundPage } from '../../common/components/notFoundComponent';

export const router = createRouter({
  routeTree,
  notFoundMode: 'root',
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
});

export type AppRouter = typeof router;
