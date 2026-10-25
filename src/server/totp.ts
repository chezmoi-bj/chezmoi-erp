import crypto from 'crypto';
import QRCode from 'qrcode';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Génère un secret aléatoire encodé en Base32 pour Google Authenticator (RFC 3548 / RFC 6238)
 */
export function generateBase32Secret(length = 16): string {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return secret;
}

/**
 * Décode une chaîne Base32 en Buffer binaire
 */
export function base32ToBuffer(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_CHARS.indexOf(cleanBase32.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Calcule le code TOTP à 6 chiffres pour un secret et un timestamp donné (RFC 6238)
 */
export function generateTOTP(secret: string, timestamp = Date.now(), timeStepSeconds = 30): string {
  const key = base32ToBuffer(secret);
  const counter = Math.floor(timestamp / 1000 / timeStepSeconds);
  
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Troncation dynamique (Dynamic Truncation - RFC 4226)
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Vérifie si un code à 6 chiffres correspond au secret TOTP Google Authenticator
 * Tolère une fenêtre de 30 secondes en avance ou en retard (window = 1)
 */
export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const now = Date.now();
  const timeStep = 30 * 1000;

  for (let i = -window; i <= window; i++) {
    const calculated = generateTOTP(secret, now + i * timeStep);
    if (calculated === cleanToken) {
      return true;
    }
  }
  return false;
}

/**
 * Génère l'URL standard otpauth:// pour Google Authenticator
 */
export function generateOtpAuthUri(
  secret: string,
  accountName: string,
  issuer = 'Chezmoi administration'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Génère le QR Code scannable pour Google Authenticator
 */
export async function generateQrCodeDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, {
    width: 240,
    margin: 2,
    color: {
      dark: '#111827',
      light: '#FFFFFF',
    },
  });
}
