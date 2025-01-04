import { type Meta } from '@storybook/react';
import { type ReactNode } from 'react';

import { AutoselectedInput } from './autoselectedInput.js';

const meta: Meta<typeof AutoselectedInput> = {
  component: AutoselectedInput,
};

export default meta;

export const Default = (): ReactNode => <AutoselectedInput></AutoselectedInput>;
