import { Injectable, signal } from '@angular/core';

export interface LightboxVideo {
  readonly title: string;
  readonly embedUrl: string;
  readonly subtitle?: string;
}

/** Global state for the single, app-wide video lightbox. */
@Injectable({ providedIn: 'root' })
export class LightboxService {
  private readonly _current = signal<LightboxVideo | null>(null);
  readonly current = this._current.asReadonly();

  open(video: LightboxVideo): void {
    this._current.set(video);
  }

  close(): void {
    this._current.set(null);
  }
}
