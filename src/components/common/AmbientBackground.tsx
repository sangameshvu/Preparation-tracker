import React from 'react';

/**
 * AmbientBackground: ONE fixed full-viewport background layer (z-index -1, pointer-events none).
 * - Light: #F3F5FB base with 4 soft color blobs (blue #93C5FD, violet #C4B5FD, teal #99F6E4, peach #FED7AA)
 * - Dark: #0B0F19 base with luminous blobs (blue #2563EB, violet #7C3AED, teal #0D9488)
 * - Controlled via pure CSS in glass.css; animations obey prefers-reduced-motion and data-glass.
 */
export const AmbientBackground: React.FC = () => {
  return (
    <div className="ambient-canvas" aria-hidden="true">
      <div className="ambient-blob-container">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />
        <div className="blob-4" />
      </div>
    </div>
  );
};
