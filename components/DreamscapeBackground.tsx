
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
        }}
      ></div>
      {/* Subtle star or particle effects */}
      <div className="absolute inset-0">
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-0 animate-twinkle top-1/4 left-1/3" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-indigo-200 rounded-full opacity-0 animate-twinkle top-1/2 left-2/3" style={{ animationDelay: '0.5s', animationDuration: '5s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-purple-200 rounded-full opacity-0 animate-twinkle bottom-1/4 right-1/4" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
      </div>
    </div>
  );
};

export default DreamscapeBackground;
