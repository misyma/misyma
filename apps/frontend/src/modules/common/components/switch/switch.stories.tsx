import { type Meta } from '@storybook/react';
import { type ReactNode } from 'react';

import { Switch } from './switch';

const meta: Meta<typeof Switch> = {
  component: Switch,
};

export default meta;

export const Default = (): ReactNode => <Switch></Switch>;
