import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../../../routeTree.gen';

export const router = createRouter({
  routeTree,
  notFoundMode: 'root',
  defaultPreload: 'intent',
});

export type AppRouter = typeof router;
