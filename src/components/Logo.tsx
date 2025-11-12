import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  useImage?: boolean;
  imagePath?: string;
}

export function Logo({ className, showText = true, size = "md", useImage = true, imagePath = "/logo.png.png" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative flex-shrink-0", sizeClasses[size])}>
        {useImage && !imageError ? (
          <img 
            src={imagePath} 
            alt="ImobiCRM Logo" 
            className="w-full h-full object-contain"
            onError={() => {
              setImageError(true);
            }}
            onLoad={() => {
              // Imagem carregou com sucesso
            }}
          />
        ) : (
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Gradiente principal: índigo profundo na base para rosa vibrante nas pontas */}
            <linearGradient id="arrowGradient" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="25%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="75%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            {/* Gradiente para highlight/brilho nas bordas - efeito bevel */}
            <linearGradient id="bevelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.5" />
            </linearGradient>
            {/* Filtro para sombra sutil e profundidade */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
              <feOffset dx="0" dy="1" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Base horizontal comum - linha de onde partem as três setas */}
          <line x1="20" y1="92" x2="80" y2="92" stroke="url(#arrowGradient)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Seta central - maior, mais alta e mais proeminente */}
          <path
            d="M50 92 L50 3 L48 8 L50 13 L52 8 Z"
            fill="url(#arrowGradient)"
            filter="url(#shadow)"
          />
          {/* Highlight na borda esquerda para efeito bevel 3D */}
          <line x1="50" y1="92" x2="50" y2="3" stroke="url(#bevelGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          
          {/* Seta esquerda - menor e mais baixa */}
          <path
            d="M32 92 L32 38 L30 43 L32 48 L34 43 Z"
            fill="url(#arrowGradient)"
            filter="url(#shadow)"
          />
          {/* Highlight na borda esquerda para efeito bevel */}
          <line x1="32" y1="92" x2="32" y2="38" stroke="url(#bevelGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          
          {/* Seta direita - menor e mais baixa */}
          <path
            d="M68 92 L68 38 L66 43 L68 48 L70 43 Z"
            fill="url(#arrowGradient)"
            filter="url(#shadow)"
          />
          {/* Highlight na borda esquerda para efeito bevel */}
          <line x1="68" y1="92" x2="68" y2="38" stroke="url(#bevelGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
        )}
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap leading-none",
            textSizes[size]
          )}
        >
          ImobiCRM
        </span>
      )}
    </div>
  );
}

