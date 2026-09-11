// Country Flags and Metadata Helper for Marvel Nums

export interface CountryMeta {
  id: string;
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

// Convert 2-letter ISO country code into Unicode flag emoji
export function getFlagEmojiFromIso(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const upper = code.toUpperCase();
  // Check if chars are A-Z
  if (!/^[A-Z]{2}$/.test(upper)) return '🌐';
  const first = upper.charCodeAt(0) - 65 + 0x1F1E6;
  const second = upper.charCodeAt(1) - 65 + 0x1F1E6;
  return String.fromCodePoint(first, second);
}

// Extensive ISO code and country name mapping
const COUNTRY_LOOKUP: Record<string, { code: string; flag: string; dialCode: string }> = {
  // North America
  'united states': { code: 'US', flag: '🇺🇸', dialCode: '+1' },
  'usa': { code: 'US', flag: '🇺🇸', dialCode: '+1' },
  'us': { code: 'US', flag: '🇺🇸', dialCode: '+1' },
  'canada': { code: 'CA', flag: '🇨🇦', dialCode: '+1' },
  'ca': { code: 'CA', flag: '🇨🇦', dialCode: '+1' },
  'mexico': { code: 'MX', flag: '🇲🇽', dialCode: '+52' },
  'mx': { code: 'MX', flag: '🇲🇽', dialCode: '+52' },

  // Europe
  'united kingdom': { code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  'uk': { code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  'gb': { code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  'germany': { code: 'DE', flag: '🇩🇪', dialCode: '+49' },
  'de': { code: 'DE', flag: '🇩🇪', dialCode: '+49' },
  'france': { code: 'FR', flag: '🇫🇷', dialCode: '+33' },
  'fr': { code: 'FR', flag: '🇫🇷', dialCode: '+33' },
  'netherlands': { code: 'NL', flag: '🇳🇱', dialCode: '+31' },
  'nl': { code: 'NL', flag: '🇳🇱', dialCode: '+31' },
  'spain': { code: 'ES', flag: '🇪🇸', dialCode: '+34' },
  'es': { code: 'ES', flag: '🇪🇸', dialCode: '+34' },
  'italy': { code: 'IT', flag: '🇮🇹', dialCode: '+39' },
  'it': { code: 'IT', flag: '🇮🇹', dialCode: '+39' },
  'poland': { code: 'PL', flag: '🇵🇱', dialCode: '+48' },
  'pl': { code: 'PL', flag: '🇵🇱', dialCode: '+48' },
  'ukraine': { code: 'UA', flag: '🇺🇦', dialCode: '+380' },
  'ua': { code: 'UA', flag: '🇺🇦', dialCode: '+380' },
  'russia': { code: 'RU', flag: '🇷🇺', dialCode: '+7' },
  'ru': { code: 'RU', flag: '🇷🇺', dialCode: '+7' },
  'sweden': { code: 'SE', flag: '🇸🇪', dialCode: '+46' },
  'se': { code: 'SE', flag: '🇸🇪', dialCode: '+46' },
  'switzerland': { code: 'CH', flag: '🇨🇭', dialCode: '+41' },
  'ch': { code: 'CH', flag: '🇨🇭', dialCode: '+41' },
  'portugal': { code: 'PT', flag: '🇵🇹', dialCode: '+351' },
  'pt': { code: 'PT', flag: '🇵🇹', dialCode: '+351' },
  'turkey': { code: 'TR', flag: '🇹🇷', dialCode: '+90' },
  'tr': { code: 'TR', flag: '🇹🇷', dialCode: '+90' },
  'romania': { code: 'RO', flag: '🇷🇴', dialCode: '+40' },
  'ro': { code: 'RO', flag: '🇷🇴', dialCode: '+40' },
  'czech republic': { code: 'CZ', flag: '🇨🇿', dialCode: '+420' },
  'czechia': { code: 'CZ', flag: '🇨🇿', dialCode: '+420' },
  'cz': { code: 'CZ', flag: '🇨🇿', dialCode: '+420' },
  'austria': { code: 'AT', flag: '🇦🇹', dialCode: '+43' },
  'at': { code: 'AT', flag: '🇦🇹', dialCode: '+43' },
  'belgium': { code: 'BE', flag: '🇧🇪', dialCode: '+32' },
  'be': { code: 'BE', flag: '🇧🇪', dialCode: '+32' },
  'ireland': { code: 'IE', flag: '🇮🇪', dialCode: '+353' },
  'ie': { code: 'IE', flag: '🇮🇪', dialCode: '+353' },
  'finland': { code: 'FI', flag: '🇫🇮', dialCode: '+358' },
  'fi': { code: 'FI', flag: '🇫🇮', dialCode: '+358' },
  'norway': { code: 'NO', flag: '🇳🇴', dialCode: '+47' },
  'no': { code: 'NO', flag: '🇳🇴', dialCode: '+47' },
  'denmark': { code: 'DK', flag: '🇩🇰', dialCode: '+45' },
  'dk': { code: 'DK', flag: '🇩🇰', dialCode: '+45' },
  'greece': { code: 'GR', flag: '🇬🇷', dialCode: '+30' },
  'gr': { code: 'GR', flag: '🇬🇷', dialCode: '+30' },

  // Africa
  'nigeria': { code: 'NG', flag: '🇳🇬', dialCode: '+234' },
  'ng': { code: 'NG', flag: '🇳🇬', dialCode: '+234' },
  'ghana': { code: 'GH', flag: '🇬🇭', dialCode: '+233' },
  'gh': { code: 'GH', flag: '🇬🇭', dialCode: '+233' },
  'kenya': { code: 'KE', flag: '🇰🇪', dialCode: '+254' },
  'ke': { code: 'KE', flag: '🇰🇪', dialCode: '+254' },
  'south africa': { code: 'ZA', flag: '🇿🇦', dialCode: '+27' },
  'za': { code: 'ZA', flag: '🇿🇦', dialCode: '+27' },
  'egypt': { code: 'EG', flag: '🇪🇬', dialCode: '+20' },
  'eg': { code: 'EG', flag: '🇪🇬', dialCode: '+20' },
  'uganda': { code: 'UG', flag: '🇺🇬', dialCode: '+256' },
  'ug': { code: 'UG', flag: '🇺🇬', dialCode: '+256' },
  'tanzania': { code: 'TZ', flag: '🇹🇿', dialCode: '+255' },
  'tz': { code: 'TZ', flag: '🇹🇿', dialCode: '+255' },
  'cameroon': { code: 'CM', flag: '🇨🇲', dialCode: '+237' },
  'cm': { code: 'CM', flag: '🇨🇲', dialCode: '+237' },
  'ivory coast': { code: 'CI', flag: '🇨🇮', dialCode: '+225' },
  'cote d\'ivoire': { code: 'CI', flag: '🇨🇮', dialCode: '+225' },
  'ci': { code: 'CI', flag: '🇨🇮', dialCode: '+225' },
  'senegal': { code: 'SN', flag: '🇸🇳', dialCode: '+221' },
  'sn': { code: 'SN', flag: '🇸🇳', dialCode: '+221' },
  'rwanda': { code: 'RW', flag: '🇷🇼', dialCode: '+250' },
  'rw': { code: 'RW', flag: '🇷🇼', dialCode: '+250' },
  'zambia': { code: 'ZM', flag: '🇿🇲', dialCode: '+260' },
  'zm': { code: 'ZM', flag: '🇿🇲', dialCode: '+260' },
  'ethiopia': { code: 'ET', flag: '🇪🇹', dialCode: '+251' },
  'et': { code: 'ET', flag: '🇪🇹', dialCode: '+251' },
  'morocco': { code: 'MA', flag: '🇲🇦', dialCode: '+212' },
  'ma': { code: 'MA', flag: '🇲🇦', dialCode: '+212' },

  // Asia & Oceania
  'india': { code: 'IN', flag: '🇮🇳', dialCode: '+91' },
  'in': { code: 'IN', flag: '🇮🇳', dialCode: '+91' },
  'philippines': { code: 'PH', flag: '🇵🇭', dialCode: '+63' },
  'ph': { code: 'PH', flag: '🇵🇭', dialCode: '+63' },
  'indonesia': { code: 'ID', flag: '🇮🇩', dialCode: '+62' },
  'id': { code: 'ID', flag: '🇮🇩', dialCode: '+62' },
  'vietnam': { code: 'VN', flag: '🇻🇳', dialCode: '+84' },
  'vn': { code: 'VN', flag: '🇻🇳', dialCode: '+84' },
  'malaysia': { code: 'MY', flag: '🇲🇾', dialCode: '+60' },
  'my': { code: 'MY', flag: '🇲🇾', dialCode: '+60' },
  'thailand': { code: 'TH', flag: '🇹🇭', dialCode: '+66' },
  'th': { code: 'TH', flag: '🇹🇭', dialCode: '+66' },
  'singapore': { code: 'SG', flag: '🇸🇬', dialCode: '+65' },
  'sg': { code: 'SG', flag: '🇸🇬', dialCode: '+65' },
  'pakistan': { code: 'PK', flag: '🇵🇰', dialCode: '+92' },
  'pk': { code: 'PK', flag: '🇵🇰', dialCode: '+92' },
  'bangladesh': { code: 'BD', flag: '🇧🇩', dialCode: '+880' },
  'bd': { code: 'BD', flag: '🇧🇩', dialCode: '+880' },
  'china': { code: 'CN', flag: '🇨🇳', dialCode: '+86' },
  'cn': { code: 'CN', flag: '🇨🇳', dialCode: '+86' },
  'japan': { code: 'JP', flag: '🇯🇵', dialCode: '+81' },
  'jp': { code: 'JP', flag: '🇯🇵', dialCode: '+81' },
  'south korea': { code: 'KR', flag: '🇰🇷', dialCode: '+82' },
  'korea': { code: 'KR', flag: '🇰🇷', dialCode: '+82' },
  'kr': { code: 'KR', flag: '🇰🇷', dialCode: '+82' },
  'australia': { code: 'AU', flag: '🇦🇺', dialCode: '+61' },
  'au': { code: 'AU', flag: '🇦🇺', dialCode: '+61' },
  'new zealand': { code: 'NZ', flag: '🇳🇿', dialCode: '+64' },
  'nz': { code: 'NZ', flag: '🇳🇿', dialCode: '+64' },
  'israel': { code: 'IL', flag: '🇮🇱', dialCode: '+972' },
  'il': { code: 'IL', flag: '🇮🇱', dialCode: '+972' },
  'united arab emirates': { code: 'AE', flag: '🇦🇪', dialCode: '+971' },
  'uae': { code: 'AE', flag: '🇦🇪', dialCode: '+971' },
  'ae': { code: 'AE', flag: '🇦🇪', dialCode: '+971' },
  'saudi arabia': { code: 'SA', flag: '🇸🇦', dialCode: '+966' },
  'sa': { code: 'SA', flag: '🇸🇦', dialCode: '+966' },
  'brazil': { code: 'BR', flag: '🇧🇷', dialCode: '+55' },
  'br': { code: 'BR', flag: '🇧🇷', dialCode: '+55' },
  'argentina': { code: 'AR', flag: '🇦🇷', dialCode: '+54' },
  'ar': { code: 'AR', flag: '🇦🇷', dialCode: '+54' },
  'colombia': { code: 'CO', flag: '🇨🇴', dialCode: '+57' },
  'co': { code: 'CO', flag: '🇨🇴', dialCode: '+57' },
  'chile': { code: 'CL', flag: '🇨🇱', dialCode: '+56' },
  'cl': { code: 'CL', flag: '🇨🇱', dialCode: '+56' },
  'peru': { code: 'PE', flag: '🇵🇪', dialCode: '+51' },
  'pe': { code: 'PE', flag: '🇵🇪', dialCode: '+51' }
};

export function resolveCountryFlag(countryNameOrCode?: string, fallbackFlag = '🌐'): string {
  if (!countryNameOrCode) return fallbackFlag;
  const clean = countryNameOrCode.trim().toLowerCase();
  
  if (COUNTRY_LOOKUP[clean]) {
    return COUNTRY_LOOKUP[clean].flag;
  }

  // Check if string contains country name
  for (const [key, val] of Object.entries(COUNTRY_LOOKUP)) {
    if (key.length > 3 && clean.includes(key)) {
      return val.flag;
    }
  }

  // If 2 uppercase letters or length 2
  if (countryNameOrCode.length === 2) {
    const generated = getFlagEmojiFromIso(countryNameOrCode);
    if (generated && generated !== '🌐') return generated;
  }

  return fallbackFlag;
}

export function resolveCountryDialCode(countryNameOrCode?: string): string {
  if (!countryNameOrCode) return '';
  const clean = countryNameOrCode.trim().toLowerCase();
  if (COUNTRY_LOOKUP[clean]) {
    return COUNTRY_LOOKUP[clean].dialCode;
  }
  return '';
}
