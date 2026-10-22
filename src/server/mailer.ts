import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.resolve(__dirname, '../../public/assets/aistudio/1_e24ebf1b.png');

let transporter: Transporter | null = null;

// Configuration SMTP Hostinger (contact@chezmoi.bj)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || 'contact@chezmoi.bj';
const SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
const FROM_SENDER = process.env.SMTP_FROM || '"Chezmoi Administration" <contact@chezmoi.bj>';

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
        rejectUnauthorized: false, // Évite les blocages de certificats intermédiaires
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
    console.log('[Hostinger SMTP] Variable process.env.SMTP_PASS absente. Mode simulation actif (journaux console).');
  }

  return transporter;
}

/**
 * Générateur de template e-mail minimaliste et professionnel "façon GitHub"
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
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f8fa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      color: #1f2328;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; color: #1f2328;">
  
  <!-- Preheader text for preview in mail client -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f6f8fa;">
    ${preheader}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f6f8fa; padding: 40px 15px;">
    <tr>
      <td align="center">
        
        <!-- Main Card "Façon GitHub" -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #d0d7de; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(31,35,40,0.06);">
          
          <!-- Header with centered logo -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="cid:chezmoi-logo" alt="Chezmoi BJ" width="54" height="54" style="display: block; width: 54px; height: 54px; object-fit: contain; margin: 0 auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 17px; font-weight: 800; color: #1f2328; letter-spacing: -0.3px;">
                      chezmoi<span style="color: #f91942;">.bj</span>
                    </span>
                    ${badgeLabel ? `<span style="margin-left: 6px; font-size: 10px; font-weight: 700; background-color: rgba(249,25,66,0.1); color: #f91942; padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(249,25,66,0.2); vertical-align: middle;">${badgeLabel}</span>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 10px 36px 36px 36px;">
              <h2 style="margin: 0 0 14px 0; font-size: 19px; font-weight: 600; color: #1f2328; text-align: left; letter-spacing: -0.2px;">
                ${title}
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.55; color: #353b43;">
                Bonjour <strong>${recipientName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.55; color: #353b43;">
                ${bodyText}
              </p>

              ${code ? `
              <!-- GitHub Token Style Code Box -->
              <div style="margin: 24px 0 24px 0; text-align: center;">
                <div style="display: inline-block; background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 14px 28px; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace; font-size: 30px; font-weight: 700; letter-spacing: 9px; color: #1f2328; text-align: center;">
                  ${code}
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: #656d76; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Code de sécurité à usage unique
                </div>
              </div>
              ` : ''}

              ${actionUrl && actionText ? `
              <!-- Primary Action CTA -->
              <div style="margin: 24px 0; text-align: center;">
                <a href="${actionUrl}" style="display: inline-block; background-color: #f91942; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 26px; border-radius: 6px; box-shadow: 0 2px 8px rgba(249,25,66,0.3); text-align: center;">
                  ${actionText}
                </a>
              </div>
              ` : ''}

              <!-- Security notice -->
              <p style="margin: 24px 0 0 0; padding-top: 18px; border-top: 1px solid #eaeef2; font-size: 12px; line-height: 1.5; color: #656d76;">
                ${securityNote}
              </p>
            </td>
          </tr>

        </table>

        <!-- Minimalist Footer (Charte Chezmoi BJ) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #656d76; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #f91942;">Chezmoi BJ • ERP & Cadastre Foncier</p>
              <p style="margin: 0; color: #8c959f;">© Chezmoi BJ - Tous droits réservés</p>
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
      },
    ];
  }
  return [];
}

/**
 * 1. Envoie le code OTP de connexion par e-mail (Design GitHub)
 */
export async function sendOtpEmail(email: string, name: string, otpCode: string): Promise<boolean> {
  try {
    const transport = await getTransporter();

    const htmlContent = buildGitHubStyleHtml({
      title: 'Code de vérification pour votre session',
      preheader: `Votre code de sécurité Chezmoi ERP est : ${otpCode}`,
      recipientName: name,
      bodyText: "Vous tentez de vous connecter à votre espace sécurisé sur Chezmoi ERP. Saisissez le code temporaire ci-dessous pour déverrouiller votre session :",
      code: otpCode,
      securityNote: "Ce code de vérification expirera dans 5 minutes. Si vous n'avez pas demandé ce code, il se peut qu'un tiers tente d'accéder à votre compte. Aucun changement n'a été effectué.",
      badgeLabel: 'Authentification'
    });

    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `${otpCode} est votre code de sécurité Chezmoi ERP`,
      html: htmlContent,
      attachments: getEmailAttachments(),
    });

    console.log(`[Hostinger SMTP] E-mail code OTP envoyé avec succès à ${email} (MessageId: ${info?.messageId || 'OK'})`);
    return true;
  } catch (err: any) {
    console.error(`[Hostinger SMTP Erreur] Échec d'envoi OTP à ${email}:`, err?.message);
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
      bodyText: "Votre compte <strong>Super Admin principal</strong> a été initialisé avec succès sur la base de production Chezmoi ERP. Vous disposez des pleins privilèges sur l'ensemble des modules fonciers, comptables (e-MECeF) et RH.",
      securityNote: "Votre compte est sécurisé par l'authentification par code OTP à 6 chiffres. Vous pouvez activer la double authentification (2FA) dans les paramètres du profil.",
      badgeLabel: 'Super Admin'
    });

    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `[Chezmoi ERP] Activation du Compte Administrateur Central (SMB)`,
      html: htmlContent,
      attachments: getEmailAttachments(),
    });

    console.log(`[Hostinger SMTP] E-mail d'activation envoyé à l'administrateur central SMB (${email}).`);
    return true;
  } catch (err: any) {
    console.error(`[Hostinger SMTP Erreur] Échec envoi email SMB à ${email}:`, err?.message);
    return false;
  }
}

/**
 * 3. Envoie l'e-mail de validation pour tout nouveau compte créé (Statut EN_ATTENTE_VALIDATION)
 */
export async function sendNewAccountVerificationEmail(
  email: string,
  name: string,
  token: string,
  code: string,
  appUrl = 'http://localhost:3000'
): Promise<boolean> {
  try {
    const transport = await getTransporter();
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const htmlContent = buildGitHubStyleHtml({
      title: 'Validez votre adresse e-mail',
      preheader: `Code de validation Chezmoi ERP : ${code}`,
      recipientName: name,
      bodyText: "Un nouveau compte collaborateur a été créé pour vous sur Chezmoi ERP. Conformément à la politique de sécurité, vous devez confirmer votre adresse e-mail pour activer votre compte :",
      code: code,
      actionUrl: verificationUrl,
      actionText: 'Confirmer mon adresse e-mail',
      securityNote: "Une fois votre adresse validée, vous pourrez vous connecter en saisissant votre identifiant et en recevant un code OTP temporaire.",
      badgeLabel: 'Validation requise'
    });

    const info = await transport.sendMail({
      from: FROM_SENDER,
      to: email,
      subject: `[Chezmoi ERP] Confirmation de votre compte (${code})`,
      html: htmlContent,
      attachments: getEmailAttachments(),
    });

    console.log(`[Hostinger SMTP] E-mail de validation de nouveau compte envoyé à ${email} (Code: ${code})`);
    return true;
  } catch (err: any) {
    console.error(`[Hostinger SMTP Erreur] Échec envoi validation à ${email}:`, err?.message);
    return false;
  }
}
