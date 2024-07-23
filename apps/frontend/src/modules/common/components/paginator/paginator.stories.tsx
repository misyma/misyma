import { Meta, StoryObj } from '@storybook/react';
import { Paginator, PaginatorProps } from './paginator';
import { useArgs } from '@storybook/preview-api';
import { useState } from 'react';

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
