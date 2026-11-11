import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { renderWithStore } from './testUtils';

describe('NEXORA Conversation Sidebar', () => {
  it('renders the conversation list directly with unread badges', async () => {
    renderWithStore(<App />);

    expect(await screen.findByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Core Platform Guild')).toBeInTheDocument();
    expect(screen.getByText('Marcus Rivera')).toBeInTheDocument();
    expect(screen.getByLabelText('2 unread messages')).toBeInTheDocument();
  });

  it('filters conversations by debounced search query and renders empty state', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await screen.findByText('Sarah Chen');

    const searchInput = screen.getByLabelText('Search conversations');
    await user.type(searchInput, 'Marcus');

    await waitFor(() => {
      expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Marcus Rivera')).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'UnknownUserXYZ');
    expect(
      await screen.findByText('No matching conversations')
    ).toBeInTheDocument();
  });

  it('filters conversations by All, Unread, and Groups tabs', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await screen.findByText('Sarah Chen');

    await user.click(screen.getByRole('tab', { name: /unread/i }));
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Core Platform Guild')).toBeInTheDocument();
    expect(screen.queryByText('Marcus Rivera')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /groups/i }));
    expect(screen.getByText('Core Platform Guild')).toBeInTheDocument();
    expect(screen.getByText('NEXORA v3 Launch')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /all/i }));
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Marcus Rivera')).toBeInTheDocument();
  });

  it('selects a conversation, clears unread count, and loads messages', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /sarah chen/i }));

    expect(store.getState().conversations.selectedConversationId).toBe(
      'conv-sarah'
    );
    expect(
      store
        .getState()
        .conversations.items.find((c) => c.id === 'conv-sarah')?.unreadCount
    ).toBe(0);

    expect(
      await screen.findByText(
        'Just tested the Indigo and Violet presets in light mode too—zero contrast issues.'
      )
    ).toBeInTheDocument();
  });
});
