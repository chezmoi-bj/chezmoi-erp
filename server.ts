import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initDatabase, 
  getDatabaseStatus, 
  getAllProperties, 
  upsertProperty, 
  processSyncPush, 
  processSyncPull,
  getAllTransactions,
  upsertTransaction,
  getAllUsers,
  upsertUser,
  getAllLeaveRequests,
  addLeaveRequest,
  updateLeaveStatus,
  getAllPayslips,
  addPayslip,
  getAllDocuments,
  addDocument,
  getSettings,
  updateSettings,
  findUserByIdentifier,
  findUserById,
  storeOtp,
  verifyOtp,
  toggleUser2FA,
  verifyEmailAccount
} from './src/server/db';
import { sendOtpEmail } from './src/server/mailer';
import { 
  verifyTOTP, 
  generateBase32Secret, 
  generateOtpAuthUri, 
  generateQrCodeDataUrl 
} from './src/server/totp';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  // Parsing JSON & URL-encoded payloads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS headers pour intégrations Webhooks & API externes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialisation de la base MySQL / MariaDB Hostinger
  await initDatabase();

  // --------------------------------------------------------------------------
  // API ROUTES
  // --------------------------------------------------------------------------

  // 1. Health & Hostinger MySQL Status
  app.get('/api/health', async (req: Request, res: Response) => {
    const status = await getDatabaseStatus();
    res.json({
      status: 'online',
      app: 'Chezmoi administration',
      version: '2.5.0-hostinger-mysql',
      timestamp: new Date().toISOString(),
      database: status,
      environment: isProduction ? 'production (Hostinger Cloud)' : 'development',
    });
  });

  // 2. Propriétés & Recensement Foncier
  app.get('/api/properties', async (req: Request, res: Response) => {
    try {
      const properties = await getAllProperties();
      res.json(properties);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors du chargement des biens' });
    }
  });

  app.post('/api/properties', async (req: Request, res: Response) => {
    try {
      const saved = await upsertProperty(req.body);
      res.json({ success: true, property: saved });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors de la sauvegarde du bien' });
    }
  });

  app.put('/api/properties/:id', async (req: Request, res: Response) => {
    try {
      const updatedData = { ...req.body, id: req.params.id, updatedAt: Date.now() };
      const saved = await upsertProperty(updatedData);
      res.json({ success: true, property: saved });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors de la mise à jour du bien' });
    }
  });

  // 3. Synchronisation Offline Drift (SQLite) -> Backend MySQL
  app.post('/api/sync/push', async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Payload invalide: items doit être un tableau' });
      }
      const result = await processSyncPush(items);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur synchronisation push' });
    }
  });

  app.get('/api/sync/pull', async (req: Request, res: Response) => {
    try {
      const since = Number(req.query.since || 0);
      const data = await processSyncPull(since);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur synchronisation pull' });
    }
  });

  // 4. Comptabilité, Dépenses & Rémunérations
  app.get('/api/transactions', async (req: Request, res: Response) => {
    try {
      const transactions = await getAllTransactions();
      res.json(transactions);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur transactions' });
    }
  });

  app.post('/api/transactions', async (req: Request, res: Response) => {
    try {
      const saved = await upsertTransaction(req.body);
      res.json({ success: true, transaction: saved });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur création transaction' });
    }
  });

  // 5. Ressources Humaines & Comptes Utilisateurs
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur utilisateurs' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const saved = await upsertUser(req.body);
      res.json({ success: true, user: saved });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur mise à jour utilisateur' });
    }
  });

  // Congés RH
  app.get('/api/leave-requests', async (req: Request, res: Response) => {
    try {
      const leaves = await getAllLeaveRequests();
      res.json(leaves);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur congés' });
    }
  });

  app.post('/api/leave-requests', async (req: Request, res: Response) => {
    try {
      const created = await addLeaveRequest(req.body);
      res.json({ success: true, leaveRequest: created });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur demande de congé' });
    }
  });

  app.put('/api/leave-requests/:id/status', async (req: Request, res: Response) => {
    try {
      const { status, approvedBy } = req.body;
      const ok = await updateLeaveStatus(req.params.id, status, approvedBy || 'Admin');
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur approbation congé' });
    }
  });

  // Bulletins de paie RH
  app.get('/api/payslips', async (req: Request, res: Response) => {
    try {
      const slips = await getAllPayslips();
      res.json(slips);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur bulletins de paie' });
    }
  });

  app.post('/api/payslips', async (req: Request, res: Response) => {
    try {
      const slip = await addPayslip(req.body);
      res.json({ success: true, payslip: slip });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur création bulletin' });
    }
  });

  // 6. GED Foncière
  app.get('/api/documents', async (req: Request, res: Response) => {
    try {
      const docs = await getAllDocuments();
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur documents fonciers' });
    }
  });

  app.post('/api/documents', async (req: Request, res: Response) => {
    try {
      const doc = await addDocument(req.body);
      res.json({ success: true, document: doc });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur enregistrement document' });
    }
  });

  // 7. Paramètres Système (WhatsApp, Gmail, Claude, Gemini, Webhooks)
  app.get('/api/settings', async (req: Request, res: Response) => {
    try {
      const settings = await getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur paramètres' });
    }
  });

  app.post('/api/settings', async (req: Request, res: Response) => {
    try {
      const updated = await updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur sauvegarde paramètres' });
    }
  });

  // 8. Authentification Sécurisée par Code OTP (6 chiffres) & 2FA
  app.post('/api/auth/request-otp', async (req: Request, res: Response) => {
    try {
      const { identifier } = req.body;
      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        return res.status(400).json({ error: 'Veuillez saisir votre adresse email ou votre numéro de téléphone.' });
      }

      const user = await findUserByIdentifier(identifier.trim());
      if (!user) {
        return res.status(404).json({ 
          error: 'Aucun compte associé à cet identifiant dans la base Chezmoi administration. Veuillez vérifier votre saisie ou contacter l’administrateur.' 
        });
      }

      // Exigence 3: Le compte ne peut se connecter et accéder à son espace qu'après validation de l'e-mail
      if (user.status === 'EN_ATTENTE_VALIDATION' || user.emailVerified === false) {
        return res.status(403).json({
          error: 'Ce compte est actuellement en attente de validation. Veuillez valider votre adresse e-mail avec le code reçu avant de vous connecter.',
          pendingVerification: true,
          email: user.email,
          userName: user.name
        });
      }

      // Génération code 6 chiffres
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      storeOtp(identifier, otpCode, 300000); // 5 minutes de validité
      storeOtp(user.email, otpCode, 300000); // Également lié à l'email principal
      if (user.phone) storeOtp(user.phone, otpCode, 300000);

      // Masquage de l'email pour l'affichage de confirmation
      const [name, domain] = user.email.split('@');
      const maskedEmail = `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;

      console.log(`[AUTH OTP] Code généré pour ${user.name} (${user.email}) : [${otpCode}] (2FA: ${user.twoFactorEnabled ? 'OUI' : 'NON'})`);

      // Expédition de l'e-mail avec le code OTP via Hostinger SMTP (Template GitHub)
      sendOtpEmail(user.email, user.name, otpCode).catch(err => {
        console.error('[Hostinger SMTP] Erreur expédition code OTP:', err?.message || err);
      });

      res.json({
        success: true,
        message: `Code de sécurité envoyé avec succès à ${maskedEmail}`,
        email: user.email,
        phone: user.phone,
        maskedTarget: maskedEmail,
        twoFactorRequired: Boolean(user.twoFactorEnabled),
        userRole: user.role,
        userName: user.name,
        devOtp: !isProduction ? otpCode : undefined,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors de la génération du code OTP' });
    }
  });

  app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    try {
      const { identifier, otp } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({ error: 'Identifiant et code de vérification requis.' });
      }

      const cleanCode = otp.toString().trim();
      const user = await findUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }

      // 1. Vérification par code OTP Email (mode par défaut)
      const emailVerification = verifyOtp(identifier, cleanCode);

      // 2. Vérification par Google Authenticator (TOTP RFC 6238) si configuré
      const isTotpValid = user.totpSecret ? verifyTOTP(cleanCode, user.totpSecret) : false;

      // 3. Fallback de développement local
      const isDevPass = !isProduction && (cleanCode === '123456' || cleanCode === '000000');

      if (!emailVerification.valid && !isTotpValid && !isDevPass) {
        return res.status(401).json({ 
          error: emailVerification.reason || 'Code de sécurité invalide ou expiré (OTP email ou Google Authenticator).' 
        });
      }

      if (user.status === 'EN_ATTENTE_VALIDATION' || user.emailVerified === false) {
        return res.status(403).json({
          error: 'Ce compte est en attente de validation e-mail. Veuillez confirmer votre adresse avant de vous connecter.',
          pendingVerification: true,
          email: user.email
        });
      }

      // Création d'un token de session JWT standard
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 7
      };
      const token = `cm_jwt_${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}`;

      res.json({
        success: true,
        message: 'Authentification réussie. Session déverrouillée.',
        token,
        user,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors de la vérification OTP' });
    }
  });

  // 8b. Configuration Google Authenticator (Génération TOTP Secret & QR Code)
  app.get('/api/auth/2fa/setup', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const user = userId ? await findUserById(userId) : null;
      const accountEmail = user?.email || 'chezmoi.benin@gmail.com';

      // Secret Base32 permanent pour l'utilisateur ou nouvelle génération
      const secret = user?.totpSecret || generateBase32Secret(16);
      const otpauthUri = generateOtpAuthUri(secret, accountEmail, 'Chezmoi administration');
      const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUri);

      res.json({
        success: true,
        secret,
        otpauthUri,
        qrCodeDataUrl,
        accountEmail,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur initialisation Google Authenticator' });
    }
  });

  // Validation par email (API code ou lien web)
  app.post('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const { code, email } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Code de validation requis.' });
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
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors de la vérification de l\'adresse e-mail' });
    }
  });

  app.get('/api/auth/verify-email', async (req: Request, res: Response) => {
    try {
      const token = (req.query.token || req.query.code) as string;
      const email = req.query.email as string | undefined;
      if (!token) {
        return res.status(400).send('Jeton ou code de validation manquant.');
      }
      const result = await verifyEmailAccount(token, email);
      if (!result.success) {
        return res.status(400).send(`
          <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0b0f17; color: #fff;">
              <div style="background: #151c28; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; text-align: center; max-width: 440px;">
                <h2 style="color: #fa3055; margin-top: 0;">Validation Impossible</h2>
                <p style="color: #94a3b8;">${result.message}</p>
                <a href="/" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #fa3055; color: #fff; text-decoration: none; border-radius: 8px;">Retour à Chezmoi administration</a>
              </div>
            </body>
          </html>
        `);
      }
      res.redirect('/?email_verified=true');
    } catch (err: any) {
      res.status(500).send('Erreur lors de la validation.');
    }
  });

  // Lien direct de validation de compte pour l'utilisateur
  app.get('/verify-account', async (req: Request, res: Response) => {
    try {
      const token = (req.query.token || req.query.code) as string;
      const email = req.query.email as string | undefined;
      if (!token) {
        return res.redirect('/?error=token_missing');
      }
      const result = await verifyEmailAccount(token, email);
      if (result.success) {
        res.redirect('/?email_verified=true');
      } else {
        res.redirect(`/?error=${encodeURIComponent(result.message)}`);
      }
    } catch {
      res.redirect('/?error=verification_failed');
    }
  });

  app.post('/api/auth/toggle-2fa', async (req: Request, res: Response) => {
    try {
      const { userId, enabled, totpSecret } = req.body;
      if (!userId || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Paramètres userId et enabled requis.' });
      }
      const updated = await toggleUser2FA(userId, enabled, totpSecret);
      if (!updated) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
      res.json({
        success: true,
        message: enabled 
          ? 'Double authentification (2FA) et Google Authenticator activés avec succès.' 
          : 'Double authentification désactivée.',
        user: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur modification 2FA' });
    }
  });

  // 9. Test Webhook dispatch
  app.post('/api/webhooks/test', async (req: Request, res: Response) => {
    const { url, payload } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL webhook manquante' });
    }
    res.json({
      success: true,
      deliveredAt: new Date().toISOString(),
      url,
      payloadSent: payload || { test: 'ping', app: 'Chezmoi administration' },
      message: 'Webhook simulé avec succès vers le point de terminaison spécifié.'
    });
  });

  // --------------------------------------------------------------------------
  // FRONTEND SERVING (DEVELOPMENT vs PRODUCTION HOSTINGER)
  // --------------------------------------------------------------------------
  if (!isProduction) {
    // Mode Développement : montage du serveur Vite
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode Production Hostinger Cloud : servir le build statique dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Démarrage du serveur
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Chezmoi administration Backend Node.js / Express prêt !`);
    console.log(` Port d'écoute : ${PORT}`);
    console.log(` Environnement : ${isProduction ? 'Production Hostinger Cloud' : 'Développement'}`);
    console.log(` Endpoints API disponibles sur : /api/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Erreur fatale au démarrage du serveur Express:', err);
  process.exit(1);
});
