
import React from 'react';
import { DreamEntry } from '../types';
import { useLocale } from '../context/LocaleContext'; // Import useLocale

interface EntryCardProps {
  entry: DreamEntry;
  onClick: (id: string) => void;
  t: (key: string) => string; // Add t function prop
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick, t }) => {
  const date = new Date(entry.timestamp).toLocaleDateString();
  const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="bg-indigo-900 bg-opacity-40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-indigo-700 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={() => onClick(entry.id)}
    >
      <div>
        {entry.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden h-40 w-full object-cover">
            <img
              src={entry.imageUrl}
              alt={entry.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{entry.title}</h3>
        <p className="text-indigo-200 text-sm line-clamp-2 mb-3">{entry.content}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {entry.tags.map((tag, index) => (
            <span key={index} className="bg-indigo-700 text-indigo-100 text-xs px-2 py-1 rounded-full opacity-80">
              #{tag}
            </span>
          ))}
          {entry.mood && (
            <span className="bg-purple-700 text-purple-100 text-xs px-2 py-1 rounded-full opacity-80">
              {t('moodLabel')}: {t(`mood_${entry.mood}`)} {/* Translate mood */}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 text-right text-indigo-400 text-xs italic">
        {date} {t('at')} {time}
      </div>
    </div>
  );
};

export default EntryCard;
