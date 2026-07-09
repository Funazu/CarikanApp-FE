import React, { useState } from 'react';

const ImageFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-purple-50 text-purple-300 border border-purple-100 ${className}`}>
        <span className="material-symbols-outlined text-4xl mb-1 select-none">image</span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Carikan Amikom</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

export default ImageFallback;
