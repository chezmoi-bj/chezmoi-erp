import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { 
  PropertyRecord, 
  UserAccount, 
  CashTransaction, 
  LeaveRequest, 
  PayslipRecord, 
  LegalDocument 
} from '../types/index.js';
export type { UserAccount };
import { 
  INITIAL_PROPERTIES, 
  INITIAL_USERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_PAYSLIPS, 
  INITIAL_DOCUMENTS,
  CENTRAL_ADMIN_SMB
} from '../data/mockData';
import { 
  sendAdminInitializationEmail, 
  sendNewAccountVerificationEmail,
  sendProfileUpdatedNotificationEmail
} from './mailer';

dotenv.config();

// Configuration Hostinger MySQL
const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';
const dbName = process.env.DB_NAME || '';
const dbPort = Number(process.env.DB_PORT || 3306);

let pool: mysql.Pool | null = null;
let isMySqlConnected = false;
let lastDbError: string | null = null;

// Mémoire de secours (Fallback automatique pour le dev local quand MySQL distant Hostinger n'est pas encore configuré)
export const memoryStore = {
  properties: [...INITIAL_PROPERTIES],
  users: [...INITIAL_USERS],
  transactions: [...INITIAL_TRANSACTIONS],
  leaveRequests: [...INITIAL_LEAVE_REQUESTS],
  payslips: [...INITIAL_PAYSLIPS],
  documents: [...INITIAL_DOCUMENTS],
  settings: {
    whatsapp: { enabled: true, connectedPhone: '+229 97 00 11 22', autoNotifyOwners: true },
    gmail: { enabled: true, syncEmail: 'direction@chezmoi.bj', emailBilanMonthly: true },
    claude: { enabled: true, model: 'claude-3-7-sonnet', autoAuditDocuments: true },
    gemini: { enabled: true, model: 'gemini-2.5-flash', visionCadastre: true },
    webhooks: { makeWebhookUrl: 'https://hook.eu1.make.com/chezmoi-sync', zapierWebhookUrl: '' }
  } as Record<string, any>
};

/**
 * Initialise le pool de connexion MySQL / MariaDB Hostinger
 */
export async function initDatabase(): Promise<boolean> {
  if (!dbUser || !dbName) {
    console.log('[Hostinger MySQL] Pas d’identifiants MySQL configurés dans .env - Mode In-Memory Fallback actif.');
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
      connectTimeout: 5000,
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    isMySqlConnected = true;
    lastDbError = null;
    console.log(`[Hostinger MySQL] Connecté avec succès à la base "${dbName}" sur ${dbHost}:${dbPort} !`);

    // Initialisation et auto-migration des tables + vérification du compte Administrateur Central (SMB)
    await ensureTablesAndAdmin(pool);

    return true;
  } catch (err: any) {
    isMySqlConnected = false;
    lastDbError = err?.message || String(err);
    console.warn(`[Hostinger MySQL] Impossible de joindre MySQL (${lastDbError}). Bascule sur le stockage mémoire locale.`);

    // Envoi de l'e-mail de confirmation en mode In-Memory également
    sendAdminInitializationEmail(CENTRAL_ADMIN_SMB.email, CENTRAL_ADMIN_SMB.name).catch(err => {
      console.error('[Hostinger SMTP] Erreur envoi activation admin:', err);
    });

    return false;
  }
}

/**
 * Crée les tables nécessaires si elles n'existent pas et vérifie la présence de l'Administrateur Central (SMB)
 */
async function ensureTablesAndAdmin(pool: mysql.Pool) {
  try {
    // 1. Table users (avec colonnes de sécurité & validation)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) NOT NULL,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        password_hash VARCHAR(255) DEFAULT NULL,
        avatar TEXT DEFAULT NULL,
        phone VARCHAR(64) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'AGENT_RECENSEUR',
        job_title VARCHAR(191) NOT NULL,
        department_name VARCHAR(191) NOT NULL,
        base_salary DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
        commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        hire_date VARCHAR(32) NOT NULL,
        contract_type VARCHAR(64) NOT NULL DEFAULT 'CDI',
        city VARCHAR(100) NOT NULL DEFAULT 'Cotonou',
        assigned_zone VARCHAR(191) DEFAULT NULL,
        rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
        properties_count INT NOT NULL DEFAULT 0,
        pending_sync_count INT NOT NULL DEFAULT 0,
        total_commissions DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
        status VARCHAR(32) NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
        cnss_number VARCHAR(64) DEFAULT NULL,
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        verification_token VARCHAR(255) DEFAULT NULL,
        two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY idx_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-migration non-bloquante pour anciennes tables MySQL existantes sur Hostinger
    const columnMigrations = [
      'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE users ADD COLUMN two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE users ADD COLUMN totp_secret VARCHAR(64) DEFAULT NULL',
      'ALTER TABLE users ADD COLUMN verification_email_sent TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE users ADD COLUMN total_commissions DECIMAL(14, 2) NOT NULL DEFAULT 0.00',
      'ALTER TABLE properties ADD COLUMN rental_rates JSON DEFAULT NULL',
      'ALTER TABLE properties ADD COLUMN other_details TEXT DEFAULT NULL',
    ];
    for (const mig of columnMigrations) {
      try {
        await pool.query(mig);
      } catch {
        // Colonne déjà présente, pas d'erreur
      }
    }

    // 2. Table properties
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id VARCHAR(64) NOT NULL,
        code_reference VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        listing_type VARCHAR(64) NOT NULL,
        category VARCHAR(64) NOT NULL,
        department VARCHAR(64) DEFAULT NULL,
        city VARCHAR(100) NOT NULL,
        arrondissement VARCHAR(100) DEFAULT NULL,
        district VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        price_amount DECIMAL(14, 2) NOT NULL,
        price_usd DECIMAL(14, 2) DEFAULT NULL,
        area_sq_meters DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        rooms_count INT NOT NULL DEFAULT 0,
        bedrooms_count INT NOT NULL DEFAULT 0,
        bathrooms_count INT NOT NULL DEFAULT 0,
        coordinates_lat DECIMAL(10, 8) DEFAULT NULL,
        coordinates_lng DECIMAL(11, 8) DEFAULT NULL,
        coordinates_accuracy DECIMAL(8, 2) DEFAULT NULL,
        coordinates_address_approx TEXT DEFAULT NULL,
        coordinates_captured_at BIGINT DEFAULT NULL,
        owner_data JSON DEFAULT NULL,
        photos JSON DEFAULT NULL,
        assigned_agent_id VARCHAR(64) NOT NULL,
        assigned_agent_name VARCHAR(191) NOT NULL,
        sync_status VARCHAR(32) NOT NULL DEFAULT 'synced',
        sync_error TEXT DEFAULT NULL,
        legal_status VARCHAR(64) NOT NULL DEFAULT 'EN_COURS',
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        server_sync_timestamp BIGINT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY idx_properties_code (code_reference)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Table cash_transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cash_transactions (
        id VARCHAR(64) NOT NULL,
        code VARCHAR(64) NOT NULL,
        type VARCHAR(32) NOT NULL,
        category VARCHAR(64) NOT NULL,
        amount DECIMAL(14, 2) NOT NULL,
        description TEXT NOT NULL,
        agent_or_client VARCHAR(191) NOT NULL,
        payment_mode VARCHAR(64) NOT NULL DEFAULT 'ESPECES',
        date VARCHAR(32) NOT NULL,
        emecef_invoice_ref VARCHAR(120) DEFAULT NULL,
        beneficiary_employee_id VARCHAR(64) DEFAULT NULL,
        salary_details JSON DEFAULT NULL,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY idx_cash_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Exigence 1: Vérifier si le compte administrateur central (SMB) existe. S'il n'existe pas, l'insérer automatiquement :
    const [adminRows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1',
      [CENTRAL_ADMIN_SMB.email.toLowerCase()]
    );

    if (!adminRows || adminRows.length === 0) {
      console.log(`[Hostinger MySQL] Administrateur central SMB (${CENTRAL_ADMIN_SMB.email}) introuvable. Insertion automatique...`);
      await pool.query(
        `INSERT INTO users (
          id, name, email, avatar, phone, role, job_title, department_name, 
          base_salary, commission_rate, hire_date, contract_type, city, 
          assigned_zone, rating, properties_count, pending_sync_count, 
          total_commissions, status, email_verified, two_factor_enabled, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          CENTRAL_ADMIN_SMB.id,
          CENTRAL_ADMIN_SMB.name,
          CENTRAL_ADMIN_SMB.email,
          CENTRAL_ADMIN_SMB.avatar,
          CENTRAL_ADMIN_SMB.phone,
          CENTRAL_ADMIN_SMB.role,
          CENTRAL_ADMIN_SMB.jobTitle,
          CENTRAL_ADMIN_SMB.departmentName,
          0, 0, '2026-01-01', 'CDI', 'Cotonou', 'National (Bénin)', 10, 0, 0, 0,
          'ACTIF', 1, 0, Date.now(), Date.now()
        ]
      );
      console.log(`[Hostinger MySQL] Compte Administrateur Central SMB (${CENTRAL_ADMIN_SMB.email}) inséré avec succès (Rôle: Super Admin, Statut: Vérifié / Actif).`);
    } else {
      await pool.query(
        `UPDATE users SET role = 'SUPER_ADMIN', status = 'ACTIF', email_verified = 1, avatar = ? WHERE LOWER(email) = ?`,
        [CENTRAL_ADMIN_SMB.avatar, CENTRAL_ADMIN_SMB.email.toLowerCase()]
      );
      console.log(`[Hostinger MySQL] Compte Administrateur Central SMB (${CENTRAL_ADMIN_SMB.email}) vérifié et actif.`);
    }

    // Déclenchement de l'envoi de l'e-mail de confirmation d'activation SMB via Hostinger SMTP
    sendAdminInitializationEmail(CENTRAL_ADMIN_SMB.email, CENTRAL_ADMIN_SMB.name).catch(err => {
      console.error('[Hostinger SMTP] Erreur envoi activation admin:', err);
    });

  } catch (err: any) {
    console.error('[Hostinger MySQL] Erreur ensureTablesAndAdmin:', err?.message);
  }
}

/**
 * Retourne l'état de la connexion MySQL / MariaDB pour le monitoring
 */
export async function getDatabaseStatus() {
  return {
    engine: isMySqlConnected ? 'MySQL / MariaDB (Hostinger Cloud)' : 'In-Memory Drift Store (Prêt pour Hostinger MySQL)',
    connected: isMySqlConnected,
    host: dbHost,
    database: dbName || '(en attente de configuration .env)',
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

// ----------------------------------------------------------------------------
// GESTION DES BIENS IMMOBILIERS (PROPERTIES)
// ----------------------------------------------------------------------------

export async function getAllProperties(): Promise<PropertyRecord[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM properties ORDER BY updated_at DESC');
      return rows.map((r: any) => ({
        id: r.id,
        codeReference: r.code_reference,
        title: r.title,
        description: r.description || '',
        listingType: r.listing_type,
        category: r.category,
        department: r.department || '',
        city: r.city,
        arrondissement: r.arrondissement || '',
        district: r.district,
        address: r.address,
        priceAmount: Number(r.price_amount),
        priceUSD: r.price_usd ? Number(r.price_usd) : undefined,
        areaSqMeters: Number(r.area_sq_meters),
        roomsCount: Number(r.rooms_count),
        bedroomsCount: Number(r.bedrooms_count),
        bathroomsCount: Number(r.bathrooms_count),
        coordinates: {
          latitude: Number(r.coordinates_lat || 0),
          longitude: Number(r.coordinates_lng || 0),
          accuracy: Number(r.coordinates_accuracy || 0),
          addressApprox: r.coordinates_address_approx || '',
          capturedAt: Number(r.coordinates_captured_at || Date.now())
        },
        owner: typeof r.owner_data === 'string' ? JSON.parse(r.owner_data) : (r.owner_data || {}),
        photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : (r.photos || []),
        rentalRates: r.rental_rates ? (typeof r.rental_rates === 'string' ? JSON.parse(r.rental_rates) : r.rental_rates) : undefined,
        otherDetails: r.other_details || undefined,
        assignedAgentId: r.assigned_agent_id,
        assignedAgentName: r.assigned_agent_name,
        syncStatus: r.sync_status,
        syncError: r.sync_error || undefined,
        legalStatus: r.legal_status,
        isFeatured: Boolean(r.is_featured),
        createdAt: Number(r.created_at),
        updatedAt: Number(r.updated_at),
        serverSyncTimestamp: Number(r.server_sync_timestamp || Date.now())
      }));
    } catch (err) {
      console.error('[MySQL Error] getAllProperties:', err);
    }
  }
  return memoryStore.properties;
}

export async function upsertProperty(prop: PropertyRecord): Promise<PropertyRecord> {
  const now = Date.now();
  const record: PropertyRecord = {
    ...prop,
    syncStatus: 'synced',
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
          owner_data, photos, rental_rates, other_details, assigned_agent_id, assigned_agent_name, sync_status, 
          legal_status, is_featured, created_at, updated_at, server_sync_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          rental_rates = VALUES(rental_rates),
          other_details = VALUES(other_details),
          sync_status = 'synced',
          updated_at = VALUES(updated_at),
          server_sync_timestamp = VALUES(server_sync_timestamp)
      `;

      await pool.query(sql, [
        record.id,
        record.codeReference,
        record.title,
        record.description || '',
        record.listingType,
        record.category,
        record.department || '',
        record.city,
        record.arrondissement || '',
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
        record.rentalRates ? JSON.stringify(record.rentalRates) : null,
        record.otherDetails || null,
        record.assignedAgentId,
        record.assignedAgentName,
        'synced',
        record.legalStatus,
        record.isFeatured ? 1 : 0,
        record.createdAt || now,
        record.updatedAt || now,
        now
      ]);

      return record;
    } catch (err) {
      console.error('[MySQL Error] upsertProperty:', err);
    }
  }

  // Fallback mémoire
  const idx = memoryStore.properties.findIndex(p => p.id === record.id);
  if (idx !== -1) {
    memoryStore.properties[idx] = record;
  } else {
    memoryStore.properties.unshift(record);
  }
  return record;
}

// ----------------------------------------------------------------------------
// SYNCHRONISATION OFFLINE (DRIFT SQLITE -> MYSQL BATCH PUSH / PULL)
// ----------------------------------------------------------------------------

export interface SyncPushItem {
  id: string;
  entityType: 'property' | 'transaction' | 'user' | 'document';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  localTimestamp: number;
}

export interface SyncPushResult {
  accepted: string[];
  conflicts: { id: string; reason: string; serverRecord: any }[];
  serverTimestamp: number;
}

export async function processSyncPush(items: SyncPushItem[]): Promise<SyncPushResult> {
  const result: SyncPushResult = {
    accepted: [],
    conflicts: [],
    serverTimestamp: Date.now()
  };

  for (const item of items) {
    try {
      if (item.entityType === 'property') {
        const existing = memoryStore.properties.find(p => p.id === item.entityId);
        
        // Résolution Last-Write-Wins (LWW)
        if (existing && existing.updatedAt > item.localTimestamp) {
          result.conflicts.push({
            id: item.id,
            reason: 'Conflit de version : Le serveur possède une modification plus récente.',
            serverRecord: existing
          });
          continue;
        }

        await upsertProperty(item.payload as PropertyRecord);
        result.accepted.push(item.id);
      } else if (item.entityType === 'transaction') {
        await upsertTransaction(item.payload as CashTransaction);
        result.accepted.push(item.id);
      } else {
        result.accepted.push(item.id);
      }
    } catch (err: any) {
      result.conflicts.push({
        id: item.id,
        reason: err?.message || 'Erreur inconnue lors du push',
        serverRecord: null
      });
    }
  }

  return result;
}

export async function processSyncPull(sinceTimestamp: number) {
  const updatedProps = memoryStore.properties.filter(p => (p.updatedAt || 0) > sinceTimestamp);
  const updatedTx = memoryStore.transactions.filter(t => (Date.parse(t.date) || 0) > sinceTimestamp);
  return {
    properties: updatedProps,
    transactions: updatedTx,
    serverTimestamp: Date.now()
  };
}

// ----------------------------------------------------------------------------
// GESTION COMPTABILITÉ & DÉPENSES (CASH TRANSACTIONS)
// ----------------------------------------------------------------------------

export async function getAllTransactions(): Promise<CashTransaction[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM cash_transactions ORDER BY date DESC');
      return rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        type: r.type,
        category: r.category,
        amount: Number(r.amount),
        description: r.description,
        agentOrClient: r.agent_or_client,
        paymentMode: r.payment_mode,
        date: r.date,
        emecefInvoiceRef: r.emecef_invoice_ref || undefined,
        beneficiaryEmployeeId: r.beneficiary_employee_id || undefined,
        salaryDetails: typeof r.salary_details === 'string' ? JSON.parse(r.salary_details) : r.salary_details
      }));
    } catch (err) {
      console.error('[MySQL Error] getAllTransactions:', err);
    }
  }
  return memoryStore.transactions;
}

export async function upsertTransaction(tx: CashTransaction): Promise<CashTransaction> {
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
      console.error('[MySQL Error] upsertTransaction:', err);
    }
  }

  const idx = memoryStore.transactions.findIndex(t => t.id === tx.id);
  if (idx !== -1) {
    memoryStore.transactions[idx] = tx;
  } else {
    memoryStore.transactions.unshift(tx);
  }
  return tx;
}

// ----------------------------------------------------------------------------
// GESTION RH & COMPTES UTILISATEURS (USERS, LEAVE, PAYSLIPS)
// ----------------------------------------------------------------------------

export async function getAllUsers(): Promise<UserAccount[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users ORDER BY name ASC');
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        avatar: r.avatar || '',
        phone: r.phone,
        role: r.role,
        jobTitle: r.job_title,
        departmentName: r.department_name,
        baseSalary: Number(r.base_salary),
        commissionRate: Number(r.commission_rate),
        hireDate: r.hire_date,
        contractType: r.contract_type,
        city: r.city,
        assignedZone: r.assigned_zone || '',
        rating: Number(r.rating),
        propertiesCount: Number(r.properties_count),
        pendingSyncCount: Number(r.pending_sync_count),
        totalCommissions: Number(r.total_commissions),
        status: r.status,
        cnssNumber: r.cnss_number || undefined,
        twoFactorEnabled: Boolean(r.two_factor_enabled || false),
        totpSecret: r.totp_secret || undefined,
        emailVerified: r.email_verified !== undefined ? Boolean(r.email_verified) : true,
        verificationToken: r.verification_token || undefined,
        verificationEmailSent: Boolean(r.verification_email_sent || false),
      }));
    } catch (err) {
      console.error('[MySQL Error] getAllUsers:', err);
    }
  }
  return memoryStore.users;
}

/**
 * 1. CRÉATION D'UN NOUVEAU COLLABORATEUR (Primo-inscription)
 * - Statut initial 'EN_ATTENTE_VALIDATION' (sauf Super Admin SMB)
 * - Génération d'un code OTP à 6 chiffres unique
 * - Expédition de l'e-mail de confirmation avec lien et bouton de validation
 */
export async function createCollaborator(user: UserAccount): Promise<UserAccount> {
  const now = Date.now();
  const isSMB = user.email.toLowerCase() === 'chezmoi.benin@gmail.com';

  // Si l'utilisateur existe déjà, déléguer vers la mise à jour pour éviter tout doublon ou régression de validation
  const existingInMemory = memoryStore.users.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingInMemory) {
    return updateCollaboratorProfile(existingInMemory.id, user);
  }

  const newCollaborator: UserAccount = {
    ...user,
    status: isSMB ? 'ACTIF' : 'EN_ATTENTE_VALIDATION',
    emailVerified: isSMB ? true : false,
    verificationEmailSent: false,
    createdAt: now,
    updatedAt: now,
  };

  // Génération du code OTP initial EXCLUSIVEMENT pour la primo-inscription
  if (!isSMB) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    newCollaborator.verificationToken = verificationCode;

    // Déclenchement automatique de l'e-mail de validation (garanti une seule fois)
    newCollaborator.verificationEmailSent = true;
    sendNewAccountVerificationEmail(newCollaborator.email, newCollaborator.name, verificationCode, verificationCode).catch(e => {
      console.error('[Nodemailer] Erreur envoi validation nouveau compte:', e);
    });
  } else {
    newCollaborator.verificationEmailSent = true;
  }

  if (isMySqlConnected && pool) {
    try {
      const sql = `
        INSERT INTO users (
          id, name, email, avatar, phone, role, job_title, department_name, 
          base_salary, commission_rate, hire_date, contract_type, city, 
          assigned_zone, rating, properties_count, pending_sync_count, 
          total_commissions, status, cnss_number, email_verified, verification_token, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(sql, [
        newCollaborator.id,
        newCollaborator.name,
        newCollaborator.email,
        newCollaborator.avatar || null,
        newCollaborator.phone,
        newCollaborator.role,
        newCollaborator.jobTitle,
        newCollaborator.departmentName,
        newCollaborator.baseSalary,
        newCollaborator.commissionRate,
        newCollaborator.hireDate,
        newCollaborator.contractType,
        newCollaborator.city,
        newCollaborator.assignedZone,
        newCollaborator.rating,
        newCollaborator.propertiesCount,
        newCollaborator.pendingSyncCount,
        newCollaborator.totalCommissions,
        newCollaborator.status,
        newCollaborator.cnssNumber || null,
        newCollaborator.emailVerified ? 1 : 0,
        newCollaborator.verificationToken || null,
        now,
        now
      ]);
    } catch (err) {
      console.error('[MySQL Error] createCollaborator:', err);
    }
  }

  memoryStore.users.push(newCollaborator);
  return newCollaborator;
}

/**
 * 2. MISE À JOUR D'UN COLLABORATEUR EXISTANT
 * - RÈGLE STRICTE 1 : Si le compte a déjà validé son adresse e-mail par le passé,
 *   le système ne modifie EN AUCUN CAS son statut de validation (emailVerified reste true)
 *   et ne le repasse JAMAIS en "compte en attente de validation".
 * - RÈGLE STRICTE 2 : La mise à jour d'un profil ne génère AUCUN code OTP de validation
 *   et ne bloque JAMAIS la connexion de l'utilisateur.
 * - RÈGLE STRICTE 3 : Envoie un e-mail de notification d'information épuré,
 *   SANS bloc de code OTP et SANS bouton bloquant de confirmation.
 */
export async function updateCollaboratorProfile(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
  const now = Date.now();

  // 1. Recherche de l'utilisateur existant
  let existing = memoryStore.users.find(u => u.id === userId || (updates.email && u.email.toLowerCase() === updates.email.toLowerCase()));

  if (!existing && isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE id = ? OR LOWER(email) = ? LIMIT 1', [userId, (updates.email || '').toLowerCase()]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        existing = {
          id: r.id,
          name: r.name,
          email: r.email,
          avatar: r.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          phone: r.phone,
          role: r.role,
          jobTitle: r.job_title,
          departmentName: r.department_name,
          baseSalary: Number(r.base_salary || 0),
          commissionRate: Number(r.commission_rate || 0),
          hireDate: r.hire_date,
          contractType: r.contract_type,
          city: r.city,
          assignedZone: r.assigned_zone,
          rating: Number(r.rating || 9.0),
          propertiesCount: Number(r.properties_count || 0),
          pendingSyncCount: 0,
          totalCommissions: Number(r.total_commissions || 0),
          status: r.status,
          cnssNumber: r.cnss_number || undefined,
          emailVerified: Boolean(r.email_verified),
          totpSecret: r.totp_secret || undefined,
          twoFactorEnabled: Boolean(r.two_factor_enabled),
          verificationToken: r.verification_token || undefined,
          verificationEmailSent: Boolean(r.verification_email_sent || false),
        };
      }
    } catch (err) {
      console.error('[MySQL Error] updateCollaboratorProfile lookup:', err);
    }
  }

  if (!existing) {
    throw new Error(`Utilisateur introuvable pour la mise à jour (ID: ${userId})`);
  }

  // PROTECTION STRICTE DE LA VALIDATION DU COMPTE :
  // Si le compte a déjà été validé par le passé, conserver obligatoirement emailVerified = true
  const wasAlreadyVerified = existing.emailVerified === true;
  const isSMB = existing.email.toLowerCase() === 'chezmoi.benin@gmail.com';
  const finalEmailVerified = (wasAlreadyVerified || isSMB) ? true : Boolean(updates.emailVerified ?? existing.emailVerified);

  // Le statut ne doit JAMAIS repasser à EN_ATTENTE_VALIDATION si le compte est déjà validé
  let finalStatus: UserAccount['status'] = existing.status;
  if (wasAlreadyVerified || isSMB) {
    if (updates.status && updates.status !== 'EN_ATTENTE_VALIDATION') {
      finalStatus = updates.status;
    } else {
      finalStatus = existing.status === 'EN_ATTENTE_VALIDATION' ? 'ACTIF' : existing.status;
    }
  } else {
    finalStatus = updates.status || existing.status;
  }

  // Détection des modifications pour le résumé de notification
  const changes: string[] = [];
  if (updates.name && updates.name.trim() !== existing.name.trim()) changes.push(`Nom : ${updates.name.trim()}`);
  if (updates.phone && updates.phone.trim() !== existing.phone.trim()) changes.push(`Téléphone : ${updates.phone.trim()}`);
  if (updates.role && updates.role !== existing.role) changes.push(`Rôle : ${updates.role}`);
  if (updates.jobTitle && updates.jobTitle.trim() !== existing.jobTitle.trim()) changes.push(`Poste : ${updates.jobTitle.trim()}`);
  if (updates.city && updates.city.trim() !== existing.city.trim()) changes.push(`Ville : ${updates.city.trim()}`);
  if (updates.avatar && updates.avatar !== existing.avatar) changes.push(`Photo de profil`);
  if (updates.status && updates.status !== existing.status) changes.push(`Statut : ${updates.status}`);

  // Objet utilisateur fusionné et sécurisé
  const updatedUser: UserAccount = {
    ...existing,
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    avatar: updates.avatar !== undefined ? updates.avatar : existing.avatar,
    phone: updates.phone !== undefined ? updates.phone.trim() : existing.phone,
    role: updates.role !== undefined ? updates.role : existing.role,
    jobTitle: updates.jobTitle !== undefined ? updates.jobTitle.trim() : existing.jobTitle,
    departmentName: updates.departmentName !== undefined ? updates.departmentName.trim() : existing.departmentName,
    baseSalary: updates.baseSalary !== undefined ? Number(updates.baseSalary) : existing.baseSalary,
    commissionRate: updates.commissionRate !== undefined ? Number(updates.commissionRate) : existing.commissionRate,
    city: updates.city !== undefined ? updates.city.trim() : existing.city,
    assignedZone: updates.assignedZone !== undefined ? updates.assignedZone.trim() : existing.assignedZone,
    status: finalStatus,
    cnssNumber: updates.cnssNumber !== undefined ? updates.cnssNumber : existing.cnssNumber,
    emailVerified: finalEmailVerified,
    // La mise à jour ne génère JAMAIS de code OTP de validation
    verificationToken: finalEmailVerified ? undefined : existing.verificationToken,
    totpSecret: existing.totpSecret,
    twoFactorEnabled: existing.twoFactorEnabled,
    updatedAt: now,
  };

  // Persistance en MySQL
  if (isMySqlConnected && pool) {
    try {
      const sql = `
        UPDATE users SET 
          name = ?, 
          avatar = ?, 
          phone = ?, 
          role = ?, 
          job_title = ?, 
          department_name = ?, 
          base_salary = ?, 
          commission_rate = ?, 
          city = ?, 
          assigned_zone = ?, 
          status = ?, 
          cnss_number = ?, 
          email_verified = ?, 
          updated_at = ?
        WHERE id = ?
      `;
      await pool.query(sql, [
        updatedUser.name,
        updatedUser.avatar || null,
        updatedUser.phone,
        updatedUser.role,
        updatedUser.jobTitle,
        updatedUser.departmentName,
        updatedUser.baseSalary,
        updatedUser.commissionRate,
        updatedUser.city,
        updatedUser.assignedZone,
        updatedUser.status,
        updatedUser.cnssNumber || null,
        updatedUser.emailVerified ? 1 : 0,
        now,
        existing.id
      ]);
    } catch (err) {
      console.error('[MySQL Error] updateCollaboratorProfile:', err);
    }
  }

  // Mise à jour de la mémoire centrale
  const idx = memoryStore.users.findIndex(u => u.id === existing!.id);
  if (idx !== -1) {
    memoryStore.users[idx] = updatedUser;
  } else {
    memoryStore.users.push(updatedUser);
  }

  // Expédition exclusive de l'e-mail de notification d'information (SANS OTP, SANS BOUTON BLOQUANT)
  sendProfileUpdatedNotificationEmail(
    updatedUser.email, 
    updatedUser.name, 
    changes.length > 0 ? changes.join(', ') : undefined
  ).catch(err => {
    console.error('[Hostinger SMTP] Erreur expédition notification mise à jour profil:', err?.message || err);
  });

  return updatedUser;
}

/**
 * 3. UPSERT ROUTEUR
 * Détecte si l'utilisateur existe déjà :
 * - Si OUI -> délègue à updateCollaboratorProfile (protège le statut de validation, pas d'OTP)
 * - Si NON -> délègue à createCollaborator (génère l'OTP initial)
 */
export async function upsertUser(user: UserAccount): Promise<UserAccount> {
  const existingInMemory = memoryStore.users.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingInMemory) {
    return updateCollaboratorProfile(existingInMemory.id, user);
  }
  return createCollaborator(user);
}

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  return memoryStore.leaveRequests;
}

export async function addLeaveRequest(req: LeaveRequest): Promise<LeaveRequest> {
  memoryStore.leaveRequests.unshift(req);
  return req;
}

export async function updateLeaveStatus(id: string, status: 'APPROUVE' | 'REJETE', approvedBy: string): Promise<boolean> {
  const target = memoryStore.leaveRequests.find(l => l.id === id);
  if (target) {
    target.status = status;
    target.approvedBy = approvedBy;
    return true;
  }
  return false;
}

export async function getAllPayslips(): Promise<PayslipRecord[]> {
  return memoryStore.payslips;
}

export async function addPayslip(slip: PayslipRecord): Promise<PayslipRecord> {
  memoryStore.payslips.unshift(slip);
  return slip;
}

// ----------------------------------------------------------------------------
// GED FONCIÈRE (DOCUMENTS)
// ----------------------------------------------------------------------------

export async function getAllDocuments(): Promise<LegalDocument[]> {
  return memoryStore.documents;
}

export async function addDocument(doc: LegalDocument): Promise<LegalDocument> {
  memoryStore.documents.unshift(doc);
  return doc;
}

// ----------------------------------------------------------------------------
// PARAMÈTRES SYSTÈME (WHATSAPP, GMAIL, CLAUDE, GEMINI, WEBHOOKS)
// ----------------------------------------------------------------------------

export async function getSettings(): Promise<Record<string, any>> {
  return memoryStore.settings;
}

export async function updateSettings(newSettings: Record<string, any>): Promise<Record<string, any>> {
  memoryStore.settings = { ...memoryStore.settings, ...newSettings };
  return memoryStore.settings;
}

// ----------------------------------------------------------------------------
// AUTHENTIFICATION OTP & DOUBLE AUTHENTIFICATION (2FA)
// ----------------------------------------------------------------------------

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpMemoryStore = new Map<string, OtpEntry>();

function normalizeIdentifier(val: string): string {
  const trimmed = val.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  return trimmed.replace(/[\s\-\(\)\.]/g, '');
}

export async function findUserByIdentifier(rawIdentifier: string): Promise<UserAccount | null> {
  const norm = normalizeIdentifier(rawIdentifier);
  const isSMB = norm === 'chezmoi.benin@gmail.com' || norm === normalizeIdentifier(CENTRAL_ADMIN_SMB.phone);

  if (isSMB) {
    if (isMySqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO users (
            id, name, email, avatar, phone, role, job_title, department_name, 
            base_salary, commission_rate, hire_date, contract_type, city, 
            assigned_zone, rating, properties_count, pending_sync_count, 
            total_commissions, status, email_verified, two_factor_enabled, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status = 'ACTIF', email_verified = 1, role = 'SUPER_ADMIN'`,
          [
            CENTRAL_ADMIN_SMB.id,
            CENTRAL_ADMIN_SMB.name,
            CENTRAL_ADMIN_SMB.email,
            CENTRAL_ADMIN_SMB.avatar,
            CENTRAL_ADMIN_SMB.phone,
            CENTRAL_ADMIN_SMB.role,
            CENTRAL_ADMIN_SMB.jobTitle,
            CENTRAL_ADMIN_SMB.departmentName,
            0, 0, '2026-01-01', 'CDI', 'Cotonou', 'National (Bénin)', 10, 0, 0, 0,
            'ACTIF', 1, 0, Date.now(), Date.now()
          ]
        );
      } catch (err) {
        console.warn('[Hostinger MySQL] Auto-insertion SMB à la volée:', err);
      }
    }
    return CENTRAL_ADMIN_SMB;
  }

  if (isMySqlConnected && pool) {
    try {
      const cleanPhone = norm.replace(/\D/g, '');
      const sql = `
        SELECT * FROM users 
        WHERE LOWER(email) = ? 
           OR REPLACE(REPLACE(phone, ' ', ''), '+', '') LIKE ?
        LIMIT 1
      `;
      const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, [norm, `%${cleanPhone.slice(-8)}%`]);
      if (rows && rows.length > 0) {
        const r: any = rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          avatar: r.avatar || '',
          phone: r.phone,
          role: r.role,
          jobTitle: r.job_title,
          departmentName: r.department_name,
          baseSalary: Number(r.base_salary),
          commissionRate: Number(r.commission_rate),
          hireDate: r.hire_date,
          contractType: r.contract_type,
          city: r.city,
          assignedZone: r.assigned_zone || '',
          rating: Number(r.rating),
          propertiesCount: Number(r.properties_count),
          pendingSyncCount: Number(r.pending_sync_count),
          totalCommissions: Number(r.total_commissions),
          status: r.status,
          cnssNumber: r.cnss_number || undefined,
          twoFactorEnabled: Boolean(r.two_factor_enabled || false),
          emailVerified: r.email_verified !== undefined ? Boolean(r.email_verified) : true,
          verificationToken: r.verification_token || undefined
        };
      }
    } catch (err) {
      console.error('[MySQL Error] findUserByIdentifier:', err);
    }
  }

  // Fallback mémoire
  const found = memoryStore.users.find(u => {
    const userEmailNorm = normalizeIdentifier(u.email);
    const userPhoneNorm = normalizeIdentifier(u.phone);
    if (norm.includes('@')) {
      return userEmailNorm === norm;
    }
    const cleanNorm = norm.replace(/\D/g, '');
    const cleanUserPhone = userPhoneNorm.replace(/\D/g, '');
    return cleanUserPhone.endsWith(cleanNorm.slice(-8)) || cleanNorm.endsWith(cleanUserPhone.slice(-8));
  });

  return found || null;
}

export function storeOtp(identifier: string, code: string, ttlMs = 300000): void {
  const key = normalizeIdentifier(identifier);
  otpMemoryStore.set(key, {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0
  });
}

export function verifyOtp(identifier: string, inputCode: string): { valid: boolean; reason?: string } {
  const key = normalizeIdentifier(identifier);
  const entry = otpMemoryStore.get(key);
  if (!entry) {
    return { valid: false, reason: 'Aucun code OTP actif. Veuillez demander un nouveau code.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpMemoryStore.delete(key);
    return { valid: false, reason: 'Le code OTP a expiré (durée de validité 5 minutes).' };
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpMemoryStore.delete(key);
    return { valid: false, reason: 'Nombre maximal de tentatives dépassé. Veuillez redemander un code.' };
  }

  if (entry.code.trim() !== inputCode.trim()) {
    return { valid: false, reason: 'Code OTP incorrect. Veuillez vérifier le code reçu.' };
  }

  // Code valide : consommer le code
  otpMemoryStore.delete(key);
  return { valid: true };
}

export async function findUserById(userId: string): Promise<UserAccount | null> {
  const inMem = memoryStore.users.find(u => u.id === userId);
  if (inMem) return inMem;

  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          avatar: r.avatar,
          phone: r.phone,
          role: r.role,
          jobTitle: r.job_title,
          departmentName: r.department_name,
          baseSalary: Number(r.base_salary),
          commissionRate: Number(r.commission_rate),
          hireDate: r.hire_date,
          contractType: r.contract_type,
          city: r.city,
          assignedZone: r.assigned_zone || '',
          rating: Number(r.rating),
          propertiesCount: Number(r.properties_count),
          pendingSyncCount: Number(r.pending_sync_count),
          totalCommissions: Number(r.total_commissions),
          status: r.status,
          cnssNumber: r.cnss_number || undefined,
          twoFactorEnabled: Boolean(r.two_factor_enabled || false),
          totpSecret: r.totp_secret || undefined,
          emailVerified: r.email_verified !== undefined ? Boolean(r.email_verified) : true,
          verificationToken: r.verification_token || undefined,
          verificationEmailSent: Boolean(r.verification_email_sent || false),
        };
      }
    } catch (err) {
      console.error('[MySQL Error] findUserById:', err);
    }
  }

  return null;
}

export async function toggleUser2FA(userId: string, enabled: boolean, totpSecret?: string): Promise<UserAccount | null> {
  const user = memoryStore.users.find(u => u.id === userId);
  if (user) {
    user.twoFactorEnabled = enabled;
    if (totpSecret !== undefined) {
      user.totpSecret = totpSecret;
    }
  }

  if (isMySqlConnected && pool) {
    try {
      if (totpSecret) {
        await pool.query('UPDATE users SET two_factor_enabled = ?, totp_secret = ? WHERE id = ?', [enabled ? 1 : 0, totpSecret, userId]);
      } else {
        await pool.query('UPDATE users SET two_factor_enabled = ? WHERE id = ?', [enabled ? 1 : 0, userId]);
      }
    } catch (err) {
      console.error('[MySQL Error] toggleUser2FA:', err);
    }
  }

  return user || null;
}

export async function verifyEmailAccount(tokenOrCode: string, email?: string): Promise<{ success: boolean; user?: UserAccount; message: string }> {
  const cleanCode = tokenOrCode.trim();
  const cleanEmail = email ? normalizeIdentifier(email) : '';

  // Si le compte est déjà validé et actif (ex: clic ultérieur ou validation préalable par l'admin)
  if (cleanEmail) {
    const alreadyVerifiedUser = memoryStore.users.find(u => normalizeIdentifier(u.email) === cleanEmail && u.emailVerified);
    if (alreadyVerifiedUser) {
      return { success: true, user: alreadyVerifiedUser, message: 'Votre compte est déjà vérifié et actif ! Vous pouvez vous connecter en toute sécurité.' };
    }
  }

  // Look in memory
  const user = memoryStore.users.find(u => {
    const codeMatch = u.verificationToken && u.verificationToken.trim() === cleanCode;
    if (cleanEmail) {
      return codeMatch && normalizeIdentifier(u.email) === cleanEmail;
    }
    return Boolean(codeMatch);
  });

  if (user) {
    user.status = 'ACTIF';
    user.emailVerified = true;
    user.verificationToken = undefined;

    if (isMySqlConnected && pool) {
      try {
        await pool.query('UPDATE users SET status = ?, email_verified = ?, verification_token = NULL WHERE id = ?', ['ACTIF', 1, user.id]);
      } catch (err) {
        console.error('[MySQL Error] verifyEmailAccount:', err);
      }
    }
    return { success: true, user, message: 'Votre compte a été validé avec succès ! Vous pouvez maintenant vous connecter.' };
  }

  // Look in MySQL if connected
  if (isMySqlConnected && pool) {
    try {
      let sql = 'SELECT * FROM users WHERE verification_token = ?';
      const params: any[] = [cleanCode];
      if (cleanEmail) {
        sql += ' AND LOWER(email) = ?';
        params.push(cleanEmail);
      }
      sql += ' LIMIT 1';

      const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, params);
      if (rows && rows.length > 0) {
        const r: any = rows[0];
        await pool.query('UPDATE users SET status = ?, email_verified = ?, verification_token = NULL WHERE id = ?', ['ACTIF', 1, r.id]);
        
        const memU = memoryStore.users.find(u => u.id === r.id);
        if (memU) {
          memU.status = 'ACTIF';
          memU.emailVerified = true;
          memU.verificationToken = undefined;
        }

        const validUser: UserAccount = memU || {
          id: r.id,
          name: r.name,
          email: r.email,
          avatar: r.avatar || '',
          phone: r.phone,
          role: r.role,
          jobTitle: r.job_title,
          departmentName: r.department_name,
          baseSalary: Number(r.base_salary),
          commissionRate: Number(r.commission_rate),
          hireDate: r.hire_date,
          contractType: r.contract_type,
          city: r.city,
          assignedZone: r.assigned_zone || '',
          rating: Number(r.rating),
          propertiesCount: Number(r.properties_count),
          pendingSyncCount: Number(r.pending_sync_count),
          totalCommissions: Number(r.total_commissions),
          status: 'ACTIF',
          emailVerified: true
        };

        return {
          success: true,
          user: validUser,
          message: 'Votre compte a été validé avec succès ! Vous pouvez maintenant vous connecter.'
        };
      }
    } catch (err) {
      console.error('[MySQL Error] verifyEmailAccount SQL lookup:', err);
    }
  }

  return { success: false, message: 'Code ou lien de validation introuvable ou expiré.' };
}

