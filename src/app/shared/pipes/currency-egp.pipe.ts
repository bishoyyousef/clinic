import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyEgp',
  standalone: true
})
export class CurrencyEgpPipe implements PipeTransform {
  /**
   * Formats a numeric value to currency display with a customizable decimal count, suffixing 'EGP'.
   * E.g. 450 -> '450.00 EGP' or 450 with decimals=0 -> '450 EGP'
   */
  transform(value: number | string | null | undefined, minDecimal: number = 2, maxDecimal: number = 2): string {
    if (value === null || value === undefined || value === '') {
      return '0.00 EGP';
    }
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      return '0.00 EGP';
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDecimal,
      maximumFractionDigits: maxDecimal
    }).format(num);

    return `${formatted} EGP`;
  }
}
