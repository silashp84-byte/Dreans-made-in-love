
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
  const [copiedToClipboard, setCopiedToClipboard] = useState<'none' | 'code' | 'link'>('none');

  // Generate a new invite code when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Simple random code generation for demonstration.
      // In a real app, this would come from a backend or be a user's ID.
      setInviteCode(Math.random().toString(36).substring(2, 10).toUpperCase());
      setCopiedToClipboard('none'); // Reset copy success state
    }
  }, [isOpen]);

  const handleCopy = useCallback(async (textToCopy: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedToClipboard(type);
      setTimeout(() => setCopiedToClipboard('none'), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert(t('copyFailedAlert')); // Use translated alert message
    }
  }, [t]);

  const appShareLink = window.location.origin; // For now, share the current app URL

  const getShareMessage = useCallback((code: string) => {
    return t('inviteMessage', { code, link: appShareLink }); // Use template string with t()
  }, [t, appShareLink]);

  const handleShare = useCallback(async (platform: 'generic' | 'whatsapp' | 'twitter' | 'facebook' | 'link' | 'code') => {
    const message = getShareMessage(inviteCode);

    if (platform === 'generic' && navigator.share) {
      try {
        await navigator.share({
          title: t('appName'),
          text: message,
          url: appShareLink,
        });
      } catch (error) {
        console.error('Error sharing via Web Share API:', error);
        // Fallback to copying if native share fails or is cancelled
        handleCopy(message, 'link');
      }
      return;
    }

    if (platform === 'link') {
      handleCopy(message, 'link');
      return;
    }

    if (platform === 'code') {
      handleCopy(inviteCode, 'code');
      return;
    }

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appShareLink)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  }, [inviteCode, getShareMessage, appShareLink, handleCopy, t]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('inviteFriendModalTitle')}>
      <p className="text-center text-indigo-100 mb-6 text-lg">
        {t('inviteFriendDescription')}
      </p>

      {/* Invite Code Section */}
      <h3 className="text-xl font-semibold text-indigo-200 mb-4">{t('inviteCodeLabel')}</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <div className="bg-indigo-800 bg-opacity-50 border border-indigo-600 rounded-lg p-3 text-3xl font-bold tracking-wider text-white flex-grow text-center min-w-[180px]">
          {inviteCode}
        </div>
        <Button variant="primary" onClick={() => handleShare('code')} className="min-w-[120px]">
          {copiedToClipboard === 'code' ? t('copiedSuccessfully') : t('copyCode')}
        </Button>
      </div>
      <p className="text-center text-indigo-300 text-sm mb-8 italic">
        {t('inviteCodeCopyInstructions')}
      </p>


      {/* Share Options */}
      <h3 className="text-xl font-semibold text-indigo-200 mb-4">{t('shareVia')}</h3>
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {navigator.share && ( // Conditionally render generic share button if API is supported
          <Button variant="primary" size="md" onClick={() => handleShare('generic')} className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.516 2.607c.484.192 1.085.192 1.569 0l6.516-2.607m-13.032 0A3 3 0 115.684 9.342a3 3 0 013-1.342m-3 1.342C5.482 12.482 5.614 12.938 5.816 13.342m0 2.684c.202.404.416.792.646 1.15l-3.34 1.336c-.485.192-1.086.192-1.57 0l-3.34-1.336c.23-.358.444-.746.646-1.15m0-2.684a3 3 0 110-2.684" />
            </svg>
            {t('shareGeneric')}
          </Button>
        )}
        <Button variant="outline" size="md" onClick={() => handleShare('link')} className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.135a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
          </svg>
          {copiedToClipboard === 'link' ? t('copiedSuccessfully') : t('copyLink')}
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
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
      </div>
    </Modal>
  );
};

export default InviteFriendModal;