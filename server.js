// server.ts
import express from "express";
import dotenv3 from "dotenv";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// src/server/db.ts
import mysql from "mysql2/promise";
import dotenv2 from "dotenv";

// src/data/mockData.ts
var CENTRAL_ADMIN_SMB = {
  id: "user_smb_central",
  name: "SMB",
  avatar: "/assets/aistudio/1_e24ebf1b.png",
  email: "chezmoi.benin@gmail.com",
  phone: "+229 97 00 00 01",
  role: "SUPER_ADMIN",
  jobTitle: "Administrateur Central",
  departmentName: "Direction G\xE9n\xE9rale Chezmoi B\xE9nin",
  baseSalary: 0,
  commissionRate: 0,
  hireDate: "2026-01-01",
  contractType: "CDI",
  city: "Cotonou",
  assignedZone: "National (B\xE9nin)",
  rating: 10,
  propertiesCount: 0,
  pendingSyncCount: 0,
  totalCommissions: 0,
  status: "ACTIF",
  cnssNumber: "CNSS-2026-001",
  emailVerified: true,
  twoFactorEnabled: false
};
var INITIAL_USERS = [
  CENTRAL_ADMIN_SMB
];
var INITIAL_PROPERTIES = [];
var INITIAL_TRANSACTIONS = [];
var INITIAL_DOCUMENTS = [];
var INITIAL_LEAVE_REQUESTS = [];
var INITIAL_PAYSLIPS = [];

// src/server/mailer.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function getLogoPath() {
  const candidates = [
    path.resolve(process.cwd(), "public/assets/aistudio/1_e24ebf1b.png"),
    path.resolve(process.cwd(), "public/chezmoi-logo.png"),
    path.resolve(__dirname, "../../public/assets/aistudio/1_e24ebf1b.png")
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}
var LOGO_PATH = getLogoPath();
var transporter = null;
var SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
var SMTP_PORT = Number(process.env.SMTP_PORT || 465);
var SMTP_USER = process.env.SMTP_USER || "contact@chezmoi.bj";
var SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
var FROM_SENDER = process.env.SMTP_FROM || '"Chezmoi administration" <contact@chezmoi.bj>';
var sentVerificationEmails = /* @__PURE__ */ new Set();
async function getTransporter() {
  if (transporter) return transporter;
  if (SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      // SSL / Secure
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log(`[Hostinger SMTP] Transporteur configur\xE9 et actif : ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);
  } else {
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true
    });
    console.log("[Hostinger SMTP] Mode simulation actif (journaux console).");
  }
  return transporter;
}
function buildGitHubStyleHtml(options) {
  const {
    title,
    preheader,
    recipientName,
    bodyText,
    code,
    actionUrl,
    actionText,
    securityNote = "Ce code expire dans 5 minutes. Si vous n'\xEAtes pas \xE0 l'origine de cette demande, vous pouvez ignorer cet e-mail en toute s\xE9curit\xE9.",
    badgeLabel
  } = options;
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Roboto:wght@300;400;500&display=swap');
    body, table, td, div {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-weight: 400;
    }
    p, span, li, a {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-weight: 400;
    }
    h1, h2, h3, h4, .brand-font {
      font-family: 'Poppins', 'Roboto', sans-serif !important;
      font-weight: 600 !important;
      letter-spacing: -0.2px;
    }
    strong, b {
      font-weight: 500 !important;
      color: #0f172a;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Roboto', Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  
  <!-- Preheader text for mail client preview -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f8fafc;">
    ${preheader}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Minimaliste -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,23,42,0.05);">
          
          <!-- Header with centered Chezmoi Logo -->
          <tr>
            <td align="center" style="padding: 32px 32px 16px 32px; text-align: center;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto; text-align: center;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <img 
                      src="cid:chezmoi-logo" 
                      alt="Chezmoi administration" 
                      width="64" 
                      height="64" 
                      style="display: block; margin: 0 auto; width: 64px; height: 64px; max-width: 64px; max-height: 64px; object-fit: contain; border: 0; outline: none;" 
                    />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px; text-align: center;">
                    <span class="brand-font" style="font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 600; color: #0f172a;">
                      chezmoi<span style="color: #fa3055;">.bj</span>
                    </span>
                    <span style="display: inline-block; margin-left: 6px; font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 500; background-color: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; vertical-align: middle;">
                      administration
                    </span>
                    ${badgeLabel ? `<span style="display: inline-block; margin-left: 4px; font-family: 'Roboto', sans-serif; font-size: 10px; font-weight: 500; background-color: rgba(250,48,85,0.08); color: #fa3055; padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(250,48,85,0.2); vertical-align: middle;">${badgeLabel}</span>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 8px 36px 36px 36px;">
              <h2 class="brand-font" style="margin: 0 0 14px 0; font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 600; color: #0f172a; text-align: left; line-height: 1.4;">
                ${title}
              </h2>

              <p style="margin: 0 0 14px 0; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.6; color: #334155;">
                Bonjour <strong>${recipientName}</strong>,
              </p>

              <p style="margin: 0 0 18px 0; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.6; color: #475569;">
                ${bodyText}
              </p>

              ${code ? `
              <!-- Security Token Box (\xC9quilibr\xE9e et sobre) -->
              <div style="margin: 22px 0 22px 0; text-align: center;">
                <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 28px; font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 600; letter-spacing: 6px; color: #0f172a; text-align: center;">
                  ${code}
                </div>
                <div style="margin-top: 6px; font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 400; color: #64748b;">
                  Code de s\xE9curit\xE9 \xE0 usage unique (5 minutes)
                </div>
              </div>
              ` : ""}

              ${actionUrl && actionText ? `
              <!-- Primary Action CTA -->
              <div style="margin: 24px 0; text-align: center;">
                <a href="${actionUrl}" style="display: inline-block; font-family: 'Poppins', sans-serif; background-color: #fa3055; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 11px 24px; border-radius: 6px; text-align: center;">
                  ${actionText}
                </a>
              </div>
              ` : ""}

              <!-- Security notice -->
              <p style="margin: 22px 0 0 0; padding-top: 16px; border-top: 1px solid #f1f5f9; font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 400; line-height: 1.5; color: #64748b;">
                ${securityNote}
              </p>
            </td>
          </tr>

        </table>

        <!-- Pied de page officiel avec coordonn\xE9es l\xE9gales DGI/RCCM -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 400; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 3px 0; font-family: 'Poppins', sans-serif; font-weight: 500; color: #fa3055;">
                Chezmoi administration \u2022 Chezmoi immobilier
              </p>
              <p style="margin: 0 0 2px 0; font-family: 'Roboto', sans-serif; font-size: 10px; color: #94a3b8;">
                IFU : 0202361063128 \u2022 RCCM : RB/ABC/24 A 111099 \u2022 Bidossessi Adjrako, Abomey-Calavi
              </p>
              <p style="margin: 0; font-family: 'Roboto', sans-serif; font-size: 10px; color: #94a3b8;">
                \xA9 Chezmoi administration - Tous droits r\xE9serv\xE9s
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}
function getEmailAttachments() {
  if (fs.existsSync(LOGO_PATH)) {
    return [
      {
        filename: "chezmoi-logo.png",
        path: LOGO_PATH,
        cid: "chezmoi-logo",
        contentType: "image/png",
        contentDisposition: "inline"
      }
    ];
  }
  return [];
}
async function sendOtpEmail(email, name, otpCode) {
  try {
    const transport = await getTransporter();
    const htmlContent = buildGitHubStyleHtml({
      title: "Code de v\xE9rification pour votre session",
      preheader: `Votre code de s\xE9curit\xE9 Chezmoi administration est : ${otpCode}`,
      recipientName: name,
      bodyText: "Vous tentez de vous connecter \xE0 votre espace s\xE9curis\xE9 sur Chezmoi administration. Saisissez le code temporaire ci-dessous pour d\xE9verrouiller votre session :",
      code: otpCode,
      securityNote: "Ce code de v\xE9rification expirera dans 5 minutes. Si vous utilisez Google Authenticator, vous pouvez \xE9galement saisir directement votre code TOTP.",
      badgeLabel: "Authentification"
    });
    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `${otpCode} est votre code de s\xE9curit\xE9 Chezmoi administration`,
      html: htmlContent,
      attachments: getEmailAttachments()
    });
    console.log(`[Hostinger SMTP] E-mail OTP exp\xE9di\xE9 \xE0 ${email} (MessageId: ${info?.messageId || "OK"})`);
    return true;
  } catch (err) {
    console.error(`[Hostinger SMTP Erreur] \xC9chec envoi OTP \xE0 ${email}:`, err?.message);
    return false;
  }
}
async function sendAdminInitializationEmail(email, name) {
  try {
    const transport = await getTransporter();
    const htmlContent = buildGitHubStyleHtml({
      title: "Compte Administrateur Central activ\xE9",
      preheader: `Le compte Super Admin principal (${email}) est configur\xE9 et actif.`,
      recipientName: name,
      bodyText: "Votre compte <strong>Super Admin principal</strong> a \xE9t\xE9 initialis\xE9 avec succ\xE8s sur Chezmoi administration. Vous disposez des pleins privil\xE8ges sur l'ensemble des modules fonciers, comptables (e-MECeF) et RH.",
      securityNote: "Votre compte est s\xE9curis\xE9 par code OTP et supporte l'activation de Google Authenticator dans les param\xE8tres du profil.",
      badgeLabel: "Super Admin"
    });
    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `[Chezmoi administration] Activation du Compte Administrateur Central (SMB)`,
      html: htmlContent,
      attachments: getEmailAttachments()
    });
    console.log(`[Hostinger SMTP] E-mail activation SMB exp\xE9di\xE9 \xE0 ${email}.`);
    return true;
  } catch (err) {
    console.error(`[Hostinger SMTP Erreur] \xC9chec activation SMB \xE0 ${email}:`, err?.message);
    return false;
  }
}
async function sendNewAccountVerificationEmail(email, name, token, code, appUrl = "https://admin.chezmoi.bj") {
  const normalizedEmail = email.trim().toLowerCase();
  if (sentVerificationEmails.has(normalizedEmail)) {
    console.log(`[Hostinger SMTP] E-mail de validation d\xE9j\xE0 exp\xE9di\xE9 pr\xE9c\xE9demment pour ${normalizedEmail}. Envoi ignor\xE9 (unicit\xE9 garantie).`);
    return true;
  }
  try {
    const transport = await getTransporter();
    const verificationUrl = `${appUrl}/verify-account?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;
    const htmlContent = buildGitHubStyleHtml({
      title: "Validez votre adresse e-mail",
      preheader: `Confirmez votre compte Chezmoi administration`,
      recipientName: name,
      bodyText: "Un nouveau compte collaborateur a \xE9t\xE9 cr\xE9\xE9 pour vous sur la plateforme Chezmoi administration. Conform\xE9ment aux r\xE8gles de s\xE9curit\xE9, veuillez confirmer votre adresse pour activer vos acc\xE8s :",
      code,
      actionUrl: verificationUrl,
      actionText: "Confirmer mon adresse e-mail",
      securityNote: "Vous pouvez soit cliquer sur le bouton ci-dessus pour valider instantan\xE9ment votre compte, soit saisir le code \xE0 6 chiffres sur la page de connexion.",
      badgeLabel: "Validation requise"
    });
    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `[Chezmoi administration] Confirmation de votre compte (${code})`,
      html: htmlContent,
      attachments: getEmailAttachments()
    });
    sentVerificationEmails.add(normalizedEmail);
    console.log(`[Hostinger SMTP] E-mail de validation exp\xE9di\xE9 avec succ\xE8s \xE0 ${email} (Unicit\xE9 confirm\xE9e)`);
    return true;
  } catch (err) {
    console.error(`[Hostinger SMTP Erreur] \xC9chec envoi validation \xE0 ${email}:`, err?.message);
    return false;
  }
}

// src/server/db.ts
dotenv2.config();
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
    await ensureTablesAndAdmin(pool);
    return true;
  } catch (err) {
    isMySqlConnected = false;
    lastDbError = err?.message || String(err);
    console.warn(`[Hostinger MySQL] Impossible de joindre MySQL (${lastDbError}). Bascule sur le stockage m\xE9moire locale.`);
    sendAdminInitializationEmail(CENTRAL_ADMIN_SMB.email, CENTRAL_ADMIN_SMB.name).catch((err2) => {
      console.error("[Hostinger SMTP] Erreur envoi activation admin:", err2);
    });
    return false;
  }
}
async function ensureTablesAndAdmin(pool2) {
  try {
    await pool2.query(`
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
    const columnMigrations = [
      "ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE users ADD COLUMN totp_secret VARCHAR(64) DEFAULT NULL",
      "ALTER TABLE users ADD COLUMN verification_email_sent TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE users ADD COLUMN total_commissions DECIMAL(14, 2) NOT NULL DEFAULT 0.00",
      "ALTER TABLE properties ADD COLUMN rental_rates JSON DEFAULT NULL",
      "ALTER TABLE properties ADD COLUMN other_details TEXT DEFAULT NULL"
    ];
    for (const mig of columnMigrations) {
      try {
        await pool2.query(mig);
      } catch {
      }
    }
    await pool2.query(`
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
    await pool2.query(`
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
    const [adminRows] = await pool2.query(
      "SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1",
      [CENTRAL_ADMIN_SMB.email.toLowerCase()]
    );
    if (!adminRows || adminRows.length === 0) {
      console.log(`[Hostinger MySQL] Administrateur central SMB (${CENTRAL_ADMIN_SMB.email}) introuvable. Insertion automatique...`);
      await pool2.query(
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
          0,
          0,
          "2026-01-01",
          "CDI",
          "Cotonou",
          "National (B\xE9nin)",
          10,
          0,
          0,
          0,
          "ACTIF",
          1,
          0,
          Date.now(),
          Date.now()
        ]
      );
      console.log(`[Hostinger MySQL] Compte Administrateur Central SMB (${CENTRAL_ADMIN_SMB.email}) ins\xE9r\xE9 avec succ\xE8s (R\xF4le: Super Admin, Statut: V\xE9rifi\xE9 / Actif).`);
    } else {
      await pool2.query(
        `UPDATE users SET role = 'SUPER_ADMIN', status = 'ACTIF', email_verified = 1, avatar = ? WHERE LOWER(email) = ?`,
        [CENTRAL_ADMIN_SMB.avatar, CENTRAL_ADMIN_SMB.email.toLowerCase()]
      );
      console.log(`[Hostinger MySQL] Compte Administrateur Central SMB (${CENTRAL_ADMIN_SMB.email}) v\xE9rifi\xE9 et actif.`);
    }
    sendAdminInitializationEmail(CENTRAL_ADMIN_SMB.email, CENTRAL_ADMIN_SMB.name).catch((err) => {
      console.error("[Hostinger SMTP] Erreur envoi activation admin:", err);
    });
  } catch (err) {
    console.error("[Hostinger MySQL] Erreur ensureTablesAndAdmin:", err?.message);
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
        rentalRates: r.rental_rates ? typeof r.rental_rates === "string" ? JSON.parse(r.rental_rates) : r.rental_rates : void 0,
        otherDetails: r.other_details || void 0,
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
        record.rentalRates ? JSON.stringify(record.rentalRates) : null,
        record.otherDetails || null,
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
        cnssNumber: r.cnss_number || void 0,
        twoFactorEnabled: Boolean(r.two_factor_enabled || false),
        totpSecret: r.totp_secret || void 0,
        emailVerified: r.email_verified !== void 0 ? Boolean(r.email_verified) : true,
        verificationToken: r.verification_token || void 0,
        verificationEmailSent: Boolean(r.verification_email_sent || false)
      }));
    } catch (err) {
      console.error("[MySQL Error] getAllUsers:", err);
    }
  }
  return memoryStore.users;
}
async function upsertUser(user) {
  const now = Date.now();
  const isSMB = user.email.toLowerCase() === "chezmoi.benin@gmail.com";
  const existingInMemory = memoryStore.users.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  const isNewUser = !existingInMemory;
  if (isNewUser) {
    if (isSMB) {
      user.status = "ACTIF";
      user.emailVerified = true;
      user.verificationEmailSent = true;
    } else {
      user.status = "EN_ATTENTE_VALIDATION";
      user.emailVerified = false;
      const verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      user.verificationToken = verificationCode;
      if (!user.verificationEmailSent) {
        user.verificationEmailSent = true;
        sendNewAccountVerificationEmail(user.email, user.name, verificationCode, verificationCode).catch((e) => {
          console.error("[Nodemailer] Erreur envoi validation nouveau compte:", e);
        });
      }
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
var otpMemoryStore = /* @__PURE__ */ new Map();
function normalizeIdentifier(val) {
  const trimmed = val.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  return trimmed.replace(/[\s\-\(\)\.]/g, "");
}
async function findUserByIdentifier(rawIdentifier) {
  const norm = normalizeIdentifier(rawIdentifier);
  const isSMB = norm === "chezmoi.benin@gmail.com" || norm === normalizeIdentifier(CENTRAL_ADMIN_SMB.phone);
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
            0,
            0,
            "2026-01-01",
            "CDI",
            "Cotonou",
            "National (B\xE9nin)",
            10,
            0,
            0,
            0,
            "ACTIF",
            1,
            0,
            Date.now(),
            Date.now()
          ]
        );
      } catch (err) {
        console.warn("[Hostinger MySQL] Auto-insertion SMB \xE0 la vol\xE9e:", err);
      }
    }
    return CENTRAL_ADMIN_SMB;
  }
  if (isMySqlConnected && pool) {
    try {
      const cleanPhone = norm.replace(/\D/g, "");
      const sql = `
        SELECT * FROM users 
        WHERE LOWER(email) = ? 
           OR REPLACE(REPLACE(phone, ' ', ''), '+', '') LIKE ?
        LIMIT 1
      `;
      const [rows] = await pool.query(sql, [norm, `%${cleanPhone.slice(-8)}%`]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
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
          cnssNumber: r.cnss_number || void 0,
          twoFactorEnabled: Boolean(r.two_factor_enabled || false),
          emailVerified: r.email_verified !== void 0 ? Boolean(r.email_verified) : true,
          verificationToken: r.verification_token || void 0
        };
      }
    } catch (err) {
      console.error("[MySQL Error] findUserByIdentifier:", err);
    }
  }
  const found = memoryStore.users.find((u) => {
    const userEmailNorm = normalizeIdentifier(u.email);
    const userPhoneNorm = normalizeIdentifier(u.phone);
    if (norm.includes("@")) {
      return userEmailNorm === norm;
    }
    const cleanNorm = norm.replace(/\D/g, "");
    const cleanUserPhone = userPhoneNorm.replace(/\D/g, "");
    return cleanUserPhone.endsWith(cleanNorm.slice(-8)) || cleanNorm.endsWith(cleanUserPhone.slice(-8));
  });
  return found || null;
}
function storeOtp(identifier, code, ttlMs = 3e5) {
  const key = normalizeIdentifier(identifier);
  otpMemoryStore.set(key, {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0
  });
}
function verifyOtp(identifier, inputCode) {
  const key = normalizeIdentifier(identifier);
  const entry = otpMemoryStore.get(key);
  if (!entry) {
    return { valid: false, reason: "Aucun code OTP actif. Veuillez demander un nouveau code." };
  }
  if (Date.now() > entry.expiresAt) {
    otpMemoryStore.delete(key);
    return { valid: false, reason: "Le code OTP a expir\xE9 (dur\xE9e de validit\xE9 5 minutes)." };
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpMemoryStore.delete(key);
    return { valid: false, reason: "Nombre maximal de tentatives d\xE9pass\xE9. Veuillez redemander un code." };
  }
  if (entry.code.trim() !== inputCode.trim()) {
    return { valid: false, reason: "Code OTP incorrect. Veuillez v\xE9rifier le code re\xE7u." };
  }
  otpMemoryStore.delete(key);
  return { valid: true };
}
async function findUserById(userId) {
  const inMem = memoryStore.users.find((u) => u.id === userId);
  if (inMem) return inMem;
  if (isMySqlConnected && pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
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
          assignedZone: r.assigned_zone || "",
          rating: Number(r.rating),
          propertiesCount: Number(r.properties_count),
          pendingSyncCount: Number(r.pending_sync_count),
          totalCommissions: Number(r.total_commissions),
          status: r.status,
          cnssNumber: r.cnss_number || void 0,
          twoFactorEnabled: Boolean(r.two_factor_enabled || false),
          totpSecret: r.totp_secret || void 0,
          emailVerified: r.email_verified !== void 0 ? Boolean(r.email_verified) : true,
          verificationToken: r.verification_token || void 0,
          verificationEmailSent: Boolean(r.verification_email_sent || false)
        };
      }
    } catch (err) {
      console.error("[MySQL Error] findUserById:", err);
    }
  }
  return null;
}
async function toggleUser2FA(userId, enabled, totpSecret) {
  const user = memoryStore.users.find((u) => u.id === userId);
  if (user) {
    user.twoFactorEnabled = enabled;
    if (totpSecret !== void 0) {
      user.totpSecret = totpSecret;
    }
  }
  if (isMySqlConnected && pool) {
    try {
      if (totpSecret) {
        await pool.query("UPDATE users SET two_factor_enabled = ?, totp_secret = ? WHERE id = ?", [enabled ? 1 : 0, totpSecret, userId]);
      } else {
        await pool.query("UPDATE users SET two_factor_enabled = ? WHERE id = ?", [enabled ? 1 : 0, userId]);
      }
    } catch (err) {
      console.error("[MySQL Error] toggleUser2FA:", err);
    }
  }
  return user || null;
}
async function verifyEmailAccount(tokenOrCode, email) {
  const cleanCode = tokenOrCode.trim();
  const cleanEmail = email ? normalizeIdentifier(email) : "";
  const user = memoryStore.users.find((u) => {
    const codeMatch = u.verificationToken && u.verificationToken.trim() === cleanCode;
    if (cleanEmail) {
      return codeMatch && normalizeIdentifier(u.email) === cleanEmail;
    }
    return Boolean(codeMatch);
  });
  if (user) {
    user.status = "ACTIF";
    user.emailVerified = true;
    user.verificationToken = void 0;
    if (isMySqlConnected && pool) {
      try {
        await pool.query("UPDATE users SET status = ?, email_verified = ?, verification_token = NULL WHERE id = ?", ["ACTIF", 1, user.id]);
      } catch (err) {
        console.error("[MySQL Error] verifyEmailAccount:", err);
      }
    }
    return { success: true, user, message: "Votre compte a \xE9t\xE9 valid\xE9 avec succ\xE8s ! Vous pouvez maintenant vous connecter." };
  }
  if (isMySqlConnected && pool) {
    try {
      let sql = "SELECT * FROM users WHERE verification_token = ?";
      const params = [cleanCode];
      if (cleanEmail) {
        sql += " AND LOWER(email) = ?";
        params.push(cleanEmail);
      }
      sql += " LIMIT 1";
      const [rows] = await pool.query(sql, params);
      if (rows && rows.length > 0) {
        const r = rows[0];
        await pool.query("UPDATE users SET status = ?, email_verified = ?, verification_token = NULL WHERE id = ?", ["ACTIF", 1, r.id]);
        const memU = memoryStore.users.find((u) => u.id === r.id);
        if (memU) {
          memU.status = "ACTIF";
          memU.emailVerified = true;
          memU.verificationToken = void 0;
        }
        const validUser = memU || {
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
          status: "ACTIF",
          emailVerified: true
        };
        return {
          success: true,
          user: validUser,
          message: "Votre compte a \xE9t\xE9 valid\xE9 avec succ\xE8s ! Vous pouvez maintenant vous connecter."
        };
      }
    } catch (err) {
      console.error("[MySQL Error] verifyEmailAccount SQL lookup:", err);
    }
  }
  return { success: false, message: "Code ou lien de validation introuvable ou expir\xE9." };
}

// src/server/totp.ts
import crypto from "crypto";
import QRCode from "qrcode";
var BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function generateBase32Secret(length = 16) {
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}
function base32ToBuffer(base32) {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = "";
  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_CHARS.indexOf(cleanBase32.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}
function generateTOTP(secret, timestamp = Date.now(), timeStepSeconds = 30) {
  const key = base32ToBuffer(secret);
  const counter = Math.floor(timestamp / 1e3 / timeStepSeconds);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
  const otp = binary % 1e6;
  return otp.toString().padStart(6, "0");
}
function verifyTOTP(token, secret, window = 1) {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;
  const now = Date.now();
  const timeStep = 30 * 1e3;
  for (let i = -window; i <= window; i++) {
    const calculated = generateTOTP(secret, now + i * timeStep);
    if (calculated === cleanToken) {
      return true;
    }
  }
  return false;
}
function generateOtpAuthUri(secret, accountName, issuer = "Chezmoi administration") {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
async function generateQrCodeDataUrl(otpauthUri) {
  return QRCode.toDataURL(otpauthUri, {
    width: 240,
    margin: 2,
    color: {
      dark: "#111827",
      light: "#FFFFFF"
    }
  });
}

// server.ts
dotenv3.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
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
      app: "Chezmoi administration",
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
  app.put("/api/properties/:id", async (req, res) => {
    try {
      const updatedData = { ...req.body, id: req.params.id, updatedAt: Date.now() };
      const saved = await upsertProperty(updatedData);
      res.json({ success: true, property: saved });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur lors de la mise \xE0 jour du bien" });
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
  app.post("/api/auth/request-otp", async (req, res) => {
    try {
      const { identifier } = req.body;
      if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
        return res.status(400).json({ error: "Veuillez saisir votre adresse email ou votre num\xE9ro de t\xE9l\xE9phone." });
      }
      const user = await findUserByIdentifier(identifier.trim());
      if (!user) {
        return res.status(404).json({
          error: "Aucun compte associ\xE9 \xE0 cet identifiant dans la base Chezmoi administration. Veuillez v\xE9rifier votre saisie ou contacter l\u2019administrateur."
        });
      }
      if (user.status === "EN_ATTENTE_VALIDATION" || user.emailVerified === false) {
        return res.status(403).json({
          error: "Ce compte est actuellement en attente de validation. Veuillez valider votre adresse e-mail avec le code re\xE7u avant de vous connecter.",
          pendingVerification: true,
          email: user.email,
          userName: user.name
        });
      }
      const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      storeOtp(identifier, otpCode, 3e5);
      storeOtp(user.email, otpCode, 3e5);
      if (user.phone) storeOtp(user.phone, otpCode, 3e5);
      const [name, domain] = user.email.split("@");
      const maskedEmail = `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
      console.log(`[AUTH OTP] Code g\xE9n\xE9r\xE9 pour ${user.name} (${user.email}) : [${otpCode}] (2FA: ${user.twoFactorEnabled ? "OUI" : "NON"})`);
      sendOtpEmail(user.email, user.name, otpCode).catch((err) => {
        console.error("[Hostinger SMTP] Erreur exp\xE9dition code OTP:", err?.message || err);
      });
      res.json({
        success: true,
        message: `Code de s\xE9curit\xE9 envoy\xE9 avec succ\xE8s \xE0 ${maskedEmail}`,
        email: user.email,
        phone: user.phone,
        maskedTarget: maskedEmail,
        twoFactorRequired: Boolean(user.twoFactorEnabled),
        userRole: user.role,
        userName: user.name,
        devOtp: !isProduction ? otpCode : void 0
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur lors de la g\xE9n\xE9ration du code OTP" });
    }
  });
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { identifier, otp } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({ error: "Identifiant et code de v\xE9rification requis." });
      }
      const cleanCode = otp.toString().trim();
      const user = await findUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }
      const emailVerification = verifyOtp(identifier, cleanCode);
      const isTotpValid = user.totpSecret ? verifyTOTP(cleanCode, user.totpSecret) : false;
      const isDevPass = !isProduction && (cleanCode === "123456" || cleanCode === "000000");
      if (!emailVerification.valid && !isTotpValid && !isDevPass) {
        return res.status(401).json({
          error: emailVerification.reason || "Code de s\xE9curit\xE9 invalide ou expir\xE9 (OTP email ou Google Authenticator)."
        });
      }
      if (user.status === "EN_ATTENTE_VALIDATION" || user.emailVerified === false) {
        return res.status(403).json({
          error: "Ce compte est en attente de validation e-mail. Veuillez confirmer votre adresse avant de vous connecter.",
          pendingVerification: true,
          email: user.email
        });
      }
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        iat: Math.floor(Date.now() / 1e3),
        exp: Math.floor(Date.now() / 1e3) + 86400 * 7
      };
      const token = `cm_jwt_${Buffer.from(JSON.stringify(tokenPayload)).toString("base64")}`;
      res.json({
        success: true,
        message: "Authentification r\xE9ussie. Session d\xE9verrouill\xE9e.",
        token,
        user
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur lors de la v\xE9rification OTP" });
    }
  });
  app.get("/api/auth/2fa/setup", async (req, res) => {
    try {
      const userId = req.query.userId;
      const user = userId ? await findUserById(userId) : null;
      const accountEmail = user?.email || "chezmoi.benin@gmail.com";
      const secret = user?.totpSecret || generateBase32Secret(16);
      const otpauthUri = generateOtpAuthUri(secret, accountEmail, "Chezmoi administration");
      const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUri);
      res.json({
        success: true,
        secret,
        otpauthUri,
        qrCodeDataUrl,
        accountEmail
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur initialisation Google Authenticator" });
    }
  });
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { code, email } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Code de validation requis." });
      }
      const result = await verifyEmailAccount(code, email);
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      res.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur lors de la v\xE9rification de l'adresse e-mail" });
    }
  });
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token || req.query.code;
      const email = req.query.email;
      if (!token) {
        return res.status(400).send("Jeton ou code de validation manquant.");
      }
      const result = await verifyEmailAccount(token, email);
      if (!result.success) {
        return res.status(400).send(`
          <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0b0f17; color: #fff;">
              <div style="background: #151c28; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; text-align: center; max-width: 440px;">
                <h2 style="color: #fa3055; margin-top: 0;">Validation Impossible</h2>
                <p style="color: #94a3b8;">${result.message}</p>
                <a href="/" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #fa3055; color: #fff; text-decoration: none; border-radius: 8px;">Retour \xE0 Chezmoi administration</a>
              </div>
            </body>
          </html>
        `);
      }
      res.redirect("/?email_verified=true");
    } catch (err) {
      res.status(500).send("Erreur lors de la validation.");
    }
  });
  app.get("/verify-account", async (req, res) => {
    try {
      const token = req.query.token || req.query.code;
      const email = req.query.email;
      if (!token) {
        return res.redirect("/?error=token_missing");
      }
      const result = await verifyEmailAccount(token, email);
      if (result.success) {
        res.redirect("/?email_verified=true");
      } else {
        res.redirect(`/?error=${encodeURIComponent(result.message)}`);
      }
    } catch {
      res.redirect("/?error=verification_failed");
    }
  });
  app.post("/api/auth/toggle-2fa", async (req, res) => {
    try {
      const { userId, enabled, totpSecret } = req.body;
      if (!userId || typeof enabled !== "boolean") {
        return res.status(400).json({ error: "Param\xE8tres userId et enabled requis." });
      }
      const updated = await toggleUser2FA(userId, enabled, totpSecret);
      if (!updated) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }
      res.json({
        success: true,
        message: enabled ? "Double authentification (2FA) et Google Authenticator activ\xE9s avec succ\xE8s." : "Double authentification d\xE9sactiv\xE9e.",
        user: updated
      });
    } catch (err) {
      res.status(500).json({ error: err?.message || "Erreur modification 2FA" });
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
      payloadSent: payload || { test: "ping", app: "Chezmoi administration" },
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
    const distPath = path2.resolve(__dirname2, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Chezmoi administration Backend Node.js / Express pr\xEAt !`);
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
