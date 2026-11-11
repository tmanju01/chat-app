import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import * as conversationService from '../src/services/conversationService';
import { renderWithStore } from './testUtils';

describe('NEXORA Modals, Search, Pins, Mobile Nav & Error Recovery', () => {
  it('creates a new group conversation with React Hook Form validation', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await screen.findByText('Sarah Chen');
    await user.click(
      screen.getByRole('button', { name: 'New group conversation' })
    );

    const dialog = screen.getByRole('dialog', { name: 'Create group' });
    await user.click(within(dialog).getByRole('button', { name: 'Create group' }));
    expect(
      await within(dialog).findByText('Group name is required.')
    ).toBeInTheDocument();

    const nameInput = within(dialog).getByPlaceholderText(/Design Systems Guild/i);
    await user.click(nameInput);
    await user.paste('Mobile Squad');
    const checkboxes = within(dialog).getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(within(dialog).getByRole('button', { name: 'Create group' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Create group' })
      ).not.toBeInTheDocument();
    });
    expect(
      await screen.findByText('Group "Mobile Squad" created')
    ).toBeInTheDocument();
  });

  it('edits group details from GroupInfoPanel', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(
      await screen.findByRole('button', { name: /core platform guild/i })
    );
    await user.click(
      screen.getByRole('button', { name: 'Toggle group information' })
    );

    const panel = screen.getByLabelText('Group information');
    await user.click(
      within(panel).getByRole('button', { name: /Edit Space details/i })
    );

    const editModal = screen.getByRole('dialog', { name: 'Edit Team Space' });
    const inputs = within(editModal).getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.click(inputs[0]);
    await user.paste('Frontend Architecture Guild');
    await user.click(within(editModal).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(
        within(panel).getByText('Frontend Architecture Guild')
      ).toBeInTheDocument();
    });
  });

  it('searches messages inside a conversation and navigates matches', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /sarah chen/i }));
    await screen.findByText(
      'Shipped the updated violet surface tokens for midnight mode.'
    );

    await user.click(
      screen.getByRole('button', { name: 'Search messages in conversation' })
    );
    const searchInput = screen.getByLabelText('Search messages');
    await user.type(searchInput, 'tokens');

    expect(await screen.findByText('1 / 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next matching message' }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('pins a message and shows it inside the Pinned Messages bar', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    await screen.findByText(
      'Confirmed: messages stay normalized by conversationId in Redux.'
    );

    const pinButtons = screen.getAllByRole('button', { name: 'Pin message' });
    await user.click(pinButtons[0]);

    const togglePinBar = await screen.findByRole('button', {
      name: 'Toggle pinned messages',
    });
    await user.click(togglePinBar);
    expect(screen.getByText('Pinned Messages (1)')).toBeInTheDocument();
  });

  it('handles mobile back navigation to clear the selected conversation', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    expect(store.getState().conversations.selectedConversationId).toBe(
      'conv-marcus'
    );

    await user.click(screen.getByRole('button', { name: 'Back to conversations' }));
    expect(store.getState().conversations.selectedConversationId).toBeNull();
  });

  it('shows ErrorState on mock API failure and recovers on Retry', async () => {
    const spy = vi
      .spyOn(conversationService, 'getConversations')
      .mockRejectedValueOnce(new Error('Simulated network timeout'));

    const user = userEvent.setup();
    renderWithStore(<App />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Simulated network timeout')).toBeInTheDocument();

    spy.mockRestore();
    await user.click(screen.getByRole('button', { name: /Retry/i }));

    expect(await screen.findByText('Sarah Chen')).toBeInTheDocument();
  });

  it('displays individual contact information panel for direct conversations', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /sarah chen/i }));
    await user.click(
      screen.getByRole('button', { name: 'Toggle contact information' })
    );

    const contactPanel = screen.getByLabelText('Contact information');
    expect(
      within(contactPanel).getByText('Principal Product Designer')
    ).toBeInTheDocument();
    expect(
      within(contactPanel).getByText('Core Platform Guild')
    ).toBeInTheDocument();
  });
});
