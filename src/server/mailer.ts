import nodemailer, { Transporter } from 'nodemailer';
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
 * Initialise le transporteur Nodemailer configuré pour Hostinger SMTP (Port 465 / SSL)
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // SSL / Secure
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`[Hostinger SMTP] Transporteur configuré et actif : ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);
  } else {
    // Mode de repli en environnement local ou si SMTP_PASS n'a pas encore été injecté
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    console.log('[Hostinger SMTP] Mode simulation actif (journaux console).');
  }

  return transporter;
}

/**
 * Générateur de template e-mail épuré et professionnel :
 * - Combinaison exclusive : Poppins pour les titres importants et Roboto pour le corps des messages
 * - Graisse modérée et équilibrée (non excessive)
 * - Identité Chezmoi administration & Chezmoi immobilier
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
                    ${badgeLabel ? `<span style="display: inline-block; margin-left: 4px; font-family: 'Roboto', sans-serif; font-size: 10px; font-weight: 500; background-color: rgba(250,48,85,0.08); color: #fa3055; padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(250,48,85,0.2); vertical-align: middle;">${badgeLabel}</span>` : ''}
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
              <!-- Security Token Box (Équilibrée et sobre) -->
              <div style="margin: 22px 0 22px 0; text-align: center;">
                <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 28px; font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 600; letter-spacing: 6px; color: #0f172a; text-align: center;">
                  ${code}
                </div>
                <div style="margin-top: 6px; font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 400; color: #64748b;">
                  Code de sécurité à usage unique (5 minutes)
                </div>
              </div>
              ` : ''}

              ${actionUrl && actionText ? `
              <!-- Primary Action CTA -->
              <div style="margin: 24px 0; text-align: center;">
                <a href="${actionUrl}" style="display: inline-block; font-family: 'Poppins', sans-serif; background-color: #fa3055; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 11px 24px; border-radius: 6px; text-align: center;">
                  ${actionText}
                </a>
              </div>
              ` : ''}

              <!-- Security notice -->
              <p style="margin: 22px 0 0 0; padding-top: 16px; border-top: 1px solid #f1f5f9; font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 400; line-height: 1.5; color: #64748b;">
                ${securityNote}
              </p>
            </td>
          </tr>

        </table>

        <!-- Pied de page officiel avec coordonnées légales DGI/RCCM -->
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
                © Chezmoi administration - Tous droits réservés
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

/**
 * Prépare les pièces jointes (logo inline CID)
 */
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
  try {
    const transport = await getTransporter();

    const htmlContent = buildGitHubStyleHtml({
      title: 'Code de vérification pour votre session',
      preheader: `Votre code de sécurité Chezmoi administration est : ${otpCode}`,
      recipientName: name,
      bodyText: "Vous tentez de vous connecter à votre espace sécurisé sur Chezmoi administration. Saisissez le code temporaire ci-dessous pour déverrouiller votre session :",
      code: otpCode,
      securityNote: "Ce code de vérification expirera dans 5 minutes. Si vous utilisez Google Authenticator, vous pouvez également saisir directement votre code TOTP.",
      badgeLabel: 'Authentification'
    });

    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `${otpCode} est votre code de sécurité Chezmoi administration`,
      html: htmlContent,
      attachments: getEmailAttachments(),
    });

    console.log(`[Hostinger SMTP] E-mail OTP expédié à ${email} (MessageId: ${info?.messageId || 'OK'})`);
    return true;
  } catch (err: any) {
    console.error(`[Hostinger SMTP Erreur] Échec envoi OTP à ${email}:`, err?.message);
    return false;
  }
}

/**
 * 2. Envoie l'e-mail d'activation au compte administrateur central SMB
 */
export async function sendAdminInitializationEmail(email: string, name: string): Promise<boolean> {
  try {
    const transport = await getTransporter();

    const htmlContent = buildGitHubStyleHtml({
      title: 'Compte Administrateur Central activé',
      preheader: `Le compte Super Admin principal (${email}) est configuré et actif.`,
      recipientName: name,
      bodyText: "Votre compte <strong>Super Admin principal</strong> a été initialisé avec succès sur Chezmoi administration. Vous disposez des pleins privilèges sur l'ensemble des modules fonciers, comptables (e-MECeF) et RH.",
      securityNote: "Votre compte est sécurisé par code OTP et supporte l'activation de Google Authenticator dans les paramètres du profil.",
      badgeLabel: 'Super Admin'
    });

    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `[Chezmoi administration] Activation du Compte Administrateur Central (SMB)`,
      html: htmlContent,
      attachments: getEmailAttachments(),
    });

    console.log(`[Hostinger SMTP] E-mail activation SMB expédié à ${email}.`);
    return true;
  } catch (err: any) {
    console.error(`[Hostinger SMTP Erreur] Échec activation SMB à ${email}:`, err?.message);
    return false;
  }
}

/**
 * 3. Envoie l'e-mail de validation pour tout nouveau compte créé
 * RÈGLE STRICTE : Déclenché QU'UNE SEULE ET UNIQUE FOIS par adresse e-mail.
 * Comprend le lien de validation cliquable unique contenant le jeton.
 */
export async function sendNewAccountVerificationEmail(
  email: string,
  name: string,
  token: string,
  code: string,
  appUrl = 'https://admin.chezmoi.bj'
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Anti-doublon strict en mémoire
  if (sentVerificationEmails.has(normalizedEmail)) {
    console.log(`[Hostinger SMTP] E-mail de validation déjà expédié précédemment pour ${normalizedEmail}. Envoi ignoré (unicité garantie).`);
    return true;
  }

  try {
    const transport = await getTransporter();
    
    // Lien de validation cliquable unique
    const verificationUrl = `${appUrl}/verify-account?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

    const htmlContent = buildGitHubStyleHtml({
      title: 'Validez votre adresse e-mail',
      preheader: `Confirmez votre compte Chezmoi administration`,
      recipientName: name,
      bodyText: "Un nouveau compte collaborateur a été créé pour vous sur la plateforme Chezmoi administration. Conformément aux règles de sécurité, veuillez confirmer votre adresse pour activer vos accès :",
      code: code,
      actionUrl: verificationUrl,
      actionText: 'Confirmer mon adresse e-mail',
      securityNote: "Vous pouvez soit cliquer sur le bouton ci-dessus pour valider instantanément votre compte, soit saisir le code à 6 chiffres sur la page de connexion.",
      badgeLabel: 'Validation requise'
    });

    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `[Chezmoi administration] Confirmation de votre compte (${code})`,
      html: htmlContent,
      attachments: getEmailAttachments(),
    });

    sentVerificationEmails.add(normalizedEmail);
    console.log(`[Hostinger SMTP] E-mail de validation expédié avec succès à ${email} (Unicité confirmée)`);
    return true;
  } catch (err: any) {
    console.error(`[Hostinger SMTP Erreur] Échec envoi validation à ${email}:`, err?.message);
    return false;
  }
}
