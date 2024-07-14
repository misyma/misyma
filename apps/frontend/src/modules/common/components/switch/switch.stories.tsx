import { Meta } from '@storybook/react';
import { Switch } from './switch';
import { ReactNode } from 'react';

const meta: Meta<typeof Switch> = {
  component: Switch,
};

export default meta;

export const Default = (): ReactNode => <Switch></Switch>;
