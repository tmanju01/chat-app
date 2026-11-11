import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { renderWithStore } from './testUtils';

describe('NEXORA Advanced-Level Features', () => {
  it('queues messages in offline mode and flushes them upon reconnect', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    await screen.findByText(
      'Confirmed: messages stay normalized by conversationId in Redux.'
    );

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/You are offline\./i)).toBeInTheDocument();

    const input = screen.getByLabelText('Message input');
    await user.type(input, 'Queued msg{Enter}');

    expect(await screen.findByText('Queued')).toBeInTheDocument();
    expect(store.getState().messages.offlineQueue).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Go online' }));

    await waitFor(() => {
      expect(store.getState().messages.offlineQueue).toHaveLength(0);
    });
    expect(screen.queryByText('Queued')).not.toBeInTheDocument();
  });

  it('attaches a local file preview and sends it inside a message bubble', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /marcus rivera/i }));
    await screen.findByText(
      'Confirmed: messages stay normalized by conversationId in Redux.'
    );

    const file = new File(['hello nexora'], 'architecture-spec.txt', {
      type: 'text/plain',
    });
    const fileInput = screen.getByLabelText('Attach files');
    await user.upload(fileInput, file);

    expect(
      await screen.findByLabelText('Pending attachments')
    ).toBeInTheDocument();
    expect(screen.getByText('architecture-spec.txt')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.queryByLabelText('Pending attachments')).not.toBeInTheDocument();
    });
    expect(screen.getByText('architecture-spec.txt')).toBeInTheDocument();
  });

  it('loads earlier historical messages on demand', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /david kim/i }));
    await screen.findByText('Preview builds are now completing in under 25 seconds.');

    const loadOlderBtn = screen.getByRole('button', {
      name: 'Load earlier messages',
    });
    await user.click(loadOlderBtn);

    expect(
      await screen.findByText(/Archived sprint note \(#1\)/i)
    ).toBeInTheDocument();
  });

  it('renders inline bold, code, and clickable links safely', async () => {
    const user = userEvent.setup();
    renderWithStore(<App />);

    await user.click(await screen.findByRole('button', { name: /david kim/i }));
    await screen.findByText('Preview builds are now completing in under 25 seconds.');

    const input = screen.getByLabelText('Message input');
    await user.type(
      input,
      'Check **v3** via `npm test` at https://example.com{Enter}'
    );

    const boldEl = await screen.findByText('v3');
    expect(boldEl.tagName).toBe('STRONG');

    const codeEl = screen.getByText('npm test');
    expect(codeEl.tagName).toBe('CODE');

    const linkEl = screen.getByRole('link', { name: 'https://example.com' });
    expect(linkEl).toHaveAttribute('href', 'https://example.com');
  });
});

