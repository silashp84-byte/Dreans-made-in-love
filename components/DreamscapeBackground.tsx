
import React from 'react';

const DreamscapeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 opacity-80"
      ></div>
      <div
        className="absolute inset-0 bg-gradient-to-tr from-fuchsia-900 via-violet-900 to-purple-800 opacity-60 animate-gradient-shift"
        style={{
          backgroundSize: '400% 400%',
          animationDelay: '0s',
          animationDuration: '15s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      ></div>
      {/* Subtle star or particle effects (simplified for pure CSS) */}
      <div className="absolute inset-0">
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-0 animate-twinkle top-1/4 left-1/3" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-indigo-200 rounded-full opacity-0 animate-twinkle top-1/2 left-2/3" style={{ animationDelay: '0.5s', animationDuration: '5s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-purple-200 rounded-full opacity-0 animate-twinkle bottom-1/4 right-1/4" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); }
        }

        /* Custom scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(160, 100, 255, 0.5); /* Purple-ish */
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(160, 100, 255, 0.7);
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DreamscapeBackground;
