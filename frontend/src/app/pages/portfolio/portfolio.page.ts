import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CATEGORY_SHORT_LABELS } from '../../core/production/production-options';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { FilmCardComponent } from '../../shared/components/film-card/film-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface FilterTab {
  readonly slug: string | null;
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-portfolio-page',
  imports: [FilmCardComponent, IconComponent, RevealDirective],
  templateUrl: './portfolio.page.html',
  styleUrl: './portfolio.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  /** Bound from the `?kategoria=` query param. */
  readonly kategoria = input<string | undefined>();

  protected readonly films = this.api.portfolioResource();
  protected readonly categories = this.api.categoriesResource();
  protected readonly search = signal('');

  protected readonly activeCategory = computed(() => this.kategoria() ?? null);

  protected readonly tabs = computed<FilterTab[]>(() => {
    const films = this.films.value();
    const cats = this.categories.value().filter((c) => c.film_count > 0);
    return [
      { slug: null, label: 'Všetko', count: films.length },
      ...cats.map((c) => ({
        slug: c.slug,
        label: CATEGORY_SHORT_LABELS[c.slug] ?? c.name,
        count: c.film_count,
      })),
    ];
  });

  protected readonly visibleFilms = computed(() => {
    const category = this.activeCategory();
    const term = this.normalize(this.search().trim());
    return this.films.value().filter((film) => {
      if (category && film.category.slug !== category) return false;
      if (!term) return true;
      return this.normalize(
        `${film.title} ${film.client_name} ${film.client_sector} ${film.camera_gear} ${film.category.name}`,
      ).includes(term);
    });
  });

  constructor() {
    inject(SeoService).update(
      'Portfólio',
      'Reklamné spoty, firemné videá, aftermovies, Reels a letecké zábery dronom – pozrite si vybrané projekty nášho štúdia.',
    );
  }

  protected selectCategory(slug: string | null): void {
    void this.router.navigate([], {
      queryParams: { kategoria: slug },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected resetFilters(): void {
    this.search.set('');
    this.selectCategory(null);
  }

  /** Case- and diacritics-insensitive comparison (e.g. "zabery" matches "zábery"). */
  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
}
