
import React, { useState, useEffect } from 'react';
import { DreamEntry } from '../types';
import Input from './Input';
import TextArea from './TextArea';
import Button from './Button';
import { useLocale } from '../context/LocaleContext'; // Import useLocale

interface CreateEntryFormProps {
  initialEntry?: DreamEntry;
  onSave: (entry: DreamEntry) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  t: (key: string) => string; // Add t function prop
  moodOptions: string[]; // Add moodOptions prop
}

const CreateEntryForm: React.FC<CreateEntryFormProps> = ({
  initialEntry,
  onSave,
  onCancel,
  onDelete,
  t, // Destructure t
  moodOptions, // Destructure moodOptions
}) => {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [tags, setTags] = useState(initialEntry?.tags.join(', ') || '');
  const [mood, setMood] = useState(initialEntry?.mood || moodOptions[0]); // Use translated moodOptions
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialEntry?.imageUrl || '');

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title);
      setContent(initialEntry.content);
      setTags(initialEntry.tags.join(', '));
      setMood(initialEntry.mood);
      setImageUrl(initialEntry.imageUrl || '');
    }
  }, [initialEntry]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DreamEntry = {
      id: initialEntry?.id || Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      mood,
      timestamp: initialEntry?.timestamp || Date.now(),
      imageUrl: imageUrl || undefined,
    };
    onSave(newEntry);
  };

  const handleDelete = () => {
    if (initialEntry && onDelete) {
      onDelete(initialEntry.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-indigo-900 bg-opacity-30 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-700 max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
        {initialEntry ? t('editEntry') : t('newDreamEntry')}
      </h2>

      <Input
        id="title"
        label={t('titleLabel')}
        placeholder={t('titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <TextArea
        id="content"
        label={t('contentLabel')}
        placeholder={t('contentPlaceholder')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <Input
        id="tags"
        label={t('tagsLabel')}
        placeholder={t('tagsPlaceholder')}
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <div className="mb-4">
        <label htmlFor="mood" className="block text-indigo-200 text-sm font-semibold mb-2">
          {t('moodLabel')}
        </label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full p-3 bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        >
          {moodOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-indigo-950 text-white">
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="imageUpload" className="block text-indigo-200 text-sm font-semibold mb-2">
          {t('addImageOptional')}
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-indigo-300
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-indigo-700 file:text-white
                     hover:file:bg-indigo-600 cursor-pointer"
        />
        {imageUrl && (
          <div className="mt-4 relative w-48 h-32 rounded-lg overflow-hidden border border-indigo-600">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setImageFile(null);
                const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        )}
      </div>


      <div className="flex justify-end space-x-4 mt-6">
        {initialEntry && onDelete && (
          <Button type="button" variant="secondary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            {t('delete')}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {t('saveEntry')}
        </Button>
      </div>
    </form>
  );
};

export default CreateEntryForm;
