import { Meta, StoryObj } from '@storybook/react';
import { ShelvesSkeleton, ShelvesSkeletonProps } from './shelvesSkeleton';

const meta: Meta<typeof ShelvesSkeleton> = {
  component: ShelvesSkeleton,
};

export default meta;

type Story = StoryObj<ShelvesSkeletonProps>;

export const Default: Story = {};

export const Custom: Story = {
  args: {
    skeletonColor: 'red',
  },
  argTypes: {
    skeletonColor: {
      control: 'color',
    },
  },
};
