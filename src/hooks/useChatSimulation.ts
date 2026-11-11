import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updateConversationPreview } from '../features/conversations/conversationSlice';
import {
  addMessage,
  setTypingUsers,
  updateMessageStatus,
} from '../features/messages/messageSlice';
import { generateId } from '../services/apiHelpers';
import type { Conversation, Message } from '../types';

const SIMULATED_REPLIES = [
  'Sounds good to me — moving forward with that approach.',
  'Great update! Just verified everything on my end.',
  'Makes total sense. Let me follow up right after my next call.',
  'Appreciate the clarity. Looks super clean!',
  'Thanks for sharing — keep me posted if anything changes.',
];

export function useChatSimulation() {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.groups.currentUserId);
  const usersById = useAppSelector((state) => state.groups.usersById);
  const timersRef = useRef<number[]>([]);

  const schedule = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delayMs);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
      }
      timersRef.current = [];
    };
  }, []);

  const simulateOutgoingLifecycle = useCallback(
    (conversation: Conversation, messageId: string, threadParentId?: string | null) => {
      const otherMembers = conversation.members.filter(
        (id) => id !== currentUserId
      );
      if (otherMembers.length === 0) return;

      const responderId =
        otherMembers[Math.floor(Math.random() * otherMembers.length)];
      const responder = usersById[responderId];
      const isOnline = responder?.status === 'online';

      // Progress status: sent -> delivered -> read
      schedule(() => {
        dispatch(
          updateMessageStatus({
            conversationId: conversation.id,
            messageId,
            status: 'delivered',
          })
        );
      }, 450);

      schedule(() => {
        dispatch(
          updateMessageStatus({
            conversationId: conversation.id,
            messageId,
            status: 'read',
          })
        );
      }, 1050);

      if (!isOnline) return;

      schedule(() => {
        dispatch(
          setTypingUsers({
            conversationId: conversation.id,
            userIds: [responderId],
          })
        );
      }, 1350);

      schedule(() => {
        dispatch(
          setTypingUsers({
            conversationId: conversation.id,
            userIds: [],
          })
        );

        const replyText =
          SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)];
        const nowIso = new Date().toISOString();
        const incoming: Message = {
          id: generateId('msg-in'),
          conversationId: conversation.id,
          senderId: responderId,
          content: replyText,
          timestamp: nowIso,
          status: 'read',
          type: 'text',
          replyTo: null,
          threadParentId: threadParentId ?? null,
          reactions: [],
          editedAt: null,
          isPinned: false,
        };

        dispatch(addMessage(incoming));
        if (!threadParentId) {
          dispatch(
            updateConversationPreview({
              conversationId: conversation.id,
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
      }, 2600);
    },
    [currentUserId, dispatch, schedule, usersById]
  );

  return { simulateOutgoingLifecycle };
}
