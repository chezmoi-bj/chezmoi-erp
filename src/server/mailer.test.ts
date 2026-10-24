import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Mailer Configuration & Template validation', async (t) => {
  await t.test('Mailer source code contains Poppins font declarations and Google Fonts link', () => {
    const mailerPath = path.resolve(process.cwd(), 'src/server/mailer.ts');
    const content = fs.readFileSync(mailerPath, 'utf8');

    assert.ok(content.includes('family=Poppins'), 'Mailer should link to Google Fonts Poppins');
    assert.ok(content.includes("font-family: 'Poppins'"), 'Mailer should specify Poppins font');
    assert.ok(content.includes('cid:chezmoi-logo'), 'Mailer should attach logo with CID chezmoi-logo');
    assert.ok(content.includes('smtp.hostinger.com'), 'Mailer should target Hostinger SMTP');
    assert.ok(content.includes('contact@chezmoi.bj'), 'Mailer sender should be contact@chezmoi.bj');
    assert.ok(content.includes('© Chezmoi BJ - Tous droits réservés'), 'Mailer footer should include copyright notice');
  });

  await t.test('Chezmoi logo files exist on filesystem', () => {
    const candidate1 = path.resolve(process.cwd(), 'public/assets/aistudio/1_e24ebf1b.png');
    const candidate2 = path.resolve(process.cwd(), 'public/chezmoi-logo.png');

    const exists = fs.existsSync(candidate1) || fs.existsSync(candidate2);
    assert.ok(exists, 'At least one Chezmoi logo asset should exist');
  });
});
