# Professional CRM Application — Scope & Design

**Version:** 1.0  
**Date:** 2025-08-29  

## 1.1 Project Objectives
- Deliver a multi-retailer backoffice, POS (desktop), and mobile operations suite.
- Centralize master data (retailers, stores, items, suppliers), pricing, and core operations.
- Provide secure RBAC, auditing, and data isolation (per retailer).
- Meet performance SLOs (API p95 ≤ 300ms reads, scan ≤ 300ms median online).
- Offline-capable POS with conflict-safe sync.

## 2. Application Overview
Three apps in one platform:
- **Admin Web Portal / Backoffice**
- **PoS (Windows Desktop)**
- **Android / iOS Tablet App**

### 2.1 Admin Web Portal / Backoffice Application
#### 2.1.1 User Login and Forgot Password
- Email/password (Credentials) with bcrypt hashes.
- Reset via one-time token (Phase-2); placeholder endpoint present.

#### 2.1.2 User Creation
- Create/disable users; assign retailer, role.

#### 2.1.3 Manage Roles and Rights
- Roles: software_admin, retailer_admin, store_manager.
- Permission map (feature flags) per role.

#### 2.1.4 Manage Licenses
- Plans per retailer (MVP flags + entitlements).

#### 2.1.5 System Log Details
- Structured logs; view filters, export CSV.

#### 2.1.6 Change Data Logs
- Audit who/what/when on C/U/D.

#### 2.1.7 DropdownValueMaster
- Global ref lists (units, tax codes, reasons).

### 2.2 Master Data Management
#### 2.2.1 Manage Suppliers
- Supplier CRUD; contact, terms.

#### 2.2.2 Manage Items
- Products, barcodes, attributes.

#### 2.2.3 Manage Store
- Store CRUD; codes, addresses.

#### 2.2.4 Store Item Management
- Store-level overrides.

#### 2.2.5 Supplier Item Management
- **(Phase-2)** Link supplier → items, costs.

#### 2.2.6 Purchase Planning
- Replenishment/forecast (Phase-2).

#### 2.2.7 Manager Purchase Return
- Returns workflow.

#### 2.2.8 Manage Paid Outs
- Non-merch expenses track.

#### 2.2.9 EDI Invoice Management
- EDI ASN/Invoice ingest (Phase-2/3).

#### 2.2.10 Verify invoice delivery (for non-EDI)
- Manual verification flow.

#### 2.2.11 Delivery Management
- Receiving → putaway.

#### 2.2.12 Count Sheet Load List
- Cycle count batches.

#### 2.2.13 Reduce to clear list
- Markdowns; effective dates.

#### 2.2.14 Wastage List
- Shrink capture.

#### 2.2.15 Fill Scan List
- Refill tasks.

#### 2.2.16 Gap Scan List
- Gap checks.

#### 2.2.17 Promotion
- Simple rule engine (MVP).

#### 2.2.18 Promotions & Customer Loyalty
- Loyalty tiers, campaigns (Phase-3).

#### 2.2.19 Special Orders/Basket Orders
- Customer pre-orders; deposits.

## 3. PoS (Point of Sale) — Windows Desktop
### 3.1 User Login
Windows desktop Electron app; local SQLite cache.

### 3.2 POS Front Screen
Scan → cart → price/tax/promos.

### 3.3 Add-To-Cart Feature
#### 3.3.1 Receipt/Bill Generation
#### 3.3.2 Customer Details
#### 3.3.3 Payment Modes (Cash/Card/Cheque/Food Stamp)
#### 3.3.4 Print Receipt
#### 3.3.5 Hold/Park Sale
#### 3.3.6 Item Card / Product Info
#### 3.3.7 Shortcuts & Lookup
#### 3.3.8 Split Payments
#### 3.3.9 Customer-facing Display
#### 3.3.10 User Account & Permission
#### 3.3.11 Sales History
#### 3.3.12 Employee Reporting
#### 3.3.13 Dashboard
#### 3.3.14 Customer Loyalty
#### 3.3.15 3rd Party Integration

## 4. Android / iOS Tablet App
### 4.1 Mobile App Login
### 4.2 Forgot Password
### 4.3 Home & Modules
#### 4.3.1 Price Management
#### 4.3.2 Purchase Order
#### 4.3.3 Delivery Details
#### 4.3.5 Stock Management
#### 4.3.7 Waste Management
*(Other “Error! Bookmark not defined.” items will be resolved in final doc)*

## 5. System Architecture
- Monorepo: pnpm + Turborepo; Next.js backoffice; Electron POS; React Native mobile (later).
- PostgreSQL + Drizzle ORM; RLS in code via retailer_id.
- Observability, backups, migrations.

## 6. Infrastructure / Server Requirements
- App hosting: Vercel/container; RDS Postgres; S3 for assets.
- Redis for sessions/cache.

## 7. Assumptions, Dependencies and Constraints
- POS offline ≥72h with conflict-safe sync.
- Security: TLS, bcrypt, least privilege, audit.
- Perf SLOs as specified.