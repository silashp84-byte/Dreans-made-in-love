import React from 'react';
import { SimulatedUser } from '../types';
import Button from './Button';
import { useLocale } from '../context/LocaleContext';

interface SimulatedUserCardProps {
  user: SimulatedUser;
  onViewProfile: (user: SimulatedUser) => void;
  isFollowing?: boolean; // New prop to indicate if the user is followed
  onToggleFollow?: (userId: string) => void; // Optional: for unfollow directly from card
  currentUserKeywords?: string[]; // New prop for shared interests
}

const SimulatedUserCard: React.FC<SimulatedUserCardProps> = ({
  user,
  onViewProfile,
  isFollowing = false,
  onToggleFollow,
  currentUserKeywords = []
}) => {
  const { t } = useLocale();

  // Simple shared interests logic for the card
  const userContent = `${user.bio} ${user.dreams.map(d => d.title + ' ' + d.content).join(' ')}`.toLowerCase();
  const hasSharedInterests = currentUserKeywords.some(keyword => userContent.includes(keyword.toLowerCase()));

  return (
    <div className="bg-indigo-900 bg-opacity-40 backdrop-blur-md rounded-xl p-4 shadow-lg border border-indigo-700 hover:border-purple-500 hover:shadow-xl transition-all duration-300 flex items-center gap-4">
      <img
        src={user.avatarUrl}
        alt={`${user.username}'s avatar`}
        className="w-12 h-12 rounded-full object-cover border border-purple-500"
      />
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">
          {user.username}
          {isFollowing && (
            <span className="ml-2 text-purple-300 text-sm italic">({t('following')})</span>
          )}
          {/* Fix: Corrected typo from `hasSharedInterists` to `hasSharedInterests` */}
          {hasSharedInterests && (
            <span className="ml-2 text-green-300 text-sm" title={t('sharedInterests')}>
              ✨
            </span>
          )}
        </h3>
        <p className="text-indigo-200 text-sm line-clamp-1">{user.bio}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => onViewProfile(user)}>
        {t('viewProfile')}
      </Button>
    </div>
  );
};

export default SimulatedUserCard;