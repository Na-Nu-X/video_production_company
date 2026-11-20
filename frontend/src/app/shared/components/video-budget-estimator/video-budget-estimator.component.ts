import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  ADDONS,
  AddonKey,
  calculateEstimate,
  FILMING_DAYS,
  formatDays,
  formatEur,
  formatWeeks,
  TierKey,
  TIERS,
  VIDEO_TYPES,
  VideoTypeKey,
} from '../../../core/production/production-options';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-video-budget-estimator',
  imports: [IconComponent],
  templateUrl: './video-budget-estimator.component.html',
  styleUrl: './video-budget-estimator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoBudgetEstimatorComponent {
  private readonly router = inject(Router);

  /** Optional heading override when embedded on different pages. */
  readonly heading = input('Koľko bude stáť vaše video?');

  protected readonly videoTypes = VIDEO_TYPES.filter((t) => t.inEstimator);
  protected readonly tiers = TIERS;
  protected readonly dayOptions = FILMING_DAYS;
  protected readonly addonOptions = ADDONS;

  protected readonly videoType = signal<VideoTypeKey>('firemne_video');
  protected readonly tier = signal<TierKey>('standard');
  protected readonly days = signal<number>(1);
  protected readonly addons = signal<ReadonlySet<AddonKey>>(new Set<AddonKey>(['social']));

  protected readonly estimate = computed(() =>
    calculateEstimate({
      videoType: this.videoType(),
      tier: this.tier(),
      days: this.days(),
      addons: [...this.addons()],
    }),
  );

  protected readonly priceMin = computed(() => formatEur(this.estimate().min));
  protected readonly priceMax = computed(() => formatEur(this.estimate().max));
  protected readonly delivery = computed(() => formatWeeks(this.estimate().weeksMin, this.estimate().weeksMax));
  protected readonly selectedTier = computed(() => this.tiers.find((t) => t.key === this.tier())!);

  protected readonly formatDays = formatDays;

  protected toggleAddon(key: AddonKey): void {
    this.addons.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  protected sendBrief(): void {
    void this.router.navigate(['/dopyt'], {
      queryParams: {
        type: this.videoType(),
        tier: this.tier(),
        days: this.days(),
        addons: [...this.addons()].join(',') || null,
      },
    });
  }
}
