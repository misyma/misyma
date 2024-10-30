import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/tabs/changeRequests/')({
  staticData: {
    routeDisplayableNameParts: [
      {
        href: '/admin/tabs/authors/',
        readableName: 'Admin',
      },
      {
        readableName: 'Prośby o zmianę',
        href: '/admin/tabs/changeRequests/',
      },
    ],
  },
});
