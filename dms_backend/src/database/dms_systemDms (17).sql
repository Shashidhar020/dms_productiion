-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 19, 2026 at 02:30 PM
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
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `distributor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `key_hash` char(64) NOT NULL,
  `key_name` varchar(150) DEFAULT NULL,
  `status` enum('ACTIVE','REVOKED') DEFAULT 'ACTIVE',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `module_name` varchar(100) NOT NULL,
  `action_name` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
  `branch_code` varchar(50) NOT NULL,
  `branch_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `city_name` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distributors`
--

CREATE TABLE `distributors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `parent_distributor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `distributor_level` enum('SUPER_DISTRIBUTOR','DISTRIBUTOR','SUB_DISTRIBUTOR') DEFAULT 'DISTRIBUTOR',
  `distributor_code` varchar(100) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `gst_number` varchar(30) DEFAULT NULL,
  `pan_number` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `city_name` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ledgers`
--

CREATE TABLE `ledgers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `distributor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `state` varchar(40) DEFAULT NULL,
  `country` varchar(40) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `ledger_type` enum('CUSTOMER','SUPPLIER','GENERAL') DEFAULT 'GENERAL',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manufacturers`
--

CREATE TABLE `manufacturers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_code` varchar(50) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `gst_number` varchar(30) DEFAULT NULL,
  `pan_number` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pch_itm_bch_allocations`
--

CREATE TABLE `pch_itm_bch_allocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_uuid` char(36) DEFAULT NULL,
  `godown_name` varchar(255) DEFAULT NULL,
  `batch_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(18,3) DEFAULT NULL,
  `rate` decimal(18,4) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `permission_code` varchar(100) NOT NULL,
  `permission_name` varchar(255) NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `permission_code`, `permission_name`, `module_name`, `created_at`) VALUES
(1, 'sales_order.read', 'View Sales Orders', 'sales_order', '2026-05-14 02:04:13'),
(2, 'sales_order.create', 'Create Sales Orders', 'sales_order', '2026-05-14 02:04:13'),
(3, 'sales_order.update', 'Update Sales Orders', 'sales_order', '2026-05-14 02:04:13'),
(4, 'inventory.read', 'View Inventory', 'inventory', '2026-05-14 02:04:13'),
(5, 'inventory.adjust', 'Adjust Inventory', 'inventory', '2026-05-14 02:04:13'),
(6, 'reports.view', 'View Reports', 'reports', '2026-05-14 02:04:13'),
(7, 'retailer.read', 'View Retailers', 'retailer', '2026-05-14 02:04:13'),
(8, 'retailer.create', 'Create Retailers', 'retailer', '2026-05-14 02:04:13'),
(9, 'user.manage', 'Manage Users', 'users', '2026-05-14 02:04:13'),
(10, 'distributor.read', 'View Distributors', 'distributor', '2026-05-14 02:04:13');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) DEFAULT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stock_item_name` varchar(255) NOT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `quantity` decimal(18,2) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `rate` decimal(18,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `billedqty` decimal(20,2) DEFAULT NULL,
  `mrp_rate` decimal(18,2) DEFAULT NULL,
  `inclvatrate` decimal(12,2) DEFAULT NULL,
  `gst_taxability` enum('Taxable','Exempt','Nil Rated','Non-GST') DEFAULT 'Taxable',
  `gst_rate` decimal(12,2) DEFAULT NULL,
  `supply_type` enum('Goods','Services') DEFAULT 'Goods',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `raw_sync_payloads`
--

CREATE TABLE `raw_sync_payloads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
  `sync_type` enum('SALES','PURCHASE','SALES_ORDER','PURCHASE_ORDER','STOCK','PAYMENT') NOT NULL,
  `source_reference` varchar(255) DEFAULT NULL,
  `payload` longtext NOT NULL,
  `processing_status` enum('PENDING','PROCESSED','FAILED') DEFAULT 'PENDING',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `role_code` varchar(100) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
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
  `cmpstate` varchar(50) DEFAULT NULL,
  `consigneestate` varchar(40) DEFAULT NULL,
  `narration` text DEFAULT NULL,
  `sub_total` decimal(12,2) DEFAULT NULL,
  `total_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `is_cancelled` tinyint(1) DEFAULT 0,
  `is_optional` tinyint(1) DEFAULT 0,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_addresses`
--

CREATE TABLE `sales_addresses` (
  `id` bigint(20) NOT NULL,
  `sales_id` bigint(20) UNSIGNED DEFAULT NULL,
  `address_type` enum('BUYER','CONSIGNEE','DISPATCH_FROM') DEFAULT NULL,
  `line_number` int(11) DEFAULT NULL,
  `address_line` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_batch_allocations`
--

CREATE TABLE `sales_batch_allocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_uuid` char(36) DEFAULT NULL,
  `godown_name` varchar(255) DEFAULT NULL,
  `batch_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(18,3) DEFAULT NULL,
  `rate` decimal(18,4) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_bill_allocations`
--

CREATE TABLE `sales_bill_allocations` (
  `id` bigint(20) NOT NULL,
  `sales_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `bill_name` varchar(100) DEFAULT NULL,
  `bill_type` varchar(50) DEFAULT NULL,
  `credit_period` varchar(50) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_cost_center_alllocations`
--

CREATE TABLE `sales_cost_center_alllocations` (
  `id` bigint(20) NOT NULL,
  `sales_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `cost_centre_name` varchar(255) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_gst_details`
--

CREATE TABLE `sales_gst_details` (
  `id` bigint(20) NOT NULL,
  `sales_id` bigint(20) UNSIGNED DEFAULT NULL,
  `registration_name` varchar(255) DEFAULT NULL,
  `tax_type` varchar(50) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_items`
--

CREATE TABLE `sales_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) DEFAULT NULL,
  `sales_id` bigint(20) UNSIGNED NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stock_item_name` varchar(255) NOT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `quantity` decimal(18,2) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `rate` decimal(18,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `billedqty` decimal(20,2) DEFAULT NULL,
  `mrp_rate` decimal(18,2) DEFAULT NULL,
  `inclvatrate` decimal(12,2) DEFAULT NULL,
  `gst_taxability` enum('Taxable','Exempt','Nil Rated','Non-GST') DEFAULT 'Taxable',
  `gst_rate` decimal(12,2) DEFAULT NULL,
  `supply_type` enum('Goods','Services') DEFAULT 'Goods',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_ledger_entries`
--

CREATE TABLE `sales_ledger_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sales_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ledger_name` varchar(255) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `entry_type` enum('DEBIT','CREDIT') NOT NULL,
  `is_party_ledger` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `ledger_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_parties`
--

CREATE TABLE `sales_parties` (
  `id` bigint(20) NOT NULL,
  `sales_id` bigint(50) UNSIGNED DEFAULT NULL,
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

-- --------------------------------------------------------

--
-- Table structure for table `stock_batches`
--

CREATE TABLE `stock_batches` (
  `id` bigint(20) NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `godown` varchar(255) DEFAULT NULL,
  `batch_name` varchar(255) DEFAULT NULL,
  `qty` decimal(18,3) DEFAULT NULL,
  `rate` decimal(18,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_items`
--

CREATE TABLE `stock_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `distributor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guid` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `parent` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `costing_method` varchar(50) DEFAULT NULL,
  `valuation_method` varchar(50) DEFAULT NULL,
  `is_batchwise` tinyint(1) DEFAULT 0,
  `is_perishable` tinyint(1) DEFAULT 0,
  `opening_balance` decimal(18,3) DEFAULT NULL,
  `opening_rate` decimal(18,3) DEFAULT NULL,
  `opening_value` decimal(18,3) DEFAULT NULL,
  `is_from_invoice` tinyint(1) DEFAULT 1,
  `is_synced` tinyint(1) DEFAULT 0,
  `unit` varchar(20) DEFAULT NULL,
  `base_unit` varchar(50) DEFAULT NULL,
  `additional_unit` varchar(50) DEFAULT NULL,
  `gst_applicable` tinyint(1) DEFAULT 1,
  `gst_type_of_supply` varchar(50) DEFAULT NULL,
  `gst_taxability` enum('Taxable','Exempt','Nil Rated','Non-GST') DEFAULT 'Taxable',
  `gst_rate` decimal(5,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_item_gst`
--

CREATE TABLE `stock_item_gst` (
  `id` bigint(20) NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED NOT NULL,
  `applicable_from` date NOT NULL,
  `taxability` varchar(50) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `is_reverse_charge` tinyint(1) DEFAULT 0,
  `is_non_gst` tinyint(1) DEFAULT 0,
  `is_ineligible_itc` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_item_gst_rates`
--

CREATE TABLE `stock_item_gst_rates` (
  `id` bigint(20) NOT NULL,
  `gst_id` bigint(20) NOT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `cgst` decimal(5,2) DEFAULT NULL,
  `sgst` decimal(5,2) DEFAULT NULL,
  `igst` decimal(5,2) DEFAULT NULL,
  `cess` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_item_hsn`
--

CREATE TABLE `stock_item_hsn` (
  `id` bigint(20) NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `applicable_from` date DEFAULT NULL,
  `hsn_code` varchar(50) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_item_tax`
--

CREATE TABLE `stock_item_tax` (
  `id` bigint(20) NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cgst` decimal(5,2) DEFAULT NULL,
  `sgst` decimal(5,2) DEFAULT NULL,
  `igst` decimal(5,2) DEFAULT NULL,
  `hsn_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_master`
--

CREATE TABLE `stock_master` (
  `id` bigint(20) NOT NULL,
  `guid` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `parent` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `base_unit` varchar(50) DEFAULT NULL,
  `opening_qty` decimal(18,3) DEFAULT NULL,
  `opening_rate` decimal(18,3) DEFAULT NULL,
  `opening_value` decimal(18,3) DEFAULT NULL,
  `is_batchwise` tinyint(1) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_prices`
--

CREATE TABLE `stock_prices` (
  `id` bigint(20) NOT NULL,
  `stock_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `price_type` varchar(50) DEFAULT NULL,
  `min_qty` decimal(18,3) DEFAULT NULL,
  `max_qty` decimal(18,3) DEFAULT NULL,
  `rate` decimal(18,3) DEFAULT NULL,
  `discount` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tally_connections`
--

CREATE TABLE `tally_connections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED NOT NULL,
  `tally_company_name` varchar(255) NOT NULL,
  `tally_server` varchar(255) DEFAULT NULL,
  `tally_port` varchar(20) DEFAULT NULL,
  `sync_mode` enum('ONE_WAY','TWO_WAY') DEFAULT 'TWO_WAY',
  `last_sync_at` timestamp NULL DEFAULT NULL,
  `sync_status` enum('CONNECTED','DISCONNECTED','FAILED') DEFAULT 'DISCONNECTED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `territories`
--

CREATE TABLE `territories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `territory_code` varchar(100) NOT NULL,
  `territory_name` varchar(255) NOT NULL,
  `parent_territory_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED NOT NULL,
  `distributor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reporting_to_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_type` enum('MANUFACTURER','DISTRIBUTOR') NOT NULL,
  `employee_code` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_super_admin` tinyint(1) DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','BLOCKED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` bigint(20) NOT NULL,
  `session_id` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) NOT NULL,
  `distributor_id` bigint(20) DEFAULT NULL,
  `refresh_token` varchar(500) NOT NULL,
  `ip_address` varchar(100) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('ACTIVE','REVOKED','EXPIRED') DEFAULT 'ACTIVE',
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_territories`
--

CREATE TABLE `user_territories` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `territory_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

CREATE TABLE `vouchers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `manufacturer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `distributor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `uuid` char(36) NOT NULL,
  `guid` varchar(100) NOT NULL,
  `voucher_number` varchar(50) NOT NULL,
  `voucher_type` varchar(50) NOT NULL,
  `voucher_date` date NOT NULL,
  `effective_date` date DEFAULT NULL,
  `party_name` varchar(255) NOT NULL,
  `party_ledger_name` varchar(255) DEFAULT NULL,
  `party_gstin` varchar(20) DEFAULT NULL,
  `company_gstin` varchar(20) DEFAULT NULL,
  `place_of_supply` varchar(100) DEFAULT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `cmpstate` varchar(50) DEFAULT NULL,
  `consigneestate` varchar(40) DEFAULT NULL,
  `narration` text DEFAULT NULL,
  `sub_total` decimal(12,2) DEFAULT NULL,
  `total_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `is_cancelled` tinyint(1) DEFAULT 0,
  `is_optional` tinyint(1) DEFAULT 0,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voucher_addresses`
--

CREATE TABLE `voucher_addresses` (
  `id` bigint(20) NOT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `address_type` enum('BUYER','CONSIGNEE','DISPATCH_FROM') DEFAULT NULL,
  `line_number` int(11) DEFAULT NULL,
  `address_line` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voucher_bill_allocations`
--

CREATE TABLE `voucher_bill_allocations` (
  `id` bigint(20) NOT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `bill_name` varchar(100) DEFAULT NULL,
  `bill_type` varchar(50) DEFAULT NULL,
  `credit_period` varchar(50) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voucher_cost_centre_allocations`
--

CREATE TABLE `voucher_cost_centre_allocations` (
  `id` bigint(20) NOT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `cost_centre_name` varchar(255) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voucher_gst_details`
--

CREATE TABLE `voucher_gst_details` (
  `id` bigint(20) NOT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `registration_name` varchar(255) DEFAULT NULL,
  `tax_type` varchar(50) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voucher_ledger_entries`
--

CREATE TABLE `voucher_ledger_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ledger_name` varchar(255) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `entry_type` enum('DEBIT','CREDIT') NOT NULL,
  `is_party_ledger` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `ledger_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voucher_parties`
--

CREATE TABLE `voucher_parties` (
  `id` bigint(20) NOT NULL,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
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
-- Indexes for dumped tables
--

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_key_hash` (`key_hash`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_distributor` (`distributor_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_module` (`module_name`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_branch_code` (`distributor_id`,`branch_code`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_distributor` (`distributor_id`);

--
-- Indexes for table `distributors`
--
ALTER TABLE `distributors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_distributor_code` (`manufacturer_id`,`distributor_code`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_parent` (`parent_distributor_id`),
  ADD KEY `idx_level` (`distributor_level`),
  ADD KEY `idx_business_name` (`business_name`);

--
-- Indexes for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ledger_name` (`name`),
  ADD KEY `fk_ledgers_distributor` (`distributor_id`),
  ADD KEY `idx_ledgers_tenant` (`manufacturer_id`,`distributor_id`);

--
-- Indexes for table `manufacturers`
--
ALTER TABLE `manufacturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `manufacturer_code` (`manufacturer_code`),
  ADD UNIQUE KEY `uk_manf_email` (`email`),
  ADD KEY `idx_company_name` (`company_name`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `pch_itm_bch_allocations`
--
ALTER TABLE `pch_itm_bch_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_id` (`item_uuid`),
  ADD KEY `idx_batch` (`batch_name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_code` (`permission_code`),
  ADD KEY `idx_module` (`module_name`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `idx_hsn` (`hsn_code`),
  ADD KEY `fk_stock_item` (`stock_item_id`),
  ADD KEY `idx_vch_uuid` (`voucher_id`);

--
-- Indexes for table `raw_sync_payloads`
--
ALTER TABLE `raw_sync_payloads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_distributor` (`distributor_id`),
  ADD KEY `idx_sync_type` (`sync_type`),
  ADD KEY `idx_processing` (`processing_status`),
  ADD KEY `idx_source_reference` (`source_reference`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_role_code` (`manufacturer_id`,`role_code`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `idx_permission` (`permission_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guid` (`guid`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `uk_salesdid_guid` (`distributor_id`,`guid`),
  ADD KEY `idx_invoice_date` (`invoice_date`),
  ADD KEY `idx_party_name` (`party_name`),
  ADD KEY `idx_gstin` (`party_gstin`),
  ADD KEY `idx_sales_mfg_dist_date` (`manufacturer_id`,`distributor_id`,`invoice_date`),
  ADD KEY `idx_sales_tenant` (`manufacturer_id`,`distributor_id`);

--
-- Indexes for table `sales_addresses`
--
ALTER TABLE `sales_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_uuid` (`sales_id`);

--
-- Indexes for table `sales_batch_allocations`
--
ALTER TABLE `sales_batch_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_id` (`item_uuid`),
  ADD KEY `idx_batch` (`batch_name`);

--
-- Indexes for table `sales_bill_allocations`
--
ALTER TABLE `sales_bill_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_id` (`sales_id`);

--
-- Indexes for table `sales_cost_center_alllocations`
--
ALTER TABLE `sales_cost_center_alllocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_id` (`sales_id`);

--
-- Indexes for table `sales_gst_details`
--
ALTER TABLE `sales_gst_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_uuid` (`sales_id`);

--
-- Indexes for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `idx_hsn` (`hsn_code`),
  ADD KEY `fk_stock_item` (`stock_item_id`),
  ADD KEY `idx_inv_uuid` (`sales_id`);

--
-- Indexes for table `sales_ledger_entries`
--
ALTER TABLE `sales_ledger_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_id` (`sales_id`),
  ADD KEY `idx_ledger_name` (`ledger_name`),
  ADD KEY `fk_ledger` (`ledger_id`);

--
-- Indexes for table `sales_parties`
--
ALTER TABLE `sales_parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_uuid` (`sales_id`);

--
-- Indexes for table `stock_batches`
--
ALTER TABLE `stock_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_item_id` (`stock_item_id`);

--
-- Indexes for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_stock_name` (`name`),
  ADD UNIQUE KEY `uniq_guid` (`guid`),
  ADD KEY `idx_hsn` (`hsn_code`),
  ADD KEY `fk_stock_distributor` (`distributor_id`),
  ADD KEY `idx_stock_items_tenant` (`manufacturer_id`,`distributor_id`);

--
-- Indexes for table `stock_item_gst`
--
ALTER TABLE `stock_item_gst`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_gst` (`stock_item_id`,`applicable_from`),
  ADD UNIQUE KEY `unique_gst_stock` (`stock_item_id`,`applicable_from`),
  ADD KEY `idx_stock_item_id` (`stock_item_id`),
  ADD KEY `idx_applicable_from` (`applicable_from`);

--
-- Indexes for table `stock_item_gst_rates`
--
ALTER TABLE `stock_item_gst_rates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gst_id` (`gst_id`);

--
-- Indexes for table `stock_item_hsn`
--
ALTER TABLE `stock_item_hsn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_item_id` (`stock_item_id`);

--
-- Indexes for table `stock_item_tax`
--
ALTER TABLE `stock_item_tax`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_item_id` (`stock_item_id`);

--
-- Indexes for table `stock_master`
--
ALTER TABLE `stock_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guid` (`guid`),
  ADD KEY `idx_guid` (`guid`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `stock_prices`
--
ALTER TABLE `stock_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_price_lookup` (`stock_item_id`,`price_type`);

--
-- Indexes for table `tally_connections`
--
ALTER TABLE `tally_connections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_distributor_connection` (`distributor_id`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_sync_status` (`sync_status`);

--
-- Indexes for table `tax_details`
--
ALTER TABLE `tax_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_tax_type` (`tax_type`);

--
-- Indexes for table `territories`
--
ALTER TABLE `territories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_territory_code` (`manufacturer_id`,`territory_code`),
  ADD KEY `idx_parent` (`parent_territory_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_email` (`email`),
  ADD KEY `idx_manufacturer` (`manufacturer_id`),
  ADD KEY `idx_distributor` (`distributor_id`),
  ADD KEY `idx_branch` (`branch_id`),
  ADD KEY `idx_reporting` (`reporting_to_user_id`),
  ADD KEY `idx_user_type` (`user_type`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `idx_role` (`role_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_session_id` (`session_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_refresh_token` (`refresh_token`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `user_territories`
--
ALTER TABLE `user_territories`
  ADD PRIMARY KEY (`user_id`,`territory_id`),
  ADD KEY `idx_territory` (`territory_id`);

--
-- Indexes for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guid` (`guid`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `distributor_guid` (`distributor_id`,`guid`) USING BTREE,
  ADD KEY `idx_voucher_date` (`voucher_date`),
  ADD KEY `idx_party_name` (`party_name`),
  ADD KEY `idx_gstin` (`party_gstin`),
  ADD KEY `idx_vouchers_tenant` (`manufacturer_id`,`distributor_id`),
  ADD KEY `idx_vouchers_tenant_date` (`manufacturer_id`,`voucher_date`);

--
-- Indexes for table `voucher_addresses`
--
ALTER TABLE `voucher_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_voucher_uuid` (`voucher_id`);

--
-- Indexes for table `voucher_bill_allocations`
--
ALTER TABLE `voucher_bill_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vch_id` (`voucher_id`);

--
-- Indexes for table `voucher_cost_centre_allocations`
--
ALTER TABLE `voucher_cost_centre_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vch_id` (`voucher_id`);

--
-- Indexes for table `voucher_gst_details`
--
ALTER TABLE `voucher_gst_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vch_uuid` (`voucher_id`);

--
-- Indexes for table `voucher_ledger_entries`
--
ALTER TABLE `voucher_ledger_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vch_id` (`voucher_id`),
  ADD KEY `idx_ledger_name` (`ledger_name`),
  ADD KEY `fk_ledger` (`ledger_id`);

--
-- Indexes for table `voucher_parties`
--
ALTER TABLE `voucher_parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_voucher_uuid` (`voucher_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_keys`
--
ALTER TABLE `api_keys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `distributors`
--
ALTER TABLE `distributors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ledgers`
--
ALTER TABLE `ledgers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2045;

--
-- AUTO_INCREMENT for table `manufacturers`
--
ALTER TABLE `manufacturers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `pch_itm_bch_allocations`
--
ALTER TABLE `pch_itm_bch_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=565;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=541;

--
-- AUTO_INCREMENT for table `raw_sync_payloads`
--
ALTER TABLE `raw_sync_payloads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=845;

--
-- AUTO_INCREMENT for table `sales_addresses`
--
ALTER TABLE `sales_addresses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1408;

--
-- AUTO_INCREMENT for table `sales_batch_allocations`
--
ALTER TABLE `sales_batch_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=873;

--
-- AUTO_INCREMENT for table `sales_bill_allocations`
--
ALTER TABLE `sales_bill_allocations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=320;

--
-- AUTO_INCREMENT for table `sales_cost_center_alllocations`
--
ALTER TABLE `sales_cost_center_alllocations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `sales_gst_details`
--
ALTER TABLE `sales_gst_details`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=469;

--
-- AUTO_INCREMENT for table `sales_items`
--
ALTER TABLE `sales_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=830;

--
-- AUTO_INCREMENT for table `sales_ledger_entries`
--
ALTER TABLE `sales_ledger_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1553;

--
-- AUTO_INCREMENT for table `sales_parties`
--
ALTER TABLE `sales_parties`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=986;

--
-- AUTO_INCREMENT for table `stock_batches`
--
ALTER TABLE `stock_batches`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT for table `stock_items`
--
ALTER TABLE `stock_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1144;

--
-- AUTO_INCREMENT for table `stock_item_gst`
--
ALTER TABLE `stock_item_gst`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;

--
-- AUTO_INCREMENT for table `stock_item_gst_rates`
--
ALTER TABLE `stock_item_gst_rates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `stock_item_hsn`
--
ALTER TABLE `stock_item_hsn`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `stock_item_tax`
--
ALTER TABLE `stock_item_tax`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `stock_master`
--
ALTER TABLE `stock_master`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `stock_prices`
--
ALTER TABLE `stock_prices`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `tally_connections`
--
ALTER TABLE `tally_connections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tax_details`
--
ALTER TABLE `tax_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `territories`
--
ALTER TABLE `territories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1222;

--
-- AUTO_INCREMENT for table `voucher_addresses`
--
ALTER TABLE `voucher_addresses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1252;

--
-- AUTO_INCREMENT for table `voucher_bill_allocations`
--
ALTER TABLE `voucher_bill_allocations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=350;

--
-- AUTO_INCREMENT for table `voucher_cost_centre_allocations`
--
ALTER TABLE `voucher_cost_centre_allocations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voucher_gst_details`
--
ALTER TABLE `voucher_gst_details`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=416;

--
-- AUTO_INCREMENT for table `voucher_ledger_entries`
--
ALTER TABLE `voucher_ledger_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2231;

--
-- AUTO_INCREMENT for table `voucher_parties`
--
ALTER TABLE `voucher_parties`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1730;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `fk_apikey_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_apikey_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_apikey_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `fk_branch_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_branch_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `distributors`
--
ALTER TABLE `distributors`
  ADD CONSTRAINT `fk_distributor_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_parent_distributor` FOREIGN KEY (`parent_distributor_id`) REFERENCES `distributors` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD CONSTRAINT `fk_ledgers_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ledgers_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pch_itm_bch_allocations`
--
ALTER TABLE `pch_itm_bch_allocations`
  ADD CONSTRAINT `fk_pch_item` FOREIGN KEY (`item_uuid`) REFERENCES `purchase_items` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `fk_pi_vchid` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stk_item` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`);

--
-- Constraints for table `raw_sync_payloads`
--
ALTER TABLE `raw_sync_payloads`
  ADD CONSTRAINT `fk_rsp_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rsp_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `fk_role_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sales_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sales_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_addresses`
--
ALTER TABLE `sales_addresses`
  ADD CONSTRAINT `fk_addinvid` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_batch_allocations`
--
ALTER TABLE `sales_batch_allocations`
  ADD CONSTRAINT `fk_salesitem_id` FOREIGN KEY (`item_uuid`) REFERENCES `sales_items` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_bill_allocations`
--
ALTER TABLE `sales_bill_allocations`
  ADD CONSTRAINT `fk_sb_id` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_cost_center_alllocations`
--
ALTER TABLE `sales_cost_center_alllocations`
  ADD CONSTRAINT `fk_scc_id` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_gst_details`
--
ALTER TABLE `sales_gst_details`
  ADD CONSTRAINT `fk_inv_gst` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD CONSTRAINT `fk_si_id` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_item` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`);

--
-- Constraints for table `sales_ledger_entries`
--
ALTER TABLE `sales_ledger_entries`
  ADD CONSTRAINT `fk_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sl_id` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales_parties`
--
ALTER TABLE `sales_parties`
  ADD CONSTRAINT `fk_sp_sid` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_batches`
--
ALTER TABLE `stock_batches`
  ADD CONSTRAINT `fk_stk_batches` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD CONSTRAINT `fk_stock_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_item_gst`
--
ALTER TABLE `stock_item_gst`
  ADD CONSTRAINT `fk_stk_gst` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_item_gst_rates`
--
ALTER TABLE `stock_item_gst_rates`
  ADD CONSTRAINT `stock_item_gst_rates_ibfk_1` FOREIGN KEY (`gst_id`) REFERENCES `stock_item_gst` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_item_hsn`
--
ALTER TABLE `stock_item_hsn`
  ADD CONSTRAINT `fk_stk_hsn` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_item_tax`
--
ALTER TABLE `stock_item_tax`
  ADD CONSTRAINT `stock_item_tax_ibfk_1` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_prices`
--
ALTER TABLE `stock_prices`
  ADD CONSTRAINT `fk_stk_prs` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tally_connections`
--
ALTER TABLE `tally_connections`
  ADD CONSTRAINT `fk_tally_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tally_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tax_details`
--
ALTER TABLE `tax_details`
  ADD CONSTRAINT `tax_details_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `sales_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `territories`
--
ALTER TABLE `territories`
  ADD CONSTRAINT `fk_parent_territory` FOREIGN KEY (`parent_territory_id`) REFERENCES `territories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_territory_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_reporting_user` FOREIGN KEY (`reporting_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_territories`
--
ALTER TABLE `user_territories`
  ADD CONSTRAINT `fk_ut_territory` FOREIGN KEY (`territory_id`) REFERENCES `territories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ut_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD CONSTRAINT `fk_vouchers_distributor` FOREIGN KEY (`distributor_id`) REFERENCES `distributors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vouchers_manufacturer` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `voucher_addresses`
--
ALTER TABLE `voucher_addresses`
  ADD CONSTRAINT `fk_add_vchid` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `voucher_bill_allocations`
--
ALTER TABLE `voucher_bill_allocations`
  ADD CONSTRAINT `fk_vchid` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `voucher_cost_centre_allocations`
--
ALTER TABLE `voucher_cost_centre_allocations`
  ADD CONSTRAINT `fk_vchcc_vid` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`);

--
-- Constraints for table `voucher_gst_details`
--
ALTER TABLE `voucher_gst_details`
  ADD CONSTRAINT `fk_vchid_gst` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `voucher_ledger_entries`
--
ALTER TABLE `voucher_ledger_entries`
  ADD CONSTRAINT `fk_le_vchid` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ledger_id` FOREIGN KEY (`ledger_id`) REFERENCES `ledgers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `voucher_parties`
--
ALTER TABLE `voucher_parties`
  ADD CONSTRAINT `fk_voucher_id` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
