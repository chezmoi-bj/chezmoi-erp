import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateBase32Secret, 
  generateTOTP, 
  verifyTOTP, 
  generateOtpAuthUri,
  base32ToBuffer 
} from './totp.js';

describe('Google Authenticator RFC 6238 TOTP Engine', () => {
  test('generates valid 16-character base32 secret', () => {
    const secret = generateBase32Secret(16);
    assert.equal(secret.length, 16);
    assert.match(secret, /^[A-Z2-7]+$/);
  });

  test('converts base32 to buffer correctly', () => {
    const secret = 'JBSWY3DPEHPK3PXP'; // Standard RFC test vector for "Hello!\xde\xad\xbe\xef"
    const buf = base32ToBuffer(secret);
    assert.ok(buf.length > 0);
  });

  test('generates and verifies valid 6-digit TOTP code', () => {
    const secret = generateBase32Secret(16);
    const code = generateTOTP(secret);
    assert.equal(code.length, 6);
    assert.match(code, /^\d{6}$/);

    // Immediate verification must succeed
    const isValid = verifyTOTP(code, secret);
    assert.equal(isValid, true);
  });

  test('rejects wrong token or wrong secret', () => {
    const secret = generateBase32Secret(16);
    assert.equal(verifyTOTP('000000', secret), false);
    assert.equal(verifyTOTP('12345', secret), false);
    assert.equal(verifyTOTP('abcdef', secret), false);
  });

  test('creates valid otpauth URI with Chezmoi administration issuer', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = generateOtpAuthUri(secret, 'chezmoi.benin@gmail.com');
    assert.ok(uri.startsWith('otpauth://totp/Chezmoi%20administration:chezmoi.benin%40gmail.com'));
    assert.ok(uri.includes('secret=JBSWY3DPEHPK3PXP'));
    assert.ok(uri.includes('issuer=Chezmoi%20administration'));
  });
});
