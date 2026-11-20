import { HttpClient, HttpParams, httpResource, HttpResourceRef } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
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

/**
 * Read-only view of an `httpResource`. Unlike the raw ref, `value()` never
 * throws while the resource is in an error state (Angular 22 behaviour) —
 * it returns the fallback instead, so templates can read it unconditionally.
 */
export interface ApiResource<T> {
  readonly value: Signal<T>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<unknown>;
  reload(): boolean;
}

function toApiResource<T>(ref: HttpResourceRef<T>, fallback: T): ApiResource<T> {
  return {
    value: computed(() => (ref.hasValue() ? ref.value() : fallback)),
    isLoading: ref.isLoading,
    error: ref.error,
    reload: () => ref.reload(),
  };
}

export interface ListQuery {
  readonly category?: string | null;
  readonly featured?: boolean;
  readonly search?: string;
  readonly ordering?: string;
}

/**
 * Thin, signal-first API facade.
 *
 * The `*Resource` methods create `httpResource`s (wrapped as {@link ApiResource}) and therefore must be called
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

  categoriesResource(): ApiResource<ProductionCategory[]> {
    return this.list<ProductionCategory>(() => this.url('categories/'));
  }

  portfolioResource(query: () => ListQuery = () => ({})): ApiResource<PortfolioFilm[]> {
    return this.list<PortfolioFilm>(() => this.url('portfolio/', query()));
  }

  filmResource(slug: () => string | undefined): ApiResource<PortfolioFilmDetail | undefined> {
    const ref = httpResource<PortfolioFilmDetail>(() => {
      const s = slug();
      return s ? `${this.baseUrl}/portfolio/${encodeURIComponent(s)}/` : undefined;
    });
    return toApiResource(ref, undefined);
  }

  servicesResource(query: () => ListQuery = () => ({})): ApiResource<ProductionService[]> {
    return this.list<ProductionService>(() => this.url('services/', query()));
  }

  crewResource(): ApiResource<CrewMember[]> {
    return this.list<CrewMember>(() => this.url('crew/'));
  }

  private list<T>(url: () => string): ApiResource<T[]> {
    return toApiResource(httpResource<T[]>(url, { defaultValue: [] }), []);
  }

  submitBrief(payload: BriefRequestPayload): Observable<BriefRequestPayload & { id: number }> {
    return this.http.post<BriefRequestPayload & { id: number }>(`${this.baseUrl}/briefs/`, payload);
  }
}
