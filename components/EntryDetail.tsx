
import React from 'react';
import { DreamEntry, ToolType } from '../types';
import Button from './Button';
import { useLocale } from '../context/LocaleContext'; // Import useLocale

interface EntryDetailProps {
  entry: DreamEntry;
  onBack: () => void;
  onEdit: (entry: DreamEntry) => void;
  onTriggerAITool: (entry: DreamEntry, toolType: ToolType) => void;
  isOnline: boolean;
  t: (key: string) => string; // Add t function prop
}

const EntryDetail: React.FC<EntryDetailProps> = ({
  entry,
  onBack,
  onEdit,
  onTriggerAITool,
  isOnline,
  t, // Destructure t
}) => {
  const date = new Date(entry.timestamp).toLocaleDateString();
  const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 bg-indigo-900 bg-opacity-30 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-700 max-w-2xl mx-auto my-8 custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-white">{entry.title}</h2>
        <Button onClick={onBack} variant="ghost">
          {t('backToList')}
        </Button>
      </div>

      <p className="text-indigo-400 text-sm mb-6 italic">
        {t('createdOn')} {date} {t('at')} {time}
      </p>

      {entry.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden max-h-96">
          <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-contain" />
        </div>
      )}

      <div className="prose prose-invert max-w-none text-indigo-100 leading-relaxed mb-6">
        <p className="whitespace-pre-wrap">{entry.content}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {entry.tags.map((tag, index) => (
          <span key={index} className="bg-indigo-700 text-indigo-100 text-sm px-3 py-1 rounded-full opacity-80">
            #{tag}
          </span>
        ))}
        {entry.mood && (
          <span className="bg-purple-700 text-purple-100 text-sm px-3 py-1 rounded-full opacity-80">
            {t('moodLabel')}: {t(`mood_${entry.mood}`)} {/* Translate mood */}
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-col md:flex-row md:justify-end gap-4">
        <Button onClick={() => onEdit(entry)} variant="outline">
          {t('editEntry')}
        </Button>
        <Button
          onClick={() => onTriggerAITool(entry, 'dreamInterpreter')}
          disabled={!isOnline}
          variant="primary"
          className={`${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isOnline ? t('aiDreamInterpreter') : t('offlineAIDisabled')}
        </Button>
        <Button
          onClick={() => onTriggerAITool(entry, 'storySpark')}
          disabled={!isOnline}
          variant="primary"
          className={`${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isOnline ? t('aiStorySpark') : t('offlineAIDisabled')}
        </Button>
        <Button
          onClick={() => onTriggerAITool(entry, 'aiVisualizer')}
          disabled={!isOnline}
          variant="primary"
          className={`${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isOnline ? t('aiVisualizer') : t('offlineAIDisabled')}
        </Button>
      </div>
    </div>
  );
};

export default EntryDetail;
