import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="page-hero not-found">
      <div class="container">
        <p class="eyebrow mono">Chyba 404 · Záber chýba</p>
        <h1 class="display-xl">Tento záber<br />sa do strihu nedostal.</h1>
        <p class="lead">Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.</p>
        <div class="actions">
          <a class="btn btn--primary" routerLink="/">Späť na úvod</a>
          <a class="btn btn--ghost" routerLink="/portfolio">Pozrieť portfólio</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .not-found {
      min-height: 80vh;
      display: flex;
      align-items: center;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).update('Stránka sa nenašla');
  }
}
