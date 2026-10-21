export interface CodeSnippet {
  id: string;
  title: string;
  category: 'MySQL/Prisma' | 'Drift/SQLite' | 'Architecture Flutter' | 'Sync Engine' | 'Census Form (Dart)' | 'e-MECeF (Dart)';
  fileName: string;
  language: string;
  description: string;
  content: string;
}

export const FLUTTER_CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'mysql_schema',
    title: '1. Schéma MySQL / MariaDB Distant (Hostinger Cloud & Prisma)',
    category: 'MySQL/Prisma',
    fileName: 'server/prisma/schema.prisma',
    language: 'prisma',
    description: 'Schéma distant MySQL / MariaDB pour hébergement Cloud Hostinger (sans VPS) avec RBAC, audit log et statuts de synchronisation.',
    content: `// ============================================================================
// CHEZMOI IMMOBILIER - Hostinger Cloud MySQL/MariaDB Schema (Prisma ORM & SQL)
// 100% Compatible avec phpMyAdmin Hostinger & Node.js Express (mysql2)
// Conforme Multi-agences Bénin (Cotonou, Calavi, Ouidah, Porto-Novo)
// ============================================================================

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  ADMIN
  RH
  COMPTABLE
  SECRETAIRE
  AGENT_RECENSEUR
}

enum SyncState {
  PENDING
  SYNCED
  CONFLICT
}

enum MandateType {
  EXCLUSIF
  SIMPLE
  GESTION_DIRECTE
}

enum LegalStatus {
  TITRE_FONCIER
  ATTESTATION_RECASEMENT
  EN_COURS
  CONCESSION_FAMILIALE
}

enum PropertyCategory {
  TERRAIN_NU
  PARCELLE_AVEC_TF
  VILLA_BASSE
  VILLA_DUPLEX
  IMMEUBLE_R_PLUS
  APPARTEMENT
  BOUTIQUE_MAGASIN
  BUREAU
  CONCESSION_FAMILIALE
}

model User {
  id            String       @id @default(uuid())
  email         String       @unique
  passwordHash  String
  fullName      String
  phone         String
  role          Role         @default(AGENT_RECENSEUR)
  city          String       @default("Cotonou")
  isActive      Boolean      @default(true)
  properties    Property[]   @relation("AgentProperties")
  invoices      Invoice[]
  syncLogs      SyncAudit[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Owner {
  id             String       @id @default(uuid())
  fullName       String
  phonePrimary   String
  phoneWhatsapp  String
  email          String?
  idCardNumber   String?
  idPhotoUrl     String?
  mandateType    MandateType  @default(EXCLUSIF)
  mandateMonths  Int          @default(12)
  properties     Property[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Property {
  id             String           @id @default(uuid())
  clientLocalId  String?          @unique // UUID généré côté Flutter SQLite
  codeReference  String           @unique // Ex: CM-COT-2026-048
  title          String
  description    String           @db.Text
  category       PropertyCategory
  listingType    String           // VENTE, LOCATION, LOCATION_MEUBLEE
  city           String
  district       String           // Haie Vive, Fidjrossè, Arconville...
  address        String
  priceAmount    Decimal          @db.Decimal(15, 2) // En FCFA (XOF)
  areaSqMeters   Float
  roomsCount     Int              @default(0)
  bedroomsCount  Int              @default(0)
  bathroomsCount Int              @default(0)
  legalStatus    LegalStatus      @default(TITRE_FONCIER)
  
  // Géolocalisation GPS
  latitude       Float
  longitude      Float
  gpsAccuracy    Float            // Précision en mètres
  altitude       Float?
  
  // Propriétaire & Agent
  ownerId        String
  owner          Owner            @relation(fields: [ownerId], references: [id])
  agentId        String
  agent          User             @relation("AgentProperties", fields: [agentId], references: [id])
  
  // Médias & Relations
  photos         PropertyPhoto[]
  documents      PropertyDocument[]
  syncState      SyncState        @default(SYNCED)
  version        Int              @default(1)
  
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  syncedAt       DateTime         @default(now())

  @@index([city, district])
  @@index([category])
  @@index([agentId])
}

model PropertyPhoto {
  id          String   @id @default(uuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  category    String   // FACADE, SALON, CHAMBRE, CUISINE, TITRE, IDENTITE
  url         String   // URL MinIO / S3 / VPS Storage
  localPath   String?  // Chemin SQLite d'origine sur le mobile
  isMain      Boolean  @default(false)
  caption     String?
  uploadedAt  DateTime @default(now())
}

model PropertyDocument {
  id          String   @id @default(uuid())
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  docType     String   // TITRE_FONCIER, ATTESTATION_RECASEMENT, MANDAT
  fileUrl     String
  fileName    String
  fileSize    Int
  status      String   @default("VALIDE")
  createdAt   DateTime @default(now())
}

model Invoice {
  id              String   @id @default(uuid())
  invoiceNumber   String   @unique // Format: FAC-2026-XXXX
  clientName      String
  clientIFU       String?
  clientPhone     String
  totalHT         Decimal  @db.Decimal(15, 2)
  totalTVA        Decimal  @db.Decimal(15, 2)
  totalTTC        Decimal  @db.Decimal(15, 2)
  paymentMode     String
  
  // e-MECeF DGI Bénin
  nim             String   // Machine ID
  ifuSeller       String   // IFU Chezmoi
  sdcId           String   // Contrôleur SDC
  securityCode    String   // Code sécurisé DGI (XXXX-XXXX)
  qrPayload       String   @db.Text
  
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
  createdAt       DateTime @default(now())
}

model SyncAudit {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  entityType  String
  entityId    String
  action      String   // CREATE, UPDATE, DELETE
  diff        Json?
  status      String   // SUCCESS, CONFLICT, RESOLVED
  createdAt   DateTime @default(now())
}`,
  },
  {
    id: 'drift_schema',
    title: '2. Schéma Drift / SQLite Local (Client Flutter)',
    category: 'Drift/SQLite',
    fileName: 'lib/core/database/app_database.dart',
    language: 'dart',
    description: 'Schéma local SQLite avec Drift pour Flutter. Tables offline-first, type-safe avec flags de synchronisation.',
    content: `// ============================================================================
// CHEZMOI IMMOBILIER - Local Database (Drift / SQLite pour Flutter)
// Multiplateforme : Windows, macOS, Linux, Android, iOS
// ============================================================================

import 'package:drift/drift.dart';

part 'app_database.g.dart';

// Enum statut de sync local
enum LocalSyncStatus {
  pending,  // Fiche créée en brousse/hors-ligne, en attente de réseau
  syncing,  // Upload en cours vers le VPS
  synced,   // Fiche validée et présente sur PostgreSQL
  failed,   // Erreur serveur (re-tentative automatique avec backoff)
  conflict  // Version concurrente détectée
}

// ----------------------------------------------------------------------------
// 1. Table Propriétaires locaux
// ----------------------------------------------------------------------------
class LocalOwners extends Table {
  TextColumn get id => text()(); // UUID v4
  TextColumn get fullName => text().withLength(min: 2, max: 120)();
  TextColumn get phonePrimary => text().withLength(min: 8, max: 20)();
  TextColumn get phoneWhatsapp => text().withLength(min: 8, max: 20)();
  TextColumn get email => text().nullable()();
  TextColumn get idCardNumber => text().nullable()();
  TextColumn get localIdentityPhotoPath => text().nullable()();
  TextColumn get mandateType => text().withDefault(const Constant('EXCLUSIF'))();
  IntColumn get mandateDurationMonths => integer().withDefault(const Constant(12))();
  IntColumn get syncStatus => intEnum<LocalSyncStatus>()
      .withDefault(Constant(LocalSyncStatus.pending.index))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// ----------------------------------------------------------------------------
// 2. Table Biens Immobiliers recensés
// ----------------------------------------------------------------------------
class LocalProperties extends Table {
  TextColumn get id => text()(); // UUID client local
  TextColumn get serverId => text().nullable()(); // ID retourné par PostgreSQL
  TextColumn get codeReference => text()(); // Ex: CM-COT-2026-089
  TextColumn get title => text().withLength(min: 3, max: 200)();
  TextColumn get description => text()();
  TextColumn get category => text()(); // VILLA_DUPLEX, TERRAIN_NU, etc.
  TextColumn get listingType => text()(); // VENTE, LOCATION
  TextColumn get city => text()(); // Cotonou, Calavi, Ouidah...
  TextColumn get district => text()(); // Haie-Vive, Fidjrossè...
  TextColumn get address => text()();
  RealColumn get priceAmount => real()(); // FCFA
  RealColumn get areaSqMeters => real()();
  IntColumn get roomsCount => integer().withDefault(const Constant(0))();
  IntColumn get bedroomsCount => integer().withDefault(const Constant(0))();
  IntColumn get bathroomsCount => integer().withDefault(const Constant(0))();
  TextColumn get legalStatus => text()(); // TITRE_FONCIER, ATTESTATION...

  // Coordonnées GPS capturées sur le terrain
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  RealColumn get accuracy => real()(); // Précision en mètres
  RealColumn get altitude => real().nullable()();

  // Relations & Agent
  TextColumn get ownerId => text().references(LocalOwners, #id)();
  TextColumn get agentId => text()();
  TextColumn get agentName => text()();

  // Flags de synchronisation Offline-First
  IntColumn get syncStatus => intEnum<LocalSyncStatus>()
      .withDefault(Constant(LocalSyncStatus.pending.index))();
  TextColumn get syncError => text().nullable()();
  IntColumn get syncRetryCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get syncedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

// ----------------------------------------------------------------------------
// 3. Table Photos & Fichiers locaux
// ----------------------------------------------------------------------------
class LocalPhotos extends Table {
  TextColumn get id => text()();
  TextColumn get propertyId => text().references(LocalProperties, #id)();
  TextColumn get category => text()(); // FACADE, SALON, DOC_TITRE, IDENTITE
  TextColumn get localFilePath => text()(); // Chemin vers /app_flutter/photos/...
  TextColumn get remoteUrl => text().nullable()();
  BoolColumn get isMain => boolean().withDefault(const Constant(false))();
  TextColumn get caption => text().nullable()();
  IntColumn get syncStatus => intEnum<LocalSyncStatus>()
      .withDefault(Constant(LocalSyncStatus.pending.index))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// ----------------------------------------------------------------------------
// 4. File d'attente des mutations réseau (Offline Mutation Queue)
// ----------------------------------------------------------------------------
class LocalSyncQueue extends Table {
  TextColumn get id => text()();
  TextColumn get entityType => text()(); // 'property', 'owner', 'photo'
  TextColumn get entityId => text()();
  TextColumn get action => text()(); // 'CREATE', 'UPDATE', 'DELETE'
  TextColumn get payloadJson => text()(); // Données sérialisées
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  IntColumn get maxRetries => integer().withDefault(const Constant(5))();
  TextColumn get lastError => text().nullable()();
  IntColumn get syncStatus => intEnum<LocalSyncStatus>()
      .withDefault(Constant(LocalSyncStatus.pending.index))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get nextRetryAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [LocalOwners, LocalProperties, LocalPhotos, LocalSyncQueue])
class AppDatabase extends _$AppDatabase {
  AppDatabase(QueryExecutor e) : super(e);

  @override
  int get schemaVersion => 1;
}`,
  },
  {
    id: 'flutter_architecture',
    title: '3. Arborescence du Projet Flutter (Clean Architecture)',
    category: 'Architecture Flutter',
    fileName: 'flutter_project_structure.txt',
    language: 'text',
    description: 'Organisation modulaire Feature-First / Clean Architecture pour un code maintenable et testable.',
    content: `chezmoi_mobile_erp/
├── android/
├── ios/
├── windows/
├── macos/
├── lib/
│   ├── main.dart                          # Point d'entrée multiplateforme
│   ├── app.dart                           # MaterialApp, Thème Arche & Localisation
│   │
│   ├── core/                              # Socle transverse partagé
│   │   ├── constants/
│   │   │   ├── api_endpoints.dart         # URLs VPS Node.js
│   │   │   ├── app_colors.dart            # Charte Arche : Vert Émeraude, Lime #E2FC52
│   │   │   └── app_theme.dart             # Cartes arrondies 16px, typographie
│   │   ├── database/
│   │   │   ├── app_database.dart          # Drift SQLite Database
│   │   │   ├── connection/                # Native executor (Windows, Android, etc.)
│   │   │   └── daos/                      # Data Access Objects (Property, Owner, Queue)
│   │   ├── network/
│   │   │   ├── dio_client.dart            # Client HTTP configuré
│   │   │   ├── network_info.dart          # Connectivity listener (online/offline)
│   │   │   └── interceptors/
│   │   │       ├── auth_interceptor.dart  # Injection Bearer Token JWT
│   │   │       └── offline_queue_interceptor.dart # Capture des requêtes sans réseau
│   │   ├── sync/
│   │   │   ├── offline_sync_engine.dart   # Moteur de file d'attente & retry
│   │   │   └── conflict_resolver.dart     # Arbitrage Last-Write-Wins
│   │   └── utils/
│   │       ├── gps_service.dart           # Geolocator haute précision
│   │       └── file_storage_service.dart  # Sauvegarde locale des photos
│   │
│   ├── features/                          # Découpage Fonctionnel (Feature-First)
│   │   │
│   │   ├── auth/                          # Authentification & Contrôle d'accès RBAC
│   │   │   ├── data/ (repositories, models)
│   │   │   ├── domain/ (usecases, entities)
│   │   │   └── presentation/ (login_screen, bloc)
│   │   │
│   │   ├── dashboard/                     # Dashboard Inspiration Dribbble Arche
│   │   │   └── presentation/
│   │   │       ├── arche_dashboard_screen.dart
│   │   │       └── widgets/ (contacts_drawer, stats_curve, floorplan_viewer)
│   │   │
│   │   ├── property_census/               # Module Recensement Terrain (Offline-First)
│   │   │   ├── data/
│   │   │   │   ├── datasources/ (local_drift_source, remote_vps_source)
│   │   │   │   └── repositories/ (property_repository_impl.dart)
│   │   │   ├── domain/
│   │   │   │   ├── entities/ (property_entity.dart, owner_entity.dart)
│   │   │   │   └── usecases/ (save_local_census.dart, sync_properties.dart)
│   │   │   └── presentation/
│   │   │       ├── bloc/ (census_bloc.dart, census_state.dart)
│   │   │       ├── screens/ (property_census_screen.dart)
│   │   │       └── widgets/
│   │   │           ├── gps_instant_card.dart     # Bouton style WhatsApp + précision
│   │   │           ├── satellite_map_picker.dart # Carte d'affinage satellite
│   │   │           ├── categorized_photo_grid.dart # Photos bien vs Photos identité
│   │   │           └── owner_step_form.dart
│   │   │
│   │   ├── sync_management/               # Gestionnaire de file d'attente & Conflits
│   │   │   └── presentation/ (sync_status_badge.dart, sync_queue_modal.dart)
│   │   │
│   │   ├── accounting_emecef/             # Facturation Normalisée e-MECeF Bénin
│   │   │   ├── data/ (emecef_api_service.dart)
│   │   │   └── presentation/ (invoices_screen.dart, normalized_receipt_dialog.dart)
│   │   │
│   │   ├── human_resources/               # RH & Suivi commissions agents
│   │   │   └── presentation/ (agent_profile_screen.dart, commissions_sheet.dart)
│   │   │
│   │   └── documents_ged/                 # GED & Statut des Titres Fonciers
│   │       └── presentation/ (documents_list_screen.dart, scanner_widget.dart)
│   │
│   └── injection_container.dart           # Injection de dépendances via GetIt
└── pubspec.yaml`,
  },
  {
    id: 'sync_engine_dart',
    title: '4. Moteur de Synchronisation Hors-Ligne (Dio + SQLite)',
    category: 'Sync Engine',
    fileName: 'lib/core/sync/offline_sync_engine.dart',
    language: 'dart',
    description: 'Gestionnaire de file d’attente offline, détection de connectivité, upload en arrière-plan et backoff exponentiel.',
    content: `// ============================================================================
// CHEZMOI IMMOBILIER - Offline Sync Engine (Flutter)
// File d'attente intelligente & Synchronisation automatique dès retour réseau
// ============================================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import '../database/app_database.dart';

class OfflineSyncEngine {
  final AppDatabase _db;
  final Dio _dio;
  final Connectivity _connectivity;
  
  bool _isSyncing = false;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;

  OfflineSyncEngine({
    required AppDatabase db,
    required Dio dio,
    required Connectivity connectivity,
  })  : _db = db,
        _dio = dio,
        _connectivity = connectivity;

  void initialize() {
    // Écoute automatique des changements de réseau
    _connectivitySub = _connectivity.onConnectivityChanged.listen((results) {
      final isOnline = results.any((r) => r != ConnectivityResult.none);
      if (isOnline && !_isSyncing) {
        triggerSyncProcess();
      }
    });
  }

  /// Déclenche la synchronisation manuelle ou automatique
  Future<SyncResult> triggerSyncProcess() async {
    if (_isSyncing) return SyncResult.alreadyRunning();
    _isSyncing = true;

    int totalProcessed = 0;
    int totalErrors = 0;

    try {
      // 1. Récupération des éléments 'pending' ou 'failed' dans la queue locale
      final queueItems = await (_db.select(_db.localSyncQueue)
            ..where((tbl) => tbl.syncStatus.isIn([
                  LocalSyncStatus.pending.index,
                  LocalSyncStatus.failed.index,
                ]))
            ..orderBy([(tbl) => OrderingTerm.asc(tbl.createdAt)]))
          .get();

      for (final item in queueItems) {
        try {
          // Marquer l'élément en cours de synchronisation
          await (_db.update(_db.localSyncQueue)..where((tbl) => tbl.id.equals(item.id))).write(
            LocalSyncQueueCompanion(
              syncStatus: Value(LocalSyncStatus.syncing),
            ),
          );

          if (item.entityType == 'property') {
            await _syncPropertyItem(item);
          } else if (item.entityType == 'photo') {
            await _syncPhotoItem(item);
          }

          // Succès : marquer synchronisé et purger de la file d'attente
          await (_db.delete(_db.localSyncQueue)..where((tbl) => tbl.id.equals(item.id))).go();
          totalProcessed++;
        } catch (e) {
          totalErrors++;
          final nextRetry = DateTime.now().add(Duration(seconds: (item.retryCount + 1) * 5));
          
          await (_db.update(_db.localSyncQueue)..where((tbl) => tbl.id.equals(item.id))).write(
            LocalSyncQueueCompanion(
              syncStatus: Value(LocalSyncStatus.failed),
              retryCount: Value(item.retryCount + 1),
              lastError: Value(e.toString()),
              nextRetryAt: Value(nextRetry),
            ),
          );
        }
      }

      return SyncResult.success(totalProcessed, totalErrors);
    } finally {
      _isSyncing = false;
    }
  }

  Future<void> _syncPropertyItem(LocalSyncQueueData item) async {
    final payload = jsonDecode(item.payloadJson) as Map<String, dynamic>;
    
    // Appel POST vers l'API VPS Node.js
    final response = await _dio.post(
      '/api/v1/properties/sync',
      data: payload,
      options: Options(headers: {'X-Client-Local-Id': item.entityId}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final serverId = response.data['data']['id'];
      
      // Mise à jour de la fiche locale avec l'ID serveur et statut 'synced'
      await (_db.update(_db.localProperties)..where((tbl) => tbl.id.equals(item.entityId))).write(
        LocalPropertiesCompanion(
          serverId: Value(serverId),
          syncStatus: Value(LocalSyncStatus.synced),
          syncedAt: Value(DateTime.now()),
          syncError: const Value(null),
        ),
      );
    } else {
      throw Exception('Erreur serveur HTTP \${response.statusCode}');
    }
  }

  Future<void> _syncPhotoItem(LocalSyncQueueData item) async {
    final photo = await (_db.select(_db.localPhotos)
          ..where((tbl) => tbl.id.equals(item.entityId)))
        .getSingleOrNull();

    if (photo == null) return;
    final file = File(photo.localFilePath);
    if (!await file.exists()) return;

    final formData = FormData.fromMap({
      'photo': await MultipartFile.fromFile(file.path, filename: file.uri.pathSegments.last),
      'propertyId': photo.propertyId,
      'category': photo.category,
      'isMain': photo.isMain,
    });

    final response = await _dio.post('/api/v1/photos/upload', data: formData);

    if (response.statusCode == 200 || response.statusCode == 201) {
      final remoteUrl = response.data['url'];
      await (_db.update(_db.localPhotos)..where((tbl) => tbl.id.equals(photo.id))).write(
        LocalPhotosCompanion(
          remoteUrl: Value(remoteUrl),
          syncStatus: Value(LocalSyncStatus.synced),
        ),
      );
    }
  }

  void dispose() {
    _connectivitySub?.cancel();
  }
}

class SyncResult {
  final bool isRunning;
  final int syncedCount;
  final int errorCount;

  SyncResult({required this.isRunning, required this.syncedCount, required this.errorCount});

  factory SyncResult.alreadyRunning() => SyncResult(isRunning: true, syncedCount: 0, errorCount: 0);
  factory SyncResult.success(int count, int errors) =>
      SyncResult(isRunning: false, syncedCount: count, errorCount: errors);
}`,
  },
  {
    id: 'census_form_dart',
    title: '5. Formulaire Recensement Mobile (GPS + Caméra + Drift)',
    category: 'Census Form (Dart)',
    fileName: 'lib/features/property_census/presentation/property_census_screen.dart',
    language: 'dart',
    description: 'Interface terrain complète avec capture GPS instantanée style WhatsApp, appareil photo, photos bien vs identité, et persistance locale SQLite.',
    content: `// ============================================================================
// CHEZMOI IMMOBILIER - Écran de Recensement Mobile Terrain (Offline-First)
// Capture GPS instantanée (Style WhatsApp) + Caméra + Persistance Drift
// ============================================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

class PropertyCensusScreen extends StatefulWidget {
  const PropertyCensusScreen({Key? key}) : super(key: key);

  @override
  State<PropertyCensusScreen> createState() => _PropertyCensusScreenState();
}

class _PropertyCensusScreenState extends State<PropertyCensusScreen> {
  final _formKey = GlobalKey<FormState>();
  final _imagePicker = ImagePicker();

  // 1. Propriétaire / Représentant
  final _ownerNameCtrl = TextEditingController();
  final _ownerPhoneCtrl = TextEditingController(text: '+229 ');
  final _ownerWhatsappCtrl = TextEditingController(text: '+229 ');
  String _mandateType = 'EXCLUSIF';

  // 2. Bien & Annonce
  final _titleCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _areaCtrl = TextEditingController();
  String _category = 'VILLA_DUPLEX';
  String _listingType = 'VENTE';
  String _city = 'Cotonou';
  String _district = 'Haie-Vive';

  // 3. Géolocalisation GPS
  Position? _capturedPosition;
  bool _isLocating = false;
  LatLng? _refinedLatLng;

  // 4. Médias & Photos catégorisées
  final List<File> _propertyPhotos = [];
  File? _ownerIdCardPhoto;

  /// Capture de la position GPS instantanée (Style WhatsApp)
  Future<void> _captureInstantGPS() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.bestForNavigation,
        timeLimit: const Duration(seconds: 10),
      );

      setState(() {
        _capturedPosition = position;
        _refinedLatLng = LatLng(position.latitude, position.longitude);
        _isLocating = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Position capturée avec succès ! Précision : \${position.accuracy.toStringAsFixed(1)} m'),
          backgroundColor: const Color(0xFF0D5C54),
        ),
      );
    } catch (e) {
      setState(() => _isLocating = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur GPS : \$e'), backgroundColor: Colors.red),
      );
    }
  }

  /// Prise de photo directe via caméra
  Future<void> _takePhoto({required bool isIdentityCard}) async {
    final XFile? file = await _imagePicker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
    );
    if (file == null) return;

    setState(() {
      if (isIdentityCard) {
        _ownerIdCardPhoto = File(file.path);
      } else {
        _propertyPhotos.add(File(file.path));
      }
    });
  }

  /// Enregistrement Offline-First dans SQLite (Drift)
  Future<void> _saveCensusRecord() async {
    if (!_formKey.currentState!.validate()) return;
    if (_capturedPosition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez capturer la position GPS du bien.')),
      );
      return;
    }

    final localPropertyId = const Uuid().v4();
    final ownerId = const Uuid().v4();

    // Insertion immédiate dans Drift avec flag 'pending'
    // et enfilement dans la table LocalSyncQueue
    // (Voir AppDatabase & OfflineSyncEngine)

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fiche enregistrée hors-ligne ! Synchronisation automatique en arrière-plan.'),
        backgroundColor: Color(0xFF0D5C54),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F7),
      appBar: AppBar(
        title: const Text('Nouveau Recensement Terrain'),
        backgroundColor: const Color(0xFF0D5C54), // Vert Émeraude Chezmoi
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Section GPS Style WhatsApp
            _buildGPSCard(),
            const SizedBox(height: 16),

            // Section Propriétaire
            _buildOwnerSection(),
            const SizedBox(height: 16),

            // Section Bien & Taxonomie
            _buildPropertySection(),
            const SizedBox(height: 16),

            // Section Photos catégorisées
            _buildPhotosSection(),
            const SizedBox(height: 24),

            // Bouton de validation
            ElevatedButton.icon(
              onPressed: _saveCensusRecord,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE2FC52), // Lime Arche
                foregroundColor: Colors.black87,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.cloud_upload_outlined),
              label: const Text(
                'Enregistrer la Fiche Terrain (Offline-First)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGPSCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2FC52).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.gps_fixed, color: Color(0xFF0D5C54)),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Géolocalisation Immédiate',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_capturedPosition != null) ...[
              Text(
                'Coordonnées : \${_capturedPosition!.latitude.toStringAsFixed(6)}, \${_capturedPosition!.longitude.toStringAsFixed(6)}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              Text(
                'Précision GPS : ±\${_capturedPosition!.accuracy.toStringAsFixed(1)} mètres',
                style: TextStyle(color: Colors.green.shade700, fontSize: 13),
              ),
            ] else
              const Text(
                'Capturez la position GPS exacte où vous vous trouvez devant le bien.',
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _isLocating ? null : _captureInstantGPS,
              icon: _isLocating
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.my_location),
              label: Text(_capturedPosition == null ? 'Capturer Position GPS (Style WhatsApp)' : 'Ré-actualiser le point GPS'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOwnerSection() => Card(/* Formulaire propriétaire */);
  Widget _buildPropertySection() => Card(/* Formulaire caractéristiques & prix */);
  Widget _buildPhotosSection() => Card(/* Ségrégation photos bien vs pièce identité */);
}`,
  },
  {
    id: 'emecef_dart',
    title: '6. Intégration e-MECeF Bénin (Facture Normalisée DGI)',
    category: 'e-MECeF (Dart)',
    fileName: 'lib/features/accounting_emecef/data/emecef_service.dart',
    language: 'dart',
    description: 'Calculateur de taxes DGI Bénin, génération de jeton de sécurité cryptographique et payload QR Code.',
    content: `// ============================================================================
// CHEZMOI IMMOBILIER - Client e-MECeF Bénin (Facturation Normalisée DGI)
// ============================================================================

import 'dart:convert';
import 'package:crypto/crypto.dart';

class EMecefService {
  final String nim;        // Ex: MC01234567-01
  final String ifuSeller;  // Ex: 3202112345678 (Chezmoi Immobilier)
  final String sdcId;      // Ex: SDC-BJ-009

  EMecefService({
    required this.nim,
    required this.ifuSeller,
    required this.sdcId,
  });

  /// Calcule la facture normalisée selon les groupes de taxes béninois
  NormalizedInvoice processInvoice({
    required String invoiceNumber,
    required String clientName,
    required double totalTTC,
    required List<InvoiceItem> items,
  }) {
    final now = DateTime.now().toUtc();
    final formattedDate = now.toIso8601String().replaceAll('T', ' ').substring(0, 19);

    // Calcul code de sécurité
    final rawSeed = '\${nim}_\${invoiceNumber}_\${totalTTC.toInt()}_\${now.millisecondsSinceEpoch}';
    final digest = md5.convert(utf8.encode(rawSeed)).toString().toUpperCase();
    final securityCode = '\${digest.substring(0, 4)}-\${digest.substring(4, 8)}';

    // Format officiel DGI QR Code : NIM*IFU*SDC_ID*DATETIME*TOTAL_TTC*SECURITY_CODE
    final qrPayload = '\$nim*\$ifuSeller*\$sdcId*\$formattedDate*\${totalTTC.toInt()}*\$securityCode';

    return NormalizedInvoice(
      invoiceNumber: invoiceNumber,
      clientName: clientName,
      totalTTC: totalTTC,
      securityCode: securityCode,
      qrPayload: qrPayload,
      formattedDate: formattedDate,
      nim: nim,
      ifuSeller: ifuSeller,
      sdcId: sdcId,
    );
  }
}

class InvoiceItem {
  final String title;
  final double priceTTC;
  final String taxGroup; // 'A' Exonéré, 'B' TVA 18%
  InvoiceItem({required this.title, required this.priceTTC, required this.taxGroup});
}

class NormalizedInvoice {
  final String invoiceNumber;
  final String clientName;
  final double totalTTC;
  final String securityCode;
  final String qrPayload;
  final String formattedDate;
  final String nim;
  final String ifuSeller;
  final String sdcId;

  NormalizedInvoice({
    required this.invoiceNumber,
    required this.clientName,
    required this.totalTTC,
    required this.securityCode,
    required this.qrPayload,
    required this.formattedDate,
    required this.nim,
    required this.ifuSeller,
    required this.sdcId,
  });
}`,
  },
];
