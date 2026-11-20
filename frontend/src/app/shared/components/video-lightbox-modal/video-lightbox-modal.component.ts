import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { LightboxService } from '../../../core/services/lightbox.service';
import { buildEmbedUrl } from '../../../core/utils/video-embed';
import { IconComponent } from '../icon/icon.component';

/**
 * App-wide video lightbox built on the native <dialog> element
 * (focus trapping, Escape handling and inert background for free).
 * Only allow-listed YouTube / Vimeo embed URLs are ever trusted.
 */
@Component({
  selector: 'app-video-lightbox-modal',
  imports: [IconComponent],
  templateUrl: './video-lightbox-modal.component.html',
  styleUrl: './video-lightbox-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoLightboxModalComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private returnFocusTo: HTMLElement | null = null;

  protected readonly lightbox = inject(LightboxService);
  protected readonly video = this.lightbox.current;

  protected readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const video = this.video();
    const url = video ? buildEmbedUrl(video.embedUrl, { autoplay: true }) : null;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  constructor() {
    effect(() => {
      const dialog = this.dialogRef().nativeElement;
      const isOpen = this.video() !== null;
      if (isOpen && !dialog.open) {
        this.returnFocusTo = this.document.activeElement as HTMLElement | null;
        dialog.showModal();
        this.document.body.classList.add('is-scroll-locked');
      } else if (!isOpen && dialog.open) {
        dialog.close();
      }
    });

    // Some close paths (e.g. Escape while focus is inside the cross-origin
    // player iframe) can close the dialog without our (close) handler running.
    // Watching the `open` attribute keeps state in sync no matter how it closed.
    afterNextRender(() => {
      const dialog = this.dialogRef().nativeElement;
      const observer = new MutationObserver(() => {
        if (!dialog.open && this.video() !== null) this.onDialogClose();
      });
      observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private readonly destroyRef = inject(DestroyRef);

  protected close(): void {
    this.lightbox.close();
  }

  /** Fired by the native dialog (Escape key or programmatic close). */
  protected onDialogClose(): void {
    if (this.video() === null && !this.document.body.classList.contains('is-scroll-locked')) return;
    this.document.body.classList.remove('is-scroll-locked');
    this.lightbox.close();
    this.returnFocusTo?.focus?.();
    this.returnFocusTo = null;
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogRef().nativeElement) {
      this.close();
    }
  }
}
