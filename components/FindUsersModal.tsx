
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Input from './Input';
import SimulatedUserCard from './SimulatedUserCard';
import { SimulatedUser } from '../types';
import { SIMULATED_USERS } from '../data/simulatedUsers';
import { useLocale } from '../context/LocaleContext';

interface FindUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (user: SimulatedUser) => void; // Callback to view a specific user's profile
}

const FindUsersModal: React.FC<FindUsersModalProps> = ({ isOpen, onClose, onViewProfile }) => {
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<SimulatedUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(''); // Reset search term when modal opens
      setFilteredUsers(SIMULATED_USERS.slice(0, 5)); // Show featured users initially
    }
  }, [isOpen]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        SIMULATED_USERS.filter((user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(SIMULATED_USERS.slice(0, 5)); // Show featured users if search is empty
    }
  }, [searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('findUsersModalTitle')}>
      <Input
        id="userSearch"
        placeholder={t('searchUsersPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6"
      />

      <h3 className="text-xl font-semibold text-indigo-200 mb-4">
        {searchTerm ? (filteredUsers.length > 0 ? t('featuredUsers') : '') : t('featuredUsers')}
      </h3> {/* Adjust title based on search results */}

      {filteredUsers.length > 0 ? (
        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {filteredUsers.map((user) => (
            <SimulatedUserCard key={user.id} user={user} onViewProfile={onViewProfile} />
          ))}
        </div>
      ) : (
        <p className="text-indigo-300 text-center mt-8">{t('noUsersFound')}</p>
      )}
    </Modal>
  );
};

export default FindUsersModal;
