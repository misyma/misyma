import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { RootPage } from './rootPage';

describe('RootPage', () => {
  it('renders component', () => {
    render(<RootPage />);
  });
});
