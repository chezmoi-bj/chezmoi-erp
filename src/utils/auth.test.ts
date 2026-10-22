import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateOTP, 
  maskIdentifier, 
  isRoleAuthorizedForTab, 
  getAllowedTabsForRole, 
  getDefaultTabForRole,
  normalizeIdentifier,
  createMockJWT
} from './auth';
import { UserAccount } from '../types';

describe('Chezmoi ERP Auth & RBAC Suite', () => {
  test('generateOTP produces a 6-digit numeric string', () => {
    const code = generateOTP();
    assert.equal(code.length, 6);
    assert.match(code, /^[0-9]{6}$/);
    const num = parseInt(code, 10);
    assert.ok(num >= 100000 && num <= 999999);
  });

  test('maskIdentifier masks emails properly', () => {
    const masked = maskIdentifier('direction@chezmoi.bj');
    assert.ok(masked.startsWith('di***'));
    assert.ok(masked.endsWith('@chezmoi.bj'));
  });

  test('maskIdentifier masks telephone numbers properly', () => {
    const masked = maskIdentifier('+229 97 00 01 02');
    assert.ok(masked.includes('****'));
    assert.ok(masked.endsWith('02'));
  });

  test('normalizeIdentifier strips spaces and lowercases', () => {
    assert.equal(normalizeIdentifier(' Direction@Chezmoi.BJ '), 'direction@chezmoi.bj');
    assert.equal(normalizeIdentifier('+229 97 00 01 02'), '+22997000102');
  });

  test('RBAC role permissions matrix properly restricts tabs', () => {
    // Super admin can access all 5 primary tabs
    assert.equal(isRoleAuthorizedForTab('SUPER_ADMIN', 'dashboard'), true);
    assert.equal(isRoleAuthorizedForTab('SUPER_ADMIN', 'accounting'), true);
    assert.equal(isRoleAuthorizedForTab('SUPER_ADMIN', 'hr'), true);
    assert.equal(isRoleAuthorizedForTab('SUPER_ADMIN', 'census'), true);
    assert.equal(isRoleAuthorizedForTab('SUPER_ADMIN', 'ged'), true);

    // Agent can only access census
    assert.equal(isRoleAuthorizedForTab('AGENT_RECENSEUR', 'census'), true);
    assert.equal(isRoleAuthorizedForTab('AGENT_RECENSEUR', 'accounting'), false);
    assert.equal(isRoleAuthorizedForTab('AGENT_RECENSEUR', 'hr'), false);
    assert.equal(isRoleAuthorizedForTab('AGENT_RECENSEUR', 'dashboard'), false);

    // Comptable can access accounting and dashboard, but not HR
    assert.equal(isRoleAuthorizedForTab('COMPTABLE', 'accounting'), true);
    assert.equal(isRoleAuthorizedForTab('COMPTABLE', 'dashboard'), true);
    assert.equal(isRoleAuthorizedForTab('COMPTABLE', 'hr'), false);

    // RH can access hr and dashboard, but not accounting
    assert.equal(isRoleAuthorizedForTab('RH', 'hr'), true);
    assert.equal(isRoleAuthorizedForTab('RH', 'dashboard'), true);
    assert.equal(isRoleAuthorizedForTab('RH', 'accounting'), false);
  });

  test('getDefaultTabForRole returns expected tab', () => {
    assert.equal(getDefaultTabForRole('AGENT_RECENSEUR'), 'census');
    assert.equal(getDefaultTabForRole('SECRETAIRE'), 'census');
    assert.equal(getDefaultTabForRole('SUPER_ADMIN'), 'dashboard');
  });

  test('createMockJWT creates valid 3-part token', () => {
    const mockUser: UserAccount = {
      id: 'user_test',
      name: 'Test User',
      email: 'test@chezmoi.bj',
      avatar: '',
      phone: '+22997000000',
      role: 'SUPER_ADMIN',
      jobTitle: 'Admin',
      departmentName: 'Direction',
      baseSalary: 1000000,
      commissionRate: 5,
      hireDate: '2023-01-01',
      contractType: 'CDI',
      city: 'Cotonou',
      assignedZone: 'Littoral',
      rating: 9.5,
      propertiesCount: 10,
      pendingSyncCount: 0,
      totalCommissions: 500000,
      status: 'ACTIF'
    };
    const token = createMockJWT(mockUser);
    const parts = token.split('.');
    assert.equal(parts.length, 3);
  });
});
