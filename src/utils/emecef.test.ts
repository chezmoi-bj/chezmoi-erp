import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInvoiceTotals,
  calculateTaxBreakdown,
  numberToFrenchWords,
  generateSecurityCode,
  formatEMecefQRPayload,
  processStandardizedInvoice,
} from './emecef.ts';
import type { EMecefInvoiceItem } from './emecef.ts';

test('calculateInvoiceTotals calculates VAT 18% correctly for tax group B', () => {
  const items: EMecefInvoiceItem[] = [
    {
      id: 'item_1',
      designation: 'Frais de mandat de gestion locative',
      quantity: 1,
      unitPriceTTC: 118000,
      taxGroup: 'B',
    },
  ];

  const { totalHT, totalTVA, totalTTC } = calculateInvoiceTotals(items);
  assert.equal(totalTTC, 118000);
  assert.equal(totalHT, 100000);
  assert.equal(totalTVA, 18000);
});

test('calculateInvoiceTotals handles exempt tax group A (0% VAT)', () => {
  const items: EMecefInvoiceItem[] = [
    {
      id: 'item_2',
      designation: 'Caution loyer propriétaire (Exonéré art. 23 CGI)',
      quantity: 1,
      unitPriceTTC: 300000,
      taxGroup: 'A',
    },
  ];

  const { totalHT, totalTVA, totalTTC } = calculateInvoiceTotals(items);
  assert.equal(totalTTC, 300000);
  assert.equal(totalHT, 300000);
  assert.equal(totalTVA, 0);
});

test('calculateTaxBreakdown aggregates both group A and B', () => {
  const items: EMecefInvoiceItem[] = [
    { id: '1', designation: 'Bornage', quantity: 1, unitPriceTTC: 50000, taxGroup: 'A' },
    { id: '2', designation: 'Droit fixe', quantity: 1, unitPriceTTC: 118000, taxGroup: 'B' },
  ];
  const breakdown = calculateTaxBreakdown(items);
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].totalTTC, 50000);
  assert.equal(breakdown[1].totalTTC, 118000);
  assert.equal(breakdown[1].imposableHT, 100000);
  assert.equal(breakdown[1].taxAmount, 18000);
});

test('numberToFrenchWords translates 382000 into French words correctly', () => {
  const words = numberToFrenchWords(382000);
  assert(words.includes('trois cent'));
  assert(words.includes('quatre-vingt'));
});

test('generateSecurityCode generates 8-char hyphenated code', () => {
  const code = generateSecurityCode('TEST_SEED_123');
  assert.equal(code.length, 9); // XXXX-XXXX
  assert.match(code, /^[0-9A-F]{4}-[0-9A-F]{4}$/);
});

test('processStandardizedInvoice builds complete e-MECeF DGI payload', () => {
  const result = processStandardizedInvoice({
    invoiceNumber: 'FAC-2026-0042',
    clientName: 'Association des tailleurs',
    clientPhone: '01 97 23 86 13',
    nim: 'MC01234567-01',
    ifuSeller: '0202361063128',
    sdcId: 'SDC-BJ-009',
    paymentMode: 'ESPECES',
    timestamp: 1776250000000,
    items: [
      {
        id: '1',
        designation: 'Droit Fixe 10.000m² < S >= 50.000m²',
        quantity: 1,
        unitPriceTTC: 25000,
        taxGroup: 'B',
      },
    ],
  });

  assert.equal(result.invoiceNumber, 'FAC-2026-0042');
  assert.equal(result.totalTTC, 25000);
  assert(result.qrCodePayload.includes('MC01234567-01'));
  assert(result.qrCodePayload.includes('0202361063128'));
  assert(result.qrCodePayload.includes('25000'));
});
