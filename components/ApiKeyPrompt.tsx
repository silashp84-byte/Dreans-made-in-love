
import React from 'react';
import Button from './Button';
import { useLocale } from '../context/LocaleContext'; // Import useLocale

interface ApiKeyPromptProps {
  onSelectKey: () => void;
  message: string;
  t: (key: string) => string; // Add t function prop
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey, message, t }) => {
  return (
    <div className="p-6 bg-gradient-to-br from-red-950 to-purple-950 border border-red-800 rounded-xl text-white text-center shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-red-300">{t('apiKeyRequired')}</h3>
      <p className="mb-6 text-lg">
        {message}
      </p>
      <Button variant="primary" onClick={onSelectKey} className="w-full md:w-auto">
        {t('selectApiKey')}
      </Button>
      <p className="mt-4 text-sm text-gray-400">
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 hover:text-indigo-100 underline"
        >
          {t('learnAboutBilling')}
        </a>
      </p>
    </div>
  );
};

export default ApiKeyPrompt;
