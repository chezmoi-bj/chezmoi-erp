export type Role = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'RH' 
  | 'COMPTABLE' 
  | 'SECRETAIRE' 
  | 'AGENT_RECENSEUR';

export type PropertyListingType =
  | 'VENTE'
  | 'LOCATION'
  | 'LOCATION_MEUBLEE'
  | 'BAIL_COMMERCIAL'
  | 'GESTION_DELEGUEE';

export type PropertyCategory =
  | 'TERRAIN_NU'
  | 'PARCELLE_AVEC_TF'
  | 'VILLA_BASSE'
  | 'VILLA_DUPLEX'
  | 'IMMEUBLE_R_PLUS'
  | 'APPARTEMENT'
  | 'BOUTIQUE_MAGASIN'
  | 'BUREAU'
  | 'CONCESSION_FAMILIALE';

export type DocumentType =
  | 'TITRE_FONCIER'
  | 'ATTESTATION_RECASEMENT'
  | 'CONVENTION_VENTE'
  | 'MANDAT_GESTION'
  | 'PLAN_TOPOGRAPHIQUE'
  | 'CNI_PROPRIETAIRE'
  | 'PASSEPORT_PROPRIETAIRE';

export type PhotoCategory =
  | 'FACADE'
  | 'SALON'
  | 'CHAMBRE'
  | 'CUISINE'
  | 'EXTERIEUR'
  | 'DOC_TITRE'
  | 'IDENTITE_PROPRIETAIRE';

export interface PropertyPhoto {
  id: string;
  category: PhotoCategory;
  url: string;
  isMain: boolean;
  localPath?: string;
  caption?: string;
  timestamp: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  addressApprox: string;
  capturedAt: number;
}

export type MandateType = 
  | 'COMMISSION_VENTE' 
  | 'COMMISSION_LOCATION' 
  | 'COMMISSION_LOCATION_MEUBLEE'
  | 'EXCLUSIF' 
  | 'SIMPLE' 
  | 'GESTION_DIRECTE';

export type PropertyLegalStatus =
  | 'TITRE_FONCIER_PERSONNEL'
  | 'CONVENTION_VENTE'
  | 'HERITAGE'
  | 'ATTESTATION_DETENTION_COUTUMIERE'
  | 'ATTESTATION_RECASEMENT'
  | 'TITRE_FONCIER_EN_COURS'
  | 'TITRE_FONCIER'
  | 'CONCESSION'
  | 'EN_COURS'
  | string;

export interface OwnerInfo {
  id: string;
  fullName: string;
  phonePrimary: string;
  phoneWhatsapp: string;
  email?: string;
  idCardNumber?: string;
  mandateType: MandateType;
  mandateDurationMonths: number;
}

export interface PropertyRecord {
  id: string;
  codeReference: string; // Ex: CM-COT-2026-089
  title: string;
  description: string;
  listingType: PropertyListingType;
  category: PropertyCategory;
  department?: string;
  city: string;
  arrondissement?: string;
  district: string; // Quartier / Village
  address: string;
  priceAmount: number; // in XOF (FCFA)
  priceUSD?: number;
  areaSqMeters: number;
  roomsCount: number;
  bedroomsCount: number;
  bathroomsCount: number;
  coordinates: Coordinates;
  owner: OwnerInfo;
  photos: PropertyPhoto[];
  rentalRates?: {
    daily?: number; // FCFA / jour
    weekly?: number; // FCFA / semaine
    monthly?: number; // FCFA / mois
  };
  otherDetails?: string; // Précisions additionnelles, conditions, commodités
  assignedAgentId: string;
  assignedAgentName: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict';
  syncError?: string;
  createdAt: number;
  updatedAt: number;
  serverSyncTimestamp?: number;
  legalStatus: PropertyLegalStatus;
  isFeatured?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  phone: string;
  role: Role;
  jobTitle: string;
  departmentName: string;
  baseSalary: number; // FCFA
  commissionRate: number; // %
  hireDate: string;
  contractType: 'CDI' | 'CDD' | 'MANDATAIRE_INDEPENDANT' | 'STAGE';
  city: string;
  assignedZone: string;
  rating: number;
  propertiesCount: number;
  pendingSyncCount: number;
  totalCommissions?: number;
  status: 'ACTIF' | 'EN_MISSION' | 'CONGE' | 'SUSPENDU' | 'EN_ATTENTE_VALIDATION' | 'PENDING';
  cnssNumber?: string;
  twoFactorEnabled?: boolean;
  totpSecret?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationEmailSent?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetPropertyId?: string;
  propertyName?: string;
  location?: string;
  agentName?: string;
  timestamp: number;
  read: boolean;
  type: 'NEW_PROPERTY_CENSUS' | 'SYSTEM' | 'SYNC';
}

export interface AuthSession {
  token: string;
  user: UserAccount;
  expiresAt: number;
}

export type AgentRecenseur = UserAccount;

export interface CashTransaction {
  id: string;
  code: string;
  type: 'ENTREE' | 'SORTIE';
  category: 
    | 'COMMISSION_VENTE' 
    | 'COMMISSION_LOCATION' 
    | 'COMMISSION_LOCATION_MEUBLEE'
    | 'FRAIS_RECENSEMENT' 
    | 'LOYER_ENCAISSE' 
    | 'SALAIRE_REMUNERATION'
    | 'DEPLACEMENT' 
    | 'FOURNITURES' 
    | 'DEPENSE_SOCIETE';
  amount: number;
  description: string;
  agentOrClient: string;
  paymentMode: 'ESPECES' | 'MOBILE_MONEY' | 'VIREMENT' | 'CHEQUE';
  date: string;
  emecefInvoiceRef?: string;
  beneficiaryEmployeeId?: string;
  salaryDetails?: {
    month: string;
    baseAmount: number;
    commissionAmount: number;
    bonusAmount: number;
    deductions: number;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'CONGE_PAYE' | 'PERMISSION_EXCEPTIONNELLE' | 'MALADIE' | 'MATERNITE';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  requestedAt: string;
  approvedBy?: string;
}

export interface PayslipRecord {
  id: string;
  slipNumber: string;
  employeeId: string;
  employeeName: string;
  role: Role;
  month: string; // ex: Octobre 2026
  baseSalary: number;
  commissions: number;
  bonuses: number;
  grossTotal: number;
  cnssEmployee: number; // 3.6%
  iptsTax: number;
  netPayable: number;
  paymentMode: string;
  paidAt: string;
  status: 'PAYE' | 'EN_PREPARATION';
}

export interface LegalDocument {
  id: string;
  title: string;
  type: DocumentType;
  propertyCode: string;
  propertyName: string;
  ownerName: string;
  fileSize: string;
  status: 'VALIDE' | 'EN_VERIFICATION' | 'REJETE' | 'MANQUANT';
  uploadedAt: string;
  expiryDate?: string;
}
