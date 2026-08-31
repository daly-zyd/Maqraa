import React from 'react';

export interface AvatarProps {
  gender?: 'male' | 'female';
  role?: 'sheikh' | 'teacher' | 'supervisor' | 'tech' | 'founder';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IslamicAvatar: React.FC<AvatarProps> = ({
  gender = 'male',
  role = 'sheikh',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const isFemale = gender === 'female' || role === 'teacher';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl p-1 bg-gradient-to-tr from-emerald-900 via-emerald-800 to-emerald-700 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800 border-2 border-gold-500/40 shadow-lg group-hover:scale-105 transition-all duration-300 ${sizeClasses[size]} ${className}`}
    >
      {/* Background Islamic Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gold-500/10 blur-sm pointer-events-none" />

      {isFemale ? (
        // Dignified Woman Teacher Avatar with Modest Hijab Silhouette
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-gold-300 drop-shadow-md fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Ring */}
          <circle cx="50" cy="50" r="46" fill="#0b4f3a" stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Hijab Silhouette & Head Outline */}
          <path
            d="M50 20 C36 20 32 32 32 45 C32 58 35 70 24 82 C29 86 40 88 50 88 C60 88 71 86 76 82 C65 70 68 58 68 45 C68 32 64 20 50 20 Z"
            fill="#063828"
          />
          
          {/* Inner Face Silhouette with Graceful Lines */}
          <ellipse cx="50" cy="46" rx="14" ry="17" fill="#e8d5b5" />
          
          {/* Hijab Drape Wrap & Gold Trim */}
          <path
            d="M36 48 C36 62 44 72 50 72 C56 72 64 62 64 48 C64 36 60 28 50 28 C40 28 36 36 36 48 Z"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.5"
          />
          
          {/* Modest Robe Shoulders */}
          <path
            d="M24 82 C34 76 42 74 50 74 C58 74 66 76 76 82 L76 90 L24 90 Z"
            fill="#084230"
          />

          {/* Book / Quran Emblem at Base */}
          <path
            d="M45 80 L50 77 L55 80 L55 83 L50 81 L45 83 Z"
            fill="#d4af37"
          />
        </svg>
      ) : role === 'tech' ? (
        // Technical Support Avatar with Headset & Dignified Style
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-gold-300 drop-shadow-md fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="46" fill="#0b4f3a" stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Shoulders */}
          <path d="M22 84 C28 72 38 68 50 68 C62 68 72 72 78 84 L78 90 L22 90 Z" fill="#063828" />
          
          {/* Neck & Face */}
          <rect x="44" y="56" width="12" height="15" rx="3" fill="#e8d5b5" />
          <ellipse cx="50" cy="42" rx="16" ry="19" fill="#e8d5b5" />
          
          {/* Headset Arc */}
          <path d="M30 42 C30 27 40 22 50 22 C60 22 70 27 70 42" fill="none" stroke="#d4af37" strokeWidth="3" />
          <rect x="28" y="38" width="6" height="12" rx="2" fill="#d4af37" />
          <rect x="66" y="38" width="6" height="12" rx="2" fill="#d4af37" />
          <path d="M32 46 C32 56 42 56 46 54" fill="none" stroke="#d4af37" strokeWidth="2" />
          <circle cx="47" cy="54" r="2.5" fill="#d4af37" />
        </svg>
      ) : role === 'supervisor' ? (
        // Supervision / Administration Avatar with Insignia
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-gold-300 drop-shadow-md fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="46" fill="#0b4f3a" stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Ghutra / Shemagh & Shoulders */}
          <path d="M22 85 C28 72 38 66 50 66 C62 66 72 72 78 85 L78 90 L22 90 Z" fill="#063828" />
          <ellipse cx="50" cy="46" rx="15" ry="18" fill="#e8d5b5" />
          
          {/* Shemagh Wrap & Agal */}
          <path d="M32 30 C32 20 40 18 50 18 C60 18 68 20 68 30 L72 65 C66 68 62 55 58 48 L50 48 L42 48 C38 55 34 68 28 65 Z" fill="#ffffff" opacity="0.9" />
          <ellipse cx="50" cy="26" rx="16" ry="3" fill="#1a1a1a" stroke="#d4af37" strokeWidth="1" />
          
          {/* Badge Insignia */}
          <polygon points="50,70 54,78 63,78 56,83 59,91 50,86 41,91 44,83 37,78 46,78" fill="#d4af37" />
        </svg>
      ) : (
        // Dignified Sheikh / Scholar Avatar with Imama & Trim
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-gold-300 drop-shadow-md fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="46" fill="#0b4f3a" stroke="#d4af37" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Traditional Islamic Cloak (Bisht / Thobe) */}
          <path d="M20 86 C26 72 37 66 50 66 C63 66 74 72 80 86 L80 92 L20 92 Z" fill="#063828" />
          
          {/* Golden Embroidery Collar of Bisht */}
          <path d="M38 68 L50 80 L62 68 L58 66 L50 75 L42 66 Z" fill="#d4af37" />
          
          {/* Face & Dignified Beard Silhouette */}
          <ellipse cx="50" cy="46" rx="15" ry="18" fill="#e8d5b5" />
          <path d="M36 46 C36 60 42 68 50 68 C58 68 64 60 64 46 C60 52 56 54 50 54 C44 54 40 52 36 46 Z" fill="#3a2e2b" />
          
          {/* Sheikh Turban (Imama) with Golden Embellishment */}
          <path d="M32 34 C32 20 40 16 50 16 C60 16 68 20 68 34 C64 36 60 38 50 38 C40 38 36 36 32 34 Z" fill="#f8fafc" />
          <path d="M31 34 C35 30 42 28 50 28 C58 28 65 30 69 34 L68 38 L32 38 Z" fill="#e2e8f0" />
          <circle cx="50" cy="22" r="3" fill="#d4af37" />
        </svg>
      )}
    </div>
  );
};

export default IslamicAvatar;
