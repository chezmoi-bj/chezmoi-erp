import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getSafeAppUrl } from './mailer';
import { createCollaborator, updateCollaboratorProfile, verifyEmailAccount, memoryStore, UserAccount } from './db';

describe('Vérification stricte du flux de gestion des collaborateurs et e-mails', () => {

  test('getSafeAppUrl ne retourne JAMAIS localhost ou 127.0.0.1', () => {
    assert.strictEqual(getSafeAppUrl('http://localhost:3000'), 'https://admin.chezmoi.bj');
    assert.strictEqual(getSafeAppUrl('http://127.0.0.1:3000'), 'https://admin.chezmoi.bj');
    assert.strictEqual(getSafeAppUrl('http://localhost:8080/path'), 'https://admin.chezmoi.bj');
    assert.strictEqual(getSafeAppUrl('https://admin.chezmoi.bj/'), 'https://admin.chezmoi.bj');
    assert.strictEqual(getSafeAppUrl('https://chezmoi.bj'), 'https://chezmoi.bj');
  });

  test('createCollaborator génère un code OTP initial pour un nouveau collaborateur', async () => {
    const newUser: UserAccount = {
      id: 'test_agent_101',
      name: 'Agent Testeur',
      email: 'test.agent101@chezmoi.bj',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+229 97 00 11 22',
      role: 'AGENT_RECENSEUR',
      jobTitle: 'Agent de terrain',
      departmentName: 'Opérations',
      baseSalary: 150000,
      commissionRate: 5,
      hireDate: '2026-01-15',
      contractType: 'CDI',
      city: 'Cotonou',
      assignedZone: 'Cadjehoun',
      rating: 5,
      propertiesCount: 0,
      pendingSyncCount: 0,
      totalCommissions: 0,
      status: 'EN_ATTENTE_VALIDATION',
    };

    const created = await createCollaborator(newUser);
    assert.strictEqual(created.emailVerified, false);
    assert.strictEqual(created.status, 'EN_ATTENTE_VALIDATION');
    assert.ok(created.verificationToken, 'Un code OTP initial doit être généré à la création');
    assert.strictEqual(created.verificationToken.length, 6);
  });

  test('updateCollaboratorProfile protège un compte déjà vérifié : pas de régression ni de token OTP', async () => {
    // 1. On insère un utilisateur déjà vérifié
    const verifiedUser: UserAccount = {
      id: 'verified_user_202',
      name: 'Didier Aballo',
      email: 'didier.aballo40@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '+229 90 12 34 56',
      role: 'AGENT_RECENSEUR',
      jobTitle: 'Agent Immobilier',
      departmentName: 'Opérations',
      baseSalary: 200000,
      commissionRate: 7,
      hireDate: '2025-10-01',
      contractType: 'CDI',
      city: 'Abomey-Calavi',
      assignedZone: 'Bidossessi Adjrako',
      rating: 5,
      propertiesCount: 12,
      pendingSyncCount: 0,
      totalCommissions: 150000,
      status: 'ACTIF',
      emailVerified: true,
      verificationToken: undefined,
    };
    memoryStore.users.push(verifiedUser);

    // 2. L'administrateur met à jour son profil (ex: changement de téléphone, poste, et tentative erronée de statut)
    const updated = await updateCollaboratorProfile(verifiedUser.id, {
      name: 'Didier Kokou Aballo',
      phone: '+229 91 99 88 77',
      jobTitle: 'Responsable Zone Calavi',
      status: 'EN_ATTENTE_VALIDATION' as any, // Tentative de régression
    });

    // 3. Vérifications strictes selon les règles
    assert.strictEqual(updated.name, 'Didier Kokou Aballo');
    assert.strictEqual(updated.phone, '+229 91 99 88 77');
    assert.strictEqual(updated.jobTitle, 'Responsable Zone Calavi');
    assert.strictEqual(updated.emailVerified, true, 'Le compte doit impérativement rester validé');
    assert.strictEqual(updated.status, 'ACTIF', 'Un compte déjà vérifié ne doit jamais repasser en attente de validation');
    assert.strictEqual(updated.verificationToken, undefined, 'La mise à jour de profil ne doit jamais générer de code OTP');
  });

  test('verifyEmailAccount valide le jeton et gère avec succès les clics ultérieurs sur un compte déjà actif', async () => {
    const res = await verifyEmailAccount('token_invalide', 'didier.aballo40@gmail.com');
    // Le compte didier.aballo40@gmail.com étant déjà vérifié dans le test précédent :
    assert.strictEqual(res.success, true);
    assert.ok(res.message.includes('déjà vérifié'));
  });

});
