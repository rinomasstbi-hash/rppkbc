
import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full" role="status">
    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
    <p className="mt-4 text-gray-600">AI sedang membuat Rencana Pembelajaran...</p>
  </div>
);