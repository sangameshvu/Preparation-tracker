import React from 'react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" role="status" aria-label="Loading page">
      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl glass-regular shadow-lg">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
      <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground animate-pulse">
        Loading view...
      </p>
    </div>
  );
};
