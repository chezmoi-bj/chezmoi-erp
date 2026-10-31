import { 
  UserAccount, 
  CashTransaction, 
  LegalDocument, 
  PropertyRecord,
  PayslipRecord,
  LeaveRequest
} from '../types';

/**
 * 1. COMPTE ADMINISTRATEUR CENTRAL UNIQUE (SMB)
 * Configuré pour la production Chezmoi ERP Bénin
 */
export const CENTRAL_ADMIN_SMB: UserAccount = {
  id: 'user_smb_central',
  name: 'SMB',
  avatar: '/assets/aistudio/1_e24ebf1b.png',
  email: 'chezmoi.benin@gmail.com',
  phone: '+229 97 00 00 01',
  role: 'SUPER_ADMIN',
  jobTitle: 'Administrateur Central',
  departmentName: 'Direction Générale Chezmoi Bénin',
  baseSalary: 0,
  commissionRate: 0,
  hireDate: '2026-01-01',
  contractType: 'CDI',
  city: 'Cotonou',
  assignedZone: 'National (Bénin)',
  rating: 10,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-001',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const COLLABORATOR_KOKOU_ABALLO: UserAccount = {
  id: 'user_kokou_aballo',
  name: 'Kokou Aballo',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: 'didier.aballo40@gmail.com',
  phone: '+229 90 12 34 56',
  role: 'AGENT_RECENSEUR',
  jobTitle: 'Agent Immobilier Terrain',
  departmentName: 'Opérations Foncières',
  baseSalary: 150000,
  commissionRate: 5,
  hireDate: '2026-01-15',
  contractType: 'CDI',
  city: 'Abomey-Calavi',
  assignedZone: 'Bidossessi Adjrako',
  rating: 5,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-002',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const COLLABORATOR_SEAN_AGENCY: UserAccount = {
  id: 'user_sean_agency',
  name: 'Sean Agency',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  email: 'sean.co.agency@gmail.com',
  phone: '+229 97 00 00 02',
  role: 'ADMIN',
  jobTitle: 'Administrateur Opérations',
  departmentName: 'Administration & Gestion',
  baseSalary: 250000,
  commissionRate: 8,
  hireDate: '2026-01-01',
  contractType: 'CDI',
  city: 'Cotonou',
  assignedZone: 'National (Bénin)',
  rating: 5,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-003',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const INITIAL_USERS: UserAccount[] = [
  CENTRAL_ADMIN_SMB,
  COLLABORATOR_KOKOU_ABALLO,
  COLLABORATOR_SEAN_AGENCY
];

/**
 * 2. TABLES VIDÉES DE TOUTES DONNÉES DE TEST FICTIVES
 * Prêtes pour la production Hostinger MySQL
 */
export const INITIAL_PROPERTIES: PropertyRecord[] = [];

export const INITIAL_TRANSACTIONS: CashTransaction[] = [];

export const INITIAL_DOCUMENTS: LegalDocument[] = [];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_PAYSLIPS: PayslipRecord[] = [];
