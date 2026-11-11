import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../src/App';
import { renderWithStore } from './testUtils';

describe('NEXORA Store & Theme Foundation', () => {
  it('initializes all four Redux slices with expected default state', () => {
    const { store } = renderWithStore(<App />);
    const state = store.getState();

    expect(state.conversations.filter).toBe('all');
    expect(state.conversations.items).toEqual([]);
    expect(state.messages.byConversationId).toEqual({});
    expect(state.groups.currentUserId).toBe('user-me');
    expect(state.theme.mode).toBe('dark');
  });

  it('switches dark and light themes with localStorage persistence', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<App />);

    await user.click(
      screen.getByRole('button', { name: /switch to light mode/i })
    );
    expect(store.getState().theme.mode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('nexora_theme_mode')).toBe('"light"');

    await user.click(
      screen.getByRole('button', { name: /switch to dark mode/i })
    );
    expect(store.getState().theme.mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('nexora_theme_mode')).toBe('"dark"');
  });
});
