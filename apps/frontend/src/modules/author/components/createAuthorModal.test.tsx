import { it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { CreateAuthorModal } from './createAuthorModal';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../../tests/customRender';

it('correctly renders Trigger', async () => {
  const onMutated = () => {};

  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={
        <button aria-label="BasicButtonLabel">
          The most basic button ever
        </button>
      }
    />
  );

  const button = await screen.findByLabelText('BasicButtonLabel');
  expect(button).toBeVisible();
});

it('correctly renders Modal', async () => {
  const onMutated = () => {};

  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={
        <button aria-label="BasicButtonLabel">
          The most basic button ever
        </button>
      }
    />
  );

  const button = await screen.findByLabelText('BasicButtonLabel');
  await userEvent.click(button);

  const dialogTitle = await screen.findByLabelText("Create author modal header");
  expect(dialogTitle).toBeVisible();
  expect(dialogTitle).toHaveTextContent("Stwórz autora");
});
