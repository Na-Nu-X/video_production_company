/**
 * White-label configuration.
 *
 * Every piece of studio branding and business information lives here, so the
 * whole site can be rebranded for a new client by editing this single file
 * (plus the colour tokens in `src/styles.scss` → `:root`).
 */

export interface SocialLink {
  readonly label: string;
  readonly icon: 'youtube' | 'vimeo' | 'instagram' | 'linkedin';
  readonly url: string;
}

export interface TrustMetric {
  readonly value: string;
  readonly label: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly author: string;
  readonly role: string;
  readonly company: string;
}

export interface SiteConfig {
  readonly studioName: string;
  readonly legalName: string;
  readonly wordmark: { readonly primary: string; readonly secondary: string };
  readonly tagline: string;
  readonly heroHeadline: { readonly lead: string; readonly highlight: string; readonly tail: string };
  readonly heroSubline: string;
  readonly heroImageUrl: string;
  readonly showreel: { readonly title: string; readonly embedUrl: string; readonly duration: string };
  readonly contact: {
    readonly producerName: string;
    readonly producerPhone: string;
    readonly newBusinessEmail: string;
    readonly officeHours: string;
    readonly responseTime: string;
  };
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly zip: string;
    readonly country: string;
    readonly mapUrl: string;
  };
  readonly company: {
    readonly ico: string;
    readonly dic: string;
    readonly icDph: string;
    readonly register: string;
  };
  readonly droneCertification: string;
  readonly social: readonly SocialLink[];
  readonly trustMetrics: readonly TrustMetric[];
  readonly clientLogos: readonly string[];
  readonly testimonials: readonly Testimonial[];
  readonly seo: { readonly titleSuffix: string; readonly defaultDescription: string };
}

export const SITE_CONFIG: SiteConfig = {
  studioName: 'Záber Films',
  legalName: 'Záber Films s.r.o.',
  wordmark: { primary: 'ZÁBER', secondary: 'films' },
  tagline: 'Reklamné spoty, firemné videá a aftermovies s filmovým rukopisom.',
  heroHeadline: {
    lead: 'Príbehy, ktoré',
    highlight: 'predávajú',
    tail: 'v každom zábere.',
  },
  heroSubline:
    'Sme bratislavské produkčné štúdio. Od kreatívneho námetu cez natáčanie cinema technikou až po color grading – dodáme video, ktoré vaša značka potrebuje.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=2400&q=80',
  showreel: {
    title: 'Showreel 2026',
    embedUrl: 'https://www.youtube.com/embed/R6MlUcmOul8',
    duration: '02:14',
  },
  contact: {
    producerName: 'Ing. Zuzana Novotná',
    producerPhone: '+421 905 123 456',
    newBusinessEmail: 'projekty@zaberfilms.sk',
    officeHours: 'Po – Pi, 9:00 – 18:00',
    responseTime: 'Odpovieme do 24 hodín v pracovné dni.',
  },
  address: {
    street: 'Mlynské nivy 12',
    city: 'Bratislava',
    zip: '821 09',
    country: 'Slovensko',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Mlynsk%C3%A9+nivy+12+Bratislava',
  },
  company: {
    ico: '54 321 987',
    dic: '2121 987 654',
    icDph: 'SK2121987654',
    register: 'Zapísaná v OR Mestského súdu Bratislava III, odd. Sro, vl. č. 123456/B',
  },
  droneCertification:
    'Piloti registrovaní u Dopravného úradu SR (kategória Open A1/A3 & A2, Specific STS-01) • poistenie zodpovednosti za lety do 1 000 000 €',
  social: [
    { label: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/' },
    { label: 'Vimeo', icon: 'vimeo', url: 'https://vimeo.com/' },
    { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/' },
    { label: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/' },
  ],
  trustMetrics: [
    { value: '12+', label: 'rokov na pľaci' },
    { value: '340+', label: 'dokončených projektov' },
    { value: '6K', label: 'cinema RAW štandard' },
    { value: '24 h', label: 'odozva na dopyt' },
  ],
  clientLogos: [
    'Zrnko & Para',
    'Nordvolt',
    'Danube Tech Summit',
    'Velopeak',
    'Tatra Peaks',
    'Auto Volta',
    'Lumen',
    'Riverside Sound',
  ],
  testimonials: [
    {
      quote:
        'Spot pre našu pražiareň vyzerá ako zahraničná kampaň. Tím od prvého stretnutia rozumel značke a predplatné v e-shope narástlo o viac ako tretinu.',
      author: 'Michaela Hrušková',
      role: 'Marketingová riaditeľka',
      company: 'Zrnko & Para Roasters',
    },
    {
      quote:
        'Aftermovie bolo hotové za 72 hodín a stalo sa naším najsilnejším argumentom pre sponzorov. Profesionálny, pokojný a neuveriteľne rýchly štáb.',
      author: 'Tomáš Bielik',
      role: 'Riaditeľ podujatia',
      company: 'Danube Tech Summit',
    },
    {
      quote:
        'Náborové video konečne ukázalo, akí sme naozaj. Kandidáti na pohovoroch spomínajú konkrétne zábery – to sa nám s inzerátmi nikdy nestalo.',
      author: 'Andrea Kollárová',
      role: 'Head of People',
      company: 'Nordvolt Systems',
    },
  ],
  seo: {
    titleSuffix: 'Záber Films – videoprodukcia Bratislava',
    defaultDescription:
      'Video produkčné štúdio z Bratislavy: reklamné spoty, firemné a náborové videá, event aftermovies, Reels produkcia a certifikované letecké zábery dronom.',
  },
};
