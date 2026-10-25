import { Role, UserAccount, AuthSession } from '../types';

/**
 * Rôles disponibles dans Chezmoi administration Bénin
 */
export const ROLE_DEFINITIONS: Record<Role, {
  label: string;
  badgeColor: string;
  description: string;
  allowedTabs: string[];
  defaultTab: string;
}> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    badgeColor: 'bg-rose-100 text-[#FA3055] border-rose-200',
    description: 'Direction générale - Accès complet & paramétrages',
    allowedTabs: ['dashboard', 'census', 'accounting', 'hr', 'ged'],
    defaultTab: 'dashboard',
  },
  ADMIN: {
    label: 'Admin Opérations',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: 'Supervision des opérations foncières & recensement terrain',
    allowedTabs: ['dashboard', 'census', 'ged'],
    defaultTab: 'dashboard',
  },
  COMPTABLE: {
    label: 'Comptable',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Facturation normalisée e-MECeF, trésorerie & salaires',
    allowedTabs: ['dashboard', 'accounting'],
    defaultTab: 'dashboard',
  },
  RH: {
    label: 'Ressources Humaines',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Collaborateurs, fiches de paie, congés & contrats',
    allowedTabs: ['dashboard', 'hr'],
    defaultTab: 'dashboard',
  },
  SECRETAIRE: {
    label: 'Secrétaire',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Accueil, GED foncière, consultation factures & relevés',
    allowedTabs: ['census', 'ged', 'accounting'],
    defaultTab: 'census',
  },
  AGENT_RECENSEUR: {
    label: 'Agent Recenseur',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Relevé parcellaire GPS, photos & fiches propriétaires',
    allowedTabs: ['census'],
    defaultTab: 'census',
  },
};

/**
 * Génère un code OTP aléatoire à 6 chiffres
 */
export function generateOTP(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Masque un email ou téléphone pour l'affichage de confirmation OTP
 */
export function maskIdentifier(identifier: string): string {
  if (!identifier) return '';
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    const [name, domain] = trimmed.split('@');
    if (name.length <= 2) {
      return `${name}***@${domain}`;
    }
    return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
  }
  // Téléphone
  const cleanPhone = trimmed.replace(/\s+/g, '');
  if (cleanPhone.length > 6) {
    const start = cleanPhone.substring(0, cleanPhone.length - 4);
    const end = cleanPhone.substring(cleanPhone.length - 2);
    return `${start.slice(0, 4)} **** ** ${end}`;
  }
  return cleanPhone;
}

/**
 * Vérifie si un rôle a le droit d'accéder à un onglet
 */
export function isRoleAuthorizedForTab(role: Role, tabId: string): boolean {
  const config = ROLE_DEFINITIONS[role];
  if (!config) return false;
  return config.allowedTabs.includes(tabId);
}

/**
 * Récupère la liste des onglets autorisés pour un rôle
 */
export function getAllowedTabsForRole(role: Role): string[] {
  const config = ROLE_DEFINITIONS[role];
  return config ? config.allowedTabs : ['dashboard'];
}

/**
 * Récupère l'onglet par défaut pour un rôle
 */
export function getDefaultTabForRole(role: Role): string {
  const config = ROLE_DEFINITIONS[role];
  return config ? config.defaultTab : 'dashboard';
}

/**
 * Normalise un identifiant (email ou téléphone béninois)
 */
export function normalizeIdentifier(val: string): string {
  const trimmed = val.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Nettoyer les espaces, tirets et parenthèses pour les téléphones
  return trimmed.replace(/[\s\-\(\)\.]/g, '');
}

/**
 * Crée un faux jeton JWT pour stocker la session
 */
export function createMockJWT(user: UserAccount): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 jours
  }));
  const signature = btoa(`chezmoi_secret_${user.id}_${user.role}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Sauvegarde la session dans le localStorage
 */
export const AUTH_STORAGE_KEY = 'chezmoi_erp_auth_session';

export function saveSession(user: UserAccount, token: string): void {
  try {
    const session: AuthSession = {
      token,
      user,
      expiresAt: Date.now() + 86400 * 7 * 1000,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Erreur sauvegarde session:', e);
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Erreur déconnexion:', e);
  }
}
