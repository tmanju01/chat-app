import { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Pin,
  Search,
  Star,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/common/Avatar';
import { formatLastSeen } from '../../../utils/dateUtils';
import { selectSelectedConversation } from '../../conversations/conversationSelectors';
import {
  selectConversation,
  toggleConversationPriority,
} from '../../conversations/conversationSlice';
import {
  selectActiveGroupMembers,
  selectDirectChatPeer,
  selectIsInfoPanelOpen,
  selectUsersById,
} from '../../groups/groupSelectors';
import { toggleInfoPanel } from '../../groups/groupSlice';
import {
  selectActiveSearchMatchIndex,
  selectCurrentTypingUsers,
  selectMatchingMessageIds,
  selectMessageSearchQuery,
  selectPinnedMessages,
} from '../messageSelectors';
import {
  setActiveSearchMatchIndex,
  setActiveThreadMessageId,
  setMessageSearchQuery,
} from '../messageSlice';

interface ChatHeaderProps {
  showPinnedBar: boolean;
  onTogglePinnedBar: () => void;
}

export function ChatHeader({
  showPinnedBar,
  onTogglePinnedBar,
}: ChatHeaderProps) {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectSelectedConversation);
  const peer = useAppSelector(selectDirectChatPeer);
  const groupMembers = useAppSelector(selectActiveGroupMembers);
  const typingUserIds = useAppSelector(selectCurrentTypingUsers);
  const usersById = useAppSelector(selectUsersById);
  const isInfoPanelOpen = useAppSelector(selectIsInfoPanelOpen);
  const pinnedMessages = useAppSelector(selectPinnedMessages);

  const searchQuery = useAppSelector(selectMessageSearchQuery);
  const matchingIds = useAppSelector(selectMatchingMessageIds);
  const activeMatchIdx = useAppSelector(selectActiveSearchMatchIndex);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (!conversation) return null;

  const isGroup = conversation.type === 'group';

  let subtitle = '';
  if (typingUserIds.length > 0) {
    const names = typingUserIds
      .map((id) => usersById[id]?.name.split(' ')[0])
      .filter(Boolean);
    subtitle = names.length > 0 ? `${names.join(', ')} typing...` : 'Typing...';
  } else if (isGroup) {
    const memberCount = groupMembers.length || conversation.members.length;
    const onlineCount = groupMembers.filter((m) => m.status === 'online').length;
    subtitle = `${memberCount} members${onlineCount > 0 ? ` • ${onlineCount} online` : ''}`;
  } else if (peer) {
    if (peer.status === 'online') {
      subtitle = 'Online';
    } else if (peer.status === 'away') {
      subtitle = 'Away';
    } else {
      subtitle = formatLastSeen(peer.lastSeen);
    }
  }

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    dispatch(setMessageSearchQuery(''));
  };

  return (
    <header className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#121520]">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => dispatch(selectConversation(null))}
            aria-label="Back to conversations"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <Avatar
            src={conversation.avatar}
            name={conversation.name}
            status={peer?.status ?? 'offline'}
            showStatus={!isGroup}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {conversation.name}
            </h2>
            <p
              className={`truncate text-xs ${
                typingUserIds.length > 0 || peer?.status === 'online'
                  ? 'font-medium text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => dispatch(toggleConversationPriority(conversation.id))}
            aria-label={
              conversation.isPriority
                ? 'Remove from priority'
                : 'Mark as priority'
            }
            aria-pressed={conversation.isPriority}
            title="Toggle priority"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors sm:h-9 sm:w-9 ${
              conversation.isPriority
                ? 'border-amber-400/50 bg-amber-50 text-amber-500 dark:bg-amber-500/10'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-400 dark:hover:bg-white/10'
            }`}
          >
            <Star
              className={`h-4 w-4 ${conversation.isPriority ? 'fill-amber-400' : ''}`}
            />
          </button>

          {pinnedMessages.length > 0 && (
            <button
              type="button"
              onClick={onTogglePinnedBar}
              aria-label="Toggle pinned messages"
              aria-pressed={showPinnedBar}
              className={`inline-flex h-8 items-center gap-1 rounded-xl border px-2 text-xs font-medium transition-colors sm:h-9 sm:px-2.5 ${
                showPinnedBar
                  ? 'border-violet-500/50 bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <Pin className="h-3.5 w-3.5" />
              <span>{pinnedMessages.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isSearchOpen) {
                handleCloseSearch();
              } else {
                setIsSearchOpen(true);
              }
            }}
            aria-label="Search messages in conversation"
            aria-pressed={isSearchOpen}
            title="Search in thread"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors sm:h-9 sm:w-9 ${
              isSearchOpen
                ? 'border-violet-500/50 bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-300 dark:hover:bg-white/10'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch(setActiveThreadMessageId(null));
              dispatch(toggleInfoPanel());
            }}
            aria-label={
              isGroup
                ? 'Toggle group information'
                : 'Toggle contact information'
            }
            aria-pressed={isInfoPanelOpen}
            title={isGroup ? 'Space info' : 'Contact info'}
            className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-2 text-xs font-medium transition-colors sm:h-9 sm:px-2.5 ${
              isInfoPanelOpen
                ? 'border-violet-500/50 bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-300 dark:hover:bg-white/10'
            }`}
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isGroup ? 'Space info' : 'Contact info'}
            </span>
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2 dark:border-white/10 dark:bg-[#0F121C]">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => dispatch(setMessageSearchQuery(e.target.value))}
            placeholder="Search messages in this conversation..."
            aria-label="Search messages"
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />

          {searchQuery.trim() && (
            <span className="shrink-0 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {matchingIds.length === 0
                ? '0 matches'
                : `${activeMatchIdx + 1} / ${matchingIds.length}`}
            </span>
          )}

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                if (matchingIds.length === 0) return;
                dispatch(
                  setActiveSearchMatchIndex(
                    (activeMatchIdx - 1 + matchingIds.length) % matchingIds.length
                  )
                );
              }}
              disabled={matchingIds.length === 0}
              aria-label="Previous matching message"
              className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (matchingIds.length === 0) return;
                dispatch(
                  setActiveSearchMatchIndex(
                    (activeMatchIdx + 1) % matchingIds.length
                  )
                );
              }}
              disabled={matchingIds.length === 0}
              aria-label="Next matching message"
              className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCloseSearch}
              aria-label="Close message search"
              className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

