import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateInvoiceTotals, 
  calculateTaxBreakdown, 
  processStandardizedInvoice, 
  DGI_TAX_GROUPS,
  EMecefInvoiceItem,
  numberToFrenchWords
} from './emecef.js';

test('e-MECeF DGI Tax Groups & Ventilation Engine', async (t) => {
  await t.test('All 6 official DGI groups exist and have correct rates', () => {
    assert.equal(DGI_TAX_GROUPS.A.rate, 0);
    assert.equal(DGI_TAX_GROUPS.B.rate, 0.18);
    assert.equal(DGI_TAX_GROUPS.C.rate, 0);
    assert.equal(DGI_TAX_GROUPS.D.rate, 0.18);
    assert.equal(DGI_TAX_GROUPS.E.rate, 0);
    assert.equal(DGI_TAX_GROUPS.F.rate, 0);
  });

  await t.test('Calculates TVA and Base Imposable correctly for Groupe B (18%) and decimal quantity', () => {
    const items: EMecefInvoiceItem[] = [
      {
        id: '1',
        designation: 'Prestation foncière',
        quantity: 2.5,
        unitPriceTTC: 40000,
        taxGroup: 'B',
      }
    ];

    const totals = calculateInvoiceTotals(items);
    // 2.5 * 40,000 = 100,000 TTC
    assert.equal(totals.totalTTC, 100000);
    // Base HT = round(100,000 / 1.18) = 84746
    assert.equal(totals.totalHT, 84746);
    // TVA = 100,000 - 84,746 = 15254
    assert.equal(totals.totalTVA, 15254);
    assert.equal(totals.totalSpecificTax, 0);

    const breakdown = calculateTaxBreakdown(items);
    const groupB = breakdown.find(b => b.groupCode === 'B');
    assert.ok(groupB);
    assert.equal(groupB?.totalTTC, 100000);
    assert.equal(groupB?.imposableHT, 84746);
    assert.equal(groupB?.taxAmount, 15254);
  });

  await t.test('Handles multi-group ventilation across A (0%), B (18%), and E (TPS 0%)', () => {
    const items: EMecefInvoiceItem[] = [
      {
        id: '1',
        designation: 'Bornes relevées',
        quantity: 1,
        unitPriceTTC: 10000,
        taxGroup: 'A', // Exonéré
      },
      {
        id: '2',
        designation: 'Commission vente',
        quantity: 1,
        unitPriceTTC: 118000,
        taxGroup: 'B', // 18% -> 100,000 base + 18,000 TVA
      },
      {
        id: '3',
        designation: 'Droit fixe TPS',
        quantity: 2,
        unitPriceTTC: 5000,
        taxGroup: 'E', // TPS -> 10,000 total, 10,000 base, 0 impôt
      }
    ];

    const totals = calculateInvoiceTotals(items);
    assert.equal(totals.totalTTC, 10000 + 118000 + 10000); // 138,000
    assert.equal(totals.totalHT, 10000 + 100000 + 10000); // 120,000
    assert.equal(totals.totalTVA, 18000);

    const breakdown = calculateTaxBreakdown(items);
    const rowA = breakdown.find(r => r.groupCode === 'A');
    const rowB = breakdown.find(r => r.groupCode === 'B');
    const rowE = breakdown.find(r => r.groupCode === 'E');

    assert.equal(rowA?.imposableHT, 10000);
    assert.equal(rowA?.taxAmount, 0);

    assert.equal(rowB?.imposableHT, 100000);
    assert.equal(rowB?.taxAmount, 18000);

    assert.equal(rowE?.imposableHT, 10000);
    assert.equal(rowE?.taxAmount, 0);
  });

  await t.test('Generates official DGI QR code payload and formatted words', () => {
    const res = processStandardizedInvoice({
      invoiceNumber: 'FV-2026-0042',
      clientName: 'ETCHI Odile',
      clientIFU: '0202111883391',
      clientPhone: '+229 97 00 00 00',
      nim: 'EM01508441',
      ifuSeller: '0202361063128',
      sdcId: 'SDC-BJ-009',
      paymentMode: 'ESPECES',
      timestamp: 1730000000000,
      items: [
        {
          id: '1',
          designation: 'Honoraires transaction',
          quantity: 1,
          unitPriceTTC: 200000,
          taxGroup: 'B',
        }
      ]
    });

    assert.ok(res.qrCodePayload.includes('EM01508441'));
    assert.ok(res.qrCodePayload.includes('0202361063128'));
    assert.ok(res.qrCodePayload.includes('200000'));
    assert.ok(res.totalInWords.toLowerCase().includes('deux cent mille'));
  });
});
