import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { CATEGORY_TO_VIDEO_TYPE } from '../../core/production/production-options';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { buildEmbedUrl } from '../../core/utils/video-embed';
import { FilmCardComponent } from '../../shared/components/film-card/film-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-portfolio-detail-page',
  imports: [RouterLink, FilmCardComponent, IconComponent],
  templateUrl: './portfolio-detail.page.html',
  styleUrl: './portfolio-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioDetailPage {
  private readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);

  /** Bound from the `:slug` route param. */
  readonly slug = input.required<string>();

  protected readonly film = this.api.filmResource(() => this.slug());

  protected readonly notFound = computed(() => {
    const err = this.film.error();
    return err instanceof HttpErrorResponse && err.status === 404;
  });

  protected readonly playerUrl = computed<SafeResourceUrl | null>(() => {
    const film = this.film.value();
    const url = film ? buildEmbedUrl(film.video_embed_url) : null;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  protected readonly gearItems = computed(() =>
    (this.film.value()?.camera_gear ?? '')
      .split('•')
      .map((g) => g.trim())
      .filter(Boolean),
  );

  /** Query params for the "similar video" CTA → pre-filled brief wizard. */
  protected readonly briefParams = computed(() => {
    const film = this.film.value();
    if (!film) return {};
    return {
      type: CATEGORY_TO_VIDEO_TYPE[film.category.slug] ?? null,
      tier: film.category.slug === 'reklamne-spoty' ? 'premium' : 'standard',
      days: Math.min(Math.max(film.filming_days, 1), 5),
      inspiration: film.title,
    };
  });

  constructor() {
    effect(() => {
      const film = this.film.value();
      if (film) {
        this.seo.update(film.title, `${film.client_name}: ${film.creative_brief.slice(0, 150)}…`, film.thumbnail_url);
      } else if (this.notFound()) {
        this.seo.update('Projekt sa nenašiel');
      }
    });
  }
}
