
import React from 'react';
import Button from './Button';
import { useLocale } from '../context/LocaleContext'; // Adjust path as needed

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onSelectLanguage: (locale: string) => void;
}

const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onSelectLanguage }) => {
  const { t } = useLocale();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-indigo-950 to-purple-950 border border-purple-800 rounded-xl shadow-2xl w-full max-w-sm p-8 md:p-10 transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn text-center">
        <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
          {t('chooseYourLanguage')}
        </h2>
        <div className="flex flex-col gap-4">
          <Button variant="primary" size="lg" onClick={() => onSelectLanguage('en')}>
            {t('english')}
          </Button>
          <Button variant="primary" size="lg" onClick={() => onSelectLanguage('pt')}>
            {t('portuguese')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
