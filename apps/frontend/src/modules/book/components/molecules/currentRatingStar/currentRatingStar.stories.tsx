import { type Meta, type StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';

import { type BookReading } from '@common/contracts';

import { CurrentRatingStar } from './currentRatingStar';
import { QueryClientProvider } from '../../../../core/components/providers/queryClientProvider/queryClientProvider';
import { MockStoreProvider } from '../../../../core/components/providers/storeProvider/mockStoreProvider';

const meta: Meta<typeof CurrentRatingStar> = {
  component: CurrentRatingStar,
  decorators: (Story) => {
    return (
      <MockStoreProvider>
        <QueryClientProvider>
          <Story></Story>
        </QueryClientProvider>
      </MockStoreProvider>
    );
  },
};

type Story = StoryObj<typeof CurrentRatingStar>;

export default meta;

const dummyBookReading: BookReading = {
  id: '1',
  endedAt: new Date().toISOString(),
  rating: 5,
  startedAt: new Date().toISOString(),
  userBookId: '1',
  comment: 'None',
};

export const DummyFive: Story = {
  args: {
    userBookId: '123',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.misyma.com/api/*', () => {
          return HttpResponse.json({
            data: [dummyBookReading],
          });
        }),
      ],
    },
  },
};

export const DummyTen: Story = {
  args: {
    userBookId: '123',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.misyma.com/api/*', () => {
          return HttpResponse.json({
            data: [
              {
                ...dummyBookReading,
                rating: 10,
              },
            ],
          });
        }),
      ],
    },
  },
};

export const NoRatings: Story = {
  args: {
    userBookId: '123',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('https://api.misyma.com/api/*', () => {
          return HttpResponse.json({
            data: [],
          });
        }),
      ],
    },
  },
};
