import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Inline SVG icon set (24×24, stroke-based). Paths are static constants
 * authored in this file, so trusting them is safe.
 */
const ICONS = {
  play: '<path d="M7 4.5v15l12.5-7.5L7 4.5Z" fill="currentColor" stroke="none"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  megaphone: '<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  drone: '<circle cx="5.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7.5 7.5 10 10M16.5 7.5 14 10M7.5 16.5 10 14M16.5 16.5 14 14"/><rect x="10" y="10" width="4" height="4" rx="1"/>',
  camera: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H15a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 15 18H4.5A1.5 1.5 0 0 1 3 16.5v-9Z"/><path d="m16.5 10.5 4.5-3v9l-4.5-3"/>',
  aperture: '<circle cx="12" cy="12" r="9"/><path d="M14.3 3.3 9 12.5M20.5 9.5H9.8M18.5 18 13 8.8M9.7 20.7 15 11.5M3.5 14.5h10.7M5.5 6l5.5 9.2"/>',
  light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  'phone-call': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  'map-pin': '<path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  quote: '<path d="M10 7H6a2 2 0 0 0-2 2v4h5v5H4M20 7h-4a2 2 0 0 0-2 2v4h5v5h-5" />',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/>',
  vimeo: '<path d="M3 8.5 4 9.8s1.8-1.4 2.4-.7c.6.7 2.9 9.2 3.7 10.8.7 1.4 2.6 3.2 4.7.4 2.1-2.7 6.4-8.5 6.7-11.6.3-3.1-1.6-4.6-4.3-3.2-2.7 1.3-3.4 4.6-3.4 4.6s1.2-.9 2-.2c.8.7-.4 3.4-1.6 4.8-1.1 1.4-2 2.1-2.6.8-.6-1.3-1.6-7-2.3-8.7-.8-1.7-3.3.3-4.3 1Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".8" fill="currentColor"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 10v6.5M7.5 7.3v.2M11 16.5V10M11 12.8c0-1.6 1.1-2.8 2.6-2.8s2.4 1 2.4 2.8v3.7"/>',
} as const;

export type IconName = keyof typeof ICONS;

export function isIconName(value: string): value is IconName {
  return value in ICONS;
}

@Component({
  selector: 'app-icon',
  template: '',
  host: {
    'aria-hidden': 'true',
    '[innerHTML]': 'svg()',
    '[style.--icon-size]': 'size() + "px"',
  },
  styles: `
    :host {
      display: inline-flex;
      width: var(--icon-size, 20px);
      height: var(--icon-size, 20px);
      flex-shrink: 0;
      line-height: 0;
    }
    :host ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly size = input<number>(20);
  readonly strokeWidth = input<number>(1.6);

  protected readonly svg = computed<SafeHtml>(() => {
    const name = this.name();
    const body = isIconName(name) ? ICONS[name] : ICONS.film;
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${this.strokeWidth()}" stroke-linecap="round" stroke-linejoin="round" focusable="false">${body}</svg>`,
    );
  });
}
