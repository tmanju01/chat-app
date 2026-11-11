import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Sidebar } from '../../features/conversations/components/Sidebar';
import { selectSelectedConversation } from '../../features/conversations/conversationSelectors';
import { ContactInfoPanel } from '../../features/groups/components/ContactInfoPanel';
import { GroupInfoPanel } from '../../features/groups/components/GroupInfoPanel';
import { selectIsInfoPanelOpen } from '../../features/groups/groupSelectors';
import { setInfoPanelOpen } from '../../features/groups/groupSlice';
import { ChatWindow } from '../../features/messages/components/ChatWindow';
import { ThreadPanel } from '../../features/messages/components/ThreadPanel';
import { selectActiveThreadParent } from '../../features/messages/messageSelectors';
import { setActiveThreadMessageId } from '../../features/messages/messageSlice';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { Toast } from '../common/Toast';
import { NewConversationModal } from '../modals/NewConversationModal';
import { NewGroupModal } from '../modals/NewGroupModal';

const CommandPalette = lazy(() =>
  import('../modals/CommandPalette').then((m) => ({
    default: m.CommandPalette,
  }))
);

export function AppLayout() {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const isInfoPanelOpen = useAppSelector(selectIsInfoPanelOpen);
  const activeThreadParent = useAppSelector(selectActiveThreadParent);

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const handleTogglePalette = useCallback(() => {
    setIsPaletteOpen((prev) => !prev);
  }, []);

  useKeyboardShortcut('k', handleTogglePalette, { ctrlOrMeta: true });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showInfoPanel = Boolean(selectedConversation) && isInfoPanelOpen;
  const showThreadPanel =
    Boolean(selectedConversation) && Boolean(activeThreadParent) && !showInfoPanel;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0B0D14] dark:text-slate-100">
      {/* Left Conversation Sidebar: full-screen on mobile when no chat selected */}
      <div
        className={`${
          selectedConversation ? 'hidden md:flex' : 'flex w-full'
        } h-full shrink-0 md:w-76 lg:w-88 xl:w-96`}
      >
        <Sidebar
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
        />
      </div>

      {/* Main Chat Window */}
      <main
        className={`${
          selectedConversation ? 'flex' : 'hidden md:flex'
        } h-full min-w-0 flex-1 flex-col`}
      >
        <ChatWindow
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
          onShowToast={showToast}
        />
      </main>

      {/* Optional Right Panel: Group Info / Contact Info */}
      {showInfoPanel && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              dispatch(setInfoPanelOpen(false));
            }
          }}
          className="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-xs lg:static lg:inset-auto lg:z-auto lg:h-full lg:w-80 lg:shrink-0 lg:bg-transparent lg:backdrop-blur-none"
        >
          <div className="h-full w-full shadow-2xl sm:max-w-sm lg:max-w-none lg:shadow-none">
            {selectedConversation?.type === 'group' ? (
              <GroupInfoPanel onShowToast={showToast} />
            ) : (
              <ContactInfoPanel />
            )}
          </div>
        </div>
      )}

      {/* Optional Right Panel: Message Thread */}
      {showThreadPanel && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              dispatch(setActiveThreadMessageId(null));
            }
          }}
          className="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-xs lg:static lg:inset-auto lg:z-auto lg:h-full lg:w-80 lg:shrink-0 lg:bg-transparent lg:backdrop-blur-none"
        >
          <div className="h-full w-full shadow-2xl sm:max-w-sm lg:max-w-none lg:shadow-none">
            <ThreadPanel />
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
        />
      </Suspense>

      <NewConversationModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onCreated={(name) => showToast(`Group "${name}" created`)}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
