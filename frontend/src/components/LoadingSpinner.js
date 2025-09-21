import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <Loader className={`${sizeClasses[size]} text-orange-500 animate-spin`} />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
