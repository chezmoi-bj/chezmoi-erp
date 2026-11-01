import { 
  UserAccount, 
  CashTransaction, 
  LegalDocument, 
  PropertyRecord,
  PayslipRecord,
  LeaveRequest
} from '../types';

/**
 * 1. MEMBRES RÉELS DU SYSTÈME (CHEZMOI ADMINISTRATION)
 * Conformes aux 5 profils réels enregistrés sur https://admin.chezmoi.bj
 */
export const USER_SMB_CENTRAL: UserAccount = {
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
  rating: 9.99,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-001',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const USER_KOKOU_ABALLO: UserAccount = {
  id: 'user_kokou_aballo',
  name: 'Kokou Aballo',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: 'didier.aballo40@gmail.com',
  phone: '+229 90 12 34 56',
  role: 'ADMIN',
  jobTitle: 'Manager',
  departmentName: 'Opérations Foncières',
  baseSalary: 0,
  commissionRate: 3.5,
  hireDate: '2026-01-15',
  contractType: 'CDI',
  city: 'Abomey-Calavi',
  assignedZone: 'Cotonou et environs',
  rating: 8.5,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-002',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const USER_GBETO_JEAN_CLAUDE: UserAccount = {
  id: 'user_gbeto_jean_claude',
  name: 'GBETO Jean-Claude',
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  email: 'gbeto.jeanclaude@chezmoi.bj',
  phone: '+229 97 00 12 01',
  role: 'ADMIN',
  jobTitle: 'Agent recenseur foncier terrain',
  departmentName: 'Opérations Foncières',
  baseSalary: 0,
  commissionRate: 3.5,
  hireDate: '2026-01-10',
  contractType: 'CDI',
  city: 'Cotonou',
  assignedZone: 'Cotonou et environs',
  rating: 8.5,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-003',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const USER_ISMENE_BANKOLE: UserAccount = {
  id: 'user_ismene_bankole',
  name: 'Ismène Mahoussi Samiath Bankole',
  avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  email: 'ismene.bankole@chezmoi.bj',
  phone: '+229 97 00 12 02',
  role: 'SECRETAIRE',
  jobTitle: 'Agent recenseur foncier terrain',
  departmentName: 'Secrétariat & Administration',
  baseSalary: 0,
  commissionRate: 3.5,
  hireDate: '2026-01-12',
  contractType: 'CDI',
  city: 'Cotonou',
  assignedZone: 'Cotonou et environs',
  rating: 8.5,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'ACTIF',
  cnssNumber: 'CNSS-2026-004',
  emailVerified: true,
  twoFactorEnabled: false,
};

export const USER_DEO_GRATIAS: UserAccount = {
  id: 'user_deo_gratias',
  name: 'Déo Gratias Marie Clarisse',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  email: 'deogratias.marieclarisse@chezmoi.bj',
  phone: '+229 97 00 12 03',
  role: 'SECRETAIRE',
  jobTitle: 'Agent recenseur foncier terrain',
  departmentName: 'Secrétariat & Administration',
  baseSalary: 0,
  commissionRate: 3.5,
  hireDate: '2026-01-20',
  contractType: 'CDI',
  city: 'Cotonou',
  assignedZone: 'Cotonou et environs',
  rating: 8.5,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: 'EN_ATTENTE_VALIDATION',
  cnssNumber: 'CNSS-2026-005',
  emailVerified: false,
  twoFactorEnabled: false,
};

// Aliases de rétrocompatibilité
export const CENTRAL_ADMIN_SMB = USER_SMB_CENTRAL;
export const COLLABORATOR_KOKOU_ABALLO = USER_KOKOU_ABALLO;

export const INITIAL_USERS: UserAccount[] = [
  USER_SMB_CENTRAL,
  USER_KOKOU_ABALLO,
  USER_GBETO_JEAN_CLAUDE,
  USER_ISMENE_BANKOLE,
  USER_DEO_GRATIAS
];

export const INITIAL_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop_womey_sodo_521',
    codeReference: 'CM-ABO-2026-521',
    title: 'Parcelle Womey Sodo - A vendre - 2000m²',
    description: 'Parcelle viabilisée et clôturée de 2000 m² située à Womey Sodo. Zone résidentielle paisible, eau SONEB et électricité SBEE disponibles. Accès rapide depuis le carrefour Calvaire.',
    listingType: 'VENTE',
    category: 'TERRAIN_NU',
    department: 'Atlantique',
    city: 'Abomey-Calavi',
    arrondissement: 'Godomey',
    district: 'Womey Sodo',
    address: '2ème von après le carrefour Calvaire',
    priceAmount: 25000000,
    priceUSD: 41667,
    areaSqMeters: 2000,
    roomsCount: 6,
    bedroomsCount: 4,
    bathroomsCount: 3,
    legalStatus: 'CONCESSION',
    otherDetails: 'Accès bitumé à 150m, quartier en plein essor, terrain plat sans bas-fond.',
    coordinates: {
      latitude: 6.3621,
      longitude: 2.3812,
      altitude: 9.2,
      accuracy: 3.4,
      addressApprox: 'Womey Sodo, Abomey-Calavi',
      capturedAt: 1769000000000,
    },
    rentalRates: {
      daily: 35000,
      weekly: 200000,
      monthly: 650000,
    },
    owner: {
      id: 'owner_meckdashi_alain',
      fullName: 'Meckdashi Alain',
      phonePrimary: '0197225225',
      phoneWhatsapp: '0197225225',
      mandateType: 'SIMPLE',
      mandateDurationMonths: 12,
    },
    photos: [
      {
        id: 'photo_womey_1',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        category: 'EXTERIEUR',
        caption: 'Vue du terrain et bornage',
        isMain: true,
        timestamp: 1769000000000,
      }
    ],
    assignedAgentId: 'user_smb_central',
    assignedAgentName: 'SMB',
    syncStatus: 'synced',
    createdAt: 1769000000000,
    updatedAt: 1769000000000,
  }
];
export const INITIAL_TRANSACTIONS: CashTransaction[] = [];
export const INITIAL_DOCUMENTS: LegalDocument[] = [];
export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];
export const INITIAL_PAYSLIPS: PayslipRecord[] = [];
