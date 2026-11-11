import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AppLayout } from './components/layout/AppLayout';
import { fetchConversations } from './features/conversations/conversationSlice';
import {
  flushOfflineQueueThunk,
  setOfflineMode,
} from './features/messages/messageSlice';

function App() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOfflineMode(false));
      dispatch(flushOfflineQueueThunk());
    };
    const handleOffline = () => {
      dispatch(setOfflineMode(true));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return <AppLayout />;
}

export default App;
