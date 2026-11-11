import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { renderWithStore } from './testUtils';

describe('NEXORA Group Management & Command Palette', () => {
  it('manages group members from the Group Info Panel', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(
      await screen.findByRole('button', { name: /core platform guild/i })
    );
    await user.click(
      screen.getByRole('button', { name: 'Toggle group information' })
    );

    const panel = screen.getByLabelText('Group information');
    expect(within(panel).getByText('Members (5)')).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: /add member/i }));
    const addModal = screen.getByRole('dialog', { name: 'Add Space member' });
    await user.click(within(addModal).getAllByRole('button', { name: 'Add' })[0]);

    await waitFor(() => {
      expect(within(panel).getByText('Members (6)')).toBeInTheDocument();
    });

    await user.click(
      within(panel).getByRole('button', { name: /Remove Sarah Chen from group/i })
    );

    await waitFor(() => {
      expect(within(panel).getByText('Members (5)')).toBeInTheDocument();
    });
  }, 10000);

  it('opens Command Palette with Ctrl+K and selects a conversation', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    await screen.findByText('Sarah Chen');
    await user.keyboard('{Control>}k{/Control}');

    const dialog = await screen.findByRole(
      'dialog',
      { name: 'Command palette' },
      { timeout: 3000 }
    );

    await user.click(within(dialog).getByRole('button', { name: /Marcus Rivera/i }));

    expect(store.getState().conversations.selectedConversationId).toBe(
      'conv-marcus'
    );
    expect(
      screen.queryByRole('dialog', { name: 'Command palette' })
    ).not.toBeInTheDocument();
  });
});
