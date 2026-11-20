import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';

/** Adds a cinematic fade-up when the element enters the viewport. */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal', '[style.transition-delay]': 'delay() + "ms"' },
})
export class RevealDirective {
  readonly delay = input<number>(0, { alias: 'appReveal', transform: (v: unknown) => Number(v) || 0 });

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        el.classList.add('is-visible');
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
              observer.disconnect();
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
