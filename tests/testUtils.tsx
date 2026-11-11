import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { setupStore } from '../src/app/store';
import type { RootState } from '../src/app/store';

export function renderWithStore(
  ui: ReactElement,
  preloadedState?: Partial<RootState>
) {
  const store = setupStore(preloadedState);
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

