/**
 * Standardized Structured ID Generator for HONNE Coffee & Tea Enterprise System
 */

export class IdGenerator {
  private static formatDate(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  private static randomDigits(length: number = 4): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
  }

  static user(role: 'admin' | 'customer' = 'customer', index?: number): string {
    if (role === 'admin') {
      const idx = String(index || 1).padStart(3, '0');
      return `USR_ADM_${idx}`;
    }
    const dateStr = this.formatDate();
    const rand = this.randomDigits(4);
    return `USR_CUS_${dateStr}_${rand}`;
  }

  static product(category: 'coffee' | 'tea' | 'matcha' | 'cacao', seq: number): string {
    const prefixMap: Record<string, string> = {
      coffee: 'PRD_CF',
      tea: 'PRD_TR',
      matcha: 'PRD_MC',
      cacao: 'PRD_CC'
    };
    const p = prefixMap[category] || 'PRD_GEN';
    return `${p}_${String(seq).padStart(3, '0')}`;
  }

  static order(): string {
    const dateStr = this.formatDate();
    const rand = this.randomDigits(4);
    return `ORD_${dateStr}_${rand}`;
  }

  static pickupCode(): string {
    return this.randomDigits(4);
  }
}
