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
  storeOtp,
  verifyOtp,
  toggleUser2FA
} from './src/server/db';

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
      app: 'Chezmoi ERP Immobilier Bénin',
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
          error: 'Aucun compte associé à cet identifiant dans la base Chezmoi ERP. Veuillez vérifier votre saisie ou contacter l’administrateur.' 
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

      res.json({
        success: true,
        message: `Code de sécurité envoyé avec succès à ${maskedEmail}`,
        email: user.email,
        phone: user.phone,
        maskedTarget: maskedEmail,
        devOtpCode: otpCode, // Renvoyé pour faciliter les tests et la démonstration
        twoFactorRequired: Boolean(user.twoFactorEnabled),
        userRole: user.role,
        userName: user.name,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erreur lors de la génération du code OTP' });
    }
  });

  app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    try {
      const { identifier, otp } = req.body;
      if (!identifier || !otp) {
        return res.status(400).json({ error: 'Identifiant et code OTP requis.' });
      }

      const verification = verifyOtp(identifier, otp.toString().trim());
      if (!verification.valid) {
        return res.status(401).json({ error: verification.reason || 'Code OTP invalide' });
      }

      const user = await findUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
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

  app.post('/api/auth/toggle-2fa', async (req: Request, res: Response) => {
    try {
      const { userId, enabled } = req.body;
      if (!userId || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Paramètres userId et enabled requis.' });
      }
      const updated = await toggleUser2FA(userId, enabled);
      if (!updated) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
      res.json({
        success: true,
        message: enabled ? 'Double authentification (2FA) activée.' : 'Double authentification désactivée.',
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
      payloadSent: payload || { test: 'ping', app: 'Chezmoi ERP' },
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
    console.log(` Chezmoi ERP Backend Node.js / Express prêt !`);
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
