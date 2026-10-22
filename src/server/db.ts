import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { 
  PropertyRecord, 
  UserAccount, 
  CashTransaction, 
  LeaveRequest, 
  PayslipRecord, 
  LegalDocument 
} from '../types';
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
  sendNewAccountVerificationEmail 
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
const memoryStore = {
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

    // Synchronisation du compte Administrateur Central (SMB) en base MySQL
    try {
      const initSql = `
        INSERT INTO users (
          id, name, email, avatar, phone, role, job_title, department_name, 
          base_salary, commission_rate, hire_date, contract_type, city, 
          assigned_zone, rating, properties_count, pending_sync_count, 
          total_commissions, status, email_verified, two_factor_enabled, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          role = VALUES(role),
          avatar = VALUES(avatar),
          status = 'ACTIF',
          email_verified = 1;
      `;
      await pool.query(initSql, [
        CENTRAL_ADMIN_SMB.id,
        CENTRAL_ADMIN_SMB.name,
        CENTRAL_ADMIN_SMB.email,
        CENTRAL_ADMIN_SMB.avatar,
        CENTRAL_ADMIN_SMB.phone,
        CENTRAL_ADMIN_SMB.role,
        CENTRAL_ADMIN_SMB.jobTitle,
        CENTRAL_ADMIN_SMB.departmentName,
        0, 0, '2026-01-01', 'CDI', 'Cotonou', 'National (Bénin)', 5, 0, 0, 0,
        'ACTIF', 1, 0, Date.now(), Date.now()
      ]);
      console.log(`[Hostinger MySQL] Compte Administrateur Central SMB (${CENTRAL_ADMIN_SMB.email}) synchronisé en BDD.`);
    } catch (e: any) {
      console.warn('[Hostinger MySQL] Avertissement init admin SMB en BDD:', e?.message);
    }

    // Déclenchement de l'envoi de l'e-mail de confirmation d'activation SMB via Nodemailer
    sendAdminInitializationEmail(CENTRAL_ADMIN_SMB.email, CENTRAL_ADMIN_SMB.name).catch(err => {
      console.error('[Nodemailer] Erreur envoi activation admin:', err);
    });

    return true;
  } catch (err: any) {
    isMySqlConnected = false;
    lastDbError = err?.message || String(err);
    console.warn(`[Hostinger MySQL] Impossible de joindre MySQL (${lastDbError}). Bascule sur le stockage mémoire locale.`);

    // Envoi de l'e-mail de confirmation en mode In-Memory également
    sendAdminInitializationEmail(CENTRAL_ADMIN_SMB.email, CENTRAL_ADMIN_SMB.name).catch(err => {
      console.error('[Nodemailer] Erreur envoi activation admin:', err);
    });

    return false;
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
        emailVerified: r.email_verified !== undefined ? Boolean(r.email_verified) : true,
        verificationToken: r.verification_token || undefined,
      }));
    } catch (err) {
      console.error('[MySQL Error] getAllUsers:', err);
    }
  }
  return memoryStore.users;
}

export async function upsertUser(user: UserAccount): Promise<UserAccount> {
  const now = Date.now();
  const isSMB = user.email.toLowerCase() === 'chezmoi.benin@gmail.com';
  
  // Vérification s'il s'agit d'un nouvel utilisateur
  const existingInMemory = memoryStore.users.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  const isNewUser = !existingInMemory;

  if (isNewUser) {
    if (isSMB) {
      user.status = 'ACTIF';
      user.emailVerified = true;
    } else {
      // Exigence 3: Tout nouveau compte créé doit passer par le statut "en attente de validation"
      user.status = 'EN_ATTENTE_VALIDATION';
      user.emailVerified = false;
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationToken = verificationCode;

      // Déclenchement automatique de l'envoi de l'e-mail de confirmation via Nodemailer
      sendNewAccountVerificationEmail(user.email, user.name, verificationCode, verificationCode).catch(e => {
        console.error('[Nodemailer] Erreur envoi validation nouveau compte:', e);
      });
    }
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
          email_verified = VALUES(email_verified),
          verification_token = VALUES(verification_token),
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
        user.emailVerified ? 1 : 0,
        user.verificationToken || null,
        now,
        now
      ]);
      return user;
    } catch (err) {
      console.error('[MySQL Error] upsertUser:', err);
    }
  }

  const idx = memoryStore.users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    memoryStore.users[idx] = user;
  } else {
    memoryStore.users.push(user);
  }
  return user;
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

export async function toggleUser2FA(userId: string, enabled: boolean): Promise<UserAccount | null> {
  const user = memoryStore.users.find(u => u.id === userId);
  if (user) {
    user.twoFactorEnabled = enabled;
  }

  if (isMySqlConnected && pool) {
    try {
      await pool.query('UPDATE users SET two_factor_enabled = ? WHERE id = ?', [enabled ? 1 : 0, userId]);
    } catch (err) {
      console.error('[MySQL Error] toggleUser2FA:', err);
    }
  }

  return user || null;
}

export async function verifyEmailAccount(tokenOrCode: string, email?: string): Promise<{ success: boolean; user?: UserAccount; message: string }> {
  const cleanCode = tokenOrCode.trim();
  const cleanEmail = email ? normalizeIdentifier(email) : '';

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

