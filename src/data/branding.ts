// Default luxury SVG Site Logo & Branding Assets

export function getDefaultSiteLogoSvg(siteName = "LigaBandot"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 70" width="340" height="70">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="30%" stop-color="#fde047"/>
        <stop offset="70%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <!-- Ram / Horned Goat Luxury Icon -->
    <g transform="translate(10, 5) scale(0.9)" filter="url(#goldGlow)">
      <!-- Horn Curves -->
      <path d="M 35 12 C 22 8, 12 18, 16 32 C 18 38, 26 42, 34 38 C 30 34, 26 28, 28 22 C 30 16, 38 18, 44 24 Z" fill="url(#goldGrad)"/>
      <path d="M 40 18 C 34 14, 26 20, 28 28 C 30 32, 36 34, 40 30 Z" fill="#0b0e14"/>
      <!-- Ram Head & Crown -->
      <path d="M 42 22 L 56 36 L 50 56 L 42 54 L 38 44 L 34 46 L 36 38 Z" fill="url(#goldGrad)"/>
      <!-- Eye -->
      <circle cx="44" cy="34" r="2.5" fill="#0b0e14"/>
      <!-- Beard & Chin Details -->
      <path d="M 46 54 L 40 64 L 36 54 Z" fill="url(#goldGrad)"/>
    </g>

    <!-- Site Title Text -->
    <text x="80" y="44" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#goldGrad)" letter-spacing="1" filter="url(#goldGlow)">${siteName}</text>
    
    <!-- Subtitle URL -->
    <text x="140" y="58" font-family="monospace" font-weight="700" font-size="9" fill="#fef08a" letter-spacing="2" opacity="0.85">WWW.${siteName.toUpperCase().replace(/\s+/g, '')}.COM</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_SITE_LOGO_URL =
  "https://cdn.areabermain.club/assets/cdn/az1/2025/10/15/20251015/e94bdb4085e68cc3a0f0800de144b38b/ligabandot-logo2-1.png";
export const DEFAULT_SITE_NAME = "the royal predictions";
export const DEFAULT_KEYWORDS_TEXT =
  "👑 VIP DENGAN PASARAN TERLENGKAP DAN PREDIKSI AKURAT SETIAP HARI • PARLAY TERBAIK";
