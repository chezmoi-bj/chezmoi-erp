import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getAllProperties, 
  upsertProperty, 
  deleteProperty 
} from './db';
import { PropertyRecord } from '../types';

test('Gestion des statuts opérationnels et suppression des biens fonciers', async (t) => {
  const testPropId = `prop_test_${Date.now()}`;
  const testRef = `CM-TEST-${Math.floor(100 + Math.random() * 900)}`;

  const dummyProp: PropertyRecord = {
    id: testPropId,
    codeReference: testRef,
    title: 'Terrain de test à Cotonou Cadjehoun',
    description: 'Parcelle clôturée avec titre foncier',
    listingType: 'VENTE',
    category: 'Terrains',
    city: 'Cotonou',
    district: 'Cadjehoun',
    address: 'Rue 124, près du Collège',
    priceAmount: 45000000,
    priceUSD: 75000,
    areaSqMeters: 500,
    roomsCount: 0,
    bedroomsCount: 0,
    bathroomsCount: 0,
    coordinates: {
      latitude: 6.3582,
      longitude: 2.4114,
      accuracy: 3.2,
      addressApprox: 'Cadjehoun, Cotonou',
      capturedAt: Date.now(),
    },
    owner: {
      id: 'own_1',
      fullName: 'Monsieur Test',
      phonePrimary: '+229 97 00 11 22',
      phoneWhatsapp: '+229 97 00 11 22',
      mandateType: 'SIMPLE',
      mandateDurationMonths: 12,
    },
    photos: [],
    assignedAgentId: 'agent_1',
    assignedAgentName: 'SMB',
    syncStatus: 'synced',
    legalStatus: 'TITRE_FONCIER',
    operationalStatus: 'DISPONIBLE',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await t.test('1. Création d\'un bien avec statut par défaut DISPONIBLE', async () => {
    const saved = await upsertProperty(dummyProp);
    assert.equal(saved.id, testPropId);
    assert.equal(saved.operationalStatus, 'DISPONIBLE');

    const all = await getAllProperties();
    const found = all.find(p => p.id === testPropId);
    assert.ok(found, 'Le bien doit être présent dans la base');
    assert.equal(found?.operationalStatus, 'DISPONIBLE');
  });

  await t.test('2. Modification dynamique du statut vers EN_LOCATION', async () => {
    const updated = {
      ...dummyProp,
      operationalStatus: 'EN_LOCATION' as const,
      updatedAt: Date.now(),
    };
    await upsertProperty(updated);

    const all = await getAllProperties();
    const found = all.find(p => p.id === testPropId);
    assert.equal(found?.operationalStatus, 'EN_LOCATION');
  });

  await t.test('3. Modification dynamique du statut vers VENDU', async () => {
    const updated = {
      ...dummyProp,
      operationalStatus: 'VENDU' as const,
      updatedAt: Date.now(),
    };
    await upsertProperty(updated);

    const all = await getAllProperties();
    const found = all.find(p => p.id === testPropId);
    assert.equal(found?.operationalStatus, 'VENDU');
  });

  await t.test('4. Suppression définitive du bien via deleteProperty', async () => {
    const success = await deleteProperty(testPropId);
    assert.equal(success, true, 'deleteProperty doit renvoyer true');

    const all = await getAllProperties();
    const found = all.find(p => p.id === testPropId);
    assert.equal(found, undefined, 'Le bien supprimé ne doit plus exister en base');
  });
});
