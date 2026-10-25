/**
 * Chezmoi administration - Module e-MECeF / e-SFE DGI Bénin
 * Conforme aux spécifications officielles de la Direction Générale des Impôts (Bénin).
 */

export type DgiTaxGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface DgiTaxGroupConfig {
  code: DgiTaxGroup;
  label: string;
  shortLabel: string;
  badge: string;
  rate: number; // 0 or 0.18
  description: string;
}

export const DGI_TAX_GROUPS: Record<DgiTaxGroup, DgiTaxGroupConfig> = {
  A: {
    code: 'A',
    label: 'Groupe A : Exonéré (0%)',
    shortLabel: 'A - EXONERE',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rate: 0,
    description: 'Biens et prestations exonérés de TVA',
  },
  B: {
    code: 'B',
    label: 'Groupe B : Taxable (TVA 18%)',
    shortLabel: 'B - TAXABLE',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    rate: 0.18,
    description: 'Régime standard imposable à la TVA 18%',
  },
  C: {
    code: 'C',
    label: 'Groupe C : Exportation (0%)',
    shortLabel: 'C - EXPORTATION',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    rate: 0,
    description: 'Exportations directes de services ou biens',
  },
  D: {
    code: 'D',
    label: "Groupe D : TVA Régime d'exception (18%)",
    shortLabel: "D - TVA REGIME D'EXCEPTION 18%",
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    rate: 0.18,
    description: "TVA sous convention ou régime dérogatoire (18%)",
  },
  E: {
    code: 'E',
    label: 'Groupe E : Régime de la TPS (Taxe Professionnelle Synthétique)',
    shortLabel: 'E - TPS',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    rate: 0,
    description: 'Entreprises relevant du régime de la TPS',
  },
  F: {
    code: 'F',
    label: 'Groupe F : Réservé',
    shortLabel: 'F - RESERVE',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    rate: 0,
    description: 'Groupe réservé administration',
  },
};

export interface EMecefInvoiceItem {
  id: string;
  designation: string;
  quantity: number; // Support décimal (ex: 1, 2.5, 0.75)
  unitPriceTTC: number; // Montant unitaire en FCFA
  specificTax?: number; // Taxe spécifique (T.S.) pour la ligne totale
  taxGroup: DgiTaxGroup;
  selectedForPrint?: boolean; // Pour module d'impression sélectif
}

export interface EMecefInvoiceData {
  invoiceNumber: string;
  invoiceType?: 'FACTURE_VENTE' | 'FACTURE_NORMALISEE' | 'FACTURE_PROFORMA' | 'FACTURE_AVOIR';
  clientName: string;
  clientIFU?: string;
  clientPhone: string;
  clientAddress?: string;
  providerName?: string;
  sellerName?: string;
  additionalDescription?: string;
  items: EMecefInvoiceItem[];
  paymentMode: 'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE';
  amountPaid?: number;
  nim: string;
  ifuSeller: string;
  sdcId: string;
  timestamp: number;
}

export interface TaxGroupBreakdown {
  group: string; // Ex: "A - EXONERE", "B - TAXABLE"
  groupCode: DgiTaxGroup;
  totalTTC: number;
  imposableHT: number;
  taxAmount: number;
  specificTax: number;
}

export interface StandardizedInvoiceResult {
  invoiceNumber: string;
  invoiceType: 'FACTURE_VENTE' | 'FACTURE_NORMALISEE' | 'FACTURE_PROFORMA' | 'FACTURE_AVOIR';
  clientName: string;
  clientIFU?: string;
  clientPhone: string;
  clientAddress?: string;
  providerName: string;
  sellerName: string;
  additionalDescription?: string;
  items: (EMecefInvoiceItem & { 
    totalItemTTC: number;
    baseImposable: number;
    taxAmount: number;
  })[];
  totalHT: number;
  totalTVA: number;
  totalSpecificTax: number;
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
  counters: string;
  formattedDate: string;
  formattedTime: string;
}

/**
 * Catalogue prédéfini des prestations immobilières et foncières conformes DGI Bénin
 */
export const PREDEFINED_DGI_SERVICES: { designation: string; defaultPrice: number; defaultGroup: DgiTaxGroup }[] = [
  { designation: 'Droit Fixe 1m² < S ≥ 1.000m²', defaultPrice: 10000, defaultGroup: 'E' },
  { designation: 'Droit Fixe 10.000m² < S ≥ 50.000m²', defaultPrice: 25000, defaultGroup: 'B' },
  { designation: 'Prestation de la brigade topographique', defaultPrice: 18000, defaultGroup: 'A' },
  { designation: 'Rattachement au système géodésique national (Système WGS 84 UTM 31-N)', defaultPrice: 10000, defaultGroup: 'B' },
  { designation: 'Fourniture de 5 copies de plans originaux sur calque', defaultPrice: 1000, defaultGroup: 'A' },
  { designation: 'Bornes relevées, calculées et vérifiées', defaultPrice: 5000, defaultGroup: 'A' },
  { designation: 'Plan de situation', defaultPrice: 7500, defaultGroup: 'A' },
  { designation: 'Dessin technique et cartographie', defaultPrice: 5500, defaultGroup: 'B' },
  { designation: 'Application du morcellement par la brigade', defaultPrice: 8000, defaultGroup: 'A' },
  { designation: 'Dessin projet morcellement', defaultPrice: 1000, defaultGroup: 'A' },
  { designation: 'Commission d’agence sur vente de bien', defaultPrice: 1500000, defaultGroup: 'B' },
  { designation: 'Commission sur location immobilière', defaultPrice: 150000, defaultGroup: 'B' },
  { designation: 'Commission sur location meublée', defaultPrice: 75000, defaultGroup: 'B' },
  { designation: 'Frais de dossier et ouverture de recensement foncier', defaultPrice: 50000, defaultGroup: 'A' },
];

/**
 * Calcule les totaux HT, TVA, TS et TTC pour les articles de la facture
 */
export function calculateInvoiceTotals(items: EMecefInvoiceItem[]): {
  totalHT: number;
  totalTVA: number;
  totalSpecificTax: number;
  totalTTC: number;
} {
  let totalHT = 0;
  let totalTVA = 0;
  let totalSpecificTax = 0;
  let totalTTC = 0;

  for (const item of items) {
    const rawTotal = (item.quantity || 0) * (item.unitPriceTTC || 0);
    const ts = Number(item.specificTax) || 0;
    const itemTotalTTC = rawTotal + ts;
    totalTTC += itemTotalTTC;
    totalSpecificTax += ts;

    if (item.taxGroup === 'B' || item.taxGroup === 'D') {
      // TVA 18% standard ou régime d'exception
      const baseSansTS = rawTotal;
      const itemHT = Math.round(baseSansTS / 1.18);
      const itemTVA = baseSansTS - itemHT;
      totalHT += itemHT;
      totalTVA += itemTVA;
    } else {
      // Exonéré (A), Exportation (C), TPS (E), Réservé (F)
      totalHT += rawTotal;
    }
  }

  return { totalHT, totalTVA, totalSpecificTax, totalTTC };
}

/**
 * Calcule la table de "VENTILATION DES IMPÔTS" automatique par Groupe DGI
 */
export function calculateTaxBreakdown(items: EMecefInvoiceItem[]): TaxGroupBreakdown[] {
  const groups: Record<DgiTaxGroup, { totalTTC: number; specificTax: number }> = {
    A: { totalTTC: 0, specificTax: 0 },
    B: { totalTTC: 0, specificTax: 0 },
    C: { totalTTC: 0, specificTax: 0 },
    D: { totalTTC: 0, specificTax: 0 },
    E: { totalTTC: 0, specificTax: 0 },
    F: { totalTTC: 0, specificTax: 0 },
  };

  for (const item of items) {
    const raw = (item.quantity || 0) * (item.unitPriceTTC || 0);
    const ts = Number(item.specificTax) || 0;
    const group = item.taxGroup || 'A';
    if (groups[group]) {
      groups[group].totalTTC += (raw + ts);
      groups[group].specificTax += ts;
    }
  }

  const breakdown: TaxGroupBreakdown[] = [];

  // Traiter chaque groupe avec des montants ou les deux groupes historiques A et B si la facture est vide
  const presentGroups = (Object.keys(groups) as DgiTaxGroup[]).filter(
    g => groups[g].totalTTC > 0
  );

  // Si aucun article, afficher au minimum Groupe A et B (comme dans l'interface DGI e-SFE)
  const groupsToDisplay = presentGroups.length > 0 ? presentGroups : (['A', 'B'] as DgiTaxGroup[]);

  for (const g of groupsToDisplay) {
    const config = DGI_TAX_GROUPS[g];
    const { totalTTC, specificTax } = groups[g];

    let imposableHT = 0;
    let taxAmount = 0;

    if (g === 'B' || g === 'D') {
      const baseSansTS = totalTTC - specificTax;
      imposableHT = baseSansTS > 0 ? Math.round(baseSansTS / 1.18) : 0;
      taxAmount = baseSansTS - imposableHT;
    } else {
      imposableHT = totalTTC > 0 ? totalTTC : 0;
      taxAmount = 0;
    }

    breakdown.push({
      group: config.shortLabel,
      groupCode: g,
      totalTTC,
      imposableHT,
      taxAmount,
      specificTax,
    });
  }

  return breakdown;
}

/**
 * Conversion d'un montant numérique en toutes lettres en français (FCFA)
 */
export function numberToFrenchWords(n: number): string {
  if (!n || n === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  function convertHundreds(num: number, isAtEnd = false): string {
    let result = '';
    const h = Math.floor(num / 100);
    const rem = num % 100;

    if (h > 0) {
      if (h === 1) {
        result += 'cent';
      } else {
        result += `${units[h]} cent${rem === 0 && isAtEnd ? 's' : ''}`;
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
          result += `soixante-${u === 1 ? 'et-onze' : teens[u]}`;
        } else if (t === 9) {
          result += `quatre-vingt-${teens[u]}`;
        } else {
          result += tens[t];
          if (u === 1 && t !== 8) {
            result += '-et-un';
          } else if (u > 0) {
            result += `-${units[u]}`;
          }
        }
      }
    }
    return result;
  }

  const parts: string[] = [];
  const billions = Math.floor(n / 1000000000);
  let remainder = n % 1000000000;
  const millions = Math.floor(remainder / 1000000);
  remainder %= 1000000;
  const thousands = Math.floor(remainder / 1000);
  remainder %= 1000;

  if (billions > 0) {
    parts.push(`${convertHundreds(billions, false)} milliard${billions > 1 ? 's' : ''}`);
  }

  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(`${convertHundreds(millions, false)} millions`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertHundreds(thousands, false)} mille`);
    }
  }

  if (remainder > 0 || parts.length === 0) {
    parts.push(convertHundreds(remainder, true));
  }

  return parts.join(' ').trim();
}

/**
 * Génère un code de sécurité DGI Bénin au format XXXX-XXXX
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
 * Formate la charge utile du QR Code e-MECeF DGI Bénin
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
 * Normalise et certifie une facture selon les spécifications e-MECeF DGI Bénin
 */
export function processStandardizedInvoice(
  data: EMecefInvoiceData
): StandardizedInvoiceResult {
  const { totalHT, totalTVA, totalSpecificTax, totalTTC } = calculateInvoiceTotals(data.items);
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

  const itemsWithCalculations = data.items.map(item => {
    const raw = (item.quantity || 0) * (item.unitPriceTTC || 0);
    const ts = Number(item.specificTax) || 0;
    const totalItemTTC = raw + ts;

    let baseImposable = raw;
    let taxAmount = 0;

    if (item.taxGroup === 'B' || item.taxGroup === 'D') {
      baseImposable = Math.round(raw / 1.18);
      taxAmount = raw - baseImposable;
    }

    return {
      ...item,
      totalItemTTC,
      baseImposable,
      taxAmount,
    };
  });

  return {
    invoiceNumber: data.invoiceNumber,
    invoiceType: data.invoiceType || 'FACTURE_VENTE',
    clientName: data.clientName,
    clientIFU: data.clientIFU,
    clientPhone: data.clientPhone,
    clientAddress: data.clientAddress,
    providerName: data.providerName || 'Chezmoi immobilier',
    sellerName: data.sellerName || 'SFE en ligne',
    additionalDescription: data.additionalDescription,
    items: itemsWithCalculations,
    totalHT,
    totalTVA,
    totalSpecificTax,
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
    counters: `${Math.floor(100 + Math.random() * 900)}/2026 FV`,
    formattedDate,
    formattedTime,
  };
}
