import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
  }

  protected close(): void {
    this.lightbox.close();
  }

  /** Fired by the native dialog (Escape key or programmatic close). */
  protected onDialogClose(): void {
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
