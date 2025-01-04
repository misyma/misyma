import { type Meta } from '@storybook/react';
import { type ReactNode } from 'react';

import { Bookmark } from './bookmark';

const meta: Meta<typeof Bookmark> = {
  component: Bookmark,
};

export default meta;

export const Default = (): ReactNode => (
  <div className="h-10">
    <Bookmark></Bookmark>
  </div>
);
