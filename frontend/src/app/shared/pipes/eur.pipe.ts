import { Pipe, PipeTransform } from '@angular/core';

import { formatEur } from '../../core/production/production-options';

/** Formats a number or DRF decimal string as Slovak EUR, e.g. "1 900 €". */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const n = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isFinite(n) ? formatEur(n) : '';
  }
}
