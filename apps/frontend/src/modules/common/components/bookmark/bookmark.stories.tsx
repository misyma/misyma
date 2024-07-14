import { Meta } from '@storybook/react';
import { Bookmark } from './bookmark';
import { ReactNode } from 'react';

const meta: Meta<typeof Bookmark> = {
  component: Bookmark,
};

export default meta;

export const Default = (): ReactNode => (
    <div className='h-10'>
        <Bookmark></Bookmark>
    </div>
);
