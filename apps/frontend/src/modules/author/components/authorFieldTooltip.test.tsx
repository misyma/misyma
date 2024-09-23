import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthorFieldTooltip } from './authorFieldTooltip';
import userEvent from '@testing-library/user-event';

it('correctly mounts the Component', async () => {
  render(<AuthorFieldTooltip />);

  await userEvent.hover(
    await screen.findByLabelText('author information tooltip trigger')
  );

  const element = (
    await screen.findAllByLabelText('author information tooltip content')
  )[0];

  expect(element).toHaveTextContent(
    'Imię i nazwisko autora musi mieć minimum 3 znaki i zawierać spację oddzielającą imię i nazwisko.'
  );
  expect(element).toBeVisible();
});
