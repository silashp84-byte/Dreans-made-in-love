
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Input from './Input';
import SimulatedUserCard from './SimulatedUserCard';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import { SimulatedUser } from '../types';
import { SIMULATED_USERS } from '../data/simulatedUsers';
import { useLocale } from '../context/LocaleContext';
import { getUserLocation, UserLocation } from '../services/geolocationService';
import { getDistance } from '../utils/distanceUtils';

interface FindNearbyUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (user: SimulatedUser) => void;
  followedUserIds: Set<string>; // New prop
  onToggleFollow: (userId: string) => void; // New prop
  currentUserKeywords: string[]; // New prop for shared interests
}

const NEARBY_RADIUS_KM = 50; // Define what "nearby" means in kilometers

const FindNearbyUsersModal: React.FC<FindNearbyUsersModalProps> = ({
  isOpen,
  onClose,
  onViewProfile,
  followedUserIds, // Destructure new prop
  onToggleFollow, // Destructure new prop
  currentUserKeywords // Destructure new prop
}) => {
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<SimulatedUser[]>([]);
  const [filteredNearbyUsers, setFilteredNearbyUsers] = useState<SimulatedUser[]>([]);

  const fetchUserLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    const response = await getUserLocation();
    if (response.success && response.location) {
      setUserLocation(response.location);
    } else {
      let errorDetail = 'Unknown error';
      if (response.error) {
        if (typeof response.error === 'string') {
          errorDetail = response.error;
        } else if (response.error instanceof GeolocationPositionError) {
          errorDetail = response.error.message;
        }
      }
      setLocationError(response.message.replace('{error}', errorDetail));
      setUserLocation(null); // Clear location if there's an error
    }
    setLocationLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUserLocation(); // Attempt to fetch location when modal opens
      setSearchTerm('');
    } else {
      setUserLocation(null); // Clear location when modal closes
      setLocationError(null);
      setNearbyUsers([]);
      setFilteredNearbyUsers([]);
    }
  }, [isOpen, fetchUserLocation]);

  // Filter SIMULATED_USERS based on user's location
  useEffect(() => {
    if (userLocation) {
      const calculatedNearbyUsers = SIMULATED_USERS.filter((user) => {
        const distance = getDistance(
          userLocation.latitude,
          userLocation.longitude,
          user.latitude,
          user.longitude
        );
        return distance <= NEARBY_RADIUS_KM;
      });
      setNearbyUsers(calculatedNearbyUsers);
    } else {
      setNearbyUsers([]);
    }
  }, [userLocation]);

  // Apply search filter to nearby users
  useEffect(() => {
    if (searchTerm) {
      setFilteredNearbyUsers(
        nearbyUsers.filter((user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredNearbyUsers(nearbyUsers); // If no search term, show all nearby users
    }
  }, [searchTerm, nearbyUsers]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('findUsersModalTitle')}>
      {locationLoading && <LoadingSpinner />}
      {locationError && (
        <div className="text-center text-red-300 mb-4 p-4 bg-red-900 bg-opacity-30 rounded-lg border border-red-700">
          <p className="mb-2">{locationError}</p>
          <Button variant="outline" size="sm" onClick={fetchUserLocation}>
            {t('retryGeolocation')}
          </Button>
        </div>
      )}

      {!locationLoading && !locationError && userLocation && (
        <>
          <Input
            id="userSearch"
            placeholder={t('searchUsersPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-6"
          />

          <h3 className="text-xl font-semibold text-indigo-200 mb-4">{t('usersNearby')}</h3>

          {filteredNearbyUsers.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {filteredNearbyUsers.map((user) => (
                <SimulatedUserCard
                  key={user.id}
                  user={user}
                  onViewProfile={onViewProfile}
                  isFollowing={followedUserIds.has(user.id)}
                  onToggleFollow={onToggleFollow}
                  currentUserKeywords={currentUserKeywords}
                />
              ))}
            </div>
          ) : (
            <p className="text-indigo-300 text-center mt-8">{t('noNearbyUsersFound')}</p>
          )}
        </>
      )}

      {!locationLoading && !locationError && !userLocation && (
        <p className="text-indigo-300 text-center mt-8">
          {t('fetchingLocation')} {/* Default message if no location yet and no error */}
        </p>
      )}
    </Modal>
  );
};

export default FindNearbyUsersModal;
