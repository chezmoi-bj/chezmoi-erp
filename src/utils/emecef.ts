/**
 * Chezmoi Immobilier - Module e-MECeF Bénin (Facturation Normalisée DGI)
 * Conforme aux spécifications techniques de la Direction Générale des Impôts (Bénin).
 */

export interface EMecefInvoiceItem {
  id: string;
  designation: string;
  quantity: number;
  unitPriceTTC: number;
  taxGroup: 'A' | 'B' | 'E'; // A: Exonéré, B: TVA 18%, E: TPS
}

export interface EMecefInvoiceData {
  invoiceNumber: string;
  invoiceType?: 'FACTURE_PROFORMA' | 'FACTURE_NORMALISEE';
  clientName: string;
  clientIFU?: string;
  clientPhone: string;
  providerName?: string; // Prestataire (ex: Didier Alvaro ABALLO)
  items: EMecefInvoiceItem[];
  paymentMode: 'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE';
  amountPaid?: number;
  nim: string; // Numéro d'Identification Machine
  ifuSeller: string; // IFU Chezmoi Immobilier
  sdcId: string; // Système Décentralisé de Contrôle
  timestamp: number;
}

export interface TaxGroupBreakdown {
  group: 'A-EXONERE' | 'B-TAXABLE' | 'E-TPS';
  totalTTC: number;
  imposableHT: number;
  taxAmount: number;
}

export interface StandardizedInvoiceResult {
  invoiceNumber: string;
  invoiceType: 'FACTURE_PROFORMA' | 'FACTURE_NORMALISEE';
  clientName: string;
  clientIFU?: string;
  clientPhone: string;
  providerName: string;
  items: (EMecefInvoiceItem & { totalItemTTC: number })[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  taxBreakdown: TaxGroupBreakdown[];
  paymentMode: 'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE';
  amountPaid: number;
  totalInWords: string;
  securityCode: string;
  qrCodePayload: string;
  nim: string;
  ifuSeller: string;
  sdcId: string;
  counters: string; // e.g. 245/2026
  formattedDate: string;
  formattedTime: string;
}

/**
 * Calculates VAT and Totals according to Bénin tax groups
 */
export function calculateInvoiceTotals(items: EMecefInvoiceItem[]): {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
} {
  let totalHT = 0;
  let totalTVA = 0;
  let totalTTC = 0;

  for (const item of items) {
    const itemTotalTTC = item.quantity * item.unitPriceTTC;
    totalTTC += itemTotalTTC;

    if (item.taxGroup === 'B') {
      // TVA 18% standard
      const itemHT = Math.round(itemTotalTTC / 1.18);
      const itemTVA = itemTotalTTC - itemHT;
      totalHT += itemHT;
      totalTVA += itemTVA;
    } else {
      // Exonéré (A) ou TPS (E)
      totalHT += itemTotalTTC;
    }
  }

  return { totalHT, totalTVA, totalTTC };
}

/**
 * Calculates full tax ventilation table
 */
export function calculateTaxBreakdown(items: EMecefInvoiceItem[]): TaxGroupBreakdown[] {
  let groupATotal = 0;
  let groupBTotal = 0;
  let groupETotal = 0;

  for (const item of items) {
    const itemTotal = item.quantity * item.unitPriceTTC;
    if (item.taxGroup === 'A') {
      groupATotal += itemTotal;
    } else if (item.taxGroup === 'B') {
      groupBTotal += itemTotal;
    } else {
      groupETotal += itemTotal;
    }
  }

  const breakdown: TaxGroupBreakdown[] = [];

  breakdown.push({
    group: 'A-EXONERE',
    totalTTC: groupATotal,
    imposableHT: 0,
    taxAmount: 0,
  });

  const bImposable = groupBTotal > 0 ? Math.round(groupBTotal / 1.18) : 0;
  const bTax = groupBTotal - bImposable;

  breakdown.push({
    group: 'B-TAXABLE',
    totalTTC: groupBTotal,
    imposableHT: bImposable,
    taxAmount: bTax,
  });

  if (groupETotal > 0) {
    breakdown.push({
      group: 'E-TPS',
      totalTTC: groupETotal,
      imposableHT: groupETotal,
      taxAmount: 0,
    });
  }

  return breakdown;
}

/**
 * Converts numbers into French words for standard Beninese receipts
 */
export function numberToFrenchWords(n: number): string {
  if (n === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  function convertHundreds(num: number): string {
    let result = '';
    const h = Math.floor(num / 100);
    const rem = num % 100;

    if (h > 0) {
      if (h === 1) {
        result += 'cent';
      } else {
        result += `${units[h]} cent${rem === 0 ? 's' : ''}`;
      }
      if (rem > 0) result += ' ';
    }

    if (rem > 0) {
      if (rem < 10) {
        result += units[rem];
      } else if (rem < 20) {
        result += teens[rem - 10];
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        if (t === 7) {
          result += `soixante-${teens[u]}`;
        } else if (t === 9) {
          result += `quatre-vingt-${teens[u]}`;
        } else {
          result += tens[t];
          if (u === 1 && t !== 8) {
            result += ' et un';
          } else if (u > 0) {
            result += `-${units[u]}`;
          }
        }
      }
    }

    return result.trim();
  }

  const millions = Math.floor(n / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(`${convertHundreds(millions)} millions`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertHundreds(thousands)} mille`);
    }
  }

  if (remainder > 0 || parts.length === 0) {
    parts.push(convertHundreds(remainder));
  }

  return parts.join(' ').trim();
}

/**
 * Generates an 8-character alphanumeric security token formatted as XXXX-XXXX
 */
export function generateSecurityCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(-8);
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Formats standard DGI Benin e-MECeF QR payload:
 * Format: NIM*IFU*SDC_ID*TIMESTAMP*TOTAL_TTC*SECURITY_CODE
 */
export function formatEMecefQRPayload(
  nim: string,
  ifuSeller: string,
  sdcId: string,
  formattedDate: string,
  totalTTC: number,
  securityCode: string
): string {
  return `${nim}*${ifuSeller}*${sdcId}*${formattedDate}*${totalTTC}*${securityCode}`;
}

/**
 * Normalizes an invoice into a compliant e-MECeF receipt
 */
export function processStandardizedInvoice(
  data: EMecefInvoiceData
): StandardizedInvoiceResult {
  const { totalHT, totalTVA, totalTTC } = calculateInvoiceTotals(data.items);
  const dateObj = new Date(data.timestamp);
  const formattedDate = dateObj.toLocaleDateString('fr-FR');
  const formattedTime = dateObj.toTimeString().substring(0, 8);
  const isoFormatted = dateObj.toISOString().replace('T', ' ').substring(0, 19);

  const seed = `${data.nim}_${data.invoiceNumber}_${totalTTC}_${data.timestamp}`;
  const securityCode = generateSecurityCode(seed);

  const qrCodePayload = formatEMecefQRPayload(
    data.nim,
    data.ifuSeller,
    data.sdcId,
    isoFormatted,
    totalTTC,
    securityCode
  );

  const taxBreakdown = calculateTaxBreakdown(data.items);
  const totalInWords = numberToFrenchWords(totalTTC);

  const itemsWithTotal = data.items.map(item => ({
    ...item,
    totalItemTTC: item.quantity * item.unitPriceTTC,
  }));

  return {
    invoiceNumber: data.invoiceNumber,
    invoiceType: data.invoiceType || 'FACTURE_PROFORMA',
    clientName: data.clientName,
    clientIFU: data.clientIFU,
    clientPhone: data.clientPhone,
    providerName: data.providerName || 'Didier Alvaro ABALLO',
    items: itemsWithTotal,
    totalHT,
    totalTVA,
    totalTTC,
    taxBreakdown,
    paymentMode: data.paymentMode,
    amountPaid: data.amountPaid ?? totalTTC,
    totalInWords,
    securityCode,
    qrCodePayload,
    nim: data.nim,
    ifuSeller: data.ifuSeller,
    sdcId: data.sdcId,
    counters: `${Math.floor(100 + Math.random() * 900)}/2026`,
    formattedDate,
    formattedTime,
  };
}
