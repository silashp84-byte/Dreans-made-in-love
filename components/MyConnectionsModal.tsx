
import React from 'react';
import Modal from './Modal';
import SimulatedUserCard from './SimulatedUserCard';
import Button from './Button';
import { SimulatedUser } from '../types';
import { SIMULATED_USERS } from '../data/simulatedUsers'; // Assuming SIMULATED_USERS is accessible
import { useLocale } from '../context/LocaleContext';

interface MyConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  followedUserIds: Set<string>;
  onViewProfile: (user: SimulatedUser) => void;
  onToggleFollow: (userId: string) => void;
  currentUserKeywords: string[]; // For shared interests display
}

const MyConnectionsModal: React.FC<MyConnectionsModalProps> = ({
  isOpen,
  onClose,
  followedUserIds,
  onViewProfile,
  onToggleFollow,
  currentUserKeywords
}) => {
  const { t } = useLocale();

  if (!isOpen) return null;

  const connectedUsers = SIMULATED_USERS.filter(user => followedUserIds.has(user.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('myConnectionsModalTitle')}>
      {connectedUsers.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {connectedUsers.map(user => (
            <SimulatedUserCard
              key={user.id}
              user={user}
              onViewProfile={onViewProfile}
              isFollowing={true} // Always true in this modal context
              onToggleFollow={onToggleFollow}
              currentUserKeywords={currentUserKeywords}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-indigo-300 mt-8">
          <p className="mb-4">{t('noConnectionsYet')}</p>
          <Button variant="outline" onClick={onClose}>
            {t('backToSearch')} {/* Could direct to find nearby users or just close */}
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default MyConnectionsModal;
