import React from 'react';
import { validateAndSanitizeImage } from '../utils/imageSanitizer';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  initials?: string;
  alt?: string;
  square?: boolean;
  className?: string;
  slot?: string;
}

export function Avatar({
  src,
  initials,
  alt = '',
  square = false,
  className = '',
  slot,
  ...props
}: AvatarProps) {
  const shapeClass = square ? 'rounded-xl' : 'rounded-full';
  const safeSrc = validateAndSanitizeImage(src);

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-slate-800 text-slate-200 border border-slate-700/60 font-semibold select-none shadow-sm ${shapeClass} ${className}`}
      {...props}
    >
      {safeSrc ? (
        <img
          src={safeSrc}
          alt={alt}
          className={`w-full h-full object-cover ${shapeClass}`}
          onError={(e) => {
            // Se falhar o carregamento da imagem, esconde para mostrar o ícone/iniciais de fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : initials ? (
        <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">{initials}</span>
      ) : (
        <svg className="w-1/2 h-1/2 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </span>
  );
}
