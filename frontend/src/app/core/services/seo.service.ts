import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { SITE_CONFIG } from '../config/site.config';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(pageTitle: string | null, description?: string, image?: string): void {
    const fullTitle = pageTitle ? `${pageTitle} | ${SITE_CONFIG.seo.titleSuffix}` : SITE_CONFIG.seo.titleSuffix;
    const desc = description ?? SITE_CONFIG.seo.defaultDescription;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: this.document.location?.href ?? '' });
    if (image ?? SITE_CONFIG.heroImageUrl) {
      this.meta.updateTag({ property: 'og:image', content: image ?? SITE_CONFIG.heroImageUrl });
    }
  }
}
