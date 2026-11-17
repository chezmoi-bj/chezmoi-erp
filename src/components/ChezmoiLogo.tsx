import React from 'react';

interface ChezmoiLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const ChezmoiLogo: React.FC<ChezmoiLogoProps> = ({
  className = '',
  size,
  showText = false,
}) => {
  const dimensionStyle = size !== undefined ? { width: size, height: size } : undefined;
  const fallbackSizeClass = size === undefined && !className ? 'w-10 h-10' : '';

  if (!showText) {
    return (
      <img
        src="./assets/aistudio/1_e24ebf1b.png"
        alt="Chezmoi"
        style={dimensionStyle}
        className={`object-contain flex-shrink-0 select-none ${fallbackSizeClass} ${className}`.trim()}
        draggable={false}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`.trim()}>
      <img
        src="./assets/aistudio/1_e24ebf1b.png"
        alt="Chezmoi"
        style={dimensionStyle ?? { width: 40, height: 40 }}
        className="object-contain flex-shrink-0 select-none"
        draggable={false}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold text-[#141414] dark:text-white tracking-tight">chezmoi</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#141414] text-white font-bold tracking-wider">
            .bj
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 font-medium">Plateforme foncière</span>
      </div>
    </div>
  );
};
