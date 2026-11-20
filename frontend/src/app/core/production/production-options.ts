/**
 * Production domain options shared by the budget estimator and the brief wizard.
 * Keys match the Django `ProductionBriefRequest` choices.
 */

export type VideoTypeKey =
  | 'reklamny_spot'
  | 'firemne_video'
  | 'event_aftermovie'
  | 'social_media_reels'
  | 'produktove_video'
  | 'dronove_zabery';

export type TierKey = 'kompakt' | 'standard' | 'premium';

export type AddonKey = 'dron' | 'motion' | 'voiceover' | 'social';

export interface VideoTypeOption {
  readonly key: VideoTypeKey;
  readonly label: string;
  readonly hint: string;
  /** Creative + post-production base cost in EUR. */
  readonly basePrice: number;
  readonly baseWeeks: number;
  /** Whether this type appears in the on-page estimator. */
  readonly inEstimator: boolean;
}

export interface TierOption {
  readonly key: TierKey;
  readonly label: string;
  readonly shortLabel: string;
  readonly hint: string;
  readonly dayRate: number;
  readonly baseMultiplier: number;
  readonly extraWeeks: number;
  readonly crew: readonly string[];
}

export interface AddonOption {
  readonly key: AddonKey;
  readonly label: string;
  readonly hint: string;
  readonly price: number;
  /** Added per filming day on top of `price`. */
  readonly pricePerDay: number;
  readonly extraWeeks: number;
  readonly crew?: string;
}

export const VIDEO_TYPES: readonly VideoTypeOption[] = [
  {
    key: 'reklamny_spot',
    label: 'Reklamný spot',
    hint: 'TV, online a kino kampane',
    basePrice: 2400,
    baseWeeks: 3,
    inEstimator: true,
  },
  {
    key: 'firemne_video',
    label: 'Firemné / Brand video',
    hint: 'Imidž, nábor, PR',
    basePrice: 1200,
    baseWeeks: 2,
    inEstimator: true,
  },
  {
    key: 'event_aftermovie',
    label: 'Event aftermovie',
    hint: 'Konferencie, festivaly, firemné akcie',
    basePrice: 800,
    baseWeeks: 1,
    inEstimator: true,
  },
  {
    key: 'social_media_reels',
    label: 'Séria Reels / TikTok videí',
    hint: 'Vertikálny obsah 9:16 v sérii',
    basePrice: 950,
    baseWeeks: 1,
    inEstimator: true,
  },
  {
    key: 'produktove_video',
    label: 'Produktové video',
    hint: 'E-shop, gastro, makro detaily',
    basePrice: 750,
    baseWeeks: 1,
    inEstimator: true,
  },
  {
    key: 'dronove_zabery',
    label: 'Letecké zábery dronom',
    hint: 'Cinema a FPV lety',
    basePrice: 400,
    baseWeeks: 1,
    inEstimator: false,
  },
];

export const TIERS: readonly TierOption[] = [
  {
    key: 'kompakt',
    label: 'Kompaktná produkcia',
    shortLabel: 'Kompaktný tím (4K)',
    hint: '1 kameraman, 4K, prirodzené svetlo',
    dayRate: 650,
    baseMultiplier: 1,
    extraWeeks: 0,
    crew: ['Kameraman-režisér', 'Strihač & colorist'],
  },
  {
    key: 'standard',
    label: 'Štandardná štúdiová produkcia',
    shortLabel: 'Štandardná produkcia (štáb + svetlá)',
    hint: 'Štáb, profesionálne svetlá, zvuk',
    dayRate: 1450,
    baseMultiplier: 1.4,
    extraWeeks: 1,
    crew: ['Režisér', 'Kameraman / DOP', 'Osvetľovač (gaffer)', 'Zvukár', 'Strihač & colorist'],
  },
  {
    key: 'premium',
    label: 'Prémiová reklamná produkcia',
    shortLabel: 'Prémiová cinema produkcia (RED/ARRI + casting)',
    hint: 'Cinema kamera, herci, lokácie',
    dayRate: 3400,
    baseMultiplier: 2.2,
    extraWeeks: 2,
    crew: [
      'Výkonný producent',
      'Režisér',
      'Kameraman / DOP',
      'Asistent kamery (focus puller)',
      'Gaffer + osvetľovači',
      'Zvukár',
      'Casting & herci',
      'Stylista / make-up',
      'Strihač & colorist',
    ],
  },
];

export const FILMING_DAYS: readonly number[] = [0.5, 1, 2, 3, 5];

export const ADDONS: readonly AddonOption[] = [
  {
    key: 'dron',
    label: 'Letecké zábery dronom',
    hint: 'Certifikovaný pilot, 4K/8K',
    price: 350,
    pricePerDay: 200,
    extraWeeks: 0,
    crew: 'Certifikovaný pilot dronu',
  },
  {
    key: 'motion',
    label: '2D/3D motion grafika a titulky',
    hint: 'Animované logá, infografiky',
    price: 650,
    pricePerDay: 0,
    extraWeeks: 1,
    crew: 'Motion dizajnér',
  },
  {
    key: 'voiceover',
    label: 'Profesionálny voiceover & zvukový mix',
    hint: 'Speaker, štúdio, mastering',
    price: 420,
    pricePerDay: 0,
    extraWeeks: 0,
    crew: 'Voiceover speaker & zvukový majster',
  },
  {
    key: 'social',
    label: 'Formáty pre sociálne siete 9:16',
    hint: 'Cutdowny pre Reels, TikTok, Shorts',
    price: 290,
    pricePerDay: 0,
    extraWeeks: 0,
  },
];

export const TARGET_PLATFORMS: readonly string[] = [
  'YouTube / Web',
  'Instagram / TikTok (9:16)',
  'TV vysielanie',
  'LinkedIn',
  'Facebook',
  'Interné použitie / prezentácie',
];

/** Maps portfolio/service category slugs to brief video types. */
export const CATEGORY_TO_VIDEO_TYPE: Readonly<Record<string, VideoTypeKey>> = {
  'reklamne-spoty': 'reklamny_spot',
  'firemne-videa': 'firemne_video',
  'event-aftermovies': 'event_aftermovie',
  'social-media-reels': 'social_media_reels',
  'produktove-gastro-videa': 'produktove_video',
  'dronove-zabery': 'dronove_zabery',
};

export function findVideoType(key: string | null | undefined): VideoTypeOption | undefined {
  return VIDEO_TYPES.find((t) => t.key === key);
}

export function findTier(key: string | null | undefined): TierOption | undefined {
  return TIERS.find((t) => t.key === key);
}

export function isAddonKey(value: string): value is AddonKey {
  return ADDONS.some((a) => a.key === value);
}

// -----------------------------------------------------------------------------
// Estimate calculation
// -----------------------------------------------------------------------------

export interface EstimateInput {
  readonly videoType: VideoTypeKey;
  readonly tier: TierKey;
  readonly days: number;
  readonly addons: readonly AddonKey[];
}

export interface EstimateResult {
  readonly min: number;
  readonly max: number;
  readonly crew: readonly string[];
  readonly weeksMin: number;
  readonly weeksMax: number;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const type = findVideoType(input.videoType) ?? VIDEO_TYPES[0];
  const tier = findTier(input.tier) ?? TIERS[0];
  const addons = ADDONS.filter((a) => input.addons.includes(a.key));
  const days = Math.max(0.5, input.days);

  const base = type.basePrice * tier.baseMultiplier + tier.dayRate * days;
  const addonCost = addons.reduce((sum, a) => sum + a.price + a.pricePerDay * days, 0);
  const total = base + addonCost;

  const weeksMin =
    type.baseWeeks +
    tier.extraWeeks +
    (days >= 3 ? 1 : 0) +
    addons.reduce((sum, a) => sum + a.extraWeeks, 0);

  const crew = [...tier.crew];
  for (const addon of addons) {
    if (addon.crew && !crew.includes(addon.crew)) {
      crew.splice(crew.length - 1, 0, addon.crew);
    }
  }

  return {
    min: roundTo(total * 0.9, 100),
    max: roundTo(total * 1.25, 100),
    crew,
    weeksMin,
    weeksMax: weeksMin + 1,
  };
}

const eur = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export function formatEur(value: number): string {
  return eur.format(value);
}

export function formatDays(days: number): string {
  const n = String(days).replace('.', ',');
  if (!Number.isInteger(days)) return `${n} dňa`;
  if (days === 1) return '1 deň';
  if (days >= 2 && days <= 4) return `${n} dni`;
  return `${n} dní`;
}

export function formatWeeks(min: number, max: number): string {
  const unit = max <= 4 ? 'týždne' : 'týždňov';
  return `${min} – ${max} ${max === 1 ? 'týždeň' : unit}`;
}

export function summarizeEstimate(input: EstimateInput, result: EstimateResult): string {
  const type = findVideoType(input.videoType)?.label ?? input.videoType;
  const tier = findTier(input.tier)?.label ?? input.tier;
  const addons = ADDONS.filter((a) => input.addons.includes(a.key)).map((a) => a.label);
  return [
    type,
    tier,
    formatDays(input.days),
    addons.length ? `+ ${addons.join(', ')}` : '',
    `${formatEur(result.min)} – ${formatEur(result.max)}`,
    formatWeeks(result.weeksMin, result.weeksMax),
  ]
    .filter(Boolean)
    .join(' • ')
    .slice(0, 300);
}

/** Short tab labels for portfolio filters (falls back to the category name). */
export const CATEGORY_SHORT_LABELS: Readonly<Record<string, string>> = {
  'reklamne-spoty': 'Reklamné spoty',
  'firemne-videa': 'Firemné videá',
  'event-aftermovies': 'Eventy',
  'social-media-reels': 'Social Media / Reels',
  'produktove-gastro-videa': 'Produkty & gastro',
  'dronove-zabery': 'Dron',
};
