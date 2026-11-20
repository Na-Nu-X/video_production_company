import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

interface NavLink {
  readonly label: string;
  readonly path: string;
  readonly fragment?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-scrolled]': 'scrolled()',
    '[class.is-open]': 'menuOpen()',
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class NavbarComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly phoneHref = `tel:${SITE_CONFIG.contact.producerPhone.replace(/\s+/g, '')}`;
  protected readonly links: readonly NavLink[] = [
    { label: 'Portfólio', path: '/portfolio' },
    { label: 'Služby & Technika', path: '/sluzby' },
    { label: 'O štúdiu', path: '/o-studiu' },
    { label: 'Kalkulačka ceny', path: '/', fragment: 'kalkulacka' },
  ];

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));

    effect(() => {
      this.document.body.classList.toggle('is-scroll-locked', this.menuOpen());
    });
  }

  protected onScroll(): void {
    this.scrolled.set((this.document.defaultView?.scrollY ?? 0) > 24);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
