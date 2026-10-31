import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLogoPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'public/assets/aistudio/1_e24ebf1b.png'),
    path.resolve(process.cwd(), 'public/chezmoi-logo.png'),
    path.resolve(__dirname, '../../public/assets/aistudio/1_e24ebf1b.png'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const LOGO_PATH = getLogoPath();

// URL officielle de production - JAMAIS de localhost:3000 dans les e-mails
export function getSafeAppUrl(providedUrl?: string): string {
  const candidate = (providedUrl || process.env.APP_URL || process.env.VITE_APP_URL || '').trim();
  // Protection absolue : interdire localhost ou 127.0.0.1 dans les liens d'e-mails
  if (!candidate || candidate.includes('localhost') || candidate.includes('127.0.0.1')) {
    return 'https://admin.chezmoi.bj';
  }
  return candidate.replace(/\/+$/, '');
}

export const BASE_APP_URL = getSafeAppUrl();

let transporter: Transporter | null = null;

// Configuration SMTP Hostinger (contact@chezmoi.bj)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || 'contact@chezmoi.bj';
const SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
const FROM_SENDER = process.env.SMTP_FROM || '"Chezmoi administration" <contact@chezmoi.bj>';

// Garde anti-doublon pour l'envoi d'e-mails de vérification (une seule fois par adresse)
const sentVerificationEmails = new Set<string>();

/**
 * Initialise le transporteur Nodemailer avec pool persistant, keep-alive et timeouts
 * pour éviter les déconnexions et blocages de file d'attente sur Hostinger SMTP.
 */
function createHostingerTransporter(): Transporter {
  if (SMTP_PASS) {
    const t = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // SSL
      pool: true, // Utilisation d'un pool persistant pour éviter de fermer les sockets
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 15000, // 15 secondes
      greetingTimeout: 15000,
      socketTimeout: 30000, // 30 secondes
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log(`[Hostinger SMTP Pool] Transporteur initialisé : ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);
    return t;
  }

  // Mode de repli en environnement local ou si SMTP_PASS n'a pas encore été injecté
  const devT = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
  console.log('[Hostinger SMTP] Mode simulation local actif.');
  return devT;
}

export async function getTransporter(): Promise<Transporter> {
  if (!transporter) {
    transporter = createHostingerTransporter();
  }
  return transporter;
}

/**
 * Envoi sécurisé d'e-mail avec gestion d'erreurs, try/catch robuste et réessais automatiques (retry)
 */
async function sendMailWithRetry(mailOptions: SendMailOptions, maxRetries = 3): Promise<boolean> {
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const currentTransport = await getTransporter();
      const info = await currentTransport.sendMail(mailOptions);
      console.log(`[Hostinger SMTP] E-mail expédié avec succès à ${mailOptions.to} (MessageId: ${info?.messageId || 'OK'})`);
      return true;
    } catch (err: any) {
      console.warn(`[Hostinger SMTP Tentative ${attempt}/${maxRetries}] Échec envoi à ${mailOptions.to}: ${err?.message}`);
      
      // Si déconnexion socket, détruire l'instance pour recréer une connexion fraîche à la prochaine tentative
      if (err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT' || err?.code === 'ESOCKET' || err?.responseCode === 421) {
        console.warn('[Hostinger SMTP] Réinitialisation du pool de connexion suite à une fermeture distante.');
        transporter = null;
      }

      if (attempt >= maxRetries) {
        console.error(`[Hostinger SMTP Échec Définitif] Impossible d'expédier l'e-mail à ${mailOptions.to} après ${maxRetries} tentatives.`, err);
        return false;
      }

      // Attente exponentielle avant réessai
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5;
    }
  }

  return false;
}

/**
 * Générateur de template e-mail épuré et conforme à la charte :
 * - Polices exclusives : Poppins pour les titres, Roboto pour le corps
 * - Typographie aérée sans excès de graisse
 * - Mentions légales officielles : IFU 0202361063128, RCCM RB/ABC/24 A 111099
 */
function buildGitHubStyleHtml(options: {
  title: string;
  preheader: string;
  recipientName: string;
  bodyText: string;
  code?: string;
  actionUrl?: string;
  actionText?: string;
  securityNote?: string;
  badgeLabel?: string;
}): string {
  const {
    title,
    preheader,
    recipientName,
    bodyText,
    code,
    actionUrl,
    actionText,
    securityNote = "Ce code expire dans 5 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.",
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
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-weight: 600;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; -webkit-font-smoothing: antialiased;">
  
  <!-- Preheader invisible pour les clients de messagerie -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        
        <!-- Conteneur Carte Blanche Centrale -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;">
          
          <!-- En-tête : Logo & Badge -->
          <tr>
            <td style="padding: 24px 28px 20px 28px; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <img src="cid:chezmoi-logo" alt="Chezmoi" width="34" height="34" style="display: block; border-radius: 8px;" />
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                          <span style="font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 600; color: #0f172a; letter-spacing: -0.3px;">chezmoi</span>
                          <span style="font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 500; color: #fa3055; margin-left: 4px;">administration</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  ${badgeLabel ? `
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 500; color: #fa3055; background-color: #fff1f2; border: 1px solid #ffe4e6; padding: 3px 10px; border-radius: 20px;">
                      ${badgeLabel}
                    </span>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps du message -->
          <tr>
            <td style="padding: 28px 28px 24px 28px;">
              <h1 style="margin: 0 0 14px 0; font-family: 'Poppins', sans-serif; font-size: 19px; font-weight: 600; color: #0f172a; line-height: 1.35;">
                ${title}
              </h1>

              <p style="margin: 0 0 16px 0; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.6; color: #334155;">
                Bonjour ${recipientName},
              </p>

              <p style="margin: 0 0 20px 0; font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.6; color: #334155;">
                ${bodyText}
              </p>

              ${code ? `
              <!-- Bloc Code OTP / Sécurité -->
              <div style="margin: 22px 0; text-align: center;">
                <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 32px;">
                  <span style="font-family: 'Roboto Mono', 'Courier New', monospace; font-size: 30px; font-weight: 600; letter-spacing: 7px; color: #0f172a;">
                    ${code}
                  </span>
                </div>
                <p style="margin: 8px 0 0 0; font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 400; color: #64748b;">
                  Code de sécurité à usage unique
                </p>
              </div>
              ` : ''}

              ${actionUrl && actionText ? `
              <!-- Bouton d'action principal -->
              <div style="margin: 24px 0; text-align: center;">
                <a href="${actionUrl}" style="display: inline-block; font-family: 'Poppins', sans-serif; background-color: #fa3055; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 12px 28px; border-radius: 6px; text-align: center;">
                  ${actionText}
                </a>
              </div>
              ` : ''}

              <!-- Note de sécurité -->
              <p style="margin: 22px 0 0 0; padding-top: 16px; border-top: 1px solid #f1f5f9; font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 400; line-height: 1.5; color: #64748b;">
                ${securityNote}
              </p>
            </td>
          </tr>

        </table>

        <!-- Pied de page officiel avec coordonnées légales DGI Bénin / RCCM -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 400; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 3px 0; font-family: 'Poppins', sans-serif; font-weight: 500; color: #fa3055;">
                Chezmoi administration • Chezmoi immobilier
              </p>
              <p style="margin: 0 0 2px 0; font-family: 'Roboto', sans-serif; font-size: 10px; color: #94a3b8;">
                IFU : 0202361063128 • RCCM : RB/ABC/24 A 111099 • Bidossessi Adjrako, Abomey-Calavi
              </p>
              <p style="margin: 0; font-family: 'Roboto', sans-serif; font-size: 10px; color: #94a3b8;">
                © Chezmoi administration - République du Bénin - Tous droits réservés
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
        filename: 'chezmoi-logo.png',
        path: LOGO_PATH,
        cid: 'chezmoi-logo',
        contentType: 'image/png',
        contentDisposition: 'inline',
      },
    ];
  }
  return [];
}

/**
 * 1. Envoie le code OTP de connexion par e-mail
 */
export async function sendOtpEmail(email: string, name: string, otpCode: string): Promise<boolean> {
  const htmlContent = buildGitHubStyleHtml({
    title: 'Code de vérification pour votre session',
    preheader: `Votre code de sécurité Chezmoi administration est : ${otpCode}`,
    recipientName: name,
    bodyText: "Vous tentez de vous connecter à votre espace sécurisé sur Chezmoi administration. Saisissez le code temporaire ci-dessous pour déverrouiller votre session :",
    code: otpCode,
    securityNote: "Ce code de vérification expirera dans 5 minutes. Si vous utilisez Google Authenticator, vous pouvez également saisir directement votre code TOTP.",
    badgeLabel: 'Authentification'
  });

  return sendMailWithRetry({
    from: FROM_SENDER,
    to: email,
    subject: `${otpCode} est votre code de sécurité Chezmoi administration`,
    html: htmlContent,
    attachments: getEmailAttachments(),
  });
}

/**
 * 2. Envoie l'e-mail d'activation au compte administrateur central SMB
 */
export async function sendAdminInitializationEmail(email: string, name: string): Promise<boolean> {
  const htmlContent = buildGitHubStyleHtml({
    title: 'Compte Administrateur Central activé',
    preheader: `Le compte Super Admin principal (${email}) est configuré et actif.`,
    recipientName: name,
    bodyText: "Votre compte <strong>Super Admin principal</strong> a été initialisé avec succès sur Chezmoi administration. Vous disposez des pleins privilèges sur l'ensemble des modules fonciers, comptables (e-MECeF) et RH.",
    securityNote: "Votre compte est sécurisé par code OTP et supporte l'activation de Google Authenticator dans les paramètres du profil.",
    badgeLabel: 'Super Admin'
  });

  return sendMailWithRetry({
    from: FROM_SENDER,
    to: email,
    subject: `[Chezmoi administration] Activation du Compte Administrateur Central (SMB)`,
    html: htmlContent,
    attachments: getEmailAttachments(),
  });
}

/**
 * 3. Envoie l'e-mail de validation pour tout nouveau compte créé
 * Le bouton d'action cible TOUJOURS l'URL absolue de production (APP_URL ou https://admin.chezmoi.bj)
 * et JAMAIS localhost:3000.
 */
export async function sendNewAccountVerificationEmail(
  email: string,
  name: string,
  token: string,
  code: string,
  appUrl = BASE_APP_URL
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Anti-doublon strict en mémoire
  if (sentVerificationEmails.has(normalizedEmail)) {
    console.log(`[Hostinger SMTP] E-mail de validation déjà expédié précédemment pour ${normalizedEmail}. Envoi ignoré (unicité garantie).`);
    return true;
  }

  // URL absolue de production officielle - JAMAIS de localhost
  const targetBaseUrl = getSafeAppUrl(appUrl);
  const verificationUrl = `${targetBaseUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

  const htmlContent = buildGitHubStyleHtml({
    title: 'Validez votre adresse e-mail',
    preheader: `Confirmez votre compte Chezmoi administration`,
    recipientName: name,
    bodyText: "Un nouveau compte collaborateur a été créé pour vous sur Chezmoi administration. Conformément à la politique de sécurité, vous devez confirmer votre adresse e-mail pour activer votre compte :",
    code: code,
    actionUrl: verificationUrl,
    actionText: 'Confirmer mon adresse e-mail',
    securityNote: "Une fois votre adresse validée, vous pourrez vous connecter en saisissant votre identifiant et en recevant un code OTP temporaire ou via Google Authenticator.",
    badgeLabel: 'Validation requise'
  });

  const sent = await sendMailWithRetry({
    from: FROM_SENDER,
    to: email,
    subject: `[Chezmoi administration] Confirmation de votre compte (${code})`,
    html: htmlContent,
    attachments: getEmailAttachments(),
  });

  if (sent) {
    sentVerificationEmails.add(normalizedEmail);
  }
  return sent;
}

/**
 * 4. Envoie un e-mail de notification d'information lors de la mise à jour d'un profil existant
 * - STRICTEMENT SANS code OTP bloquant
 * - STRICTEMENT SANS bouton de confirmation d'e-mail ou de réactivation
 * - Simple notification d'information épurée
 */
export async function sendProfileUpdatedNotificationEmail(
  email: string,
  name: string,
  updatesSummary?: string
): Promise<boolean> {
  const details = updatesSummary 
    ? `Les modifications suivantes ont été enregistrées sur votre profil : <strong>${updatesSummary}</strong>.` 
    : "Les informations de votre profil collaborateur (nom, coordonnées ou affectation) ont été mises à jour par l'administration.";

  const htmlContent = buildGitHubStyleHtml({
    title: 'Mise à jour de votre profil collaborateur',
    preheader: 'Notification : vos informations de profil ont été mises à jour',
    recipientName: name,
    bodyText: `${details} Votre compte demeure actif et directement accessible sans aucune action ou validation supplémentaire de votre part.`,
    securityNote: "Si vous n'êtes pas à l'origine de cette mise à jour ou si vous constatez une anomalie, veuillez contacter directement la direction générale Chezmoi administration.",
    badgeLabel: 'Information profil'
  });

  return sendMailWithRetry({
    from: FROM_SENDER,
    to: email,
    subject: `[Chezmoi administration] Mise à jour de votre profil collaborateur`,
    html: htmlContent,
    attachments: getEmailAttachments(),
  });
}
