import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { CATEGORY_TO_VIDEO_TYPE } from '../../core/production/production-options';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { EurPipe } from '../../shared/pipes/eur.pipe';

interface GearGroup {
  readonly title: string;
  readonly icon: string;
  readonly spec: string;
  readonly imageUrl: string;
  readonly items: readonly string[];
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;

@Component({
  selector: 'app-services-page',
  imports: [RouterLink, IconComponent, RevealDirective, EurPipe],
  templateUrl: './services.page.html',
  styleUrl: './services.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {
  protected readonly site = SITE_CONFIG;
  protected readonly services = inject(ApiService).servicesResource();
  protected readonly typeFor = CATEGORY_TO_VIDEO_TYPE;

  protected readonly gear: readonly GearGroup[] = [
    {
      title: 'Cinema kamery',
      icon: 'camera',
      spec: '6K RAW · 4K 120 fps',
      imageUrl: img('1502982720700-bfff97f2ecac'),
      items: ['RED Komodo 6K (REDCODE RAW)', 'Sony FX6 Full-Frame', '2× Sony FX3 (B / C kamera)', 'ARRI Alexa Mini LF – na prémiové produkcie'],
    },
    {
      title: 'Objektívy',
      icon: 'aperture',
      spec: 'Anamorphic 1.8× · T1.5',
      imageUrl: img('1516035069371-29a1b244cc32'),
      items: ['Atlas Orion Anamorphic sada', 'Sigma Cine FF High Speed Primes', 'Laowa 24mm Probe Macro', 'Sony G Master zoomy 16-35 / 24-70 / 70-200'],
    },
    {
      title: 'Svietenie a grip',
      icon: 'light',
      spec: 'Bi-color · RGBWW',
      imageUrl: img('1626379953822-baec19c3accd'),
      items: ['Aputure 600d Pro & 300x', 'Astera Titan Tubes (RGB efekty)', 'Softboxy, rámy a difúzie 12×12', 'DJI RS 4 Pro gimbal, slider, motion-control'],
    },
    {
      title: 'Zvuk',
      icon: 'mic',
      spec: '32-bit float',
      imageUrl: img('1590602847861-f357a9332bbc'),
      items: ['Sound Devices MixPre-6 II', 'Sennheiser MKH 416 (boom)', 'Bezdrôtové mikroporty Sennheiser EW-DX', 'Voiceover kabína a mix v štúdiu'],
    },
    {
      title: 'Dronová technika',
      icon: 'drone',
      spec: '8K · FPV',
      imageUrl: img('1508614589041-895b88991e3e'),
      items: ['DJI Inspire 3 + Zenmuse X9-8K Air', 'DJI Mavic 3 Pro Cine', 'FPV Cinewhoop pre interiérové prelety', 'Certifikovaní piloti, povolenia, poistenie'],
    },
    {
      title: 'Postprodukčné štúdio',
      icon: 'monitor',
      spec: 'DaVinci Resolve Studio',
      imageUrl: img('1574717024653-61fd2cf4d44d'),
      items: ['Color grading suite s referenčným monitorom', 'DaVinci Resolve Studio & Fusion', 'Adobe Premiere Pro & After Effects', 'Sound design a mastering (EBU R128)'],
    },
  ];

  constructor() {
    inject(SeoService).update(
      'Služby & Technika',
      'Reklamné spoty, firemné videá, aftermovies, Reels produkcia a dronové zábery. Pracujeme s RED, Sony a ARRI kamerami a DaVinci Resolve.',
    );
  }
}
