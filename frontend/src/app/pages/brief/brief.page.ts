import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ApiFieldErrors, BriefRequestPayload } from '../../core/models/api.models';
import {
  ADDONS,
  AddonKey,
  calculateEstimate,
  FILMING_DAYS,
  findTier,
  findVideoType,
  formatDays,
  formatEur,
  formatWeeks,
  isAddonKey,
  summarizeEstimate,
  TARGET_PLATFORMS,
  TierKey,
  TIERS,
  VIDEO_TYPES,
  VideoTypeKey,
} from '../../core/production/production-options';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

type Step = 1 | 2 | 3;
type ContactField = 'company_name' | 'contact_name' | 'email' | 'phone' | 'project_description' | 'gdpr_consent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+0-9 ()\-/]*$/;

function toggled<T>(set: ReadonlySet<T>, value: T): ReadonlySet<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

@Component({
  selector: 'app-brief-page',
  imports: [RouterLink, IconComponent],
  templateUrl: './brief.page.html',
  styleUrl: './brief.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BriefPage {
  private readonly api = inject(ApiService);
  private readonly formTop = viewChild<ElementRef<HTMLElement>>('formTop');

  protected readonly site = SITE_CONFIG;
  protected readonly phoneHref = `tel:${SITE_CONFIG.contact.producerPhone.replace(/\s+/g, '')}`;
  protected readonly videoTypes = VIDEO_TYPES;
  protected readonly tiers = TIERS;
  protected readonly dayOptions = FILMING_DAYS;
  protected readonly addonOptions = ADDONS;
  protected readonly platformOptions = TARGET_PLATFORMS;
  protected readonly deadlinePresets = ['Čo najskôr', 'Do 1 mesiaca', 'Do 3 mesiacov', 'Termín je flexibilný'];
  protected readonly steps = [
    { n: 1 as Step, label: 'Typ videa' },
    { n: 2 as Step, label: 'Rozsah produkcie' },
    { n: 3 as Step, label: 'Kontakt & brief' },
  ];
  protected readonly formatDays = formatDays;

  // ---------------------------------------------------------------- state
  protected readonly step = signal<Step>(1);
  protected readonly videoType = signal<VideoTypeKey | null>(null);
  protected readonly tier = signal<TierKey | null>(null);
  protected readonly days = signal<number>(1);
  protected readonly addons = signal<ReadonlySet<AddonKey>>(new Set());
  protected readonly platforms = signal<ReadonlySet<string>>(new Set());
  protected readonly deadline = signal('');
  protected readonly contact = signal<Record<Exclude<ContactField, 'gdpr_consent'>, string>>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    project_description: '',
  });
  protected readonly gdpr = signal(false);
  protected readonly prefilledFromEstimator = signal(false);

  protected readonly attempted = signal<ReadonlySet<Step>>(new Set());
  protected readonly serverErrors = signal<ApiFieldErrors>({});
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  // ---------------------------------------------------------------- derived
  protected readonly selectedType = computed(() => findVideoType(this.videoType()));
  protected readonly selectedTier = computed(() => findTier(this.tier()));

  protected readonly estimateInput = computed(() => {
    const videoType = this.videoType();
    const tier = this.tier();
    return videoType && tier ? { videoType, tier, days: this.days(), addons: [...this.addons()] } : null;
  });

  protected readonly estimate = computed(() => {
    const input = this.estimateInput();
    return input ? calculateEstimate(input) : null;
  });

  protected readonly estimateRange = computed(() => {
    const e = this.estimate();
    return e ? `${formatEur(e.min)} – ${formatEur(e.max)}` : null;
  });

  protected readonly estimateDelivery = computed(() => {
    const e = this.estimate();
    return e ? formatWeeks(e.weeksMin, e.weeksMax) : null;
  });

  protected readonly step1Errors = computed(() => ({
    videoType: this.videoType() ? null : 'Vyberte, prosím, typ videa.',
  }));

  protected readonly step2Errors = computed(() => ({
    tier: this.tier() ? null : 'Vyberte rozsah produkcie.',
  }));

  protected readonly step3Errors = computed(() => {
    const c = this.contact();
    const server = this.serverErrors();
    const first = (key: keyof ApiFieldErrors) => {
      const v = server[key];
      return Array.isArray(v) ? v[0] : (v ?? null);
    };
    return {
      contact_name: c.contact_name.trim().length < 2 ? 'Zadajte, prosím, vaše meno.' : first('contact_name'),
      email: !c.email.trim()
        ? 'Zadajte, prosím, e-mail.'
        : !EMAIL_RE.test(c.email.trim())
          ? 'Zadajte platnú e-mailovú adresu.'
          : first('email'),
      phone:
        c.phone.trim() && (!PHONE_RE.test(c.phone) || c.phone.replace(/\D/g, '').length < 9)
          ? 'Zadajte platné telefónne číslo, napr. +421 900 123 456.'
          : first('phone'),
      company_name: first('company_name'),
      project_description:
        c.project_description.trim().length < 20
          ? 'Popíšte projekt aspoň v pár vetách (min. 20 znakov).'
          : first('project_description'),
      gdpr_consent: this.gdpr() ? null : 'Na odoslanie je potrebný súhlas so spracovaním osobných údajov.',
    } satisfies Record<ContactField, string | null>;
  });

  protected readonly platformsLabel = computed(() => [...this.platforms()].join(', '));

  protected readonly descriptionLength = computed(() => this.contact().project_description.trim().length);

  constructor() {
    inject(SeoService).update(
      'Nezáväzný dopyt',
      'Pošlite nám brief na video – reklamný spot, firemné video, aftermovie či Reels. Odpovieme do 24 hodín s návrhom a cenovou ponukou.',
    );
    this.applyQueryParams();
  }

  // ---------------------------------------------------------------- prefill
  private applyQueryParams(): void {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;

    const type = findVideoType(params.get('type'));
    if (type) this.videoType.set(type.key);

    const tier = findTier(params.get('tier'));
    if (tier) this.tier.set(tier.key);

    const days = Number.parseFloat(params.get('days') ?? '');
    if (Number.isFinite(days) && days >= 0.5 && days <= 60) {
      this.days.set(FILMING_DAYS.includes(days) ? days : Math.min(...FILMING_DAYS.filter((d) => d >= days), 5));
    }

    const addons = (params.get('addons') ?? '').split(',').filter(isAddonKey);
    if (addons.length) this.addons.set(new Set(addons));

    const inspiration = params.get('inspiration')?.slice(0, 200);
    if (inspiration) {
      this.updateContact(
        'project_description',
        `Páči sa nám váš projekt „${inspiration}“ a chceli by sme niečo podobné pre našu firmu. `,
      );
    }

    this.prefilledFromEstimator.set(!!(type && tier && params.has('days')));
    if (type && tier) this.step.set(3);
    else if (type) this.step.set(2);
  }

  // ---------------------------------------------------------------- actions
  protected toggleAddon(key: AddonKey): void {
    this.addons.update((current) => toggled(current, key));
  }

  protected togglePlatform(platform: string): void {
    this.platforms.update((current) => toggled(current, platform));
  }

  protected updateContact(field: Exclude<ContactField, 'gdpr_consent'>, value: string): void {
    this.contact.update((c) => ({ ...c, [field]: value }));
    if (this.serverErrors()[field]) {
      this.serverErrors.update((e) => ({ ...e, [field]: undefined }));
    }
  }

  protected onInput(field: Exclude<ContactField, 'gdpr_consent'>, event: Event): void {
    this.updateContact(field, (event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  protected showErrors(step: Step): boolean {
    return this.attempted().has(step);
  }

  protected goTo(target: Step): void {
    // Moving backwards is always allowed; forward requires valid previous steps.
    for (let s = 1 as Step; s < target; s = (s + 1) as Step) {
      if (!this.isStepValid(s)) {
        this.markAttempted(s);
        this.step.set(s);
        this.scrollToForm();
        return;
      }
    }
    this.step.set(target);
    this.scrollToForm();
  }

  protected next(): void {
    const current = this.step();
    if (!this.isStepValid(current)) {
      this.markAttempted(current);
      return;
    }
    if (current < 3) this.goTo((current + 1) as Step);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitError.set(null);
    ([1, 2, 3] as Step[]).forEach((s) => this.markAttempted(s));

    const invalid = ([1, 2, 3] as Step[]).find((s) => !this.isStepValid(s));
    if (invalid) {
      this.step.set(invalid);
      this.focusFirstInvalid();
      return;
    }

    const input = this.estimateInput();
    const estimate = this.estimate();
    const c = this.contact();
    const payload: BriefRequestPayload = {
      video_type: this.videoType()!,
      production_tier: this.tier()!,
      filming_days: String(this.days()),
      target_platforms: [...this.platforms()],
      desired_deadline: this.deadline().trim().slice(0, 120),
      company_name: c.company_name.trim(),
      contact_name: c.contact_name.trim(),
      email: c.email.trim(),
      phone: c.phone.trim(),
      project_description: c.project_description.trim(),
      estimate_summary: input && estimate ? summarizeEstimate(input, estimate) : '',
      gdpr_consent: this.gdpr(),
    };

    this.submitting.set(true);
    this.api.submitBrief(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.scrollToForm();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.handleSubmitError(err);
      },
    });
  }

  private handleSubmitError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 400 && err.error && typeof err.error === 'object') {
        const errors = err.error as ApiFieldErrors;
        this.serverErrors.set(errors);
        if (errors.video_type) this.step.set(1);
        else if (errors.production_tier || errors.filming_days || errors.target_platforms) this.step.set(2);
        this.submitError.set('Niektoré údaje nie sú v poriadku. Skontrolujte, prosím, označené polia.');
        return;
      }
      if (err.status === 429) {
        this.submitError.set('Odoslali ste priveľa dopytov naraz. Skúste to o chvíľu alebo nám zavolajte.');
        return;
      }
    }
    this.submitError.set(
      `Dopyt sa nepodarilo odoslať. Skúste to znova alebo nám napíšte na ${this.site.contact.newBusinessEmail}.`,
    );
  }

  protected startOver(): void {
    this.videoType.set(null);
    this.tier.set(null);
    this.days.set(1);
    this.addons.set(new Set());
    this.platforms.set(new Set());
    this.deadline.set('');
    this.contact.set({ company_name: '', contact_name: '', email: '', phone: '', project_description: '' });
    this.gdpr.set(false);
    this.attempted.set(new Set());
    this.serverErrors.set({});
    this.submitted.set(false);
    this.step.set(1);
  }

  // ---------------------------------------------------------------- helpers
  private isStepValid(step: Step): boolean {
    const errors = step === 1 ? this.step1Errors() : step === 2 ? this.step2Errors() : this.step3Errors();
    return Object.values(errors).every((e) => !e);
  }

  private markAttempted(step: Step): void {
    this.attempted.update((s) => new Set(s).add(step));
  }

  private scrollToForm(): void {
    queueMicrotask(() =>
      this.formTop()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  private focusFirstInvalid(): void {
    setTimeout(() => {
      const el = this.formTop()?.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"], .has-error button');
      el?.focus();
    });
  }
}
