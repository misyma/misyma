import { Meta, StoryObj } from '@storybook/react';
import { CurrentRatingStar } from './currentRatingStar';
import { http, HttpResponse } from 'msw';
import { BookReading } from '@common/contracts';
import { MockStoreProvider } from '../../../core/components/providers/storeProvider/mockStoreProvider';
import { QueryClientProvider } from '../../../core/components/providers/queryClientProvider/queryClientProvider';

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
}
