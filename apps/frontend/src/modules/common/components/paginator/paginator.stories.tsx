import { useArgs } from '@storybook/preview-api';
import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Paginator, type PaginatorProps } from './paginator';

const meta: Meta<typeof Paginator> = {
  component: Paginator,
};

export default meta;

type Story = StoryObj<PaginatorProps>;

export const Default: Story = {
  args: {
    pageIndex: 5,
    pagesCount: 15,
  },

  render: function Render(args) {
    const [{ pageIndex }] = useArgs();

    const [currentPage, setCurrentPage] = useState(pageIndex ?? 1);

    const onPageChange = (val: number) => setCurrentPage(val);

    return (
      <Paginator
        {...args}
        pageIndex={currentPage}
        onPageChange={onPageChange}
      />
    );
  },
};
