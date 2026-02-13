
import React from 'react';
// import { useLocale } from '../context/LocaleContext'; // No direct t() call needed here, title prop is already translated

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // This title is already passed as a translated string from parent
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // const { t } = useLocale(); // Not directly used here, title prop is already translated
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-indigo-950 to-purple-950 border border-purple-800 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-indigo-300 hover:text-white text-2xl font-bold transition-colors duration-200"
          aria-label="Close" // Add aria-label for accessibility
        >
          &times;
        </button>
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">
          {title} {/* Title is already translated by parent */}
        </h2>
        <div className="text-indigo-100 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
