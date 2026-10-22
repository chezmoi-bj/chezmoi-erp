import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: Transporter | null = null;

/**
 * Initialise le transporteur Nodemailer
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log(`[Nodemailer] Transporteur SMTP connecté (${smtpHost}:${smtpPort})`);
  } else {
    // Mode d'émulation pour environnement Cloud / développement sans SMTP tiers requis
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    console.log('[Nodemailer] Mode Transport Local actif (simulation avec journalisation des e-mails).');
  }

  return transporter;
}

const FROM_EMAIL = process.env.SMTP_FROM || 'Chezmoi ERP Bénin <notifications@chezmoi.bj>';

/**
 * 1. Envoie l'e-mail d'activation au compte administrateur central SMB
 */
export async function sendAdminInitializationEmail(email: string, name: string): Promise<boolean> {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `[Chezmoi ERP] Activation & Validation du Compte Administrateur Central - ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0D0E; color: #F3F4F6; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <div style="padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: radial-gradient(circle at 50% 0%, rgba(249,25,66,0.15), transparent 70%);">
            <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">chezmoi<span style="color: #F91942;">.bj</span> ERP</h1>
            <p style="color: #94A3B8; font-size: 13px; margin: 5px 0 0 0;">Plateforme de Gestion Immobilière & Cadastre Foncier</p>
          </div>
          <div style="padding: 35px 30px;">
            <div style="background-color: rgba(249,25,66,0.1); border: 1px solid rgba(249,25,66,0.25); border-radius: 12px; padding: 15px; margin-bottom: 25px;">
              <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #F91942; letter-spacing: 0.5px;">Sécurité & Initialisation</span>
              <strong style="font-size: 16px; color: #FFFFFF;">Compte Administrateur Central (SMB) configuré</strong>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #E2E8F0;">Bonjour <strong>${name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">Votre compte <strong>Super Admin principal</strong> a été configuré avec succès sur la base de données de production Chezmoi ERP.</p>
            
            <div style="background-color: #14171A; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid rgba(255,255,255,0.06);">
              <table style="width: 100%; font-size: 13px; color: #CBD5E1;">
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Identifiant principal :</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #FFFFFF; text-align: right;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Rôle système :</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #F91942; text-align: right;">Super Admin (Direction)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8;">Statut d'activation :</td>
                  <td style="padding: 6px 0; font-weight: bold; color: #10B981; text-align: right;">Actif & Validé</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #94A3B8;">Vous pouvez vous connecter à tout moment sur l'interface sécurisée avec votre code OTP à 6 chiffres.</p>
          </div>
          <div style="padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #64748B;">
            Chezmoi Bénin • Tous droits réservés • République du Bénin
          </div>
        </div>
      `,
    });

    console.log(`[Nodemailer] E-mail d'activation envoyé à l'administrateur central SMB (${email}). ID message: ${info?.messageId || 'OK'}`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer Erreur] Impossible d'envoyer l'e-mail à ${email}:`, err?.message);
    return false;
  }
}

/**
 * 2. Envoie l'e-mail de validation pour tout nouveau compte créé (Statut EN_ATTENTE_VALIDATION)
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

    await transport.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `[Chezmoi ERP] Confirmation requise : activez votre compte collaborateur`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0D0E; color: #F3F4F6; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <div style="padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: radial-gradient(circle at 50% 0%, rgba(249,25,66,0.15), transparent 70%);">
            <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">chezmoi<span style="color: #F91942;">.bj</span> ERP</h1>
            <p style="color: #94A3B8; font-size: 13px; margin: 5px 0 0 0;">Validation d'adresse e-mail obligatoire</p>
          </div>
          <div style="padding: 35px 30px;">
            <p style="font-size: 14px; line-height: 1.6; color: #E2E8F0;">Bonjour <strong>${name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">Votre compte a été pré-enregistré dans l'ERP Chezmoi. Il est actuellement au statut <strong>« En attente de validation »</strong>.</p>
            <p style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">Pour déverrouiller l'accès à votre espace de travail et autoriser les connexions par OTP, veuillez confirmer votre adresse e-mail en utilisant le code ci-dessous ou en cliquant sur le lien :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #14171A; border: 1px solid #F91942; border-radius: 14px; padding: 15px 30px; letter-spacing: 6px; font-size: 28px; font-family: monospace; font-weight: 800; color: #F91942;">
                ${code}
              </div>
              <p style="color: #94A3B8; font-size: 11px; margin-top: 8px;">Code de confirmation temporaire</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF2B53, #F91942, #D8072E); color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; box-shadow: 0 4px 20px rgba(249,25,66,0.35);">
                Valider mon adresse e-mail
              </a>
            </div>

            <p style="font-size: 12px; color: #64748B; margin-top: 25px; line-height: 1.5;">
              Si le bouton ci-dessus ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
              <span style="color: #94A3B8; word-break: break-all;">${verificationUrl}</span>
            </p>
          </div>
          <div style="padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: #64748B;">
            Chezmoi Bénin • Direction des Systèmes d'Information
          </div>
        </div>
      `,
    });

    console.log(`[Nodemailer] E-mail de validation de nouveau compte envoyé à ${email} (Code: ${code})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer Erreur] Échec envoi validation à ${email}:`, err?.message);
    return false;
  }
}
