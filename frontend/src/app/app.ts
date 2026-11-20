import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { VideoLightboxModalComponent } from './shared/components/video-lightbox-modal/video-lightbox-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, VideoLightboxModalComponent],
  template: `
    <a class="skip-link" href="#main">Preskočiť na obsah</a>
    <app-navbar />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
    <app-video-lightbox-modal />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
      outline: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
