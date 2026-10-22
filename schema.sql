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
  `status` ENUM('ACTIF', 'EN_MISSION', 'CONGE', 'SUSPENDU', 'EN_ATTENTE_VALIDATION', 'PENDING') NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
  `cnss_number` VARCHAR(64) DEFAULT NULL,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verification_token` VARCHAR(255) DEFAULT NULL,
  `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` BIGINT NOT NULL,
  `updated_at` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_city` (`city`),
  KEY `idx_users_verified` (`email_verified`)
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
-- DONNÉES INITIALES : COMPTE ADMINISTRATEUR CENTRAL (SMB)
-- ============================================================================

INSERT INTO `users` (
  `id`, `name`, `email`, `password_hash`, `avatar`, `phone`, `role`, 
  `job_title`, `department_name`, `base_salary`, `commission_rate`, 
  `hire_date`, `contract_type`, `city`, `assigned_zone`, `rating`, 
  `properties_count`, `pending_sync_count`, `total_commissions`, 
  `status`, `cnss_number`, `email_verified`, `verification_token`, `two_factor_enabled`, `created_at`, `updated_at`
) VALUES (
  'user_smb_central', 'SMB', 'chezmoi.benin@gmail.com', NULL, 
  '/assets/aistudio/1_e24ebf1b.png', '+229 97 00 00 01', 'SUPER_ADMIN', 
  'Administrateur Central', 'Direction Générale Chezmoi Bénin', 0.00, 0.00, 
  '2026-01-01', 'CDI', 'Cotonou', 'National (Bénin)', 5.00, 
  0, 0, 0.00, 
  'ACTIF', 'CNSS-2026-001', 1, NULL, 0, 1769000000000, 1769000000000
) ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `status` = 'ACTIF',
  `email_verified` = 1;

