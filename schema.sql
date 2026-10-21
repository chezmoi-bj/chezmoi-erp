-- ============================================================================
-- CHEZMOI IMMOBILIER - Base de Données MySQL / MariaDB (Hostinger Cloud)
-- 100% Compatible avec phpMyAdmin Hostinger & Node.js Express (mysql2 / Prisma)
-- Encodage : utf8mb4_unicode_ci
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `sync_queue`;
DROP TABLE IF EXISTS `legal_documents`;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `cash_transactions`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `owners`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `system_settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- Table 1: users (Comptes Administrateurs, Comptable, RH, Secrétaires, Agents)
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `avatar` TEXT DEFAULT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'RH', 'COMPTABLE', 'SECRETAIRE', 'AGENT_RECENSEUR') NOT NULL DEFAULT 'AGENT_RECENSEUR',
  `job_title` VARCHAR(191) NOT NULL,
  `department_name` VARCHAR(191) NOT NULL,
  `base_salary` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `hire_date` VARCHAR(32) NOT NULL,
  `contract_type` VARCHAR(64) NOT NULL DEFAULT 'CDI',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Cotonou',
  `assigned_zone` VARCHAR(191) DEFAULT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `properties_count` INT NOT NULL DEFAULT 0,
  `pending_sync_count` INT NOT NULL DEFAULT 0,
  `total_commissions` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('ACTIF', 'EN_MISSION', 'CONGE', 'SUSPENDU') NOT NULL DEFAULT 'ACTIF',
  `cnss_number` VARCHAR(64) DEFAULT NULL,
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: owners (Propriétaires & Mandats Fonciers Bénin)
-- ----------------------------------------------------------------------------
CREATE TABLE `owners` (
  `id` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `phone_primary` VARCHAR(64) NOT NULL,
  `phone_whatsapp` VARCHAR(64) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `id_card_number` VARCHAR(64) DEFAULT NULL,
  `mandate_type` ENUM('EXCLUSIF', 'SIMPLE', 'GESTION_DIRECTE') NOT NULL DEFAULT 'EXCLUSIF',
  `mandate_duration_months` INT NOT NULL DEFAULT 12,
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_owners_phone` (`phone_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: properties (Biens Fonciers & Immobiliers Recensés)
-- ----------------------------------------------------------------------------
CREATE TABLE `properties` (
  `id` VARCHAR(64) NOT NULL,
  `code_reference` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `listing_type` VARCHAR(64) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `department` VARCHAR(64) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL,
  `arrondissement` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `price_amount` DECIMAL(14, 2) NOT NULL,
  `price_usd` DECIMAL(14, 2) DEFAULT NULL,
  `area_sq_meters` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `rooms_count` INT NOT NULL DEFAULT 0,
  `bedrooms_count` INT NOT NULL DEFAULT 0,
  `bathrooms_count` INT NOT NULL DEFAULT 0,
  `coordinates_lat` DECIMAL(10, 8) DEFAULT NULL,
  `coordinates_lng` DECIMAL(11, 8) DEFAULT NULL,
  `coordinates_accuracy` DECIMAL(8, 2) DEFAULT NULL,
  `coordinates_address_approx` TEXT DEFAULT NULL,
  `coordinates_captured_at` BIGINT DEFAULT NULL,
  `owner_data` JSON DEFAULT NULL,
  `photos` JSON DEFAULT NULL,
  `assigned_agent_id` VARCHAR(64) NOT NULL,
  `assigned_agent_name` VARCHAR(191) NOT NULL,
  `sync_status` VARCHAR(32) NOT NULL DEFAULT 'synced',
  `sync_error` TEXT DEFAULT NULL,
  `legal_status` VARCHAR(64) NOT NULL DEFAULT 'EN_COURS',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT NOT NULL,
  `server_sync_timestamp` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_properties_code` (`code_reference`),
  KEY `idx_properties_city` (`city`),
  KEY `idx_properties_department` (`department`),
  KEY `idx_properties_agent` (`assigned_agent_id`),
  KEY `idx_properties_sync` (`sync_status`),
  KEY `idx_properties_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: cash_transactions (Bilan Comptable, Recettes, Dépenses & Rémunérations)
-- ----------------------------------------------------------------------------
CREATE TABLE `cash_transactions` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `type` ENUM('ENTREE', 'SORTIE') NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(14, 2) NOT NULL,
  `description` TEXT NOT NULL,
  `agent_or_client` VARCHAR(191) NOT NULL,
  `payment_mode` VARCHAR(64) NOT NULL,
  `date` VARCHAR(32) NOT NULL,
  `emecef_invoice_ref` VARCHAR(100) DEFAULT NULL,
  `beneficiary_employee_id` VARCHAR(64) DEFAULT NULL,
  `salary_details` JSON DEFAULT NULL,
  `created_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tx_code` (`code`),
  KEY `idx_tx_type` (`type`),
  KEY `idx_tx_category` (`category`),
  KEY `idx_tx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: leave_requests (Gestion des Congés & Permissions RH)
-- ----------------------------------------------------------------------------
CREATE TABLE `leave_requests` (
  `id` VARCHAR(64) NOT NULL,
  `employee_id` VARCHAR(64) NOT NULL,
  `employee_name` VARCHAR(191) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `start_date` VARCHAR(32) NOT NULL,
  `end_date` VARCHAR(32) NOT NULL,
  `days_count` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('EN_ATTENTE', 'APPROUVE', 'REJETE') NOT NULL DEFAULT 'EN_ATTENTE',
  `requested_at` VARCHAR(32) NOT NULL,
  `approved_by` VARCHAR(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_leave_emp` (`employee_id`),
  KEY `idx_leave_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: payslips (Bulletins de Paie & Rémunérations RH)
-- ----------------------------------------------------------------------------
CREATE TABLE `payslips` (
  `id` VARCHAR(64) NOT NULL,
  `slip_number` VARCHAR(64) NOT NULL,
  `employee_id` VARCHAR(64) NOT NULL,
  `employee_name` VARCHAR(191) NOT NULL,
  `role` VARCHAR(64) NOT NULL,
  `month` VARCHAR(64) NOT NULL,
  `base_salary` DECIMAL(14, 2) NOT NULL,
  `commissions` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `bonuses` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `gross_total` DECIMAL(14, 2) NOT NULL,
  `cnss_employee` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `ipts_tax` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `net_payable` DECIMAL(14, 2) NOT NULL,
  `payment_mode` VARCHAR(64) NOT NULL,
  `paid_at` VARCHAR(32) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'PAYE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payslips_number` (`slip_number`),
  KEY `idx_payslips_emp` (`employee_id`),
  KEY `idx_payslips_month` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 7: legal_documents (GED Foncière & Sécurisation Titres Fonciers)
-- ----------------------------------------------------------------------------
CREATE TABLE `legal_documents` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `property_code` VARCHAR(64) NOT NULL,
  `property_name` VARCHAR(191) NOT NULL,
  `owner_name` VARCHAR(191) NOT NULL,
  `file_size` VARCHAR(32) NOT NULL,
  `status` ENUM('VALIDE', 'EN_VERIFICATION', 'REJETE', 'MANQUANT') NOT NULL DEFAULT 'VALIDE',
  `uploaded_at` VARCHAR(32) NOT NULL,
  `expiry_date` VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_doc_property` (`property_code`),
  KEY `idx_doc_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 8: sync_queue (Audit Trail Synchronisation Drift SQLite -> MySQL)
-- ----------------------------------------------------------------------------
CREATE TABLE `sync_queue` (
  `id` VARCHAR(64) NOT NULL,
  `entity_type` VARCHAR(64) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `action` VARCHAR(32) NOT NULL,
  `payload` JSON NOT NULL,
  `local_timestamp` BIGINT NOT NULL,
  `server_timestamp` BIGINT NOT NULL,
  `sync_status` VARCHAR(32) NOT NULL,
  `retry_count` INT NOT NULL DEFAULT 0,
  `last_error` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sync_entity` (`entity_type`, `entity_id`),
  KEY `idx_sync_status` (`sync_status`),
  KEY `idx_sync_srv_ts` (`server_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 9: system_settings (Configuration Admin: WhatsApp, Gmail, Gemini, Claude, Webhooks)
-- ----------------------------------------------------------------------------
CREATE TABLE `system_settings` (
  `setting_key` VARCHAR(64) NOT NULL,
  `setting_value` JSON NOT NULL,
  `updated_at` BIGINT NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DONNÉES INITIALES (SEEDING OFFICIEL CHEZMOI BÉNIN)
-- ============================================================================

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `avatar`, `phone`, `role`, `job_title`, `department_name`, `base_salary`, `commission_rate`, `hire_date`, `contract_type`, `city`, `assigned_zone`, `rating`, `properties_count`, `pending_sync_count`, `total_commissions`, `status`, `cnss_number`, `created_at`, `updated_at`) VALUES
('usr_01', 'Gilles Houessou', 'admin@chezmoi.bj', '$2a$12$e80y6mE8g...', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+229 97 00 11 22', 'SUPER_ADMIN', 'Directeur Général & Fondateur', 'Direction Générale', 950000.00, 15.00, '2023-01-15', 'CDI', 'Cotonou', 'National (Bénin)', 4.95, 12, 0, 4800000.00, 'ACTIF', 'CNSS-BJ-893421', 1705276800000, 1705276800000),
('usr_02', 'Amina Bio', 'rh@chezmoi.bj', '$2a$12$e80y6mE8g...', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '+229 96 11 22 33', 'RH', 'Responsable Ressources Humaines', 'RH & Recrutement', 450000.00, 2.00, '2023-06-01', 'CDI', 'Cotonou', 'Siège Cotonou', 4.90, 0, 0, 250000.00, 'ACTIF', 'CNSS-BJ-914205', 1705276800000, 1705276800000),
('usr_03', 'Koffi Dossou', 'compta@chezmoi.bj', '$2a$12$e80y6mE8g...', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+229 95 22 33 44', 'COMPTABLE', 'Chef Comptable & Fiscalité', 'Finance & e-MECeF', 500000.00, 3.00, '2023-04-10', 'CDI', 'Cotonou', 'Siège Cotonou', 4.88, 0, 0, 420000.00, 'ACTIF', 'CNSS-BJ-741258', 1705276800000, 1705276800000),
('usr_04', 'Sèna Agboton', 'secretaire@chezmoi.bj', '$2a$12$e80y6mE8g...', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '+229 94 33 44 55', 'SECRETAIRE', 'Secrétaire de Direction & Accueil', 'Accueil & GED', 250000.00, 1.50, '2024-02-01', 'CDD', 'Cotonou', 'Siège Cotonou', 4.80, 0, 0, 120000.00, 'ACTIF', 'CNSS-BJ-652301', 1705276800000, 1705276800000),
('usr_05', 'Fidèle Kpanou', 'fidele.k@chezmoi.bj', '$2a$12$e80y6mE8g...', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+229 97 44 55 66', 'AGENT_RECENSEUR', 'Agent Terrain Principal', 'Opérations Foncières', 200000.00, 10.00, '2024-01-10', 'CDI', 'Abomey-Calavi', 'Zone Calavi & Godomey', 4.90, 8, 0, 1450000.00, 'ACTIF', 'CNSS-BJ-369852', 1705276800000, 1705276800000),
('usr_06', 'Clarisse Houenou', 'clarisse.h@chezmoi.bj', '$2a$12$e80y6mE8g...', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '+229 96 55 66 77', 'AGENT_RECENSEUR', 'Agente Recenseuse', 'Opérations Foncières', 180000.00, 10.00, '2024-03-01', 'MANDATAIRE_INDEPENDANT', 'Cotonou', 'Haie Vive & Cadjèhoun', 4.85, 4, 1, 980000.00, 'ACTIF', 'CNSS-BJ-147258', 1705276800000, 1705276800000);

INSERT INTO `cash_transactions` (`id`, `code`, `type`, `category`, `amount`, `description`, `agentOrClient`, `payment_mode`, `date`, `emecef_invoice_ref`, `beneficiary_employee_id`, `salary_details`, `created_at`) VALUES
('tx_01', 'REC-2026-001', 'ENTREE', 'COMMISSION_VENTE', 4500000.00, 'Honoraires vente duplex Haie Vive (TF 1420 Cotonou)', 'Mme Viviane Adebo', 'VIREMENT', '2026-10-18 10:30', 'EMCF-2026-B892', NULL, NULL, 1760783400000),
('tx_02', 'DEP-2026-088', 'SORTIE', 'SALAIRE_REMUNERATION', 350000.00, 'Salaire mensuel et primes mission - Octobre 2026', 'Fidèle Kpanou (Agent terrain)', 'VIREMENT', '2026-10-17 14:00', 'BS-2026-10-02', 'usr_05', '{\"month\": \"Octobre 2026\", \"baseAmount\": 200000, \"commissionAmount\": 150000, \"bonusAmount\": 0, \"deductions\": 0}', 1760709600000),
('tx_03', 'REC-2026-002', 'ENTREE', 'LOYER_ENCAISSE', 750000.00, 'Loyer mensuel Immeuble Agla (3 appartements)', 'Locataires Agla', 'MOBILE_MONEY', '2026-10-15 09:15', 'EMCF-2026-C104', NULL, NULL, 1760519700000),
('tx_04', 'DEP-2026-089', 'SORTIE', 'DEPLACEMENT', 45000.00, 'Carburant et frais déplacement équipes recensement Calavi', 'Fidèle Kpanou', 'ESPECES', '2026-10-14 16:45', NULL, NULL, NULL, 1760460300000);
