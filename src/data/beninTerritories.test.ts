import { test, describe } from 'node:test';
import assert from 'node:assert';
import { BENIN_TERRITORIES, searchTerritory } from './beninTerritories.ts';

describe('Bénin Territorial Organization (12 Départements, 77 Communes)', () => {
  test('BENIN_TERRITORIES contains exactly the 12 official departments', () => {
    assert.strictEqual(BENIN_TERRITORIES.length, 12);
    const deptNames = BENIN_TERRITORIES.map(d => d.name);
    assert.ok(deptNames.includes('Littoral'));
    assert.ok(deptNames.includes('Atlantique'));
    assert.ok(deptNames.includes('Ouémé'));
    assert.ok(deptNames.includes('Borgou'));
    assert.ok(deptNames.includes('Zou'));
    assert.ok(deptNames.includes('Mono'));
    assert.ok(deptNames.includes('Couffo'));
    assert.ok(deptNames.includes('Collines'));
    assert.ok(deptNames.includes('Alibori'));
    assert.ok(deptNames.includes('Atacora'));
    assert.ok(deptNames.includes('Donga'));
    assert.ok(deptNames.includes('Plateau'));
  });

  test('All 77 communes of Benin are represented with valid arrondissements', () => {
    const allCommunes = BENIN_TERRITORIES.flatMap(d => d.communes);
    assert.strictEqual(allCommunes.length, 77, 'Total communes must be exactly 77');

    for (const com of allCommunes) {
      assert.ok(com.id && com.name, `Commune must have id and name: ${com.id}`);
      assert.ok(com.arrondissements.length > 0, `Commune ${com.name} must have at least 1 arrondissement`);
      for (const arr of com.arrondissements) {
        assert.ok(arr.quartiers.length > 0, `Arrondissement ${arr.name} in ${com.name} must have quartiers`);
      }
    }
  });

  test('Cotonou has all 13 arrondissements with key neighborhoods', () => {
    const littoral = BENIN_TERRITORIES.find(d => d.id === 'littoral');
    assert.ok(littoral);
    const cotonou = littoral.communes.find(c => c.id === 'cotonou');
    assert.ok(cotonou);
    assert.strictEqual(cotonou.arrondissements.length, 13);

    const arr12 = cotonou.arrondissements.find(a => a.id === 'cotonou_12');
    assert.ok(arr12);
    assert.ok(arr12.quartiers.includes('Haie Vive'));
    assert.ok(arr12.quartiers.includes('Fidjrossè Centre'));
  });

  test('searchTerritory returns instant results across levels', () => {
    const resultsAgla = searchTerritory('Agla');
    assert.ok(resultsAgla.length > 0);
    assert.ok(resultsAgla.some(r => r.communeName === 'Cotonou'));

    const resultsCalavi = searchTerritory('Tankpè');
    assert.ok(resultsCalavi.length > 0);
    assert.ok(resultsCalavi.some(r => r.communeName === 'Abomey-Calavi'));

    const resultsEmpty = searchTerritory('x');
    assert.strictEqual(resultsEmpty.length, 0);
  });
});
