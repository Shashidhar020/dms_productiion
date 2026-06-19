-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 27, 2026 at 07:22 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dms_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key_id` varchar(32) NOT NULL,
  `key_hash` char(64) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rate_limit` int(11) DEFAULT 100,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batch_allocations`
--

CREATE TABLE `batch_allocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_uuid` char(36) DEFAULT NULL,
  `godown_name` varchar(255) DEFAULT NULL,
  `batch_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(18,3) DEFAULT NULL,
  `rate` decimal(18,4) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batch_allocations`
--

INSERT INTO `batch_allocations` (`id`, `item_uuid`, `godown_name`, `batch_name`, `quantity`, `rate`, `amount`) VALUES
(364, '7_xXEVqNwABDA3sqZnNPw', 'Main Location', 'Primary Batch', 1.000, 1654.0000, 1654.00),
(371, 'BBp3VwODjuK82q5do6RQi', 'Basavanagudi', 'Primary Batch', 21.000, 0.0000, 249.48),
(372, 'o-ne8nA6ug2qYxGvOWg7k', 'Basavanagudi', 'Primary Batch', 20.000, 0.0000, 341.43);

-- --------------------------------------------------------

--
-- Table structure for table `bill_allocations`
--

CREATE TABLE `bill_allocations` (
  `id` bigint(20) NOT NULL,
  `invoice_uuid` char(36) DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `bill_name` varchar(100) DEFAULT NULL,
  `bill_type` varchar(50) DEFAULT NULL,
  `credit_period` varchar(50) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bill_allocations`
--

INSERT INTO `bill_allocations` (`id`, `invoice_uuid`, `ledger_name`, `bill_name`, `bill_type`, `credit_period`, `amount`) VALUES
(2, 'NvT78kwGR97Ka7nNdKEMo', 'Registered Party', '9', 'New Ref', '30 Days', -1654.00),
(6, '65pLuaKIKu5gX5_Ifyz6-', 'Excellent Mobiles', '3', 'New Ref', NULL, -763.00);

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `company_code` varchar(50) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `company_type` enum('SUPER_ADMIN','MANUFACTURER','DISTRIBUTOR') NOT NULL DEFAULT 'MANUFACTURER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_code`, `name`, `email`, `company_type`, `created_at`, `updated_at`) VALUES
(1, 'ACME-MFG', 'Acme Manufacturing', 'hello@acme-mfg.com', 'MANUFACTURER', '2026-04-20 04:49:13', '2026-04-20 04:49:13'),
(2, 'BRIGHT-DIST', 'Bright Distribution', 'hello@bright-dist.com', 'DISTRIBUTOR', '2026-04-20 04:49:13', '2026-04-20 04:49:13'),
(3, 'GLOBAL-HQ', 'Global HQ', 'hello@global-hq.com', 'SUPER_ADMIN', '2026-04-20 04:49:13', '2026-04-20 04:49:13');

-- --------------------------------------------------------

--
-- Table structure for table `cost_centre_allocations`
--

CREATE TABLE `cost_centre_allocations` (
  `id` bigint(20) NOT NULL,
  `invoice_uuid` char(36) DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `cost_centre_name` varchar(255) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cost_centre_allocations`
--

INSERT INTO `cost_centre_allocations` (`id`, `invoice_uuid`, `ledger_name`, `category`, `cost_centre_name`, `amount`) VALUES
(1, 'NvT78kwGR97Ka7nNdKEMo', 'Registered Party', 'Primary Cost Category', 'Skbgvd Cost Centre', -1654.00);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `guid` varchar(100) NOT NULL,
  `voucher_number` varchar(50) NOT NULL,
  `voucher_type` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `effective_date` date DEFAULT NULL,
  `party_name` varchar(255) NOT NULL,
  `party_ledger_name` varchar(255) DEFAULT NULL,
  `party_gstin` varchar(20) DEFAULT NULL,
  `company_gstin` varchar(20) DEFAULT NULL,
  `place_of_supply` varchar(100) DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `narration` text DEFAULT NULL,
  `sub_total` decimal(12,2) DEFAULT NULL,
  `total_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `is_cancelled` tinyint(1) DEFAULT 0,
  `is_optional` tinyint(1) DEFAULT 0,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `uuid`, `guid`, `voucher_number`, `voucher_type`, `invoice_date`, `effective_date`, `party_name`, `party_ledger_name`, `party_gstin`, `company_gstin`, `place_of_supply`, `state_name`, `narration`, `sub_total`, `total_amount`, `is_cancelled`, `is_optional`, `created_by`, `created_at`, `updated_at`) VALUES
(491, '65pLuaKIKu5gX5_Ifyz6-', '36bbb93c-b89e-4210-b0bb-33e1a0a81515-00000005', '3', 'Sales', '2025-04-01', '2025-04-01', 'Excellent Mobiles', 'Excellent Mobiles', '29BFCCE3046F2ZL', '09AABCS1429B1ZS', 'Karnataka', 'Karnataka', NULL, 590.91, 763.00, 0, 0, NULL, '2026-04-25 15:43:01', '2026-04-27 10:47:37'),
(492, 'NvT78kwGR97Ka7nNdKEMo', '906d6bff-0932-46c8-b200-7c9feda5f228-0000009e', '9', 'Sales', '2025-04-01', '2025-04-01', 'Registered Party', 'Registered Party', '29AAJFT0617M1ZS', '29AABCJ8820B2ZP', 'Karnataka', 'Karnataka', 'sdv', 1654.00, 1654.00, 0, 0, 'a', '2026-04-25 15:48:30', '2026-04-25 15:48:30');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_addresses`
--

CREATE TABLE `invoice_addresses` (
  `id` bigint(20) NOT NULL,
  `invoice_uuid` varchar(50) DEFAULT NULL,
  `address_type` enum('BUYER','CONSIGNEE','DISPATCH_FROM') DEFAULT NULL,
  `line_number` int(11) DEFAULT NULL,
  `address_line` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_addresses`
--

INSERT INTO `invoice_addresses` (`id`, `invoice_uuid`, `address_type`, `line_number`, `address_line`, `created_at`) VALUES
(350, 'NvT78kwGR97Ka7nNdKEMo', 'BUYER', 1, '7th A Cross Industrial Area BTM 2nd Stage', '2026-04-25 10:18:30'),
(351, 'NvT78kwGR97Ka7nNdKEMo', 'BUYER', 2, 'BTM Layout', '2026-04-25 10:18:30'),
(352, 'NvT78kwGR97Ka7nNdKEMo', 'CONSIGNEE', 1, '7th A Cross Industrial Area BTM 2nd Stage', '2026-04-25 10:18:30'),
(353, 'NvT78kwGR97Ka7nNdKEMo', 'CONSIGNEE', 2, 'BTM Layout', '2026-04-25 10:18:30'),
(375, '65pLuaKIKu5gX5_Ifyz6-', 'BUYER', 1, 'NO1,Sripal Mansion,1st Floor,', '2026-04-27 05:17:37'),
(376, '65pLuaKIKu5gX5_Ifyz6-', 'BUYER', 2, 'APPAji Rao Laner, 1st Cross,', '2026-04-27 05:17:37'),
(377, '65pLuaKIKu5gX5_Ifyz6-', 'BUYER', 3, 'C.T Street Cross,Bangalore-56002.', '2026-04-27 05:17:37'),
(378, '65pLuaKIKu5gX5_Ifyz6-', 'BUYER', 4, 'E-Mail : sdff@gmail.com', '2026-04-27 05:17:37'),
(379, '65pLuaKIKu5gX5_Ifyz6-', 'CONSIGNEE', 1, 'Basavanagudi,Bangalore', '2026-04-27 05:17:37'),
(380, '65pLuaKIKu5gX5_Ifyz6-', 'CONSIGNEE', 2, 'Basavanagudi,Bangalore', '2026-04-27 05:17:37'),
(381, '65pLuaKIKu5gX5_Ifyz6-', 'CONSIGNEE', 3, 'Basavanagudi,Bangalore', '2026-04-27 05:17:37');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_gst_details`
--

CREATE TABLE `invoice_gst_details` (
  `id` bigint(20) NOT NULL,
  `invoice_uuid` varchar(50) DEFAULT NULL,
  `registration_name` varchar(255) DEFAULT NULL,
  `tax_type` varchar(50) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_gst_details`
--

INSERT INTO `invoice_gst_details` (`id`, `invoice_uuid`, `registration_name`, `tax_type`, `gstin`, `state`, `created_at`) VALUES
(108, 'NvT78kwGR97Ka7nNdKEMo', 'Karnataka Registration', 'GST', '29AABCJ8820B2ZP', 'Karnataka', '2026-04-25 10:18:30'),
(112, '65pLuaKIKu5gX5_Ifyz6-', 'Karnataka Registration', 'GST', '09AABCS1429B1ZS', 'Karnataka', '2026-04-27 05:17:37');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) DEFAULT NULL,
  `invoice_uuid` char(36) NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stock_item_name` varchar(255) NOT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `quantity` decimal(18,3) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `rate` decimal(18,4) NOT NULL,
  `discount` decimal(12,2) DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `billedqty` decimal(20,2) DEFAULT NULL,
  `mrp_rate` decimal(18,2) DEFAULT NULL,
  `inclvatrate` decimal(12,2) DEFAULT NULL,
  `gst_taxability` enum('Taxable','Exempt','Nil Rated','Non-GST') DEFAULT 'Taxable',
  `supply_type` enum('Goods','Services') DEFAULT 'Goods',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `uuid`, `invoice_uuid`, `stock_item_id`, `stock_item_name`, `hsn_code`, `quantity`, `unit`, `rate`, `discount`, `amount`, `billedqty`, `mrp_rate`, `inclvatrate`, `gst_taxability`, `supply_type`, `created_at`) VALUES
(349, '7_xXEVqNwABDA3sqZnNPw', 'NvT78kwGR97Ka7nNdKEMo', 73, 'VEGETABLES', '710100', 1.000, 'KG', 1654.0000, NULL, 1654.00, 1.00, 175.00, 1654.00, 'Taxable', 'Goods', '2026-04-25 15:48:30'),
(356, 'BBp3VwODjuK82q5do6RQi', '65pLuaKIKu5gX5_Ifyz6-', 199, 'Samusung Galaxy', '7896', 21.000, 'nos', 12.0000, 1.00, 249.48, 21.00, NULL, NULL, 'Taxable', 'Goods', '2026-04-27 10:47:37'),
(357, 'o-ne8nA6ug2qYxGvOWg7k', '65pLuaKIKu5gX5_Ifyz6-', 198, 'Redmi Note 8', '9766', 20.000, 'nos', 17.4200, 2.00, 341.43, 20.00, NULL, NULL, 'Taxable', 'Goods', '2026-04-27 10:47:37');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_parties`
--

CREATE TABLE `invoice_parties` (
  `id` bigint(20) NOT NULL,
  `invoice_uuid` varchar(50) DEFAULT NULL,
  `party_type` enum('BUYER','CONSIGNEE','DISPATCH_FROM') DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mailing_name` varchar(255) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `gst_registration_type` varchar(50) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL,
  `base_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_parties`
--

INSERT INTO `invoice_parties` (`id`, `invoice_uuid`, `party_type`, `name`, `mailing_name`, `gstin`, `gst_registration_type`, `state`, `country`, `pincode`, `pan_number`, `base_name`, `created_at`) VALUES
(263, 'NvT78kwGR97Ka7nNdKEMo', 'BUYER', 'Registered Party', 'Registered Party', '29AAJFT0617M1ZS', 'Regular', 'Karnataka', 'India', '560076', NULL, 'Registered Party', '2026-04-25 10:18:30'),
(264, 'NvT78kwGR97Ka7nNdKEMo', 'CONSIGNEE', 'Registered Party', 'Registered Party', '29AAJFT0617M1ZS', NULL, 'Karnataka', 'India', '560076', 'PANDIASKND', NULL, '2026-04-25 10:18:30'),
(271, '65pLuaKIKu5gX5_Ifyz6-', 'BUYER', 'Demo2', 'Excellent Mobiles', '29BFCCE3046F2ZL', 'Regular', 'Karnataka', 'India', NULL, NULL, 'Excellent Mobiles', '2026-04-27 05:17:37'),
(272, '65pLuaKIKu5gX5_Ifyz6-', 'CONSIGNEE', 'Demo2', 'Demo2', '09AABCS1429B1ZS', NULL, 'Karnataka', 'India', NULL, NULL, NULL, '2026-04-27 05:17:37');

-- --------------------------------------------------------

--
-- Table structure for table `ledgers`
--

CREATE TABLE `ledgers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `ledger_type` enum('CUSTOMER','SUPPLIER','GENERAL') DEFAULT 'GENERAL',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ledgers`
--

INSERT INTO `ledgers` (`id`, `name`, `gstin`, `ledger_type`, `is_active`, `created_at`) VALUES
(171, 'Registered Party', NULL, 'CUSTOMER', 1, '2026-04-21 18:25:31'),
(172, 'Karnataka Consumer', NULL, 'CUSTOMER', 1, '2026-04-21 18:25:31'),
(173, 'Rajesh Drs', NULL, 'CUSTOMER', 1, '2026-04-21 18:25:31'),
(174, 'Documentation Charges', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(175, 'CGST', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(176, 'SGST', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(177, 'Round Off', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(178, 'Igst', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(179, 'Forign', NULL, 'CUSTOMER', 1, '2026-04-21 18:25:31'),
(180, 'Freight Charges', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(181, 'MH Registered Party', NULL, 'CUSTOMER', 1, '2026-04-21 18:25:31'),
(182, 'Discount Given', NULL, 'GENERAL', 1, '2026-04-21 18:25:31'),
(377, 'Sales Ledger', NULL, 'GENERAL', 1, '2026-04-23 12:40:13'),
(391, 'GST SALES @5%', NULL, 'GENERAL', 1, '2026-04-23 17:16:51'),
(392, 'Pending Amt', NULL, 'CUSTOMER', 1, '2026-04-23 17:16:51'),
(435, 'Santhosh', NULL, 'CUSTOMER', 1, '2026-04-24 16:52:06'),
(448, 'Icici Bank', NULL, 'CUSTOMER', 1, '2026-04-24 17:25:27'),
(449, 'Harish Chandra', NULL, 'CUSTOMER', 1, '2026-04-24 17:28:01'),
(472, 'Excellent Mobiles', NULL, 'CUSTOMER', 1, '2026-04-25 09:43:50'),
(473, 'Output CGST', NULL, 'GENERAL', 1, '2026-04-25 09:43:50'),
(474, 'Output Sgst', NULL, 'GENERAL', 1, '2026-04-25 09:43:50'),
(475, 'Travel Exense', NULL, 'GENERAL', 1, '2026-04-25 09:43:50'),
(476, 'Roundoff2', NULL, 'GENERAL', 1, '2026-04-25 09:43:50'),
(479, 'Input Cgst', NULL, 'GENERAL', 1, '2026-04-25 11:55:38'),
(480, 'Input Sgst', NULL, 'GENERAL', 1, '2026-04-25 11:55:38');

-- --------------------------------------------------------

--
-- Table structure for table `ledger_entries`
--

CREATE TABLE `ledger_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_uuid` char(36) DEFAULT NULL,
  `ledger_name` varchar(255) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `entry_type` enum('DEBIT','CREDIT') NOT NULL,
  `is_party_ledger` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `ledger_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ledger_entries`
--

INSERT INTO `ledger_entries` (`id`, `invoice_uuid`, `ledger_name`, `amount`, `entry_type`, `is_party_ledger`, `created_at`, `ledger_id`) VALUES
(487, 'NvT78kwGR97Ka7nNdKEMo', 'Registered Party', -1654.00, 'DEBIT', 1, '2026-04-25 15:48:30', 171),
(488, 'NvT78kwGR97Ka7nNdKEMo', 'Sales Ledger', 1654.00, 'CREDIT', 0, '2026-04-25 15:48:30', 377),
(504, '65pLuaKIKu5gX5_Ifyz6-', 'Excellent Mobiles', -763.00, 'DEBIT', 1, '2026-04-27 10:47:37', 472),
(505, '65pLuaKIKu5gX5_Ifyz6-', 'Input Cgst', 83.32, 'CREDIT', 0, '2026-04-27 10:47:37', 479),
(506, '65pLuaKIKu5gX5_Ifyz6-', 'Input Sgst', 83.32, 'CREDIT', 0, '2026-04-27 10:47:37', 480),
(507, '65pLuaKIKu5gX5_Ifyz6-', 'Roundoff2', 0.45, 'CREDIT', 0, '2026-04-27 10:47:37', 476),
(508, '65pLuaKIKu5gX5_Ifyz6-', 'Travel Exense', 5.00, 'CREDIT', 0, '2026-04-27 10:47:37', 475);

-- --------------------------------------------------------

--
-- Table structure for table `manufacturer_distributor_map`
--

CREATE TABLE `manufacturer_distributor_map` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `distributor_company_id` int(11) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manufacturer_distributor_map`
--

INSERT INTO `manufacturer_distributor_map` (`id`, `company_id`, `distributor_company_id`, `status`, `created_at`) VALUES
(1, 1, 2, 'ACTIVE', '2026-04-20 04:49:57');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `created_at`) VALUES
(1, 'SUPER_ADMIN', 'Super Admin', '2026-04-20 04:48:57'),
(2, 'MANUFACTURER_ADMIN', 'Manufacturer Admin', '2026-04-20 04:48:57'),
(3, 'DISTRIBUTOR_ADMIN', 'Distributor Admin', '2026-04-20 04:48:57'),
(4, 'SALESMAN', 'Salesman', '2026-04-20 04:48:57');

-- --------------------------------------------------------

--
-- Table structure for table `stock_items`
--

CREATE TABLE `stock_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `gst_taxability` enum('Taxable','Exempt','Nil Rated','Non-GST') DEFAULT 'Taxable',
  `gst_rate` decimal(5,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_items`
--

INSERT INTO `stock_items` (`id`, `name`, `alias`, `hsn_code`, `unit`, `gst_taxability`, `gst_rate`, `is_active`, `created_at`, `updated_at`) VALUES
(73, 'VEGETABLES', NULL, '710100', 'KG', 'Exempt', 0.00, 1, '2026-04-21 18:25:31', '2026-04-21 18:25:31'),
(74, 'TV', NULL, '8528', 'NOS', 'Taxable', 0.00, 1, '2026-04-21 18:25:31', '2026-04-21 18:25:31'),
(75, 'Item 12%', NULL, '5678', 'pcs', 'Taxable', 0.00, 1, '2026-04-21 18:25:31', '2026-04-21 18:25:31'),
(76, 'Item 18%', NULL, '2244', 'pcs', 'Taxable', 0.00, 1, '2026-04-21 18:25:31', '2026-04-21 18:25:31'),
(77, 'Sand Bag', NULL, '12345567', 'NOS', 'Taxable', 0.00, 1, '2026-04-21 18:25:31', '2026-04-21 18:25:31'),
(165, 'Cashew Nuts', NULL, '0801', 'KG', 'Taxable', 0.00, 1, '2026-04-23 17:16:51', '2026-04-23 17:16:51'),
(184, 'Dummy Item Testing', NULL, '12345567', 'NOS', 'Taxable', 0.00, 1, '2026-04-24 16:52:06', '2026-04-24 16:52:06'),
(198, 'Redmi Note 8', NULL, '9766', 'nos', 'Taxable', 0.00, 1, '2026-04-25 09:43:50', '2026-04-25 09:43:50'),
(199, 'Samusung Galaxy', NULL, '7896', 'nos', 'Taxable', 0.00, 1, '2026-04-25 09:43:50', '2026-04-25 09:43:50'),
(200, 'Stock Item-2', NULL, NULL, 'nos', 'Taxable', 0.00, 1, '2026-04-25 09:43:50', '2026-04-25 09:43:50'),
(201, 'Stock Item-3', NULL, NULL, 'nos', 'Taxable', 0.00, 1, '2026-04-25 09:43:50', '2026-04-25 09:43:50');

-- --------------------------------------------------------

--
-- Table structure for table `tax_details`
--

CREATE TABLE `tax_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `tax_type` enum('CGST','SGST','IGST','CESS') NOT NULL,
  `valuation_type` varchar(50) DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `tax_amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `company_id`, `role_id`, `name`, `email`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Manufacturer Admin', 'admin@acme.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC', '2026-04-20 04:49:32', '2026-04-20 04:49:32'),
(2, 1, 4, 'Salesman User', 'employee@acme.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC', '2026-04-20 04:49:32', '2026-04-20 04:49:32'),
(3, 2, 3, 'Distributor Admin', 'admin@bright-dist.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC', '2026-04-20 04:49:32', '2026-04-20 04:49:32'),
(4, 3, 1, 'Super Admin', 'super@global.com', '$2a$10$2WvXJWAU8cvQNPRAcPuSQexLprsjHeT4sdA/vh8H1aM5vL3uD5SkC', '2026-04-20 04:49:32', '2026-04-20 04:49:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_id` (`key_id`);

--
-- Indexes for table `batch_allocations`
--
ALTER TABLE `batch_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_id` (`item_uuid`),
  ADD KEY `idx_batch` (`batch_name`);

--
-- Indexes for table `bill_allocations`
--
ALTER TABLE `bill_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_id` (`invoice_uuid`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_company_code` (`company_code`),
  ADD UNIQUE KEY `unique_company_email` (`email`),
  ADD KEY `idx_companies_type` (`company_type`);

--
-- Indexes for table `cost_centre_allocations`
--
ALTER TABLE `cost_centre_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_id` (`invoice_uuid`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guid` (`guid`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `idx_invoice_date` (`invoice_date`),
  ADD KEY `idx_party_name` (`party_name`),
  ADD KEY `idx_gstin` (`party_gstin`);

--
-- Indexes for table `invoice_addresses`
--
ALTER TABLE `invoice_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_uuid` (`invoice_uuid`);

--
-- Indexes for table `invoice_gst_details`
--
ALTER TABLE `invoice_gst_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_uuid` (`invoice_uuid`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `idx_hsn` (`hsn_code`),
  ADD KEY `fk_stock_item` (`stock_item_id`),
  ADD KEY `idx_inv_uuid` (`invoice_uuid`);

--
-- Indexes for table `invoice_parties`
--
ALTER TABLE `invoice_parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_uuid` (`invoice_uuid`);

--
-- Indexes for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ledger_name` (`name`);

--
-- Indexes for table `ledger_entries`
--
ALTER TABLE `ledger_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_id` (`invoice_uuid`),
  ADD KEY `idx_ledger_name` (`ledger_name`),
  ADD KEY `fk_ledger` (`ledger_id`);

--
-- Indexes for table `manufacturer_distributor_map`
--
ALTER TABLE `manufacturer_distributor_map`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_manufacturer_distributor` (`company_id`,`distributor_company_id`),
  ADD KEY `idx_map_company_id` (`company_id`),
  ADD KEY `idx_map_distributor_company_id` (`distributor_company_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_code` (`code`);

--
-- Indexes for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_stock_name` (`name`),
  ADD KEY `idx_hsn` (`hsn_code`);

--
-- Indexes for table `tax_details`
--
ALTER TABLE `tax_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_tax_type` (`tax_type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_per_company` (`company_id`,`email`),
  ADD KEY `idx_users_company_role` (`company_id`,`role_id`),
  ADD KEY `idx_users_role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batch_allocations`
--
ALTER TABLE `batch_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=373;

--
-- AUTO_INCREMENT for table `bill_allocations`
--
ALTER TABLE `bill_allocations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cost_centre_allocations`
--
ALTER TABLE `cost_centre_allocations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=497;

--
-- AUTO_INCREMENT for table `invoice_addresses`
--
ALTER TABLE `invoice_addresses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=382;

--
-- AUTO_INCREMENT for table `invoice_gst_details`
--
ALTER TABLE `invoice_gst_details`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=358;

--
-- AUTO_INCREMENT for table `invoice_parties`
--
ALTER TABLE `invoice_parties`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=273;

--
-- AUTO_INCREMENT for table `ledgers`
--
ALTER TABLE `ledgers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=617;

--
-- AUTO_INCREMENT for table `ledger_entries`
--
ALTER TABLE `ledger_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=509;

--
-- AUTO_INCREMENT for table `manufacturer_distributor_map`
--
ALTER TABLE `manufacturer_distributor_map`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `stock_items`
--
ALTER TABLE `stock_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=292;

--
-- AUTO_INCREMENT for table `tax_details`
--
ALTER TABLE `tax_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `batch_allocations`
--
ALTER TABLE `batch_allocations`
  ADD CONSTRAINT `fk_inv_item` FOREIGN KEY (`item_uuid`) REFERENCES `invoice_items` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bill_allocations`
--
ALTER TABLE `bill_allocations`
  ADD CONSTRAINT `bill_allocations_ibfk_1` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `cost_centre_allocations`
--
ALTER TABLE `cost_centre_allocations`
  ADD CONSTRAINT `cost_centre_allocations_ibfk_1` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_addresses`
--
ALTER TABLE `invoice_addresses`
  ADD CONSTRAINT `invoice_addresses_ibfk_1` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_gst_details`
--
ALTER TABLE `invoice_gst_details`
  ADD CONSTRAINT `invoice_gst_details_ibfk_1` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_uuid` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_item` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`);

--
-- Constraints for table `invoice_parties`
--
ALTER TABLE `invoice_parties`
  ADD CONSTRAINT `invoice_parties_ibfk_1` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ledger_entries`
--
ALTER TABLE `ledger_entries`
  ADD CONSTRAINT `fk_invoice` FOREIGN KEY (`invoice_uuid`) REFERENCES `invoices` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `manufacturer_distributor_map`
--
ALTER TABLE `manufacturer_distributor_map`
  ADD CONSTRAINT `fk_map_distributor_company` FOREIGN KEY (`distributor_company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_map_manufacturer_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tax_details`
--
ALTER TABLE `tax_details`
  ADD CONSTRAINT `tax_details_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `invoice_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
