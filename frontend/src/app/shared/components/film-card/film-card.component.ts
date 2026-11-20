import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioFilm } from '../../../core/models/api.models';
import { LightboxService } from '../../../core/services/lightbox.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-film-card',
  imports: [RouterLink, IconComponent],
  templateUrl: './film-card.component.html',
  styleUrl: './film-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-large]': 'size() === "large"' },
})
export class FilmCardComponent {
  private readonly lightbox = inject(LightboxService);

  readonly film = input.required<PortfolioFilm>();
  readonly size = input<'default' | 'large'>('default');
  readonly eager = input(false);

  /** First segment of the gear line, e.g. "RED Komodo 6K". */
  protected readonly primaryGear = computed(() => this.film().camera_gear.split('•')[0]?.trim() ?? '');
  protected readonly shortCategory = computed(() => this.film().category.name.replace(/\s*\(.*\)\s*$/, ''));

  protected play(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const film = this.film();
    this.lightbox.open({
      title: film.title,
      subtitle: `${film.client_name} · ${film.production_year}`,
      embedUrl: film.video_embed_url,
    });
  }
}
