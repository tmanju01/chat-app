import { ConversationFilter } from './ConversationFilter';
import { ConversationList } from './ConversationList';
import { ConversationSearch } from './ConversationSearch';
import { ProfileHeader } from './ProfileHeader';

interface SidebarProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenCommandPalette: () => void;
}

export function Sidebar({
  onOpenNewChat,
  onOpenNewGroup,
  onOpenCommandPalette,
}: SidebarProps) {
  return (
    <aside
      aria-label="Conversation sidebar"
      className="flex h-full w-full flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#121520]"
    >
      <ProfileHeader
        onOpenNewChat={onOpenNewChat}
        onOpenNewGroup={onOpenNewGroup}
        onOpenCommandPalette={onOpenCommandPalette}
      />
      <ConversationSearch />
      <ConversationFilter />
      <ConversationList />
    </aside>
  );
}

