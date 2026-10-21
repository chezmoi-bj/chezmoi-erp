# Guide de Déploiement Hostinger Cloud (Sans VPS)
## Chezmoi ERP Immobilier Bénin — Backend Node.js & Base de Données MySQL / MariaDB

Ce guide vous accompagne pas à pas pour déployer l'application **Chezmoi ERP** sur votre formule **Cloud Hosting Hostinger** existante sans avoir besoin d'un serveur VPS dédié.

---

### Résumé de l'architecture déployée

| Composant | Technologie | Emplacement Hostinger |
| :--- | :--- | :--- |
| **Backend & API** | Node.js (v18, v20 ou v22) + Express | Module Node.js Selector (hPanel) |
| **Base de Données Centrale** | MySQL 8.0 / MariaDB 10.x | Gestionnaire MySQL & phpMyAdmin (hPanel) |
| **Stockage Hors-Ligne (Terrain)** | Drift / SQLite | Embarqué dans l'application mobile Flutter / Web |
| **Moteur de Synchronisation** | Batch Push / Pull + LWW Conflict Resolution | Endpoints `/api/sync/push` et `/api/sync/pull` |
| **Interface Frontend** | React 19 + Tailwind CSS (SPA compilée dans `dist/`) | Servie directement par Express |

---

### Étape 1 : Création de la Base de Données MySQL sur Hostinger

1. Connectez-vous à votre panneau **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Allez dans la section **Bases de données** > **Bases de données MySQL**.
3. Remplissez le formulaire de création :
   - **Nom de la base de données** : par exemple `chezmoi_db` (Hostinger préfixera automatiquement, ex: `u123456789_chezmoi_db`).
   - **Nom d'utilisateur MySQL** : par exemple `chezmoi` (ex: `u123456789_chezmoi`).
   - **Mot de passe** : Générez un mot de passe sécurisé et notez-le.
4. Cliquez sur **Créer**.

---

### Étape 2 : Importation du Schéma SQL dans phpMyAdmin

1. Toujours dans la section **Bases de données MySQL**, repérez votre nouvelle base et cliquez sur le bouton **Entrer dans phpMyAdmin**.
2. Une fois dans phpMyAdmin, sélectionnez le nom de votre base dans le volet de gauche.
3. Cliquez sur l'onglet **Importer** dans la barre supérieure.
4. Cliquez sur **Choisir un fichier** et sélectionnez le fichier `schema.sql` fourni à la racine du projet.
5. Laissez les options par défaut (Jeu de caractères : `utf-8`) et cliquez sur le bouton **Exécuter** en bas de page.
6. Toutes les tables (`properties`, `users`, `cash_transactions`, `leave_requests`, `payslips`, `legal_documents`, `sync_queue`, etc.) ainsi que les données de démonstration officielles du Bénin sont créées instantanément.

---

### Étape 3 : Configuration du Fichier `.env`

À la racine de votre application (ou via le Gestionnaire de Fichiers Hostinger) :
1. Créez ou éditez le fichier `.env` avec les identifiants créés à l'Étape 1 :

```env
PORT=3000
NODE_ENV=production

# Sur l'hébergement mutualisé / Cloud Hostinger, l'hôte est TOUJOURS 'localhost' ou '127.0.0.1'
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_chezmoi
DB_PASSWORD=VotreMotDePasseHostinger2026!
DB_NAME=u123456789_chezmoi_db

JWT_SECRET=chezmoi_secret_jwt_key_super_admin_2026_benin_cotonou
APP_URL=https://votredomaine.com
```

---

### Étape 4 : Configuration de l'Application Node.js dans Hostinger hPanel

1. Dans votre hPanel, allez dans **Avancé** (ou la barre de recherche) > **Node.js**.
2. Cliquez sur **Créer une application Node.js** :
   - **Version de Node.js** : Sélectionnez **Node.js 20.x** (ou 18.x / 22.x).
   - **Mode de l'application** : `Production`.
   - **Racine de l'application** : Choisissez le dossier où sont vos fichiers (par ex. `/public_html` ou `/public_html/chezmoi`).
   - **URL de l'application** : Votre nom de domaine ou sous-domaine (ex: `erp.votredomaine.com`).
   - **Fichier de démarrage de l'application** : `server.js` (ou `server.ts` si vous lancez avec tsx).
3. Cliquez sur **Créer**.
4. Déposez les fichiers du projet dans le dossier via FTP, Git ou le Gestionnaire de Fichiers.
5. Dans l'interface Node.js Hostinger, cliquez sur **NPM Install** puis exécutez la commande de build :
   ```bash
   npm run build
   ```
6. Cliquez sur **Démarrer l'application** (ou **Redémarrer**).

---

### Étape 5 : Vérification du Déploiement

Ouvrez votre navigateur sur votre domaine :
- **Application Web & Dashboard** : `https://votredomaine.com/`
- **Vérification de l'état MySQL** : `https://votredomaine.com/api/health`

Le point de terminaison `/api/health` vous confirmera :
```json
{
  "status": "online",
  "app": "Chezmoi ERP Immobilier Bénin",
  "version": "2.5.0-hostinger-mysql",
  "database": {
    "engine": "MySQL / MariaDB (Hostinger Cloud)",
    "connected": true,
    "host": "localhost",
    "database": "u123456789_chezmoi_db"
  }
}
```

---

### Fonctionnement Hors-Ligne (Offline First) Garanti

- Les agents de terrain en brousse ou dans les zones à faible connectivité du Bénin continuent à saisir les fiches, les photos et les coordonnées GPS directement dans la base locale **Drift / SQLite** de leur terminal.
- Dès qu'un réseau Internet (Wi-Fi, MTN Bénin, Moov Africa, Celtiis) est capté, le moteur synchronise automatiquement la file d'attente vers l'API MySQL Hostinger via `/api/sync/push`.
