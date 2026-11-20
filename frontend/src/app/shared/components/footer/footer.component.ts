import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();
  protected readonly phoneHref = `tel:${SITE_CONFIG.contact.producerPhone.replace(/\s+/g, '')}`;

  protected readonly quickLinks = [
    { label: 'Portfólio', path: '/portfolio' },
    { label: 'Služby & Technika', path: '/sluzby' },
    { label: 'O štúdiu a tím', path: '/o-studiu' },
    { label: 'Nezáväzný dopyt', path: '/dopyt' },
  ] as const;

  protected readonly serviceLinks = [
    { label: 'Reklamné spoty', category: 'reklamne-spoty' },
    { label: 'Firemné videá', category: 'firemne-videa' },
    { label: 'Event aftermovies', category: 'event-aftermovies' },
    { label: 'Reels & TikTok', category: 'social-media-reels' },
    { label: 'Zábery dronom', category: 'dronove-zabery' },
  ] as const;
}
