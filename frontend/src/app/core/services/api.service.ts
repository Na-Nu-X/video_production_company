import { HttpClient, HttpParams, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  BriefRequestPayload,
  CrewMember,
  PortfolioFilm,
  PortfolioFilmDetail,
  ProductionCategory,
  ProductionService,
} from '../models/api.models';

export interface ListQuery {
  readonly category?: string | null;
  readonly featured?: boolean;
  readonly search?: string;
  readonly ordering?: string;
}

/**
 * Thin, signal-first API facade.
 *
 * The `*Resource` methods create `httpResource`s and therefore must be called
 * from an injection context (e.g. a component field initializer).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  url(path: string, query?: ListQuery): string {
    let params = new HttpParams();
    if (query?.category) params = params.set('category', query.category);
    if (query?.featured !== undefined) params = params.set('featured', String(query.featured));
    if (query?.search) params = params.set('search', query.search);
    if (query?.ordering) params = params.set('ordering', query.ordering);
    const qs = params.toString();
    return `${this.baseUrl}/${path}${qs ? `?${qs}` : ''}`;
  }

  categoriesResource(): HttpResourceRef<ProductionCategory[]> {
    return httpResource<ProductionCategory[]>(() => this.url('categories/'), { defaultValue: [] });
  }

  portfolioResource(query: () => ListQuery = () => ({})): HttpResourceRef<PortfolioFilm[]> {
    return httpResource<PortfolioFilm[]>(() => this.url('portfolio/', query()), { defaultValue: [] });
  }

  filmResource(slug: () => string | undefined): HttpResourceRef<PortfolioFilmDetail | undefined> {
    return httpResource<PortfolioFilmDetail>(() => {
      const s = slug();
      return s ? `${this.baseUrl}/portfolio/${encodeURIComponent(s)}/` : undefined;
    });
  }

  servicesResource(query: () => ListQuery = () => ({})): HttpResourceRef<ProductionService[]> {
    return httpResource<ProductionService[]>(() => this.url('services/', query()), { defaultValue: [] });
  }

  crewResource(): HttpResourceRef<CrewMember[]> {
    return httpResource<CrewMember[]>(() => this.url('crew/'), { defaultValue: [] });
  }

  submitBrief(payload: BriefRequestPayload): Observable<BriefRequestPayload & { id: number }> {
    return this.http.post<BriefRequestPayload & { id: number }>(`${this.baseUrl}/briefs/`, payload);
  }
}
