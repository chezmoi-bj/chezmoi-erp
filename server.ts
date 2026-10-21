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
  updateSettings
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

  // 8. Test Webhook dispatch
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
