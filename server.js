// server.ts
import express from "express";
import dotenv2 from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// src/server/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// src/data/mockData.ts
var INITIAL_USERS = [
  {
    id: "user_super_admin",
    name: "M. Jean-Luc Hounnou",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "direction@chezmoi.bj",
    password: "admin",
    phone: "+229 97 00 01 02",
    role: "SUPER_ADMIN",
    jobTitle: "Directeur g\xE9n\xE9ral & fondateur",
    departmentName: "Direction g\xE9n\xE9rale",
    baseSalary: 125e4,
    commissionRate: 10,
    hireDate: "2021-01-15",
    contractType: "CDI",
    city: "Cotonou",
    assignedZone: "National (B\xE9nin)",
    rating: 9.8,
    propertiesCount: 140,
    pendingSyncCount: 0,
    totalCommissions: 125e5,
    status: "ACTIF",
    cnssNumber: "CNSS-2021-001"
  },
  {
    id: "user_admin_ops",
    name: "M. Patrick Bio",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "operations@chezmoi.bj",
    password: "admin",
    phone: "+229 96 12 34 56",
    role: "ADMIN",
    jobTitle: "Directeur des op\xE9rations fonci\xE8res",
    departmentName: "P\xF4le foncier & audit",
    baseSalary: 75e4,
    commissionRate: 5,
    hireDate: "2022-03-01",
    contractType: "CDI",
    city: "Cotonou",
    assignedZone: "Littoral & Atlantique",
    rating: 9.2,
    propertiesCount: 95,
    pendingSyncCount: 0,
    totalCommissions: 48e5,
    status: "ACTIF",
    cnssNumber: "CNSS-2022-048"
  },
  {
    id: "user_rh",
    name: "Mme. B\xE9atrice Akplogan",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    email: "rh@chezmoi.bj",
    password: "admin",
    phone: "+229 97 88 44 22",
    role: "RH",
    jobTitle: "Responsable des ressources humaines",
    departmentName: "Ressources humaines",
    baseSalary: 55e4,
    commissionRate: 0,
    hireDate: "2022-06-15",
    contractType: "CDI",
    city: "Cotonou",
    assignedZone: "Si\xE8ge Cotonou Haie-Vive",
    rating: 9,
    propertiesCount: 0,
    pendingSyncCount: 0,
    totalCommissions: 0,
    status: "ACTIF",
    cnssNumber: "CNSS-2022-119"
  },
  {
    id: "user_comptable",
    name: "M. Christian Dossou",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    email: "comptabilite@chezmoi.bj",
    password: "admin",
    phone: "+229 95 60 70 80",
    role: "COMPTABLE",
    jobTitle: "Chef comptable & fiscalit\xE9 e-MECeF",
    departmentName: "Comptabilit\xE9 & tr\xE9sorerie",
    baseSalary: 6e5,
    commissionRate: 0,
    hireDate: "2022-04-10",
    contractType: "CDI",
    city: "Cotonou",
    assignedZone: "Si\xE8ge Cotonou Haie-Vive",
    rating: 9.5,
    propertiesCount: 0,
    pendingSyncCount: 0,
    totalCommissions: 0,
    status: "ACTIF",
    cnssNumber: "CNSS-2022-092"
  },
  {
    id: "user_secretaire",
    name: "Mme. Solange Zinsou",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    email: "secretariat@chezmoi.bj",
    password: "admin",
    phone: "+229 94 22 33 44",
    role: "SECRETAIRE",
    jobTitle: "Secr\xE9taire g\xE9n\xE9rale & accueil clients",
    departmentName: "Administration & accueil",
    baseSalary: 28e4,
    commissionRate: 1,
    hireDate: "2023-01-10",
    contractType: "CDI",
    city: "Cotonou",
    assignedZone: "Si\xE8ge Haie-Vive",
    rating: 8.8,
    propertiesCount: 12,
    pendingSyncCount: 0,
    totalCommissions: 35e4,
    status: "ACTIF",
    cnssNumber: "CNSS-2023-014"
  },
  {
    id: "agent_1",
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    email: "e.davis@chezmoi.bj",
    password: "admin",
    phone: "+229 97 45 12 34",
    role: "AGENT_RECENSEUR",
    jobTitle: "Agent recenseur foncier terrain",
    departmentName: "Recensement terrain",
    baseSalary: 22e4,
    commissionRate: 3.5,
    hireDate: "2023-05-01",
    contractType: "CDD",
    city: "Cotonou",
    assignedZone: "Cotonou (12\xE8me & 13\xE8me)",
    rating: 8.3,
    propertiesCount: 48,
    pendingSyncCount: 2,
    totalCommissions: 145e4,
    status: "ACTIF",
    cnssNumber: "CNSS-2023-078"
  },
  {
    id: "agent_2",
    name: "James Smith",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    email: "j.smith@chezmoi.bj",
    password: "admin",
    phone: "+229 96 11 88 90",
    role: "AGENT_RECENSEUR",
    jobTitle: "Agent recenseur foncier terrain",
    departmentName: "Recensement terrain",
    baseSalary: 22e4,
    commissionRate: 3.5,
    hireDate: "2023-07-15",
    contractType: "CDD",
    city: "Abomey-Calavi",
    assignedZone: "Calavi Centre, Godomey, Akassato",
    rating: 8.5,
    propertiesCount: 62,
    pendingSyncCount: 0,
    totalCommissions: 218e4,
    status: "ACTIF",
    cnssNumber: "CNSS-2023-102"
  },
  {
    id: "agent_3",
    name: "Michael Johnson",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    email: "m.johnson@chezmoi.bj",
    password: "admin",
    phone: "+229 95 33 22 11",
    role: "AGENT_RECENSEUR",
    jobTitle: "Agent recenseur foncier terrain",
    departmentName: "Recensement terrain",
    baseSalary: 2e5,
    commissionRate: 3.5,
    hireDate: "2023-09-01",
    contractType: "CDD",
    city: "Ouidah",
    assignedZone: "Ouidah & Route des P\xEAches",
    rating: 7.9,
    propertiesCount: 31,
    pendingSyncCount: 1,
    totalCommissions: 92e4,
    status: "EN_MISSION",
    cnssNumber: "CNSS-2023-145"
  }
];
var INITIAL_LEAVE_REQUESTS = [
  {
    id: "leave_1",
    employeeId: "agent_1",
    employeeName: "Emily Davis",
    type: "CONGE_PAYE",
    startDate: "2026-10-25",
    endDate: "2026-11-02",
    daysCount: 7,
    reason: "Repos annuel l\xE9gal",
    status: "APPROUVE",
    requestedAt: "2026-10-12",
    approvedBy: "Mme. B\xE9atrice Akplogan"
  },
  {
    id: "leave_2",
    employeeId: "agent_3",
    employeeName: "Michael Johnson",
    type: "PERMISSION_EXCEPTIONNELLE",
    startDate: "2026-10-20",
    endDate: "2026-10-22",
    daysCount: 2,
    reason: "C\xE9r\xE9monie familiale Ouidah",
    status: "EN_ATTENTE",
    requestedAt: "2026-10-14"
  }
];
var INITIAL_PAYSLIPS = [
  {
    id: "pay_2026_09_01",
    slipNumber: "BS-2026-09-001",
    employeeId: "agent_1",
    employeeName: "Emily Davis",
    role: "AGENT_RECENSEUR",
    month: "Septembre 2026",
    baseSalary: 22e4,
    commissions: 35e4,
    bonuses: 3e4,
    grossTotal: 6e5,
    cnssEmployee: 21600,
    iptsTax: 32e3,
    netPayable: 546400,
    paymentMode: "Virement bancaire (BOA B\xE9nin)",
    paidAt: "2026-09-30 17:00",
    status: "PAYE"
  },
  {
    id: "pay_2026_09_02",
    slipNumber: "BS-2026-09-002",
    employeeId: "agent_2",
    employeeName: "James Smith",
    role: "AGENT_RECENSEUR",
    month: "Septembre 2026",
    baseSalary: 22e4,
    commissions: 42e4,
    bonuses: 45e3,
    grossTotal: 685e3,
    cnssEmployee: 24660,
    iptsTax: 38500,
    netPayable: 621840,
    paymentMode: "Virement bancaire (Ecobank)",
    paidAt: "2026-09-30 17:00",
    status: "PAYE"
  },
  {
    id: "pay_2026_09_03",
    slipNumber: "BS-2026-09-003",
    employeeId: "user_secretaire",
    employeeName: "Mme. Solange Zinsou",
    role: "SECRETAIRE",
    month: "Septembre 2026",
    baseSalary: 28e4,
    commissions: 35e3,
    bonuses: 2e4,
    grossTotal: 335e3,
    cnssEmployee: 12060,
    iptsTax: 16500,
    netPayable: 306440,
    paymentMode: "MTN Mobile Money",
    paidAt: "2026-09-30 17:00",
    status: "PAYE"
  }
];
var INITIAL_PROPERTIES = [
  {
    id: "prop_01",
    codeReference: "CM-COT-2026-048",
    title: "Arasaka Tower - Penthouse 48",
    description: "Penthouse contemporain avec piscine suspendue et vue panoramique sur l\u2019oc\xE9an Atlantique. Finitions marbre italien, domotique compl\xE8te et ascenseur priv\xE9.",
    listingType: "VENTE",
    category: "APPARTEMENT",
    department: "Littoral",
    city: "Cotonou",
    arrondissement: "12\xE8me Arrondissement (Cadj\xE8houn, Haie-Vive, Fidjross\xE8)",
    district: "Haie Vive",
    address: "Boulevard de la Marina, Rue 320, Cotonou, B\xE9nin",
    priceAmount: 385e6,
    // 385,000,000 FCFA
    priceUSD: 64e4,
    areaSqMeters: 305,
    roomsCount: 8,
    bedroomsCount: 4,
    bathroomsCount: 4,
    legalStatus: "TITRE_FONCIER",
    isFeatured: true,
    coordinates: {
      latitude: 6.3533,
      longitude: 2.4118,
      accuracy: 2.1,
      altitude: 12,
      addressApprox: "Haie-Vive, Cotonou littoral",
      capturedAt: Date.now() - 864e5 * 2
    },
    owner: {
      id: "own_1",
      fullName: "Dr. Florentin Agossou",
      phonePrimary: "+229 97 50 12 88",
      phoneWhatsapp: "+229 97 50 12 88",
      email: "f.agossou@gmail.com",
      mandateType: "EXCLUSIF",
      mandateDurationMonths: 12
    },
    photos: [
      {
        id: "p1_1",
        category: "FACADE",
        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
        isMain: true,
        caption: "Tour ext\xE9rieure & terrasse panoramique",
        timestamp: Date.now() - 864e5 * 2
      },
      {
        id: "p1_2",
        category: "SALON",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
        isMain: false,
        caption: "Grand s\xE9jour ouvert avec salon lumineux",
        timestamp: Date.now() - 864e5 * 2
      }
    ],
    assignedAgentId: "agent_1",
    assignedAgentName: "Emily Davis",
    syncStatus: "synced",
    createdAt: Date.now() - 864e5 * 2,
    updatedAt: Date.now() - 864e5 * 2
  },
  {
    id: "prop_02",
    codeReference: "CM-CAL-2026-017",
    title: "Groove Residences - Calavi",
    description: "Magnifique villa duplex R+1 neuve dans une r\xE9sidence cl\xF4tur\xE9e et gard\xE9e 24/7. Proche de l\u2019Universit\xE9 d\u2019Abomey-Calavi (UAC) et de la voie pav\xE9e.",
    listingType: "VENTE",
    category: "VILLA_DUPLEX",
    department: "Atlantique",
    city: "Abomey-Calavi",
    arrondissement: "Abomey-Calavi Centre",
    district: "Tankp\xEA",
    address: "Carrefour Tankp\xE8, Abomey-Calavi, B\xE9nin",
    priceAmount: 145e6,
    priceUSD: 24e4,
    areaSqMeters: 450,
    roomsCount: 6,
    bedroomsCount: 4,
    bathroomsCount: 3,
    legalStatus: "TITRE_FONCIER",
    isFeatured: true,
    coordinates: {
      latitude: 6.4485,
      longitude: 2.3551,
      accuracy: 2.8,
      altitude: 18,
      addressApprox: "Tankp\xEA, Abomey-Calavi",
      capturedAt: Date.now() - 864e5 * 3
    },
    owner: {
      id: "own_2",
      fullName: "Mme. Claudine Dossou",
      phonePrimary: "+229 96 40 88 12",
      phoneWhatsapp: "+229 96 40 88 12",
      email: "c.dossou@yahoo.fr",
      mandateType: "EXCLUSIF",
      mandateDurationMonths: 6
    },
    photos: [
      {
        id: "p2_1",
        category: "FACADE",
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80",
        isMain: true,
        caption: "Entr\xE9e principale et cl\xF4ture s\xE9curis\xE9e",
        timestamp: Date.now() - 864e5 * 3
      }
    ],
    assignedAgentId: "agent_1",
    assignedAgentName: "Emily Davis",
    syncStatus: "synced",
    createdAt: Date.now() - 864e5 * 3,
    updatedAt: Date.now() - 864e5 * 3
  },
  {
    id: "prop_03",
    codeReference: "CM-COT-2026-021",
    title: "Heights Apartments - Fidjross\xE8 Plage",
    description: "Appartement F4 meubl\xE9 haut standing \xE0 200m de la plage Fidjross\xE8. Id\xE9al pour expatri\xE9s et location courte/moyenne dur\xE9e.",
    listingType: "LOCATION_MEUBLEE",
    category: "APPARTEMENT",
    department: "Littoral",
    city: "Cotonou",
    arrondissement: "12\xE8me Arrondissement (Cadj\xE8houn, Haie-Vive, Fidjross\xE8)",
    district: "Fidjross\xE8 Centre",
    address: "Route des P\xEAches, Cotonou, B\xE9nin",
    priceAmount: 85e4,
    priceUSD: 1400,
    areaSqMeters: 160,
    roomsCount: 4,
    bedroomsCount: 3,
    bathroomsCount: 2,
    legalStatus: "TITRE_FONCIER",
    isFeatured: true,
    coordinates: {
      latitude: 6.3578,
      longitude: 2.3789,
      accuracy: 4.1,
      altitude: 8,
      addressApprox: "Fidjross\xE8 Plage, Cotonou",
      capturedAt: Date.now() - 864e5 * 1
    },
    owner: {
      id: "own_3",
      fullName: "Capitaine Honor\xE9 Gbedji",
      phonePrimary: "+229 97 12 34 56",
      phoneWhatsapp: "+229 97 12 34 56",
      mandateType: "GESTION_DIRECTE",
      mandateDurationMonths: 24
    },
    photos: [
      {
        id: "p3_1",
        category: "FACADE",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
        isMain: true,
        caption: "Immeuble vue mer",
        timestamp: Date.now() - 864e5 * 1
      }
    ],
    assignedAgentId: "agent_2",
    assignedAgentName: "James Smith",
    syncStatus: "synced",
    createdAt: Date.now() - 864e5 * 1,
    updatedAt: Date.now() - 864e5 * 1
  },
  {
    id: "prop_04",
    codeReference: "CM-OUI-2026-038",
    title: "Riverside Manor - Ouidah Dj\xE8gbadji",
    description: "Immense domaine foncier de 2500 m\xB2 bordant la lagune de Ouidah, id\xE9al pour \xE9colodge ou r\xE9sidence baln\xE9aire de charme.",
    listingType: "VENTE",
    category: "TERRAIN_NU",
    department: "Atlantique",
    city: "Ouidah",
    arrondissement: "Dj\xE8gbadji (Plage & Porte du Non Retour)",
    district: "Dj\xE8gbadji",
    address: "Route de la Porte du Non Retour, Ouidah",
    priceAmount: 95e6,
    priceUSD: 16e4,
    areaSqMeters: 2500,
    roomsCount: 0,
    bedroomsCount: 0,
    bathroomsCount: 0,
    legalStatus: "ATTESTATION_RECASEMENT",
    isFeatured: false,
    coordinates: {
      latitude: 6.3421,
      longitude: 2.0855,
      accuracy: 5.2,
      altitude: 5,
      addressApprox: "Dj\xE8gbadji, Ouidah littoral",
      capturedAt: Date.now() - 864e5 * 4
    },
    owner: {
      id: "own_4",
      fullName: "Famille de Souza",
      phonePrimary: "+229 95 00 11 22",
      phoneWhatsapp: "+229 95 00 11 22",
      mandateType: "SIMPLE",
      mandateDurationMonths: 12
    },
    photos: [
      {
        id: "p4_1",
        category: "EXTERIEUR",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
        isMain: true,
        caption: "Vue panoramique sur la rive lagunaire",
        timestamp: Date.now() - 864e5 * 4
      }
    ],
    assignedAgentId: "agent_3",
    assignedAgentName: "Michael Johnson",
    syncStatus: "pending",
    createdAt: Date.now() - 36e5 * 4,
    updatedAt: Date.now() - 36e5 * 4
  }
];
var INITIAL_TRANSACTIONS = [
  {
    id: "tx_1",
    code: "CAISSE-2026-081",
    type: "ENTREE",
    category: "COMMISSION_VENTE",
    amount: 1925e4,
    description: "Commission d\u2019agence 5% sur vente Villa Fidjross\xE8",
    agentOrClient: "Emily Davis / Acheteur M. Bio",
    paymentMode: "VIREMENT",
    date: "2026-10-14 16:30",
    emecefInvoiceRef: "FAC-2026-0041"
  },
  {
    id: "tx_sal_1",
    code: "DEP-2026-075",
    type: "SORTIE",
    category: "SALAIRE_REMUNERATION",
    amount: 546400,
    description: "Salaire net & commissions Septembre 2026 (Emily Davis)",
    agentOrClient: "Emily Davis (Agent)",
    paymentMode: "VIREMENT",
    date: "2026-09-30 17:00",
    emecefInvoiceRef: "BS-2026-09-001",
    beneficiaryEmployeeId: "agent_1"
  },
  {
    id: "tx_sal_2",
    code: "DEP-2026-076",
    type: "SORTIE",
    category: "SALAIRE_REMUNERATION",
    amount: 621840,
    description: "Salaire net & commissions Septembre 2026 (James Smith)",
    agentOrClient: "James Smith (Agent)",
    paymentMode: "VIREMENT",
    date: "2026-09-30 17:00",
    emecefInvoiceRef: "BS-2026-09-002",
    beneficiaryEmployeeId: "agent_2"
  },
  {
    id: "tx_2",
    code: "DEP-2026-082",
    type: "SORTIE",
    category: "DEPLACEMENT",
    amount: 75e3,
    description: "Carburant et indemnit\xE9s tourn\xE9e recensement Ouidah & Tori",
    agentOrClient: "Station B\xE9nin P\xE9tro Haie-Vive",
    paymentMode: "ESPECES",
    date: "2026-10-14 11:15"
  },
  {
    id: "tx_3",
    code: "CAISSE-2026-083",
    type: "ENTREE",
    category: "FRAIS_RECENSEMENT",
    amount: 5e4,
    description: "Frais d\u2019ouverture de dossier recensement mandat",
    agentOrClient: "Propri\xE9taire Agossou",
    paymentMode: "MOBILE_MONEY",
    date: "2026-10-13 14:00",
    emecefInvoiceRef: "FAC-2026-0042"
  },
  {
    id: "tx_4",
    code: "CAISSE-2026-084",
    type: "ENTREE",
    category: "LOYER_ENCAISSE",
    amount: 255e4,
    description: "Encaissement 3 mois loyers d\u2019avance Appartement Cadj\xE8houn",
    agentOrClient: "Locataire M. Zinsou",
    paymentMode: "VIREMENT",
    date: "2026-10-12 09:45",
    emecefInvoiceRef: "FAC-2026-0040"
  }
];
var INITIAL_DOCUMENTS = [
  {
    id: "doc_1",
    title: "Titre Foncier N\xB0 4521/LITTO Cotonou",
    type: "TITRE_FONCIER",
    propertyCode: "CM-COT-2026-048",
    propertyName: "Arasaka Tower - Penthouse 48",
    ownerName: "Dr. Florentin Agossou",
    fileSize: "4.8 Mo (PDF scell\xE9 ANDF)",
    status: "VALIDE",
    uploadedAt: "12 Oct 2026",
    expiryDate: "Permanent"
  },
  {
    id: "doc_2",
    title: "Mandat de Vente Exclusif 12 Mois",
    type: "MANDAT_GESTION",
    propertyCode: "CM-COT-2026-048",
    propertyName: "Arasaka Tower - Penthouse 48",
    ownerName: "Dr. Florentin Agossou",
    fileSize: "1.2 Mo (Sign\xE9)",
    status: "VALIDE",
    uploadedAt: "12 Oct 2026",
    expiryDate: "12 Oct 2027"
  },
  {
    id: "doc_3",
    title: "Attestation de Recasement Mairie Abomey-Calavi",
    type: "ATTESTATION_RECASEMENT",
    propertyCode: "CM-CAL-2026-017",
    propertyName: "Groove Residences - Calavi",
    ownerName: "Mme. Claudine Dossou",
    fileSize: "2.4 Mo",
    status: "VALIDE",
    uploadedAt: "10 Oct 2026"
  },
  {
    id: "doc_4",
    title: "Plan Topographique G\xE9or\xE9f\xE9renc\xE9 UTM 31N",
    type: "PLAN_TOPOGRAPHIQUE",
    propertyCode: "CM-OUI-2026-038",
    propertyName: "Riverside Manor - Ouidah",
    ownerName: "Famille de Souza",
    fileSize: "6.1 Mo (AutoCAD/PDF)",
    status: "EN_VERIFICATION",
    uploadedAt: "14 Oct 2026"
  }
];

// src/server/db.ts
dotenv.config();
var dbHost = process.env.DB_HOST || "localhost";
var dbUser = process.env.DB_USER || "";
var dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS || "";
var dbName = process.env.DB_NAME || "";
var dbPort = Number(process.env.DB_PORT || 3306);
var pool = null;
var isMySqlConnected = false;
var lastDbError = null;
var memoryStore = {
  properties: [...INITIAL_PROPERTIES],
  users: [...INITIAL_USERS],
  transactions: [...INITIAL_TRANSACTIONS],
  leaveRequests: [...INITIAL_LEAVE_REQUESTS],
  payslips: [...INITIAL_PAYSLIPS],
  documents: [...INITIAL_DOCUMENTS],
  settings: {
    whatsapp: { enabled: true, connectedPhone: "+229 97 00 11 22", autoNotifyOwners: true },
    gmail: { enabled: true, syncEmail: "direction@chezmoi.bj", emailBilanMonthly: true },
    claude: { enabled: true, model: "claude-3-7-sonnet", autoAuditDocuments: true },
    gemini: { enabled: true, model: "gemini-2.5-flash", visionCadastre: true },
    webhooks: { makeWebhookUrl: "https://hook.eu1.make.com/chezmoi-sync", zapierWebhookUrl: "" }
  }
};
async function initDatabase() {
  if (!dbUser || !dbName) {
    console.log("[Hostinger MySQL] Pas d\u2019identifiants MySQL configur\xE9s dans .env - Mode In-Memory Fallback actif.");
    isMySqlConnected = false;
    return false;
  }
  try {
    pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5e3
    });
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isMySqlConnected = true;
    lastDbError = null;
    console.log(`[Hostinger MySQL] Connect\xE9 avec succ\xE8s \xE0 la base "${dbName}" sur ${dbHost}:${dbPort} !`);
    return true;
  } catch (err) {
    isMySqlConnected = false;
    lastDbError = err?.message || String(err);
    console.warn(`[Hostinger MySQL] Impossible de joindre MySQL (${lastDbError}). Bascule sur le stockage m\xE9moire locale.`);
    return false;
  }
}
async function getDatabaseStatus() {
  return {
    engine: isMySqlConnected ? "MySQL / MariaDB (Hostinger Cloud)" : "In-Memory Drift Store (Pr\xEAt pour Hostinger MySQL)",
    connected: isMySqlConnected,
    host: dbHost,
    database: dbName || "(en attente de configuration .env)",
    port: dbPort,
    lastError: lastDbError,
    records: {
      properties: memoryStore.properties.length,
      users: memoryStore.users.length,
      transactions: memoryStore.transactions.length,
      payslips: memoryStore.payslips.length,
      documents: memoryStore.documents.length
    }
  };
}
async function getAllProperties() {
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM properties ORDER BY updated_at DESC");
      return rows.map((r) => ({
        id: r.id,
        codeReference: r.code_reference,
        title: r.title,
        description: r.description || "",
        listingType: r.listing_type,
        category: r.category,
        department: r.department || "",
        city: r.city,
        arrondissement: r.arrondissement || "",
        district: r.district,
        address: r.address,
        priceAmount: Number(r.price_amount),
        priceUSD: r.price_usd ? Number(r.price_usd) : void 0,
        areaSqMeters: Number(r.area_sq_meters),
        roomsCount: Number(r.rooms_count),
        bedroomsCount: Number(r.bedrooms_count),
        bathroomsCount: Number(r.bathrooms_count),
        coordinates: {
          latitude: Number(r.coordinates_lat || 0),
          longitude: Number(r.coordinates_lng || 0),
          accuracy: Number(r.coordinates_accuracy || 0),
          addressApprox: r.coordinates_address_approx || "",
          capturedAt: Number(r.coordinates_captured_at || Date.now())
        },
        owner: typeof r.owner_data === "string" ? JSON.parse(r.owner_data) : r.owner_data || {},
        photos: typeof r.photos === "string" ? JSON.parse(r.photos) : r.photos || [],
        assignedAgentId: r.assigned_agent_id,
        assignedAgentName: r.assigned_agent_name,
        syncStatus: r.sync_status,
        syncError: r.sync_error || void 0,
        legalStatus: r.legal_status,
        isFeatured: Boolean(r.is_featured),
        createdAt: Number(r.created_at),
        updatedAt: Number(r.updated_at),
        serverSyncTimestamp: Number(r.server_sync_timestamp || Date.now())
      }));
    } catch (err) {
      console.error("[MySQL Error] getAllProperties:", err);
    }
  }
  return memoryStore.properties;
}
async function upsertProperty(prop) {
  const now = Date.now();
  const record = {
    ...prop,
    syncStatus: "synced",
    updatedAt: prop.updatedAt || now,
    serverSyncTimestamp: now
  };
  if (isMySqlConnected && pool) {
    try {
      const sql = `
        INSERT INTO properties (
          id, code_reference, title, description, listing_type, category, 
          department, city, arrondissement, district, address, price_amount, 
          price_usd, area_sq_meters, rooms_count, bedrooms_count, bathrooms_count, 
          coordinates_lat, coordinates_lng, coordinates_accuracy, coordinates_address_approx, coordinates_captured_at,
          owner_data, photos, assigned_agent_id, assigned_agent_name, sync_status, 
          legal_status, is_featured, created_at, updated_at, server_sync_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          description = VALUES(description),
          listing_type = VALUES(listing_type),
          category = VALUES(category),
          department = VALUES(department),
          city = VALUES(city),
          arrondissement = VALUES(arrondissement),
          district = VALUES(district),
          address = VALUES(address),
          price_amount = VALUES(price_amount),
          price_usd = VALUES(price_usd),
          area_sq_meters = VALUES(area_sq_meters),
          rooms_count = VALUES(rooms_count),
          bedrooms_count = VALUES(bedrooms_count),
          bathrooms_count = VALUES(bathrooms_count),
          coordinates_lat = VALUES(coordinates_lat),
          coordinates_lng = VALUES(coordinates_lng),
          coordinates_accuracy = VALUES(coordinates_accuracy),
          coordinates_address_approx = VALUES(coordinates_address_approx),
          owner_data = VALUES(owner_data),
          photos = VALUES(photos),
          sync_status = 'synced',
          updated_at = VALUES(updated_at),
          server_sync_timestamp = VALUES(server_sync_timestamp)
      `;
      await pool.query(sql, [
        record.id,
        record.codeReference,
        record.title,
        record.description || "",
        record.listingType,
        record.category,
        record.department || "",
        record.city,
        record.arrondissement || "",
        record.district,
        record.address,
        record.priceAmount,
        record.priceUSD || null,
        record.areaSqMeters,
        record.roomsCount,
        record.bedroomsCount,
        record.bathroomsCount,
        record.coordinates?.latitude || null,
        record.coordinates?.longitude || null,
        record.coordinates?.accuracy || null,
        record.coordinates?.addressApprox || null,
        record.coordinates?.capturedAt || now,
        JSON.stringify(record.owner || {}),
        JSON.stringify(record.photos || []),
        record.assignedAgentId,
        record.assignedAgentName,
        "synced",
        record.legalStatus,
        record.isFeatured ? 1 : 0,
        record.createdAt || now,
        record.updatedAt || now,
        now
      ]);
      return record;
    } catch (err) {
      console.error("[MySQL Error] upsertProperty:", err);
    }
  }
  const idx = memoryStore.properties.findIndex((p) => p.id === record.id);
  if (idx !== -1) {
    memoryStore.properties[idx] = record;
  } else {
    memoryStore.properties.unshift(record);
  }
  return record;
}
async function processSyncPush(items) {
  const result = {
    accepted: [],
    conflicts: [],
    serverTimestamp: Date.now()
  };
  for (const item of items) {
    try {
      if (item.entityType === "property") {
        const existing = memoryStore.properties.find((p) => p.id === item.entityId);
        if (existing && existing.updatedAt > item.localTimestamp) {
          result.conflicts.push({
            id: item.id,
            reason: "Conflit de version : Le serveur poss\xE8de une modification plus r\xE9cente.",
            serverRecord: existing
          });
          continue;
        }
        await upsertProperty(item.payload);
        result.accepted.push(item.id);
      } else if (item.entityType === "transaction") {
        await upsertTransaction(item.payload);
        result.accepted.push(item.id);
      } else {
        result.accepted.push(item.id);
      }
    } catch (err) {
      result.conflicts.push({
        id: item.id,
        reason: err?.message || "Erreur inconnue lors du push",
        serverRecord: null
      });
    }
  }
  return result;
}
async function processSyncPull(sinceTimestamp) {
  const updatedProps = memoryStore.properties.filter((p) => (p.updatedAt || 0) > sinceTimestamp);
  const updatedTx = memoryStore.transactions.filter((t) => (Date.parse(t.date) || 0) > sinceTimestamp);
  return {
    properties: updatedProps,
    transactions: updatedTx,
    serverTimestamp: Date.now()
  };
}
async function getAllTransactions() {
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM cash_transactions ORDER BY date DESC");
      return rows.map((r) => ({
        id: r.id,
        code: r.code,
        type: r.type,
        category: r.category,
        amount: Number(r.amount),
        description: r.description,
        agentOrClient: r.agent_or_client,
        paymentMode: r.payment_mode,
        date: r.date,
        emecefInvoiceRef: r.emecef_invoice_ref || void 0,
        beneficiaryEmployeeId: r.beneficiary_employee_id || void 0,
        salaryDetails: typeof r.salary_details === "string" ? JSON.parse(r.salary_details) : r.salary_details
      }));
    } catch (err) {
      console.error("[MySQL Error] getAllTransactions:", err);
    }
  }
  return memoryStore.transactions;
}
async function upsertTransaction(tx) {
  if (isMySqlConnected && pool) {
    try {
      const sql = `
        INSERT INTO cash_transactions (
          id, code, type, category, amount, description, 
          agent_or_client, payment_mode, date, emecef_invoice_ref, 
          beneficiary_employee_id, salary_details, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          amount = VALUES(amount),
          description = VALUES(description),
          date = VALUES(date),
          salary_details = VALUES(salary_details)
      `;
      await pool.query(sql, [
        tx.id,
        tx.code,
        tx.type,
        tx.category,
        tx.amount,
        tx.description,
        tx.agentOrClient,
        tx.paymentMode,
        tx.date,
        tx.emecefInvoiceRef || null,
        tx.beneficiaryEmployeeId || null,
        tx.salaryDetails ? JSON.stringify(tx.salaryDetails) : null,
        Date.now()
      ]);
      return tx;
    } catch (err) {
      console.error("[MySQL Error] upsertTransaction:", err);
    }
  }
  const idx = memoryStore.transactions.findIndex((t) => t.id === tx.id);
  if (idx !== -1) {
    memoryStore.transactions[idx] = tx;
  } else {
    memoryStore.transactions.unshift(tx);
  }
  return tx;
}
async function getAllUsers() {
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM users ORDER BY name ASC");
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        avatar: r.avatar || "",
        phone: r.phone,
        role: r.role,
        jobTitle: r.job_title,
        departmentName: r.department_name,
        baseSalary: Number(r.base_salary),
        commissionRate: Number(r.commission_rate),
        hireDate: r.hire_date,
        contractType: r.contract_type,
        city: r.city,
        assignedZone: r.assigned_zone || "",
        rating: Number(r.rating),
        propertiesCount: Number(r.properties_count),
        pendingSyncCount: Number(r.pending_sync_count),
        totalCommissions: Number(r.total_commissions),
        status: r.status,
        cnssNumber: r.cnss_number || void 0
      }));
    } catch (err) {
      console.error("[MySQL Error] getAllUsers:", err);
    }
  }
  return memoryStore.users;
}
async function upsertUser(user) {
  const now = Date.now();
  if (isMySqlConnected && pool) {
    try {
      const sql = `
        INSERT INTO users (
          id, name, email, avatar, phone, role, job_title, department_name, 
          base_salary, commission_rate, hire_date, contract_type, city, 
          assigned_zone, rating, properties_count, pending_sync_count, 
          total_commissions, status, cnss_number, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          phone = VALUES(phone),
          role = VALUES(role),
          job_title = VALUES(job_title),
          department_name = VALUES(department_name),
          base_salary = VALUES(base_salary),
          commission_rate = VALUES(commission_rate),
          city = VALUES(city),
          assigned_zone = VALUES(assigned_zone),
          status = VALUES(status),
          cnss_number = VALUES(cnss_number),
          updated_at = VALUES(updated_at)
      `;
      await pool.query(sql, [
        user.id,
        user.name,
        user.email,
        user.avatar || null,
        user.phone,
        user.role,
        user.jobTitle,
        user.departmentName,
        user.baseSalary,
        user.commissionRate,
        user.hireDate,
        user.contractType,
        user.city,
        user.assignedZone,
        user.rating,
        user.propertiesCount,
        user.pendingSyncCount,
        user.totalCommissions,
        user.status,
        user.cnssNumber || null,
        now,
        now
      ]);
      return user;
    } catch (err) {
      console.error("[MySQL Error] upsertUser:", err);
    }
  }
  const idx = memoryStore.users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    memoryStore.users[idx] = user;
  } else {
    memoryStore.users.push(user);
  }
  return user;
}
async function getAllLeaveRequests() {
  return memoryStore.leaveRequests;
}
async function addLeaveRequest(req) {
  memoryStore.leaveRequests.unshift(req);
  return req;
}
async function updateLeaveStatus(id, status, approvedBy) {
  const target = memoryStore.leaveRequests.find((l) => l.id === id);
  if (target) {
    target.status = status;
    target.approvedBy = approvedBy;
    return true;
  }
  return false;
}
async function getAllPayslips() {
  return memoryStore.payslips;
}
async function addPayslip(slip) {
  memoryStore.payslips.unshift(slip);
  return slip;
}
async function getAllDocuments() {
  return memoryStore.documents;
}
async function addDocument(doc) {
  memoryStore.documents.unshift(doc);
  return doc;
}
async function getSettings() {
  return memoryStore.settings;
}
async function updateSettings(newSettings) {
  memoryStore.settings = { ...memoryStore.settings, ...newSettings };
  return memoryStore.settings;
}

// server.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var isProduction = process.env.NODE_ENV === "production";
var PORT = process.env.PORT || 3e3;
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  await initDatabase();
  app.get("/api/health", async (req, res) => {
    const status = await getDatabaseStatus();
    res.json({
      status: "online",
      app: "Chezmoi ERP Immobilier B\xE9nin",
      version: "2.5.0-hostinger-mysql",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: status,
      environment: isProduction ? "production (Hostinger Cloud)" : "development"
    });
  });
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await getAllProperties();
      res.json(properties);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur lors du chargement des biens" });
    }
  });
  app.post("/api/properties", async (req, res) => {
    try {
      const saved = await upsertProperty(req.body);
      res.json({ success: true, property: saved });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur lors de la sauvegarde du bien" });
    }
  });
  app.post("/api/sync/push", async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Payload invalide: items doit \xEAtre un tableau" });
      }
      const result = await processSyncPush(items);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur synchronisation push" });
    }
  });
  app.get("/api/sync/pull", async (req, res) => {
    try {
      const since = Number(req.query.since || 0);
      const data = await processSyncPull(since);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur synchronisation pull" });
    }
  });
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await getAllTransactions();
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur transactions" });
    }
  });
  app.post("/api/transactions", async (req, res) => {
    try {
      const saved = await upsertTransaction(req.body);
      res.json({ success: true, transaction: saved });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur cr\xE9ation transaction" });
    }
  });
  app.get("/api/users", async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur utilisateurs" });
    }
  });
  app.post("/api/users", async (req, res) => {
    try {
      const saved = await upsertUser(req.body);
      res.json({ success: true, user: saved });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur mise \xE0 jour utilisateur" });
    }
  });
  app.get("/api/leave-requests", async (req, res) => {
    try {
      const leaves = await getAllLeaveRequests();
      res.json(leaves);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur cong\xE9s" });
    }
  });
  app.post("/api/leave-requests", async (req, res) => {
    try {
      const created = await addLeaveRequest(req.body);
      res.json({ success: true, leaveRequest: created });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur demande de cong\xE9" });
    }
  });
  app.put("/api/leave-requests/:id/status", async (req, res) => {
    try {
      const { status, approvedBy } = req.body;
      const ok = await updateLeaveStatus(req.params.id, status, approvedBy || "Admin");
      res.json({ success: ok });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur approbation cong\xE9" });
    }
  });
  app.get("/api/payslips", async (req, res) => {
    try {
      const slips = await getAllPayslips();
      res.json(slips);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur bulletins de paie" });
    }
  });
  app.post("/api/payslips", async (req, res) => {
    try {
      const slip = await addPayslip(req.body);
      res.json({ success: true, payslip: slip });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur cr\xE9ation bulletin" });
    }
  });
  app.get("/api/documents", async (req, res) => {
    try {
      const docs = await getAllDocuments();
      res.json(docs);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur documents fonciers" });
    }
  });
  app.post("/api/documents", async (req, res) => {
    try {
      const doc = await addDocument(req.body);
      res.json({ success: true, document: doc });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur enregistrement document" });
    }
  });
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await getSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur param\xE8tres" });
    }
  });
  app.post("/api/settings", async (req, res) => {
    try {
      const updated = await updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur sauvegarde param\xE8tres" });
    }
  });
  app.post("/api/webhooks/test", async (req, res) => {
    const { url, payload } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL webhook manquante" });
    }
    res.json({
      success: true,
      deliveredAt: (/* @__PURE__ */ new Date()).toISOString(),
      url,
      payloadSent: payload || { test: "ping", app: "Chezmoi ERP" },
      message: "Webhook simul\xE9 avec succ\xE8s vers le point de terminaison sp\xE9cifi\xE9."
    });
  });
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Chezmoi ERP Backend Node.js / Express pr\xEAt !`);
    console.log(` Port d'\xE9coute : ${PORT}`);
    console.log(` Environnement : ${isProduction ? "Production Hostinger Cloud" : "D\xE9veloppement"}`);
    console.log(` Endpoints API disponibles sur : /api/health`);
    console.log(`=======================================================`);
  });
}
startServer().catch((err) => {
  console.error("Erreur fatale au d\xE9marrage du serveur Express:", err);
  process.exit(1);
});
