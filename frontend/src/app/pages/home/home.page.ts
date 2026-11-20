import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ApiService } from '../../core/services/api.service';
import { LightboxService } from '../../core/services/lightbox.service';
import { SeoService } from '../../core/services/seo.service';
import { FilmCardComponent } from '../../shared/components/film-card/film-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { VideoBudgetEstimatorComponent } from '../../shared/components/video-budget-estimator/video-budget-estimator.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { EurPipe } from '../../shared/pipes/eur.pipe';

interface WorkflowStep {
  readonly number: string;
  readonly title: string;
  readonly text: string;
  readonly duration: string;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, FilmCardComponent, IconComponent, VideoBudgetEstimatorComponent, RevealDirective, EurPipe],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly api = inject(ApiService);
  private readonly lightbox = inject(LightboxService);

  protected readonly site = SITE_CONFIG;
  protected readonly films = this.api.portfolioResource(() => ({ featured: true }));
  protected readonly services = this.api.servicesResource(() => ({ featured: true }));

  protected readonly featuredFilms = computed(() => this.films.value().slice(0, 5));
  protected readonly timecode = signal('00:00:00:00');

  protected readonly workflow: readonly WorkflowStep[] = [
    {
      number: '01',
      title: 'Kreatíva & scenár',
      text: 'Úvodný workshop, kreatívny námet, scenár a storyboard. Spoločne zadefinujeme cieľ, publikum a kľúčovú myšlienku.',
      duration: '3 – 7 dní',
    },
    {
      number: '02',
      title: 'Predprodukcia a lokácie',
      text: 'Výber lokácií, casting, technický scenár, harmonogram natáčania a povolenia – vrátane letov dronom.',
      duration: '1 – 2 týždne',
    },
    {
      number: '03',
      title: 'Natáčanie na pľaci',
      text: 'Skúsený štáb, cinema kamery RED a Sony, profesionálne svetlo a zvuk. Vy sa venujete biznisu, my obrazu.',
      duration: '0,5 – 5 dní',
    },
    {
      number: '04',
      title: 'Strih, color grading a zvuk',
      text: 'Strih, motion grafika, DaVinci Resolve color grading, sound design a mastering. Dve kolá pripomienok v cene.',
      duration: '1 – 3 týždne',
    },
  ];

  constructor() {
    inject(SeoService).update(null);
    this.startTimecode();
  }

  protected playShowreel(): void {
    this.lightbox.open({
      title: `${this.site.studioName} – ${this.site.showreel.title}`,
      subtitle: `Showreel · ${this.site.showreel.duration}`,
      embedUrl: this.site.showreel.embedUrl,
    });
  }

  /** Decorative running SMPTE-style timecode in the hero HUD (24 fps). */
  private startTimecode(): void {
    if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    const pad = (n: number) => String(n).padStart(2, '0');
    const id = window.setInterval(() => {
      const totalFrames = Math.floor(((performance.now() - start) / 1000) * 24);
      const frames = totalFrames % 24;
      const seconds = Math.floor(totalFrames / 24);
      this.timecode.set(`${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frames)}`);
    }, 1000 / 24);
    inject(DestroyRef).onDestroy(() => window.clearInterval(id));
  }
}
