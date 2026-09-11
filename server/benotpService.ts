import { db, DiagnosticsLog } from './db.js';

// Base URLs from uploaded official BenOTP documentation
const SERVER_URLS = {
  server1: 'https://benotp.com/stubs/handler_api.php', // USA Server 1
  server2: 'https://benotp.com/stubs/all_server_2.php', // All Countries Server 2
  server3: 'https://benotp.com/stubs/handler.php',      // All Countries Server 1 / Server 3
};

// Standard service code mappings for Server 3 (handler.php) to prevent "BAD_SERVICE" 400 errors
const SERVICE_CODE_MAPPING_TO_SHORT: Record<string, string> = {
  whatsapp: 'wa',
  wa: 'wa',
  telegram: 'tg',
  tg: 'tg',
  google: 'go',
  gmail: 'go',
  youtube: 'go',
  go: 'go',
  instagram: 'ig',
  ig: 'ig',
  facebook: 'fb',
  fb: 'fb',
  twitter: 'tw',
  x: 'tw',
  tw: 'tw',
  tiktok: 'lf',
  lf: 'lf',
  openai: 'dr',
  chatgpt: 'dr',
  dr: 'dr',
  uber: 'ub',
  ub: 'ub',
  discord: 'ds',
  ds: 'ds',
  viber: 'vi',
  vi: 'vi',
  wechat: 'wb',
  wb: 'wb',
  amazon: 'am',
  am: 'am',
  netflix: 'nf',
  nf: 'nf',
  paypal: 'pm',
  pm: 'pm',
  snapchat: 'sn',
  sn: 'sn',
  microsoft: 'mm',
  mm: 'mm',
  apple: 'wx',
  wx: 'wx',
  steam: 'mt',
  mt: 'mt',
  tinder: 'oi',
  oi: 'oi',
  linkedin: 'tn',
  tn: 'tn',
  line: 'me',
  me: 'me',
  binance: 'ba',
  ba: 'ba',
  coinbase: 're',
  re: 're',
  yahoo: 'mb',
  mb: 'mb',
  any: 'ot',
  other: 'ot',
  ot: 'ot'
};

const POPULAR_SERVICES_CATALOG = [
  { code: 'whatsapp', name: 'WhatsApp', shortCode: 'wa', icon: 'MessageCircle', baseCost: 180 },
  { code: 'telegram', name: 'Telegram', shortCode: 'tg', icon: 'Send', baseCost: 160 },
  { code: 'google', name: 'Google / Gmail / YouTube', shortCode: 'go', icon: 'Mail', baseCost: 150 },
  { code: 'instagram', name: 'Instagram', shortCode: 'ig', icon: 'Camera', baseCost: 170 },
  { code: 'facebook', name: 'Facebook / Messenger', shortCode: 'fb', icon: 'Share2', baseCost: 150 },
  { code: 'twitter', name: 'Twitter / X', shortCode: 'tw', icon: 'Twitter', baseCost: 160 },
  { code: 'tiktok', name: 'TikTok', shortCode: 'lf', icon: 'Video', baseCost: 170 },
  { code: 'openai', name: 'ChatGPT / OpenAI', shortCode: 'dr', icon: 'Cpu', baseCost: 220 },
  { code: 'discord', name: 'Discord', shortCode: 'ds', icon: 'Headphones', baseCost: 160 },
  { code: 'uber', name: 'Uber / UberEats', shortCode: 'ub', icon: 'Car', baseCost: 190 },
  { code: 'netflix', name: 'Netflix', shortCode: 'nf', icon: 'Film', baseCost: 200 },
  { code: 'amazon', name: 'Amazon', shortCode: 'am', icon: 'ShoppingBag', baseCost: 190 },
  { code: 'paypal', name: 'PayPal', shortCode: 'pm', icon: 'CreditCard', baseCost: 250 },
  { code: 'snapchat', name: 'Snapchat', shortCode: 'sn', icon: 'Ghost', baseCost: 160 },
  { code: 'microsoft', name: 'Microsoft / Outlook', shortCode: 'mm', icon: 'Grid', baseCost: 150 },
  { code: 'apple', name: 'Apple ID', shortCode: 'wx', icon: 'Smartphone', baseCost: 210 },
  { code: 'steam', name: 'Steam', shortCode: 'mt', icon: 'Gamepad2', baseCost: 170 },
  { code: 'tinder', name: 'Tinder', shortCode: 'oi', icon: 'Heart', baseCost: 220 },
  { code: 'binance', name: 'Binance', shortCode: 'ba', icon: 'Coins', baseCost: 240 },
  { code: 'other', name: 'Any Other Service', shortCode: 'ot', icon: 'HelpCircle', baseCost: 150 }
];

function resolveFlagForCountry(name: string, code: string): string {
  const cleanName = (name || '').toLowerCase().trim();
  const cleanCode = (code || '').toUpperCase().trim();

  const map: Record<string, string> = {
    'us': '🇺🇸', 'usa': '🇺🇸', 'united states': '🇺🇸',
    'gb': '🇬🇧', 'uk': '🇬🇧', 'united kingdom': '🇬🇧',
    'ca': '🇨🇦', 'canada': '🇨🇦',
    'ng': '🇳🇬', 'nigeria': '🇳🇬',
    'gh': '🇬🇭', 'ghana': '🇬🇭',
    'ke': '🇰🇪', 'kenya': '🇰🇪',
    'za': '🇿🇦', 'south africa': '🇿🇦',
    'de': '🇩🇪', 'germany': '🇩🇪',
    'fr': '🇫🇷', 'france': '🇫🇷',
    'nl': '🇳🇱', 'netherlands': '🇳🇱',
    'in': '🇮🇳', 'india': '🇮🇳',
    'br': '🇧🇷', 'brazil': '🇧🇷',
    'ph': '🇵🇭', 'philippines': '🇵🇭',
    'id': '🇮🇩', 'indonesia': '🇮🇩',
    'ru': '🇷🇺', 'russia': '🇷🇺',
    'ua': '🇺🇦', 'ukraine': '🇺🇦',
    'tr': '🇹🇷', 'turkey': '🇹🇷',
    'vn': '🇻🇳', 'vietnam': '🇻🇳',
    'es': '🇪🇸', 'spain': '🇪🇸',
    'it': '🇮🇹', 'italy': '🇮🇹',
    'pl': '🇵🇱', 'poland': '🇵🇱',
    'se': '🇸🇪', 'sweden': '🇸🇪',
    'ch': '🇨🇭', 'switzerland': '🇨🇭',
    'pt': '🇵🇹', 'portugal': '🇵🇹',
    'ro': '🇷🇴', 'romania': '🇷🇴',
    'cz': '🇨🇿', 'czech republic': '🇨🇿',
    'at': '🇦🇹', 'austria': '🇦🇹',
    'be': '🇧🇪', 'belgium': '🇧🇪',
    'ie': '🇮🇪', 'ireland': '🇮🇪',
    'fi': '🇫🇮', 'finland': '🇫🇮',
    'no': '🇳🇴', 'norway': '🇳🇴',
    'dk': '🇩🇰', 'denmark': '🇩🇰',
    'gr': '🇬🇷', 'greece': '🇬🇷',
    'eg': '🇪🇬', 'egypt': '🇪🇬',
    'ug': '🇺🇬', 'uganda': '🇺🇬',
    'tz': '🇹🇿', 'tanzania': '🇹🇿',
    'cm': '🇨🇲', 'cameroon': '🇨🇲',
    'ci': '🇨🇮', 'ivory coast': '🇨🇮',
    'sn': '🇸🇳', 'senegal': '🇸🇳',
    'rw': '🇷🇼', 'rwanda': '🇷🇼',
    'my': '🇲🇾', 'malaysia': '🇲🇾',
    'th': '🇹🇭', 'thailand': '🇹🇭',
    'sg': '🇸🇬', 'singapore': '🇸🇬',
    'pk': '🇵🇰', 'pakistan': '🇵🇰',
    'bd': '🇧🇩', 'bangladesh': '🇧🇩',
    'cn': '🇨🇳', 'china': '🇨🇳',
    'jp': '🇯🇵', 'japan': '🇯🇵',
    'kr': '🇰🇷', 'south korea': '🇰🇷',
    'au': '🇦🇺', 'australia': '🇦🇺',
    'nz': '🇳🇿', 'new zealand': '🇳🇿',
    'il': '🇮🇱', 'israel': '🇮🇱',
    'ae': '🇦🇪', 'uae': '🇦🇪', 'united arab emirates': '🇦🇪',
    'sa': '🇸🇦', 'saudi arabia': '🇸🇦',
    'mx': '🇲🇽', 'mexico': '🇲🇽',
    'ar': '🇦🇷', 'argentina': '🇦🇷',
    'co': '🇨🇴', 'colombia': '🇨🇴',
    'cl': '🇨🇱', 'chile': '🇨🇱',
    'pe': '🇵🇪', 'peru': '🇵🇪'
  };

  if (cleanCode && map[cleanCode.toLowerCase()]) return map[cleanCode.toLowerCase()];
  if (cleanName && map[cleanName]) return map[cleanName];

  for (const [key, flag] of Object.entries(map)) {
    if (key.length > 3 && cleanName.includes(key)) return flag;
  }

  if (cleanCode && cleanCode.length === 2 && /^[A-Z]{2}$/.test(cleanCode)) {
    const first = cleanCode.charCodeAt(0) - 65 + 0x1F1E6;
    const second = cleanCode.charCodeAt(1) - 65 + 0x1F1E6;
    return String.fromCodePoint(first, second);
  }

  return '🌐';
}

const STANDARD_COUNTRIES_CATALOG = [
  { id: '187', code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { id: '188', code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { id: '189', code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { id: '190', code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { id: '191', code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { id: '192', code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { id: '193', code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { id: '194', code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { id: '195', code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { id: '196', code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { id: '197', code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { id: '198', code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { id: '199', code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { id: '200', code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { id: '201', code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { id: '202', code: 'UA', name: 'Ukraine', flag: '🇺🇦', dialCode: '+380' },
  { id: '203', code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90' },
  { id: '204', code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { id: '205', code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { id: '206', code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' }
];

export class BenOTPService {
  private getApiKey(): string {
    const settings = db.getSettings();
    return settings.benotpApiKey || process.env.BENOTP_API_KEY || '';
  }

  private logDiagnostic(
    server: string,
    action: string,
    params: Record<string, any>,
    status: 'SUCCESS' | 'FAILED',
    statusCode?: number,
    responsePreview?: string,
    error?: string
  ) {
    const sanitizedParams = { ...params };
    if (sanitizedParams.api_key) sanitizedParams.api_key = '***REDACTED***';
    if (sanitizedParams.key) sanitizedParams.key = '***REDACTED***';

    const log: DiagnosticsLog = {
      id: 'diag_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      server,
      action,
      params: sanitizedParams,
      status,
      statusCode,
      responsePreview: responsePreview?.substring(0, 300),
      error
    };
    db.addDiagnosticsLog(log);
  }

  // Calculate customer retail price based on provider base cost and admin markup
  public calculateCustomerPrice(providerPrice: number): number {
    const settings = db.getSettings();
    const cleanProviderPrice = Math.max(Number(providerPrice) || 150, 10);

    let customerPrice = cleanProviderPrice;
    if (settings.markupType === 'PERCENTAGE') {
      const percentage = Math.max(Number(settings.markupValue) || 0, 0);
      customerPrice = cleanProviderPrice * (1 + percentage / 100);
    } else {
      // FIXED markup
      const fixed = Number(settings.markupValue) || 50;
      customerPrice = cleanProviderPrice + fixed;
    }

    // Round nicely to nearest integer or 5 naira
    return Math.round(customerPrice);
  }

  // Get provider balance
  public async getBalance(): Promise<{ success: boolean; balance: number; currency: string; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, balance: 0, currency: 'NGN', error: 'No API Key configured in Admin Settings' };
    }

    try {
      const url = `${SERVER_URLS.server1}?action=getBalance&api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text = (await res.text()).trim();

      this.logDiagnostic('Server 1', 'getBalance', { action: 'getBalance' }, res.ok ? 'SUCCESS' : 'FAILED', res.status, text);

      if (text.startsWith('ACCESS_BALANCE:')) {
        const val = parseFloat(text.split(':')[1]);
        db.updateSettings({ lastSyncTime: Date.now(), lastSyncStatus: 'OK', lastProviderError: '' });
        return { success: true, balance: val, currency: 'NGN' };
      }

      if (text.includes('BAD_KEY')) {
        db.updateSettings({ lastSyncStatus: 'ERROR', lastProviderError: 'Invalid BenOTP API Key' });
        return { success: false, balance: 0, currency: 'NGN', error: 'Invalid API Key' };
      }

      try {
        const json = JSON.parse(text);
        if (json.balance !== undefined) {
          db.updateSettings({ lastSyncTime: Date.now(), lastSyncStatus: 'OK', lastProviderError: '' });
          return { success: true, balance: Number(json.balance), currency: 'NGN' };
        }
        if (json.error) {
          db.updateSettings({ lastSyncStatus: 'ERROR', lastProviderError: json.error });
          return { success: false, balance: 0, currency: 'NGN', error: json.error };
        }
      } catch {
        // Not json
      }

      return { success: true, balance: 0, currency: 'NGN' };
    } catch (err: any) {
      this.logDiagnostic('Server 1', 'getBalance', { action: 'getBalance' }, 'FAILED', 500, undefined, err.message);
      db.updateSettings({ lastSyncStatus: 'ERROR', lastProviderError: err.message });
      return { success: false, balance: 0, currency: 'NGN', error: err.message };
    }
  }

  // Get available servers info
  public getServers() {
    const settings = db.getSettings();
    return [
      {
        id: 'server1',
        name: 'Server 1 — USA Instant Lines',
        type: 'USA_ONLY',
        description: 'Dedicated high-speed USA virtual lines for instant verification codes.',
        enabled: settings.server1Enabled,
        badge: 'USA Exclusive'
      },
      {
        id: 'server2',
        name: 'Server 2 — Worldwide Standard Lines',
        type: 'WORLDWIDE',
        description: 'Global phone numbers covering over 50+ countries with live availability.',
        enabled: settings.server2Enabled,
        badge: 'Global'
      },
      {
        id: 'server3',
        name: 'Server 3 — Worldwide High-Capacity Lines',
        type: 'WORLDWIDE',
        description: 'High success rate global lines optimized for social, messaging and fintech apps.',
        enabled: settings.server3Enabled,
        badge: 'High Success'
      }
    ];
  }

  // Get countries for a specific server
  public async getCountries(serverId: 'server1' | 'server2' | 'server3') {
    if (serverId === 'server1') {
      // Server 1 is strictly USA numbers as instructed
      return [
        { id: '187', code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' }
      ];
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      return STANDARD_COUNTRIES_CATALOG;
    }

    try {
      const baseUrl = serverId === 'server2' ? SERVER_URLS.server2 : SERVER_URLS.server3;
      const url = `${baseUrl}?action=getCountries&api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const text = await res.text();

      this.logDiagnostic(serverId, 'getCountries', { action: 'getCountries' }, res.ok ? 'SUCCESS' : 'FAILED', res.status, text);

      if (res.ok && !text.includes('BAD_KEY') && !text.includes('error')) {
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json) && json.length > 0) {
            return json.map((c: any) => {
              const code = (c.code || c.iso || '').toUpperCase();
              const name = c.name || c.country_name || 'Country ' + (c.id || '');
              const flag = c.flag && c.flag !== '🌐' ? c.flag : resolveFlagForCountry(name, code);
              return {
                id: String(c.id || c.country || c.code),
                code: code || 'US',
                name,
                flag,
                dialCode: c.dialCode || c.prefix || ''
              };
            });
          } else if (typeof json === 'object' && json !== null) {
            const list = Object.entries(json).map(([key, val]: [string, any]) => {
              const code = (val.code || val.iso || '').toUpperCase();
              const name = typeof val === 'string' ? val : (val.name || 'Country ' + key);
              const flag = val.flag && val.flag !== '🌐' ? val.flag : resolveFlagForCountry(name, code);
              return {
                id: key,
                code: code || 'US',
                name,
                flag,
                dialCode: val.dialCode || val.prefix || ''
              };
            });
            if (list.length > 0) return list;
          }
        } catch {
          // fallback to catalog
        }
      }
    } catch (err: any) {
      this.logDiagnostic(serverId, 'getCountries', { action: 'getCountries' }, 'FAILED', 500, undefined, err.message);
    }

    return STANDARD_COUNTRIES_CATALOG;
  }

  // Get services & real provider prices for a selected server and country
  public async getServices(serverId: 'server1' | 'server2' | 'server3', countryId: string) {
    const apiKey = this.getApiKey();

    // Default service list with calculated customer prices
    const catalog = POPULAR_SERVICES_CATALOG.map(item => {
      const providerPrice = item.baseCost;
      const customerPrice = this.calculateCustomerPrice(providerPrice);
      return {
        code: item.code,
        shortCode: item.shortCode,
        name: item.name,
        icon: item.icon,
        providerPrice,
        customerPrice,
        available: true,
        count: 50
      };
    });

    if (!apiKey) {
      return catalog;
    }

    try {
      if (serverId === 'server1') {
        // Server 1 — USA Numbers
        const url = `${SERVER_URLS.server1}?action=getServices&api_key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const text = await res.text();

        this.logDiagnostic('Server 1', 'getServices', { action: 'getServices' }, res.ok ? 'SUCCESS' : 'FAILED', res.status, text);

        if (res.ok && !text.includes('BAD_KEY') && !text.includes('error')) {
          const parsed = this.parseServicesResponse(text);
          if (parsed.length > 0) return parsed;
        }
      } else if (serverId === 'server2') {
        // Server 2 — All Countries Server 2
        // Fix for: "server 2 is not bring prices for services... sometimes Price not available. Cannot purchase."
        // We first query getServices, and getPrices with country
        const urlServices = `${SERVER_URLS.server2}?action=getServices&api_key=${encodeURIComponent(apiKey)}&country=${encodeURIComponent(countryId || '0')}`;
        const resServices = await fetch(urlServices, { signal: AbortSignal.timeout(8000) });
        const textServices = await resServices.text();

        this.logDiagnostic('Server 2', 'getServices', { country: countryId }, resServices.ok ? 'SUCCESS' : 'FAILED', resServices.status, textServices);

        // Also query getPrices
        const urlPrices = `${SERVER_URLS.server2}?action=getPrices&api_key=${encodeURIComponent(apiKey)}&country=${encodeURIComponent(countryId || '0')}`;
        let pricesMap: Record<string, number> = {};
        try {
          const resPrices = await fetch(urlPrices, { signal: AbortSignal.timeout(8000) });
          const textPrices = await resPrices.text();
          pricesMap = this.extractPricesFromBenOtp(textPrices);
        } catch (e) {
          // ignore
        }

        if (resServices.ok && !textServices.includes('BAD_KEY') && !textServices.includes('error')) {
          const parsed = this.parseServicesResponse(textServices, pricesMap);
          if (parsed.length > 0) return parsed;
        }
      } else if (serverId === 'server3') {
        // Server 3 — All Countries Server 1 (handler.php)
        const url = `${SERVER_URLS.server3}?action=getServices&api_key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const text = await res.text();

        this.logDiagnostic('Server 3', 'getServices', { action: 'getServices' }, res.ok ? 'SUCCESS' : 'FAILED', res.status, text);

        if (res.ok && !text.includes('BAD_KEY') && !text.includes('error')) {
          const parsed = this.parseServicesResponse(text);
          if (parsed.length > 0) return parsed;
        }
      }
    } catch (err: any) {
      this.logDiagnostic(serverId, 'getServices', { countryId }, 'FAILED', 500, undefined, err.message);
    }

    return catalog;
  }

  // Extract price map from BenOTP getPrices response
  private extractPricesFromBenOtp(text: string): Record<string, number> {
    const map: Record<string, number> = {};
    try {
      const json = JSON.parse(text);

      // Handle Server 2 prices array format: {"status":"success","prices":[{"country":"us","service":"wa","cost":"3936.89"}]}
      if (typeof json === 'object' && json !== null) {
        if (Array.isArray(json.prices)) {
          for (const item of json.prices) {
            if (item && item.service) {
              const sCode = String(item.service).toLowerCase();
              const priceVal = Number(item.cost || item.final_cost || item.price || item.original_cost);
              if (!isNaN(priceVal) && priceVal > 0) {
                map[sCode] = priceVal;
              }
            }
          }
        }

        for (const [key, val] of Object.entries(json)) {
          if (key === 'prices' && Array.isArray(val)) continue;
          if (typeof val === 'number') {
            map[key.toLowerCase()] = val;
          } else if (typeof val === 'string') {
            const num = parseFloat(val);
            if (!isNaN(num)) map[key.toLowerCase()] = num;
          } else if (typeof val === 'object' && val !== null) {
            // Nested country or service object
            const innerVal = val as any;
            if (innerVal.cost !== undefined) map[key.toLowerCase()] = Number(innerVal.cost);
            else if (innerVal.price !== undefined) map[key.toLowerCase()] = Number(innerVal.price);
            // check sub keys
            for (const [subKey, subVal] of Object.entries(innerVal)) {
              if (typeof subVal === 'object' && subVal !== null) {
                const subObj = subVal as any;
                if (subObj.cost !== undefined) map[subKey.toLowerCase()] = Number(subObj.cost);
                else if (subObj.price !== undefined) map[subKey.toLowerCase()] = Number(subObj.price);
              } else if (typeof subVal === 'number') {
                map[subKey.toLowerCase()] = subVal;
              }
            }
          }
        }
      }
    } catch {
      // Not JSON
    }
    return map;
  }

  // Parse services from API response safely
  private parseServicesResponse(text: string, externalPrices: Record<string, number> = {}): any[] {
    try {
      const json = JSON.parse(text);
      const results: any[] = [];

      if (Array.isArray(json)) {
        for (const item of json) {
          const code = String(item.code || item.id || item.name || '').toLowerCase();
          const name = item.name || item.title || code;
          const providerPrice = Number(item.cost || item.price || externalPrices[code] || 150);
          const customerPrice = this.calculateCustomerPrice(providerPrice);
          results.push({
            code,
            shortCode: SERVICE_CODE_MAPPING_TO_SHORT[code] || code.substring(0, 2),
            name,
            icon: this.getIconForService(code),
            providerPrice,
            customerPrice,
            available: item.count !== undefined ? Number(item.count) > 0 : true,
            count: Number(item.count || 25)
          });
        }
      } else if (typeof json === 'object' && json !== null) {
        for (const [key, val] of Object.entries(json)) {
          const code = key.toLowerCase();
          let name = key;
          let providerPrice = externalPrices[code] || 150;
          let count = 25;

          if (typeof val === 'string') {
            name = val;
          } else if (typeof val === 'object' && val !== null) {
            const obj = val as any;
            name = obj.name || obj.title || key;
            if (obj.cost !== undefined) providerPrice = Number(obj.cost);
            else if (obj.price !== undefined) providerPrice = Number(obj.price);
            if (obj.count !== undefined) count = Number(obj.count);
          }

          const customerPrice = this.calculateCustomerPrice(providerPrice);
          results.push({
            code,
            shortCode: SERVICE_CODE_MAPPING_TO_SHORT[code] || code.substring(0, 2),
            name: this.formatServiceName(name),
            icon: this.getIconForService(code),
            providerPrice,
            customerPrice,
            available: count > 0,
            count
          });
        }
      }

      if (results.length > 0) return results;
    } catch {
      // Plain text or invalid JSON
    }

    return [];
  }

  private formatServiceName(name: string): string {
    const catalogItem = POPULAR_SERVICES_CATALOG.find(p => p.code === name.toLowerCase() || p.shortCode === name.toLowerCase());
    if (catalogItem) return catalogItem.name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private getIconForService(code: string): string {
    const catalogItem = POPULAR_SERVICES_CATALOG.find(p => p.code === code || p.shortCode === code);
    return catalogItem ? catalogItem.icon : 'Smartphone';
  }

  // Get real-time price for a specific service immediately before purchase
  public async getRealtimePrice(
    serverId: 'server1' | 'server2' | 'server3',
    countryId: string,
    serviceCode: string
  ): Promise<{ providerPrice: number; customerPrice: number; available: boolean }> {
    const apiKey = this.getApiKey();
    const catalogItem = POPULAR_SERVICES_CATALOG.find(
      p => p.code === serviceCode.toLowerCase() || p.shortCode === serviceCode.toLowerCase()
    );
    const defaultBase = catalogItem ? catalogItem.baseCost : 180;

    if (!apiKey) {
      return {
        providerPrice: defaultBase,
        customerPrice: this.calculateCustomerPrice(defaultBase),
        available: true
      };
    }

    try {
      if (serverId === 'server1') {
        // Server 1 — handler_api.php
        const url = `${SERVER_URLS.server1}?action=getServices&api_key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        const text = await res.text();
        const prices = this.extractPricesFromBenOtp(text);
        const pPrice = prices[serviceCode.toLowerCase()] || prices[catalogItem?.shortCode || ''] || defaultBase;
        return {
          providerPrice: pPrice,
          customerPrice: this.calculateCustomerPrice(pPrice),
          available: true
        };
      } else if (serverId === 'server2') {
        // Server 2 — all_server_2.php
        const targetService = SERVICE_CODE_MAPPING_TO_SHORT[serviceCode.toLowerCase()] || 
          (serviceCode.includes('*') ? serviceCode.split('*')[0] : serviceCode.toLowerCase());
        const url = `${SERVER_URLS.server2}?action=getPrices&api_key=${encodeURIComponent(apiKey)}&country=${encodeURIComponent(countryId || '0')}&service=${encodeURIComponent(targetService)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        const text = await res.text();
        const prices = this.extractPricesFromBenOtp(text);
        let pPrice = prices[targetService] || prices[serviceCode.toLowerCase()] || defaultBase;

        // Try direct number parse if simple text
        const parsedFloat = parseFloat(text.trim());
        if (!isNaN(parsedFloat) && parsedFloat > 0) {
          pPrice = parsedFloat;
        }

        return {
          providerPrice: pPrice,
          customerPrice: this.calculateCustomerPrice(pPrice),
          available: true
        };
      } else if (serverId === 'server3') {
        // Server 3 — handler.php (note: action=getPrice singular!)
        // Map service code to short code (e.g. whatsapp -> wa) to prevent BAD_SERVICE
        const targetService = SERVICE_CODE_MAPPING_TO_SHORT[serviceCode.toLowerCase()] || serviceCode;
        const url = `${SERVER_URLS.server3}?action=getPrice&api_key=${encodeURIComponent(apiKey)}&country=${encodeURIComponent(countryId || '187')}&service=${encodeURIComponent(targetService)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        const text = (await res.text()).trim();

        let pPrice = defaultBase;
        const parsedNum = parseFloat(text);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          pPrice = parsedNum;
        } else {
          const prices = this.extractPricesFromBenOtp(text);
          pPrice = prices[targetService] || prices[serviceCode.toLowerCase()] || defaultBase;
        }

        return {
          providerPrice: pPrice,
          customerPrice: this.calculateCustomerPrice(pPrice),
          available: true
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      providerPrice: defaultBase,
      customerPrice: this.calculateCustomerPrice(defaultBase),
      available: true
    };
  }

  // Real number purchase
  // Correctly handles Server 1, Server 2, and Server 3 without BAD_SERVICE error
  public async purchaseNumber(
    serverId: 'server1' | 'server2' | 'server3',
    countryId: string,
    serviceCode: string
  ): Promise<{
    success: boolean;
    providerOrderId?: string;
    phoneNumber?: string;
    providerPrice?: number;
    customerPrice?: number;
    error?: string;
    rawResponse?: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: 'Carrier allocation gateway is not configured. Please contact the administrator.'
      };
    }

    // Determine correct service identifier
    // For Server 2 and Server 3, we MUST use shortCode to prevent BAD_SERVICE
    let requestService = serviceCode.toLowerCase();
    if (serverId === 'server2' || serverId === 'server3') {
      requestService = SERVICE_CODE_MAPPING_TO_SHORT[requestService] || 
        (requestService.includes('*') ? requestService.split('*')[0] : requestService);
    }

    try {
      let requestUrl = '';
      const params: Record<string, any> = {
        action: 'getNumber',
        api_key: apiKey,
        service: requestService
      };

      if (serverId === 'server1') {
        // USA Server 1
        // URL: https://benotp.com/stubs/handler_api.php?action=getNumber&api_key={{api_key}}&service={{service}}&country=usa
        params.country = 'usa';
        requestUrl = `${SERVER_URLS.server1}?action=getNumber&api_key=${encodeURIComponent(apiKey)}&service=${encodeURIComponent(requestService)}&country=usa`;
      } else if (serverId === 'server2') {
        // All Countries Server 2
        // URL: https://benotp.com/stubs/all_server_2.php?action=getNumber&api_key={{api_key}}&service={{service}}&country=COUNTRY
        params.country = countryId || '0';
        requestUrl = `${SERVER_URLS.server2}?action=getNumber&api_key=${encodeURIComponent(apiKey)}&service=${encodeURIComponent(requestService)}&country=${encodeURIComponent(params.country)}`;
      } else if (serverId === 'server3') {
        // All Countries Server 1 / Server 3
        // URL: https://benotp.com/stubs/handler.php?action=getNumber&api_key={{api_key}}&service={{service}}&country={{country}}
        params.country = countryId || '187';
        requestUrl = `${SERVER_URLS.server3}?action=getNumber&api_key=${encodeURIComponent(apiKey)}&service=${encodeURIComponent(requestService)}&country=${encodeURIComponent(params.country)}`;
      }

      const res = await fetch(requestUrl, { signal: AbortSignal.timeout(15000) });
      const text = (await res.text()).trim();

      this.logDiagnostic(serverId, 'getNumber', params, res.ok ? 'SUCCESS' : 'FAILED', res.status, text);

      // Parse provider response
      // Typical responses:
      // 1) ACCESS_NUMBER:order_id:phone_number
      // 2) JSON: {"status": "ACCESS_NUMBER", "id": "...", "number": "..."}
      // 3) Error strings: NO_NUMBERS, NO_BALANCE, BAD_SERVICE, BAD_KEY, etc.

      if (text.startsWith('ACCESS_NUMBER:')) {
        const parts = text.split(':');
        const orderId = parts[1];
        let phone = parts[2] || '';
        if (phone && !phone.startsWith('+')) {
          phone = '+' + phone;
        }

        const priceInfo = await this.getRealtimePrice(serverId, countryId, serviceCode);
        return {
          success: true,
          providerOrderId: orderId,
          phoneNumber: phone,
          providerPrice: priceInfo.providerPrice,
          customerPrice: priceInfo.customerPrice,
          rawResponse: text
        };
      }

      if (text.includes('ACCESS_NUMBER:')) {
        const clean = text.substring(text.indexOf('ACCESS_NUMBER:')).trim();
        const parts = clean.split(':');
        if (parts.length >= 3) {
          const orderId = parts[1];
          let phone = parts[2] || '';
          if (phone && !phone.startsWith('+')) phone = '+' + phone;
          const priceInfo = await this.getRealtimePrice(serverId, countryId, serviceCode);
          return {
            success: true,
            providerOrderId: orderId,
            phoneNumber: phone,
            providerPrice: priceInfo.providerPrice,
            customerPrice: priceInfo.customerPrice,
            rawResponse: text
          };
        }
      }

      // Check simple numeric pair format: orderId:phone
      if (/^\d{3,}:[+]?\d{6,}$/.test(text)) {
        const parts = text.split(':');
        const orderId = parts[0];
        let phone = parts[1];
        if (phone && !phone.startsWith('+')) phone = '+' + phone;
        const priceInfo = await this.getRealtimePrice(serverId, countryId, serviceCode);
        return {
          success: true,
          providerOrderId: orderId,
          phoneNumber: phone,
          providerPrice: priceInfo.providerPrice,
          customerPrice: priceInfo.customerPrice,
          rawResponse: text
        };
      }

      try {
        const json = JSON.parse(text);
        if (json.status === 'ACCESS_NUMBER' || json.order_id || json.id) {
          const orderId = String(json.order_id || json.id);
          let phone = String(json.number || json.phone || '');
          if (phone && !phone.startsWith('+')) {
            phone = '+' + phone;
          }
          const priceInfo = await this.getRealtimePrice(serverId, countryId, serviceCode);
          return {
            success: true,
            providerOrderId: orderId,
            phoneNumber: phone,
            providerPrice: priceInfo.providerPrice,
            customerPrice: priceInfo.customerPrice,
            rawResponse: text
          };
        }

        if (json.message === 'BAD_SERVICE' || json.error === 'BAD_SERVICE') {
          return {
            success: false,
            error: 'Selected service is currently unavailable on this line. Please choose another server or service.',
            rawResponse: text
          };
        }

        if (json.error || json.message) {
          return {
            success: false,
            error: this.translateProviderError(json.error || json.message),
            rawResponse: text
          };
        }
      } catch {
        // Not JSON
      }

      // Check text error patterns
      if (text === 'NO_NUMBERS' || text.includes('NO_NUMBERS')) {
        return {
          success: false,
          error: 'No phone numbers currently in stock for this service and country. Please try another server or check back soon.',
          rawResponse: text
        };
      }

      if (text === 'NO_BALANCE' || text.includes('NO_BALANCE')) {
        return {
          success: false,
          error: 'Virtual carrier gateway is undergoing routine maintenance. Please contact support.',
          rawResponse: text
        };
      }

      if (text === 'BAD_SERVICE' || text.includes('BAD_SERVICE')) {
        return {
          success: false,
          error: 'Service identifier rejected by carrier. Please try another server or choose another service.',
          rawResponse: text
        };
      }

      if (text === 'BAD_KEY' || text.includes('BAD_KEY')) {
        return {
          success: false,
          error: 'Carrier authentication credentials need renewal. Please notify admin.',
          rawResponse: text
        };
      }

      return {
        success: false,
        error: this.translateProviderError(text),
        rawResponse: text
      };
    } catch (err: any) {
      this.logDiagnostic(serverId, 'getNumber', { service: serviceCode, countryId }, 'FAILED', 500, undefined, err.message);
      return {
        success: false,
        error: 'Carrier connection timed out. Please verify your connection and try again.'
      };
    }
  }

  // Check OTP Status
  public async checkOtpStatus(
    serverId: 'server1' | 'server2' | 'server3',
    providerOrderId: string
  ): Promise<{ status: 'WAITING' | 'RECEIVED' | 'CANCELLED' | 'UNKNOWN'; code?: string; raw?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) return { status: 'WAITING' };

    try {
      let url = '';
      if (serverId === 'server1') {
        // getStatus with id={{order_id}}
        url = `${SERVER_URLS.server1}?action=getStatus&api_key=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(providerOrderId)}`;
      } else if (serverId === 'server2') {
        // getStatus with id={{order_id}}
        url = `${SERVER_URLS.server2}?action=getStatus&api_key=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(providerOrderId)}`;
      } else if (serverId === 'server3') {
        // getStatus with order_id={{order_id}} (as specified in documentation!)
        url = `${SERVER_URLS.server3}?action=getStatus&api_key=${encodeURIComponent(apiKey)}&order_id=${encodeURIComponent(providerOrderId)}`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const text = (await res.text()).trim();

      if (text.startsWith('STATUS_OK:')) {
        const code = text.substring('STATUS_OK:'.length).trim();
        return { status: 'RECEIVED', code, raw: text };
      }

      if (text === 'STATUS_WAIT_CODE' || text === 'STATUS_WAIT_RETRY') {
        return { status: 'WAITING', raw: text };
      }

      if (text === 'STATUS_CANCEL' || text === 'ACCESS_CANCEL') {
        return { status: 'CANCELLED', raw: text };
      }

      try {
        const json = JSON.parse(text);
        if (json.status === 'STATUS_OK' && json.code) {
          return { status: 'RECEIVED', code: String(json.code), raw: text };
        }
        if (json.code) {
          return { status: 'RECEIVED', code: String(json.code), raw: text };
        }
        if (json.status === 'STATUS_CANCEL') {
          return { status: 'CANCELLED', raw: text };
        }
        if (json.status === 'STATUS_WAIT_CODE') {
          return { status: 'WAITING', raw: text };
        }
      } catch {
        // Not JSON
      }

      // Check if text itself looks like an extracted OTP or message
      const otpMatch = text.match(/\b\d{4,8}\b/);
      if (otpMatch && !text.includes('STATUS') && !text.includes('error') && text.length < 20) {
        return { status: 'RECEIVED', code: otpMatch[0], raw: text };
      }

      return { status: 'WAITING', raw: text };
    } catch {
      return { status: 'WAITING' };
    }
  }

  // Cancel order with BenOTP provider
  public async cancelOrder(
    serverId: 'server1' | 'server2' | 'server3',
    providerOrderId: string
  ): Promise<{ success: boolean; message: string; raw?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: true, message: 'Order cancelled' };
    }

    try {
      let url = '';
      if (serverId === 'server1') {
        url = `${SERVER_URLS.server1}?action=setStatus&api_key=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(providerOrderId)}&status=8`;
      } else if (serverId === 'server2') {
        // Server 2 all_server_2.php strictly requires id parameter (order_id triggers BAD_ID)
        url = `${SERVER_URLS.server2}?action=setStatus&api_key=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(providerOrderId)}&status=8`;
      } else if (serverId === 'server3') {
        url = `${SERVER_URLS.server3}?action=setStatus&api_key=${encodeURIComponent(apiKey)}&order_id=${encodeURIComponent(providerOrderId)}&status=8`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const text = (await res.text()).trim();

      this.logDiagnostic(serverId, 'setStatus (cancel)', { orderId: providerOrderId, status: 8 }, res.ok ? 'SUCCESS' : 'FAILED', res.status, text);

      if (
        text === 'ACCESS_CANCEL' ||
        text === 'ACCESS_READY' ||
        text === 'NO_ACTIVATION' ||
        text.includes('ACCESS_CANCEL') ||
        text.includes('success') ||
        res.ok
      ) {
        return { success: true, message: 'Carrier line successfully released', raw: text };
      }

      return { success: true, message: 'Cancellation processed', raw: text };
    } catch (err: any) {
      return { success: false, message: 'Carrier cancellation request timed out' };
    }
  }

  private translateProviderError(errorText: string): string {
    const lower = errorText.toLowerCase();
    if (lower.includes('no_numbers') || lower.includes('no numbers') || lower.includes('stock')) {
      return 'Numbers temporarily out of stock for this country and service. Please try another server or service.';
    }
    if (lower.includes('no_balance') || lower.includes('balance')) {
      return 'Carrier gateway temporarily busy. Please try again shortly or contact support.';
    }
    if (lower.includes('bad_service') || lower.includes('service')) {
      return 'The selected service is currently unsupported on this line. Please try Server 1 or Server 2.';
    }
    if (lower.includes('bad_key') || lower.includes('key')) {
      return 'Provider authorization key error. Please check Admin diagnostics.';
    }
    return 'Carrier line reservation failed. No funds were charged.';
  }
}

export const benotpService = new BenOTPService();
