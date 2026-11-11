import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { renderWithStore } from './testUtils';

describe('NEXORA Advanced Messaging', () => {
  it('sends a new message via Enter key and updates preview', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    await screen.findByText(
      'Confirmed: messages stay normalized by conversationId in Redux.'
    );

    const input = screen.getByLabelText('Message input');
    await user.type(input, 'Shipping NEXORA v3 now!{Enter}');

    await waitFor(() => {
      expect(
        screen.getAllByText('Shipping NEXORA v3 now!').length
      ).toBeGreaterThanOrEqual(1);
    });

    const marcusConv = store
      .getState()
      .conversations.items.find((c) => c.id === 'conv-marcus');
    expect(marcusConv?.lastMessage?.content).toBe('Shipping NEXORA v3 now!');
  });

  it('edits an own message and displays edited indicator', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    await screen.findByText(
      'Confirmed: messages stay normalized by conversationId in Redux.'
    );

    const editButtons = screen.getAllByRole('button', { name: 'Edit message' });
    await user.click(editButtons[0]);

    const dialog = screen.getByRole('dialog', { name: 'Edit message' });
    const textarea = within(dialog).getByLabelText('Edited message content');
    await user.clear(textarea);
    await user.type(textarea, 'Updated normalized message state.');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(
        screen.getAllByText('Updated normalized message state.').length
      ).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('edited')).toBeInTheDocument();
  }, 10000);

  it('deletes an own message after confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /david kim/i }));
    await screen.findByText(
      'Can we cache dependencies in the preview pipeline to speed up PR checks?'
    );

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete message' });
    await user.click(deleteButtons[0]);

    const modal = screen.getByRole('dialog', { name: 'Confirm delete message' });
    await user.click(within(modal).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Can we cache dependencies in the preview pipeline to speed up PR checks?'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('replies to a specific message and opens threaded replies panel', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /david kim/i }));
    await screen.findByText('Preview builds are now completing in under 25 seconds.');

    const replyButtons = screen.getAllByRole('button', { name: 'Reply to message' });
    await user.click(replyButtons[replyButtons.length - 1]);

    expect(screen.getByText(/Replying to David Kim/i)).toBeInTheDocument();

    const input = screen.getByLabelText('Message input');
    await user.type(input, '25s is super snappy!{Enter}');

    await waitFor(() => {
      expect(screen.getAllByText('25s is super snappy!').length).toBeGreaterThanOrEqual(
        1
      );
    });

    const threadButtons = screen.getAllByRole('button', { name: 'Reply in thread' });
    await user.click(threadButtons[0]);

    const threadPanel = screen.getByLabelText('Message thread');
    const threadInput = within(threadPanel).getByLabelText('Thread reply input');
    await user.type(threadInput, 'Thread follow-up note{Enter}');

    expect(
      await within(threadPanel).findByText('Thread follow-up note')
    ).toBeInTheDocument();
  });

  it('adds and removes emoji reactions and copies message text', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    await screen.findByText(
      'Keeping our mock service layer Promise-based makes swapping to REST trivial later.'
    );

    const reactTriggers = screen.getAllByRole('button', { name: 'Add reaction' });
    await user.click(reactTriggers[0]);
    await user.click(screen.getByRole('button', { name: 'React with 👍' }));

    const chip = screen.getByRole('button', {
      name: /Toggle 👍 reaction \(1\)/i,
    });
    expect(chip).toBeInTheDocument();

    await user.click(chip);
    expect(
      screen.queryByRole('button', { name: /Toggle 👍 reaction/i })
    ).not.toBeInTheDocument();

    const copyButtons = screen.getAllByRole('button', { name: 'Copy message' });
    await user.click(copyButtons[0]);

    expect(writeTextMock).toHaveBeenCalledWith(
      'Keeping our mock service layer Promise-based makes swapping to REST trivial later.'
    );
    expect(
      await screen.findByText('Message copied to clipboard')
    ).toBeInTheDocument();
  });
});
