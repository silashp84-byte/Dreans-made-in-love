
import React from 'react';
import { SimulatedUser } from '../types';
import { SIMULATED_USERS } from '../data/simulatedUsers';
import { useLocale } from '../context/LocaleContext';

interface FriendsSidebarProps {
  followedUserIds: Set<string>;
  onViewProfile: (user: SimulatedUser) => void;
  currentUserKeywords: string[];
}

const FriendsSidebar: React.FC<FriendsSidebarProps> = ({
  followedUserIds,
  onViewProfile,
  currentUserKeywords,
}) => {
  const { t } = useLocale();

  const followedUsers = SIMULATED_USERS.filter((user) => followedUserIds.has(user.id));

  if (followedUsers.length === 0) {
    return (
      <aside className="hidden lg:flex flex-col w-64 p-6 bg-indigo-900/20 backdrop-blur-sm border-l border-indigo-700/30 h-[calc(100vh-100px)] sticky top-24 rounded-l-3xl">
        <h2 className="text-xl font-serif italic text-indigo-200 mb-6 border-b border-indigo-700/30 pb-2">
          {t('friendsSidebarTitle')}
        </h2>
        <p className="text-sm text-indigo-300/60 italic leading-relaxed">
          {t('noConnectionsYet')}
        </p>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 p-6 bg-indigo-900/20 backdrop-blur-sm border-l border-indigo-700/30 h-[calc(100vh-100px)] sticky top-24 rounded-l-3xl overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-serif italic text-indigo-200 mb-6 border-b border-indigo-700/30 pb-2">
        {t('friendsSidebarTitle')}
      </h2>
      <div className="space-y-4">
        {followedUsers.map((user) => {
          // Shared interests logic
          const userContent = `${user.bio} ${user.dreams.map(d => d.title + ' ' + d.content).join(' ')}`.toLowerCase();
          const hasSharedInterests = currentUserKeywords.some(keyword => userContent.includes(keyword.toLowerCase()));

          return (
            <div
              key={user.id}
              onClick={() => onViewProfile(user)}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30"
            >
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-indigo-400/30 group-hover:border-purple-400/50 transition-colors"
                />
                {hasSharedInterests && (
                  <span className="absolute -top-1 -right-1 text-[10px]" title={t('sharedInterests')}>
                    ✨
                  </span>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-medium text-indigo-100 truncate group-hover:text-white transition-colors">
                  {user.username}
                </h3>
                <p className="text-[10px] text-indigo-300/70 truncate italic">
                  {user.bio}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default FriendsSidebar;
