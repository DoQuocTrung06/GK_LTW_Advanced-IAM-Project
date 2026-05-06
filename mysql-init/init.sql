-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 06, 2026 lúc 07:30 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `whiteboard_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `boards`
--

CREATE TABLE `boards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `board_code` varchar(255) NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `visibility` enum('public','private') NOT NULL DEFAULT 'private',
  `board_data` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `boards`
--

INSERT INTO `boards` (`id`, `board_code`, `owner_id`, `visibility`, `board_data`, `created_at`, `updated_at`) VALUES
(20, '1019846d-4dc1-430b-8fca-ecd6ed7a0841', 2, 'private', NULL, '2026-05-04 10:47:29', '2026-05-04 10:47:29'),
(21, '56ef5dfe-9bac-41d7-9902-1a9661eb5ff2', 2, 'private', NULL, '2026-05-04 10:50:57', '2026-05-04 10:50:57'),
(22, 'f483f265-af14-47b9-8afd-1e406453db16', 3, 'private', NULL, '2026-05-04 10:51:14', '2026-05-04 10:51:14'),
(23, '8f05d33d-a49d-4b78-8040-5827c2ebb9b3', 3, 'private', NULL, '2026-05-04 10:58:48', '2026-05-04 10:58:48'),
(24, 'af03c4cf-f183-4c71-b466-dafb6575d1b8', 3, 'private', NULL, '2026-05-04 11:06:45', '2026-05-04 11:06:45'),
(25, '4247dd0d-568b-44f8-9693-9818f3afd34f', 2, 'private', NULL, '2026-05-04 11:09:49', '2026-05-04 11:09:49'),
(26, '94c15f9f-baaf-4f31-b54e-bf0b158958d0', 3, 'private', NULL, '2026-05-04 11:11:34', '2026-05-04 11:11:34'),
(27, '7c75d648-0bfc-4aec-bc4c-0afae6b00491', 3, 'private', NULL, '2026-05-04 11:21:11', '2026-05-04 11:21:11'),
(28, '79e65496-f53a-4e5c-a11b-a2b2cb8c72cf', 3, 'private', NULL, '2026-05-04 11:24:24', '2026-05-04 11:24:24'),
(29, '5a75ad65-f3b7-4976-8338-3cdc7d6fa5fd', 3, 'private', NULL, '2026-05-04 11:33:54', '2026-05-04 11:33:54'),
(30, 'b98bf945-7d8b-4efa-a147-f157db7166b0', 3, 'private', NULL, '2026-05-04 11:45:40', '2026-05-04 11:45:40'),
(31, '41ec4091-be4b-4503-8a51-1dda34bd27a8', 3, 'private', NULL, '2026-05-04 11:49:37', '2026-05-04 11:49:37'),
(32, '2363ded7-a4fc-4269-8708-22f2f1fadea2', 2, 'private', NULL, '2026-05-04 11:49:49', '2026-05-04 11:49:49'),
(33, '9b14699f-ca1f-4c47-bb0e-1b61b22c059e', 2, 'private', NULL, '2026-05-04 11:49:58', '2026-05-04 11:49:58'),
(34, '7bd65498-8d7f-42f6-a831-142ee80965b1', 2, 'private', NULL, '2026-05-04 11:50:57', '2026-05-04 11:50:57'),
(35, 'c04e755a-0178-4310-a066-dba065a468c0', 3, 'private', NULL, '2026-05-04 12:00:29', '2026-05-04 12:00:29'),
(36, '65c456ff-b56d-4397-8f8d-e29b4b8b2206', 2, 'private', '[{\"id\":\"shape_17779218683257kodm\",\"tool\":\"pen\",\"color\":\"#000000\",\"size\":5,\"points\":[771.4444274902344,175.61109924316406],\"isLocal\":false,\"imageObj\":null}]', '2026-05-04 12:11:06', '2026-05-04 12:11:14'),
(37, '599b4bd0-f1cd-48a5-965b-fd336292dd4a', 2, 'private', NULL, '2026-05-04 12:11:36', '2026-05-04 12:11:36'),
(38, '96f730c5-e3b1-4931-8246-5c8aed573f6f', 3, 'private', NULL, '2026-05-04 12:11:52', '2026-05-04 12:11:52'),
(39, '9dca0b54-b4f5-4edf-b338-12f2a0ad67f5', 3, 'private', NULL, '2026-05-04 12:11:58', '2026-05-04 12:11:58'),
(40, '197bdbd8-9e16-46ab-b6c0-32fe05f0c452', 3, 'private', NULL, '2026-05-04 12:12:16', '2026-05-04 12:12:16'),
(41, 'b0314d19-6aa7-4b3e-a221-1076e47fcef2', 3, 'private', '[{\"id\":\"p_1777922075087_ij7d\",\"tool\":\"diamond\",\"color\":\"#000000\",\"size\":5,\"startX\":415,\"startY\":79.0859375,\"width\":186,\"height\":152,\"isLocal\":false,\"imageObj\":null,\"x\":245,\"y\":213.0859375,\"relatedShapeId\":null},{\"id\":\"p_1777922075087_o07d\",\"tool\":\"text\",\"text\":\"T\\u00f4i t\\u00ean \\u1ee5t\",\"color\":\"#7f7f7f\",\"size\":5,\"startX\":516,\"startY\":163.0859375,\"isLocal\":false,\"imageObj\":null,\"relatedShapeId\":null}]', '2026-05-04 12:12:45', '2026-05-04 12:14:47'),
(42, '383bcdac-cd7c-412e-a584-d4af34e2b66f', 2, 'public', NULL, '2026-05-04 12:14:58', '2026-05-04 12:15:45'),
(43, '3f084967-5a2f-43fc-9a12-cce861ac53f4', 2, 'public', NULL, '2026-05-04 12:25:51', '2026-05-04 12:31:24'),
(44, 'c6b61cc0-9118-4d3b-8462-ab32bfdbbfd4', 2, 'private', NULL, '2026-05-04 12:43:24', '2026-05-04 12:43:41'),
(45, '949f6538-44b8-4d31-a4bb-8174b60a7154', 2, 'private', NULL, '2026-05-04 12:43:53', '2026-05-04 12:45:37'),
(46, 'fa0a037c-4f19-4f46-9e02-4a83af074c87', 3, 'private', NULL, '2026-05-04 12:44:08', '2026-05-04 12:44:08'),
(47, '8f945a06-9095-4f13-9e7b-8eb820180422', 2, 'private', NULL, '2026-05-05 00:00:35', '2026-05-05 00:00:35'),
(48, '97dd70c4-79ff-4fd8-bc7b-107b1cde868e', 2, 'private', NULL, '2026-05-05 00:01:17', '2026-05-05 00:01:17'),
(49, '1e6f3467-0d89-49cb-9127-f89741106675', 3, 'private', NULL, '2026-05-05 00:03:14', '2026-05-05 00:03:14'),
(50, 'f199a779-3aa5-46d9-b9a5-4515677ff3c1', 2, 'private', NULL, '2026-05-05 00:04:31', '2026-05-05 00:04:31'),
(51, 'e6aa43ef-c86c-4e04-82ec-ef6c8ef26864', 2, 'private', '[{\"id\":\"p_1778037435903_celm\",\"tool\":\"rect\",\"color\":\"#000000\",\"size\":5,\"startX\":221,\"startY\":68.0859375,\"width\":130,\"height\":107,\"isLocal\":false,\"imageObj\":null,\"relatedShapeId\":null,\"x\":445,\"y\":181.0859375},{\"id\":\"p_1778037435903_dlsv\",\"tool\":\"fill\",\"color\":\"#7f7f7f\",\"startX\":265,\"startY\":113.0859375,\"isLocal\":false,\"relatedShapeId\":\"p_1778037435903_celm\",\"imageObj\":[],\"x\":224,\"y\":113},{\"id\":\"p_1778037441310_9kgb\",\"tool\":\"rect\",\"color\":\"#000000\",\"size\":5,\"startX\":221,\"startY\":68.0859375,\"width\":130,\"height\":107,\"isLocal\":false,\"imageObj\":null,\"relatedShapeId\":null,\"x\":223,\"y\":65.0859375},{\"id\":\"p_1778037441310_vrwy\",\"tool\":\"fill\",\"color\":\"#7f7f7f\",\"startX\":265,\"startY\":113.0859375,\"isLocal\":false,\"relatedShapeId\":\"p_1778037441310_9kgb\",\"imageObj\":[],\"x\":2,\"y\":-3}]', '2026-05-05 20:16:09', '2026-05-05 20:17:33'),
(52, 'e56a1eff-134e-436a-976c-7d7bd4f35750', 2, 'private', NULL, '2026-05-05 20:54:18', '2026-05-05 20:54:18'),
(53, '948bb090-63c1-4dcb-9a0c-44287a3759b8', 2, 'private', NULL, '2026-05-05 20:58:09', '2026-05-05 20:58:09'),
(54, '98df4903-d8dd-45b5-837f-12133ba007f4', 2, 'private', NULL, '2026-05-06 04:00:36', '2026-05-06 04:00:36'),
(55, 'f2eccc51-f884-4529-8388-fd09fc06325b', 2, 'public', NULL, '2026-05-06 04:03:28', '2026-05-06 04:05:46'),
(56, 'fb317d53-d87c-451a-b222-7f2b72e883c8', 3, 'private', NULL, '2026-05-06 04:04:25', '2026-05-06 04:04:25'),
(57, '28b20b0f-6e6b-42cb-823c-121714534414', 3, 'private', NULL, '2026-05-06 04:06:59', '2026-05-06 04:06:59'),
(58, 'a84c65e2-f87f-4121-b61f-4ccbc4810fa8', 2, 'private', '[{\"id\":\"shape_1778065658390swy1j\",\"tool\":\"pen\",\"color\":\"#000000\",\"size\":5,\"points\":[461,139.0859375,461,139.0859375,462,139.0859375,466,139.0859375,470,140.0859375,475,141.0859375,486,144.0859375,496,148.0859375,500,148.0859375,502,149.0859375,507,149.0859375,508,150.0859375,510,150.0859375],\"isLocal\":false,\"imageObj\":null}]', '2026-05-06 04:07:32', '2026-05-06 04:07:43'),
(59, '2c08d5c7-06dd-4480-b6d4-0d96e853d467', 2, 'private', NULL, '2026-05-06 04:07:49', '2026-05-06 04:07:49'),
(60, '58e62c06-b12e-4cb4-82d7-78765bb16ef8', 2, 'private', NULL, '2026-05-06 04:08:22', '2026-05-06 04:08:22'),
(61, 'd37034ed-9762-4812-a337-288ebf0d0f97', 3, 'private', NULL, '2026-05-06 04:09:38', '2026-05-06 04:13:37'),
(62, 'b8b65ad5-b808-45cc-a839-bc892b7ceccb', 2, 'private', NULL, '2026-05-06 04:10:25', '2026-05-06 04:10:25'),
(63, '35681a90-267c-45ee-95ca-13af30d7738f', 2, 'private', NULL, '2026-05-06 04:10:46', '2026-05-06 04:10:46'),
(64, 'f926abfe-7860-4a2b-8cf9-0690c3e47931', 2, 'private', NULL, '2026-05-06 04:11:12', '2026-05-06 04:11:12'),
(65, '4c4119c7-4e40-4934-80b4-3e87b033b6c4', 3, 'public', NULL, '2026-05-06 04:13:42', '2026-05-06 04:15:06'),
(66, '6795adbf-3912-4d98-b210-4bd6205e91af', 2, 'private', NULL, '2026-05-06 04:14:19', '2026-05-06 04:14:19'),
(67, '7ccf65f7-ba55-4a0b-b301-d57b14e76251', 3, 'public', '[{\"id\":\"p_1778067509072_hc6u\",\"tool\":\"hexagon\",\"color\":\"#7f7f7f\",\"size\":5,\"startX\":310,\"startY\":68.0859375,\"width\":270,\"height\":240,\"imageObj\":null,\"relatedShapeId\":null,\"isLocal\":false},{\"id\":\"p_1778067509072_9nz0\",\"tool\":\"fill\",\"color\":\"#000000\",\"startX\":432,\"startY\":183.0859375,\"relatedShapeId\":\"p_1778067509072_hc6u\",\"imageObj\":[],\"isLocal\":false},{\"id\":\"p_1778067509072_jimy\",\"tool\":\"line\",\"color\":\"#000000\",\"size\":5,\"points\":[400,439.0859375,672,501.0859375],\"imageObj\":null,\"relatedShapeId\":null,\"isLocal\":false},{\"id\":\"p_1778067509072_pddx\",\"tool\":\"rightTriangle\",\"color\":\"#000000\",\"size\":5,\"startX\":697,\"startY\":108.0859375,\"width\":191,\"height\":157,\"imageObj\":null,\"relatedShapeId\":null,\"isLocal\":false}]', '2026-05-06 04:35:18', '2026-05-06 04:40:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `board_invites`
--

CREATE TABLE `board_invites` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `board_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('viewer','editor') NOT NULL DEFAULT 'viewer',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `board_invites`
--

INSERT INTO `board_invites` (`id`, `board_id`, `email`, `role`, `created_at`, `updated_at`) VALUES
(1, 35, 'doquoctrung2k@gmai.com', 'viewer', '2026-05-04 12:01:13', '2026-05-04 12:01:13'),
(2, 35, 'doquoctrung2k@gmail.com', 'viewer', '2026-05-04 12:02:13', '2026-05-04 12:02:13'),
(3, 49, 'doquoctrung2k@gmail.com', 'viewer', '2026-05-05 00:03:37', '2026-05-05 00:03:37'),
(4, 55, '524h0132@student.tdtu.edu.vn', 'viewer', '2026-05-06 04:05:10', '2026-05-06 04:05:10'),
(5, 57, 'doquoctrung2k@gmail.com', 'viewer', '2026-05-06 04:07:09', '2026-05-06 04:07:09'),
(6, 61, 'doquoctrung2k@gmail.com', 'viewer', '2026-05-06 04:11:44', '2026-05-06 04:11:44'),
(7, 67, 'doquoctrung2k@gmail.com', 'editor', '2026-05-06 04:36:21', '2026-05-06 04:36:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-2fa_login_3c9cb4ec-b0d3-48c6-8045-d00ce21ea88e', 'i:2;', 1778065250),
('laravel-cache-2fa_login_49bbf63c-97e3-41f1-a648-fd05da548bed', 'i:2;', 1778040437),
('laravel-cache-2fa_login_5cd1eedf-a43e-468c-81e4-14635b5dcf7d', 'i:2;', 1778065670),
('laravel-cache-2fa_login_c0fd7557-d4dc-46be-a285-e7fd86df80a1', 'i:2;', 1778065676),
('laravel-cache-FJaOueXtJKdrgn5j', 'a:1:{s:11:\"valid_until\";i:1777921903;}', 1779131563),
('laravel-cache-fSj9Q7TwDVKS4azD', 'a:1:{s:11:\"valid_until\";i:1778040125;}', 1779249605),
('laravel-cache-hKPz49hQeexb1JyU', 'a:1:{s:11:\"valid_until\";i:1777921706;}', 1779130946),
('laravel-cache-j9rBY1tLkdcqkaan', 'a:1:{s:11:\"valid_until\";i:1778065324;}', 1779274924),
('laravel-cache-KKP3Ukbs7EjT9vFt', 'a:1:{s:11:\"valid_until\";i:1777964575;}', 1779174175),
('laravel-cache-nD43JsqJroWqCCBl', 'a:1:{s:11:\"valid_until\";i:1778039860;}', 1779249340),
('laravel-cache-nD5dkobaW9oXf3Xo', 'a:1:{s:11:\"valid_until\";i:1778039652;}', 1779247032),
('laravel-cache-sGI3zhqNu7ZhepIo', 'a:1:{s:11:\"valid_until\";i:1777964471;}', 1779174131),
('laravel-cache-uR9etlSV0C37jJlg', 'a:1:{s:11:\"valid_until\";i:1778066012;}', 1779275072);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_28_191312_create_personal_access_tokens_table', 1),
(5, '2026_04_28_194012_add_otp_columns_to_users_table', 1),
(6, '2026_05_01_064621_create_boards_table', 1),
(7, '2026_05_01_064639_create_board_invites_table', 1),
(8, '2026_05_02_094910_add_board_data_to_boards_table', 1),
(9, '2026_05_05_063809_add_role_to_board_invites_table', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'member',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `otp` varchar(255) DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `google_id`, `role`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_enabled`, `remember_token`, `created_at`, `updated_at`, `otp`, `otp_expires_at`) VALUES
(2, 'Quốc Trung Đỗ', 'doquoctrung2k@gmail.com', '105372567264828591301', 'member', NULL, NULL, 'OH7TOW3IME3K6KXB', 1, NULL, '2026-05-04 10:47:27', '2026-05-06 04:03:18', NULL, NULL),
(3, 'Đỗ Quốc Trung', '524h0132@student.tdtu.edu.vn', '100969928039873552871', 'member', NULL, NULL, 'UAMZU6UGU4AIDWM4', 0, NULL, '2026-05-04 10:51:13', '2026-05-06 04:04:32', NULL, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `boards`
--
ALTER TABLE `boards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `boards_board_code_unique` (`board_code`),
  ADD KEY `boards_owner_id_foreign` (`owner_id`);

--
-- Chỉ mục cho bảng `board_invites`
--
ALTER TABLE `board_invites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `board_invites_board_id_email_unique` (`board_id`,`email`);

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Chỉ mục cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Chỉ mục cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Chỉ mục cho bảng `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_google_id_unique` (`google_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `boards`
--
ALTER TABLE `boards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT cho bảng `board_invites`
--
ALTER TABLE `board_invites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `boards`
--
ALTER TABLE `boards`
  ADD CONSTRAINT `boards_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `board_invites`
--
ALTER TABLE `board_invites`
  ADD CONSTRAINT `board_invites_board_id_foreign` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
