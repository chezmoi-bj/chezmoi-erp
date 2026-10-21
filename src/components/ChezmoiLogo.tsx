import React from 'react';

interface ChezmoiLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const ChezmoiLogo: React.FC<ChezmoiLogoProps> = ({ 
  className = "w-10 h-10", 
  size = 40,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-xs"
      >
        {/* Unfolded paper map base in soft slate */}
        <path
          d="M 50,340 L 95,230 L 145,230 L 190,340 Z"
          fill="#CBD5E1"
          opacity="0.95"
        />
        <path
          d="M 145,230 L 255,230 L 205,340 L 190,340 Z"
          fill="#E2E8F0"
          opacity="0.95"
        />
        <path
          d="M 255,230 L 305,230 L 350,340 L 205,340 Z"
          fill="#94A3B8"
          opacity="0.95"
        />

        {/* Location Pin in Chezmoi primary red #FA3055 */}
        <path
          d="M 200,42 C 126,42 66,102 66,176 C 66,238 178,354 194,370 C 197,373 203,373 206,370 C 222,354 334,238 334,176 C 334,102 274,42 200,42 Z"
          fill="#FA3055"
        />

        {/* White Inner Circle */}
        <circle cx="200" cy="165" r="72" fill="#FFFFFF" />

        {/* House Silhouette & Chimney in #FA3055 */}
        <rect x="216" y="112" width="12" height="24" rx="2" fill="#FA3055" />
        <path
          d="M 200,105 L 148,145 L 158,145 L 158,188 L 180,188 L 180,165 C 180,154 200,154 200,165 L 200,188 L 242,188 L 242,145 L 252,145 Z"
          fill="#FA3055"
        />

        {/* Magnifying Glass (Loupe) over the house in #FA3055 with white lens */}
        <circle cx="218" cy="170" r="28" fill="#FA3055" />
        <circle cx="218" cy="170" r="20" fill="#FFFFFF" />
        <circle cx="218" cy="170" r="14" fill="#FA3055" />
        <circle cx="214" cy="166" r="4" fill="#FFFFFF" />
        <rect
          x="236"
          y="186"
          width="13"
          height="28"
          rx="6"
          transform="rotate(-45 236 186)"
          fill="#FA3055"
          stroke="#FFFFFF"
          strokeWidth="3.5"
        />

        {/* Brand Wordmark: "chezmoi" in bold rounded lowercase white typography */}
        <text
          x="200"
          y="262"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Outfit', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="48"
          letterSpacing="-1.5px"
        >
          chezmoi
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 tracking-tight">chezmoi</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FA3055] text-white font-black tracking-wider">
              .bj ERP
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Multilocal offline-first</span>
        </div>
      )}
    </div>
  );
};
