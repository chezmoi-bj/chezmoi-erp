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

export const INITIAL_USERS: UserAccount[] = [
  CENTRAL_ADMIN_SMB
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
