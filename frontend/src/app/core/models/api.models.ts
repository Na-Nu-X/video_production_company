/** API contracts mirroring the Django REST Framework serializers. */

export interface CategoryRef {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly icon_name: string;
}

export interface ProductionCategory extends CategoryRef {
  readonly short_summary: string;
  readonly display_order: number;
  readonly film_count: number;
  readonly service_count: number;
}

export interface PortfolioFilm {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly client_name: string;
  readonly client_sector: string;
  readonly category: CategoryRef;
  readonly production_year: number;
  readonly duration_timecode: string;
  readonly camera_gear: string;
  readonly filming_days: number;
  readonly video_embed_url: string;
  readonly thumbnail_url: string;
  readonly deliverables_tags: readonly string[];
  readonly is_featured: boolean;
}

export interface PortfolioFilmDetail extends PortfolioFilm {
  readonly creative_brief: string;
  readonly execution_summary: string;
  readonly related_films: readonly PortfolioFilm[];
}

export interface ProductionService {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly category: CategoryRef;
  readonly short_description: string;
  readonly detailed_description: string;
  readonly included_phases: readonly string[];
  readonly typical_delivery_time: string;
  /** Decimal serialized as string by DRF, e.g. "1900.00". */
  readonly starting_price_eur: string | null;
  readonly is_featured: boolean;
}

export interface CrewMember {
  readonly id: number;
  readonly full_name: string;
  readonly role_title: string;
  readonly bio: string;
  readonly specialty_gear: string;
  readonly photo_url: string;
}

export interface BriefRequestPayload {
  video_type: string;
  production_tier: string;
  filming_days: string;
  target_platforms: string[];
  desired_deadline: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  project_description: string;
  estimate_summary: string;
  gdpr_consent: boolean;
}

export type ApiFieldErrors = Partial<Record<keyof BriefRequestPayload | 'non_field_errors' | 'detail', string[] | string>>;
