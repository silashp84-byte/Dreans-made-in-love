
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useLocale } from '../context/LocaleContext';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocale();
  const [inviteCode, setInviteCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate a new invite code when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Simple random code generation for demonstration.
      // In a real app, this would come from a backend or be a user's ID.
      setInviteCode(Math.random().toString(36).substring(2, 10).toUpperCase());
      setCopySuccess(false); // Reset copy success state
    }
  }, [isOpen]);

  const handleCopy = useCallback(async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy. Please try again or copy manually.');
    }
  }, [t]); // Add t to dependencies if alert message used t()

  const appShareLink = window.location.origin; // For now, share the current app URL

  const getShareMessage = useCallback((code: string) => {
    return `${t('inviteFriendDescription')} ${t('inviteCodeLabel')} ${code}. ${appShareLink}`;
  }, [t, appShareLink]);

  const handleShare = useCallback((platform: 'whatsapp' | 'twitter' | 'facebook' | 'link') => {
    const message = getShareMessage(inviteCode);
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        // Facebook sharer usually takes a URL; message is part of the post by user.
        // For simplicity, we'll just share the app link.
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appShareLink)}`;
        break;
      case 'link':
        handleCopy(message);
        return; // Don't open new window for copy link
    }

    if (url) {
      window.open(url, '_blank');
    }
  }, [inviteCode, getShareMessage, appShareLink, handleCopy]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('inviteFriendModalTitle')}>
      <p className="text-center text-indigo-100 mb-6 text-lg">
        {t('inviteFriendDescription')}
      </p>

      {/* Share via Social Media */}
      <h3 className="text-xl font-semibold text-indigo-200 mb-4">{t('shareVia')}</h3>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button variant="outline" size="md" onClick={() => handleShare('whatsapp')} className="flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt={t('social_whatsapp')} className="h-5 w-5" />
          {t('social_whatsapp')}
        </Button>
        <Button variant="outline" size="md" onClick={() => handleShare('twitter')} className="flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Twitter_icon.svg" alt={t('social_twitter')} className="h-5 w-5" />
          {t('social_twitter')}
        </Button>
        <Button variant="outline" size="md" onClick={() => handleShare('facebook')} className="flex items-center gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt={t('social_facebook')} className="h-5 w-5" />
          {t('social_facebook')}
        </Button>
        <Button variant="outline" size="md" onClick={() => handleShare('link')} className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.135a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
          </svg>
          {t('copyLink')}
        </Button>
      </div>

      {/* Invite Code Section */}
      <h3 className="text-xl font-semibold text-indigo-200 mb-4">{t('inviteCodeLabel')}</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="bg-indigo-800 bg-opacity-50 border border-indigo-600 rounded-lg p-3 text-2xl font-bold tracking-wider text-white flex-grow text-center">
          {inviteCode}
        </div>
        <Button variant="primary" onClick={() => handleCopy(inviteCode)} className="min-w-[120px]">
          {copySuccess ? t('copiedSuccessfully') : t('copyCode')}
        </Button>
      </div>
    </Modal>
  );
};

export default InviteFriendModal;