import { useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  MessageSquarePlus,
  Moon,
  Search,
  Sun,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAllConversations } from '../../features/conversations/conversationSelectors';
import {
  selectConversation,
  updateConversationPreview,
} from '../../features/conversations/conversationSlice';
import { selectCurrentUserId } from '../../features/groups/groupSelectors';
import { selectIsOffline } from '../../features/messages/messageSelectors';
import {
  addMessage,
  flushOfflineQueueThunk,
  setOfflineMode,
} from '../../features/messages/messageSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import { generateId } from '../../services/apiHelpers';
import type { Message } from '../../types';
import { Avatar } from '../common/Avatar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenNewChat,
  onOpenNewGroup,
}: CommandPaletteProps) {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const isOffline = useAppSelector(selectIsOffline);
  const conversations = useAppSelector(selectAllConversations);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations.slice(0, 5);
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, query]);

  if (!isOpen) return null;

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSimulateIncoming = () => {
    const target = conversations[0];
    if (target) {
      const senderId =
        target.members.find((id) => id !== currentUserId) ?? 'user-sarah';
      const nowIso = new Date().toISOString();
      const incoming: Message = {
        id: generateId('msg-sim'),
        conversationId: target.id,
        senderId,
        content: 'Quick ping: just pushed the latest UI polish for review!',
        timestamp: nowIso,
        status: 'read',
        type: 'text',
        replyTo: null,
        threadParentId: null,
        reactions: [],
        editedAt: null,
        isPinned: false,
      };
      dispatch(addMessage(incoming));
      dispatch(
        updateConversationPreview({
          conversationId: target.id,
          lastMessage: {
            id: incoming.id,
            senderId: incoming.senderId,
            content: incoming.content,
            timestamp: incoming.timestamp,
            status: incoming.status,
          },
          updatedAt: nowIso,
          incrementUnread: true,
        })
      );
    }
    handleClose();
  };

  const handleToggleOffline = async () => {
    if (isOffline) {
      dispatch(setOfflineMode(false));
      await dispatch(flushOfflineQueueThunk());
    } else {
      dispatch(setOfflineMode(true));
    }
    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-16 backdrop-blur-xs sm:pt-24"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#121520]">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to conversation or run an action..."
            aria-label="Command palette search"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close command palette"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="nx-scrollbar max-h-96 space-y-4 overflow-y-auto p-3">
          {filteredConversations.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Conversations
              </p>
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      dispatch(selectConversation(conv.id));
                      handleClose();
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar src={conv.avatar} name={conv.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {conv.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {conv.lastMessage?.content ?? 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 capitalize dark:bg-white/5 dark:text-slate-400">
                      {conv.type === 'group' ? 'Group' : 'Direct'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Actions
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenNewChat();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  <MessageSquarePlus className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  New direct conversation
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenNewGroup();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  New group conversation
                </span>
              </button>

              <button
                type="button"
                onClick={handleSimulateIncoming}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  <BellRing className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Simulate incoming message
                </span>
              </button>

              <button
                type="button"
                onClick={handleToggleOffline}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  <WifiOff className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isOffline ? 'Reconnect & flush offline queue' : 'Simulate offline mode'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  dispatch(toggleTheme());
                  handleClose();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  {themeMode === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Switch to {themeMode === 'dark' ? 'Light' : 'Dark'} mode
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
