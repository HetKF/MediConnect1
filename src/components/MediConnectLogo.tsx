import React from 'react';

interface MediConnectLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const MediConnectLogo: React.FC<MediConnectLogoProps> = ({
  size = 'md',
  animated = true,
  showText = false,
  textColor = 'text-slate-900',
  className = '',
}) => {
  const sizeMap = {
    sm: { width: 36, height: 36, textSize: 'text-base' },
    md: { width: 48, height: 48, textSize: 'text-xl' },
    lg: { width: 64, height: 64, textSize: 'text-2xl' },
    xl: { width: 88, height: 88, textSize: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Complete Syringe with Dripping Droplet */}
      <div 
        style={{ width: currentSize.width, height: currentSize.height }} 
        className="relative flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Multi-color droplet gradient matching reference image */}
            <linearGradient id="dropletGradientReal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Syringe barrel fluid gradient (Teal / Emerald) */}
            <linearGradient id="barrelTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00c99f" />
              <stop offset="40%" stopColor="#00b289" />
              <stop offset="100%" stopColor="#008f6e" />
            </linearGradient>

            {/* Navy Plunger Gradient */}
            <linearGradient id="navyPlungerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0b1727" />
            </linearGradient>

            {/* Droplet soft glow */}
            <filter id="dropletSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Full Syringe Assembly rotated at 45° angle */}
          <g 
            transform="rotate(45 50 50)" 
            className={animated ? 'animate-[syringeBob_3s_ease-in-out_infinite]' : ''}
          >
            {/* 1. Plunger Thumb Rest Disk (Bottom-most T-flange) */}
            <rect
              x="39"
              y="83"
              width="22"
              height="5"
              rx="2.5"
              fill="url(#navyPlungerGrad)"
              stroke="#0b1727"
              strokeWidth="0.5"
            />

            {/* 2. Plunger Shaft / Stem */}
            <rect
              x="47"
              y="68"
              width="6"
              height="15"
              fill="url(#navyPlungerGrad)"
            />
            {/* Plunger structural rib */}
            <rect
              x="49"
              y="69"
              width="2"
              height="13"
              fill="#334155"
              rx="1"
            />

            {/* 3. Barrel Finger Grip Wings / Flange */}
            <rect
              x="34"
              y="66"
              width="32"
              height="5.5"
              rx="2.75"
              fill="url(#navyPlungerGrad)"
              stroke="#0b1727"
              strokeWidth="0.5"
            />

            {/* 4. Syringe Barrel (Main Cylindrical Chamber) */}
            <rect
              x="40"
              y="30"
              width="20"
              height="36"
              rx="3"
              fill="url(#barrelTealGrad)"
              stroke="#008063"
              strokeWidth="1.2"
            />

            {/* 5. Measurement Graduation Marks (White Hatch Lines) */}
            <g stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95">
              <line x1="51" y1="36" x2="58" y2="36" />
              <line x1="54" y1="42" x2="58" y2="42" />
              <line x1="51" y1="48" x2="58" y2="48" />
              <line x1="54" y1="54" x2="58" y2="54" />
              <line x1="51" y1="60" x2="58" y2="60" />
            </g>

            {/* 6. Specular Cylindrical Glass Reflection */}
            <line
              x1="43.5"
              y1="34"
              x2="43.5"
              y2="62"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* 7. Syringe Front Shoulder (Tapered Neck) */}
            <polygon
              points="40,30 45,24 55,24 60,30"
              fill="#009677"
              stroke="#008063"
              strokeWidth="0.8"
            />

            {/* 8. Luer Lock Needle Hub / Collar */}
            <rect
              x="46"
              y="19"
              width="8"
              height="5.5"
              rx="1.5"
              fill="#00b289"
              stroke="#008063"
              strokeWidth="0.8"
            />

            {/* 9. Stainless Steel Needle */}
            <line
              x1="50"
              y1="19"
              x2="50"
              y2="3"
              stroke="#475569"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Needle Sharp Tip Bevel Highlight */}
            <line
              x1="49.5"
              y1="19"
              x2="49.5"
              y2="4"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>

          {/* 10. Moving Droplet Animation coming from the Needle Tip */}
          {animated ? (
            <g className="animate-[needleDropDrip_2.2s_cubic-bezier(0.4,0,0.2,1)_infinite]">
              {/* Teardrop geometry */}
              <path
                d="M 87 23 C 87 23, 81 31, 81 37 C 81 41.5, 84.5 45, 89 45 C 93.5 45, 97 41.5, 97 37 C 97 31, 87 23, 87 23 Z"
                fill="url(#dropletGradientReal)"
                filter="url(#dropletSoftGlow)"
              />
              {/* Droplet 4-Color Graphic Segmentation like original logo */}
              <path d="M 82 37 Q 89 37 89 29 A 7 7 0 0 0 82 37 Z" fill="#f43f5e" opacity="0.9" />
              <path d="M 89 29 Q 89 37 96 37 A 7 7 0 0 0 89 29 Z" fill="#3b82f6" opacity="0.9" />
              <path d="M 82 37 Q 89 37 89 44.5 A 7 7 0 0 1 82 37 Z" fill="#f59e0b" opacity="0.9" />
              <path d="M 89 44.5 Q 89 37 96 37 A 7 7 0 0 1 89 44.5 Z" fill="#10b981" opacity="0.9" />

              {/* Specular Highlight Gloss Dot */}
              <circle cx="86" cy="34" r="1.5" fill="#ffffff" opacity="0.9" />
            </g>
          ) : (
            <g>
              <path
                d="M 87 23 C 87 23, 81 31, 81 37 C 81 41.5, 84.5 45, 89 45 C 93.5 45, 97 41.5, 97 37 C 97 31, 87 23, 87 23 Z"
                fill="url(#dropletGradientReal)"
              />
              <path d="M 82 37 Q 89 37 89 29 A 7 7 0 0 0 82 37 Z" fill="#f43f5e" opacity="0.9" />
              <path d="M 89 29 Q 89 37 96 37 A 7 7 0 0 0 89 29 Z" fill="#3b82f6" opacity="0.9" />
              <path d="M 82 37 Q 89 37 89 44.5 A 7 7 0 0 1 82 37 Z" fill="#f59e0b" opacity="0.9" />
              <path d="M 89 44.5 Q 89 37 96 37 A 7 7 0 0 1 89 44.5 Z" fill="#10b981" opacity="0.9" />
              <circle cx="86" cy="34" r="1.5" fill="#ffffff" opacity="0.9" />
            </g>
          )}

          {/* 11. Secondary Micro-Droplet Trail (Drip Splash Effect) */}
          {animated && (
            <circle
              cx="89"
              cy="52"
              r="1.6"
              fill="#10b981"
              className="animate-[needleDropTrail_2.2s_ease-in-out_infinite]"
            />
          )}
        </svg>
      </div>

      {/* Optional Brand Text */}
      {showText && (
        <span className={`font-black tracking-tight font-sans ${currentSize.textSize} ${textColor}`}>
          Medi<span className="text-[#00b289]">Connect</span>
        </span>
      )}
    </div>
  );
};
