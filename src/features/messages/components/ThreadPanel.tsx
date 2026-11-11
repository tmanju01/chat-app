import { useState } from 'react';
import { MessageSquareText, Send, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Avatar } from '../../../components/common/Avatar';
import { formatMessageTime } from '../../../utils/dateUtils';
import { selectSelectedConversation } from '../../conversations/conversationSelectors';
import { selectCurrentUserId, selectUsersById } from '../../groups/groupSelectors';
import {
  selectActiveThreadParent,
  selectThreadRepliesMap,
} from '../messageSelectors';
import { sendMessageThunk, setActiveThreadMessageId } from '../messageSlice';

export function ThreadPanel() {
  const dispatch = useAppDispatch();
  const parent = useAppSelector(selectActiveThreadParent);
  const repliesMap = useAppSelector(selectThreadRepliesMap);
  const conversation = useAppSelector(selectSelectedConversation);
  const usersById = useAppSelector(selectUsersById);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const [replyText, setReplyText] = useState('');

  if (!parent || !conversation) return null;

  const replies = repliesMap[parent.id] ?? [];
  const parentSender = usersById[parent.senderId];

  const handleSendThreadReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setReplyText('');
    await dispatch(
      sendMessageThunk({
        conversationId: conversation.id,
        senderId: currentUserId,
        content: trimmed,
        replyTo: null,
        threadParentId: parent.id,
      })
    );
  };

  return (
    <aside
      aria-label="Message thread"
      className="flex h-full w-full flex-col border-l border-slate-200 bg-white dark:border-white/10 dark:bg-[#121520]"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquareText
            className="h-4 w-4"
            style={{ color: 'var(--nx-accent-500)' }}
          />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Thread
          </h3>
        </div>
        <button
          type="button"
          onClick={() => dispatch(setActiveThreadMessageId(null))}
          aria-label="Close thread panel"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="nx-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        {/* Parent message */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-[#161A27]">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={parentSender?.avatar}
              name={parentSender?.name ?? 'User'}
              size="sm"
            />
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {parent.senderId === currentUserId
                  ? 'You'
                  : parentSender?.name ?? 'Teammate'}
              </p>
              <p className="text-[10px] text-slate-400">
                {formatMessageTime(parent.timestamp)}
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            {parent.content}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <span>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        </div>

        {replies.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">
            No replies in this thread yet.
          </p>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => {
              const sender = usersById[reply.senderId];
              return (
                <div key={reply.id} className="flex items-start gap-2.5">
                  <Avatar
                    src={sender?.avatar}
                    name={sender?.name ?? 'User'}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-white/5 dark:bg-[#161A27]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {reply.senderId === currentUserId
                          ? 'You'
                          : sender?.name ?? 'Teammate'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatMessageTime(reply.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                      {reply.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendThreadReply();
              }
            }}
            placeholder="Reply in thread..."
            aria-label="Thread reply input"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#191D2B] dark:text-slate-100"
          />
          <button
            type="button"
            onClick={handleSendThreadReply}
            disabled={!replyText.trim()}
            aria-label="Send thread reply"
            style={
              replyText.trim()
                ? { backgroundColor: 'var(--nx-accent-600)' }
                : undefined
            }
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/5"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

