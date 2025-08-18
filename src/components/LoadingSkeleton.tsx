import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  );
};

export default LoadingSkeleton;
