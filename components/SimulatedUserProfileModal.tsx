
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { SimulatedUser } from '../types';
import { useLocale } from '../context/LocaleContext';

interface SimulatedUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SimulatedUser | null;
  isFollowing: boolean; // New prop
  onToggleFollow: (userId: string) => void; // New prop
  currentUserKeywords: string[]; // New prop for shared interests
}

const SimulatedUserProfileModal: React.FC<SimulatedUserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  isFollowing,
  onToggleFollow,
  currentUserKeywords
}) => {
  const { t } = useLocale();

  if (!isOpen || !user) return null;

  // Calculate shared interests
  const userKeywords = new Set<string>();
  user.dreams.forEach(dream => {
    dream.title.split(' ').forEach(word => userKeywords.add(word.toLowerCase()));
    dream.content.split(' ').forEach(word => userKeywords.add(word.toLowerCase()));
  });
  user.bio.split(' ').forEach(word => userKeywords.add(word.toLowerCase()));

  const sharedInterests = Array.from(userKeywords).filter(
    keyword => currentUserKeywords.includes(keyword) && keyword.length > 2 // Filter out short, common words
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('simulatedProfileTitle')}>
      <div className="flex flex-col items-center mb-6">
        <img
          src={user.avatarUrl}
          alt={`${user.username}'s avatar`}
          className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 shadow-lg mb-4"
        />
        <h3 className="text-3xl font-bold text-white mb-2">{user.username}</h3>
        <p className="text-indigo-300 text-center italic max-w-md">
          {t('simulatedProfileBio')}: {user.bio}
        </p>

        <Button
          variant={isFollowing ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => onToggleFollow(user.id)}
          className="mt-4"
        >
          {isFollowing ? t('unfollow') : t('follow')}
        </Button>
      </div>

      {/* Shared Interests Section */}
      <h4 className="text-2xl font-semibold text-indigo-100 mb-4 border-b border-indigo-700 pb-2">
        {t('sharedInterests')}
      </h4>
      <div className="mb-6">
        {sharedInterests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sharedInterests.map((interest, index) => (
              <span key={index} className="bg-green-700 text-green-100 text-sm px-3 py-1 rounded-full opacity-80">
                #{interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-indigo-300 italic">{t('noSharedInterests')}</p>
        )}
      </div>

      <h4 className="text-2xl font-semibold text-indigo-100 mb-4 border-b border-indigo-700 pb-2">
        {t('simulatedProfileDreams')}
      </h4>
      <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
        {user.dreams.length > 0 ? (
          user.dreams.map((dream) => (
            <div key={dream.id} className="bg-indigo-900 bg-opacity-30 rounded-lg p-4 border border-indigo-700">
              <h5 className="text-xl font-semibold text-white mb-2">{dream.title}</h5>
              <p className="text-indigo-200 text-sm line-clamp-3">{dream.content}</p>
            </div>
          ))
        ) : (
          <p className="text-indigo-300 text-center">{t('noDreamsYet')}</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={onClose}>
          {t('backToSearch')}
        </Button>
      </div>
    </Modal>
  );
};

export default SimulatedUserProfileModal;
