
import React from 'react';
// import { useLocale } from '../context/LocaleContext'; // No direct t() call needed here, parent passes translated props

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // This label is already passed as a translated string from parent
  id: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, className = '', ...props }) => {
  // const { t } = useLocale(); // Not directly used here, label prop is already translated
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-indigo-200 text-sm font-semibold mb-2">
          {label} {/* Label is already translated by parent */}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full p-3 bg-indigo-900 bg-opacity-30 border border-indigo-700 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-y min-h-[120px] ${className}`}
        {...props}
      ></textarea>
    </div>
  );
};

export default TextArea;
