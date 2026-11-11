import { combineReducers, configureStore } from '@reduxjs/toolkit';
import conversationReducer from '../features/conversations/conversationSlice';
import groupReducer from '../features/groups/groupSlice';
import messageReducer from '../features/messages/messageSlice';
import themeReducer from '../features/theme/themeSlice';

const rootReducer = combineReducers({
  conversations: conversationReducer,
  messages: messageReducer,
  groups: groupReducer,
  theme: themeReducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
