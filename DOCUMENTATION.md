# SHOP NAVIGATOR - End-to-End Documentation

## Multi-Tenant QR-Based Store Navigation System

**Version:** 1.0.0
**Date:** February 2026
**Tech Stack:** React.js + Node.js + Express + MySQL

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Installation & Setup](#3-installation--setup)
4. [Database Schema](#4-database-schema)
5. [Seed Data](#5-seed-data)
6. [API Reference](#6-api-reference)
7. [Admin Panel Guide](#7-admin-panel-guide)
8. [Customer Flow](#8-customer-flow)
9. [API Integration Guide](#9-api-integration-guide)
10. [QR Code Setup](#10-qr-code-setup)
11. [File Structure](#11-file-structure)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. PROJECT OVERVIEW

### What is Shop Navigator?
A multi-tenant, QR code-based store navigation system that helps customers find products inside a shop instantly. Shop owners manage their store layout, products, and offers through an admin panel. Customers scan a QR code at the shop entrance and see an interactive store map on their phone.

### Key Features
- **Multi-Tenant:** Multiple shop owners, each with multiple shops
- **Admin Dashboard:** Manage shops, zones, products, categories, offers
- **Photo Uploads:** Upload photos of zones, products, offers, and shop logos
- **QR Code Generation:** Auto-generated QR code per shop for customer access
- **Offer Banners:** Auto-sliding offer banners on the customer page
- **Product Search:** Real-time search with zone highlighting on the store map
- **Category Filters:** Filter products by category
- **API Integration:** External software can sync products/zones via API key
- **CSV Bulk Import:** Upload products in bulk via CSV file
- **Mobile Responsive:** Optimized for phone (customers scan QR from phone)

### User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Admin (Shop Owner)** | Login required | Creates shops, manages zones, products, offers |
| **Customer** | No login needed | Scans QR code, browses store map, searches products |
| **External System** | API key required | Pushes/pulls product and zone data via REST API |

---

## 2. ARCHITECTURE

```
┌──────────────────────────────────────────────────┐
│                   FRONTEND                        │
│              React.js (Port 3900)                 │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Login   │ │Dashboard │ │  Shop Manager    │  │
│  │ Register │ │(My Shops)│ │ Zones/Products/  │  │
│  │          │ │          │ │ Offers/QR/API    │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │         Customer View (Public)               │ │
│  │   Offers Slider → Search → Map → Products   │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼───────────────────────────┐
│                   BACKEND                         │
│           Node.js + Express (Port 3900)           │
│                                                   │
│  Routes:                                          │
│  ├── /api/auth        → Register, Login, Me       │
│  ├── /api/shops       → CRUD Shops + QR Code      │
│  ├── /api/zones       → CRUD Zones + Photo        │
│  ├── /api/categories  → CRUD Categories           │
│  ├── /api/products    → CRUD Products + CSV       │
│  ├── /api/offers      → CRUD Offers + Banner      │
│  ├── /api/integration → External API (API Key)    │
│  └── /api/customer    → Public shop data          │
│                                                   │
│  Middleware:                                      │
│  ├── JWT Auth (Admin routes)                      │
│  ├── API Key Auth (Integration routes)            │
│  └── Multer (Photo uploads)                       │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│                   DATABASE                        │
│                MySQL (Port 3306)                  │
│              Database: shop_navigator             │
│                                                   │
│  Tables:                                          │
│  ├── admins      (shop owners)                    │
│  ├── shops       (multi-tenant stores)            │
│  ├── categories  (product categories per shop)    │
│  ├── zones       (aisles/sections per shop)       │
│  ├── products    (products with zone mapping)     │
│  ├── offers      (deal banners per shop)          │
│  └── api_logs    (external API usage logs)        │
└──────────────────────────────────────────────────┘
```

---

## 3. INSTALLATION & SETUP

### Prerequisites
- Node.js v18+
- npm v9+
- MySQL 8.0+
- Apache/Nginx (optional, for production)

### Step 1: Clone/Copy Project
```bash
# Project is located at:
cd /var/www/html/shop-navigator/
```

### Step 2: Create Database
```bash
mysql -u root -p'Root@123' -e "CREATE DATABASE IF NOT EXISTS shop_navigator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 3: Create Tables
```bash
mysql -u root -p'Root@123' < /var/www/html/shop-navigator/backend/seed.sql
```
This creates all tables AND inserts sample data (3 admins, 4 shops, 136 products).

### Step 4: Configure Environment
Edit `/var/www/html/shop-navigator/backend/.env`:
```env
PORT=3900
DB_HOST=localhost
DB_USER=root
DB_PASS=Root@123
DB_NAME=shop_navigator
JWT_SECRET=shop_nav_secret_key_2026_xK9mP2qL
```

### Step 5: Install Dependencies
```bash
cd /var/www/html/shop-navigator/backend
npm install
```

### Step 6: Start Backend Server
```bash
cd /var/www/html/shop-navigator/backend
node server.js
```
Server starts at: `http://localhost:3900`

### Step 7: Build Frontend (if needed)
```bash
cd /var/www/html/shop-navigator/frontend
npm install
DISABLE_ESLINT_PLUGIN=true npx react-scripts build
```

### Step 8: Verify
```bash
curl http://localhost:3900/api/health
# Response: {"status":"ok","service":"Shop Navigator API"}
```

---

## 4. DATABASE SCHEMA

### Table: `admins`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Admin ID |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(150) UNIQUE | Login email |
| password | VARCHAR(255) | Bcrypt hashed password |
| phone | VARCHAR(20) | Phone number |
| created_at | TIMESTAMP | Registration date |

### Table: `shops`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Shop ID |
| admin_id | INT (FK → admins) | Owner admin |
| name | VARCHAR(150) | Shop name |
| type | ENUM | supermarket, textile, electronics, general, pharmacy, other |
| address | TEXT | Shop address |
| logo | VARCHAR(500) | Logo image path |
| api_key | VARCHAR(100) UNIQUE | API key for external integration |
| created_at | TIMESTAMP | Creation date |

### Table: `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Category ID |
| shop_id | INT (FK → shops) | Belongs to shop |
| name | VARCHAR(100) | Category name |
| icon | VARCHAR(50) | Emoji icon |
| color | VARCHAR(20) | Hex color code |
| sort_order | INT | Display order |

### Table: `zones`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Zone ID |
| shop_id | INT (FK → shops) | Belongs to shop |
| name | VARCHAR(100) | Zone/Aisle name |
| icon | VARCHAR(50) | Emoji icon |
| color | VARCHAR(20) | Hex color code |
| position_row | VARCHAR(10) | CSS grid row (e.g., "2/3") |
| position_col | VARCHAR(10) | CSS grid column (e.g., "1/2") |
| photo | VARCHAR(500) | Zone photo path |
| description | TEXT | Zone description |
| sort_order | INT | Display order |

### Table: `products`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Product ID |
| shop_id | INT (FK → shops) | Belongs to shop |
| zone_id | INT (FK → zones) | Located in zone |
| category_id | INT (FK → categories) | Product category |
| name | VARCHAR(200) | Product name |
| icon | VARCHAR(50) | Emoji icon |
| photo | VARCHAR(500) | Product photo path |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Price in INR |
| in_stock | BOOLEAN | Stock availability |
| created_at | TIMESTAMP | Added date |

### Table: `offers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Offer ID |
| shop_id | INT (FK → shops) | Belongs to shop |
| title | VARCHAR(200) | Offer headline |
| description | TEXT | Offer details |
| photo | VARCHAR(500) | Banner image path |
| discount_percent | INT | Discount percentage |
| start_date | DATE | Offer start |
| end_date | DATE | Offer end |
| is_active | BOOLEAN | Active/inactive |
| created_at | TIMESTAMP | Created date |

### Table: `api_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO) | Log ID |
| shop_id | INT (FK → shops) | Shop that used the API |
| endpoint | VARCHAR(200) | API endpoint called |
| method | VARCHAR(10) | HTTP method |
| status_code | INT | Response status |
| request_body | TEXT | Request data |
| created_at | TIMESTAMP | Log timestamp |

### Entity Relationship
```
admins (1) ──── (N) shops
shops  (1) ──── (N) zones
shops  (1) ──── (N) categories
shops  (1) ──── (N) products
shops  (1) ──── (N) offers
shops  (1) ──── (N) api_logs
zones  (1) ──── (N) products
categories (1) ── (N) products
```

---

## 5. SEED DATA

### Location
```
/var/www/html/shop-navigator/backend/seed.sql
```

### How to Run
```bash
mysql -u root -p'Root@123' shop_navigator < /var/www/html/shop-navigator/backend/seed.sql
```

### What's Included

| Data | Count | Details |
|------|-------|---------|
| **Admins** | 3 | Rajesh (2 shops), Priya (1 shop), Ali (1 shop) |
| **Shops** | 4 | 2 Supermarkets, 1 Textile, 1 Electronics |
| **Categories** | 26 | 10 Supermarket, 5 Express, 6 Textile, 5 Electronics |
| **Zones** | 34 | 11 + 5 + 10 + 8 zones across all shops |
| **Products** | 136 | 60+ Supermarket, 40+ Textile, 25+ Electronics |
| **Offers** | 11 | 4 + 4 + 3 offers across shops |

### Demo Login Credentials

| Admin | Email | Password |
|-------|-------|----------|
| Rajesh Kumar | admin@shop.com | admin123 |
| Priya Sharma | priya@textilehub.com | admin123 |
| Mohammed Ali | ali@megamart.com | admin123 |

### Sample Shops

| Shop | Type | Owner | Products | Zones |
|------|------|-------|----------|-------|
| Super Fresh Market | Supermarket | Rajesh | 60+ | 11 |
| Fresh Mart Express | Supermarket | Rajesh | (via API) | 5 |
| Fashion Hub Textiles | Textile | Priya | 40+ | 10 |
| Mega Electronics World | Electronics | Ali | 25+ | 8 |

---

## 6. API REFERENCE

### Base URL
```
http://localhost:3900/api
```

### Authentication

**Admin Auth (JWT Token):**
```
Header: Authorization: Bearer <token>
```

**API Key Auth (External Systems):**
```
Header: x-api-key: <api_key>
OR
Query: ?api_key=<api_key>
```

---

### 6.1 Auth APIs

#### POST /api/auth/register
Register a new admin account.
```json
// Request
{
    "name": "John Doe",
    "email": "john@shop.com",
    "password": "password123",
    "phone": "9876543210"
}

// Response (201)
{
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1...",
    "admin": { "id": 1, "name": "John Doe", "email": "john@shop.com" }
}
```

#### POST /api/auth/login
Login with email and password.
```json
// Request
{
    "email": "admin@shop.com",
    "password": "admin123"
}

// Response (200)
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1...",
    "admin": { "id": 1, "name": "Rajesh Kumar", "email": "admin@shop.com" }
}
```

#### GET /api/auth/me
Get current logged-in admin profile.
```
Header: Authorization: Bearer <token>

// Response (200)
{ "id": 1, "name": "Rajesh Kumar", "email": "admin@shop.com", "phone": "9876543210" }
```

---

### 6.2 Shop APIs (Admin Auth Required)

#### GET /api/shops
Get all shops owned by the logged-in admin.

#### POST /api/shops
Create a new shop (multipart/form-data for logo upload).
```
Fields: name*, type, address, logo (file)
```

#### GET /api/shops/:id
Get single shop details.

#### PUT /api/shops/:id
Update shop (multipart/form-data for logo).

#### DELETE /api/shops/:id
Delete a shop and all its data.

#### GET /api/shops/:id/qr
Generate QR code for the shop.
```json
// Response
{
    "qr": "data:image/png;base64,...",
    "url": "http://localhost:3900/shop/1",
    "shop": { ... }
}
```

#### POST /api/shops/:id/regenerate-key
Generate a new API key (old one stops working).

---

### 6.3 Zone APIs (Admin Auth Required)

#### GET /api/zones/:shopId
Get all zones for a shop.

#### POST /api/zones/:shopId
Add a new zone (multipart/form-data for photo).
```
Fields: name*, icon, color, position_row, position_col, description, sort_order, photo (file)
```

#### PUT /api/zones/update/:id
Update a zone.

#### DELETE /api/zones/delete/:id
Delete a zone.

---

### 6.4 Category APIs (Admin Auth Required)

#### GET /api/categories/:shopId
Get all categories for a shop.

#### POST /api/categories/:shopId
Add a category.
```json
{ "name": "Fruits", "icon": "🍎", "color": "#4caf50" }
```

#### PUT /api/categories/update/:id
Update a category.

#### DELETE /api/categories/delete/:id
Delete a category.

---

### 6.5 Product APIs (Admin Auth Required)

#### GET /api/products/:shopId
Get all products with zone and category info.

#### POST /api/products/:shopId
Add a product (multipart/form-data for photo).
```
Fields: name*, zone_id, category_id, icon, description, price, in_stock, photo (file)
```

#### PUT /api/products/update/:id
Update a product.

#### DELETE /api/products/delete/:id
Delete a product.

#### POST /api/products/:shopId/bulk-import
Bulk import products from CSV file.
```
CSV Columns: name, zone_name, category_name, icon, description, price
```

Example CSV:
```csv
name,zone_name,category_name,icon,description,price
Basmati Rice,Grains & Staples,Grains & Staples,🍚,Premium basmati 5kg,450
Toor Dal,Grains & Staples,Grains & Staples,🫘,1kg pack,140
```

---

### 6.6 Offer APIs (Admin Auth Required)

#### GET /api/offers/:shopId
Get all offers for a shop.

#### POST /api/offers/:shopId
Add an offer (multipart/form-data for banner).
```
Fields: title*, description, discount_percent, start_date, end_date, is_active, photo (file)
```

#### PUT /api/offers/update/:id
Update an offer.

#### DELETE /api/offers/delete/:id
Delete an offer.

---

### 6.7 Integration APIs (API Key Auth Required)

#### POST /api/integration/sync-products
Sync products from external software (upsert - updates existing, inserts new).
```json
// Header: x-api-key: snk_supermarket_api_key_001
{
    "products": [
        {
            "name": "Basmati Rice 5kg",
            "zone_name": "Grains & Staples",
            "category_name": "Grains & Staples",
            "icon": "🍚",
            "description": "Premium aged basmati",
            "price": 450,
            "in_stock": true
        },
        {
            "name": "Toor Dal 1kg",
            "zone_name": "Grains & Staples",
            "price": 140
        }
    ]
}

// Response
{ "message": "Synced 2 products", "errors": 0, "total": 2 }
```

#### POST /api/integration/sync-zones
Sync zones from external software.
```json
{
    "zones": [
        { "name": "New Aisle", "icon": "🏪", "color": "#4caf50", "description": "Fresh arrivals section" }
    ]
}
```

#### GET /api/integration/products
Get all products (for external software to read).
```
GET /api/integration/products?api_key=snk_supermarket_api_key_001
```

#### GET /api/integration/zones
Get all zones (for external software to read).
```
GET /api/integration/zones?api_key=snk_supermarket_api_key_001
```

---

### 6.8 Customer APIs (No Auth - Public)

#### GET /api/customer/shop/:id
Get full shop data for customer view (shop info, zones, categories, products, active offers).

#### GET /api/customer/shop/:id/search?q=keyword
Search products in a shop.
```
GET /api/customer/shop/1/search?q=rice
```

---

## 7. ADMIN PANEL GUIDE

### Login
1. Open `http://localhost:3900/login`
2. Enter email and password
3. Click **Login**

### Dashboard
After login, you see all your shops with stats (zones, products, offers count).
- Click a shop card to manage it
- Click **"+ Add New Shop"** to create a new shop

### Shop Manager Tabs

#### Tab 1: Zones
- Add zones/aisles of your shop (e.g., "Fresh Produce", "Dairy", "Aisle 3")
- Upload a **photo** of each zone so customers can see what it looks like
- Set **grid position** (row/column) for the store map layout
- Set **color** and **icon** for visual identity

Grid Position Guide:
```
Row "1/2" Col "1/4" = Full width top row (Entrance)
Row "2/3" Col "1/2" = Second row, first column
Row "2/3" Col "2/3" = Second row, second column
Row "2/3" Col "3/4" = Second row, third column
```

#### Tab 2: Categories
- Add product categories (e.g., "Fruits", "Dairy", "Men's Wear")
- Set color and icon for each category

#### Tab 3: Products
- Add products one by one with name, zone, category, price, and photo
- Or use **CSV Bulk Import** to upload many products at once
- Each product is assigned to a zone (tells customer WHERE it is)

#### Tab 4: Offers
- Add promotional offers with title, discount %, dates
- Upload **banner images** that auto-slide on the customer page
- Set active/inactive to control visibility

#### Tab 5: QR Code
- Auto-generated QR code for your shop
- **Print** it and place at your shop entrance
- Customers scan → Opens store map on their phone

#### Tab 6: API Integration
- View your shop's **API Key**
- See all API endpoints with examples
- Copy API key to integrate with existing POS/ERP software

---

## 8. CUSTOMER FLOW

```
Step 1: Customer enters the shop
            ↓
Step 2: Sees QR code poster at entrance
            ↓
Step 3: Scans QR code with phone camera
            ↓
Step 4: Browser opens → Shop Navigator page loads
            ↓
Step 5: Sees OFFER BANNERS sliding at top (auto-rotate every 4s)
            ↓
Step 6: Sees SEARCH BAR → Types product name (e.g., "Rice")
            ↓
Step 7: Matching products appear → Zone highlighted on MAP
            ↓
Step 8: Can also tap CATEGORY buttons to filter
            ↓
Step 9: Taps a PRODUCT → Map scrolls up & highlights the zone
            ↓
Step 10: Taps a ZONE on map → Opens zone detail with photo + all products
            ↓
Step 11: Customer walks to the right zone → Finds product!
```

### Customer Page Features
- **No login required** - works instantly after QR scan
- **No app download** - opens in phone browser
- **Offer Slider** - promotional banners auto-rotate at top
- **Search** - real-time search highlights matching zones on map
- **Category Filter** - filter products by category
- **Store Map** - color-coded zones with photos (if uploaded)
- **Product List** - shows product name, zone, price, and photo
- **Zone Detail** - tap a zone to see all products inside with photos

---

## 9. API INTEGRATION GUIDE

### Use Case
Your shop already has software (POS, ERP, inventory system). Instead of manually entering products in Shop Navigator, sync them automatically.

### Step 1: Get API Key
Login → Dashboard → Click Shop → API Integration Tab → Copy API Key

### Step 2: Sync Zones First
```bash
curl -X POST http://localhost:3900/api/integration/sync-zones \
  -H "Content-Type: application/json" \
  -H "x-api-key: snk_supermarket_api_key_001" \
  -d '{
    "zones": [
        { "name": "Aisle 1 - Fruits", "icon": "🍎", "color": "#4caf50" },
        { "name": "Aisle 2 - Dairy", "icon": "🧀", "color": "#2196f3" }
    ]
  }'
```

### Step 3: Sync Products
```bash
curl -X POST http://localhost:3900/api/integration/sync-products \
  -H "Content-Type: application/json" \
  -H "x-api-key: snk_supermarket_api_key_001" \
  -d '{
    "products": [
        { "name": "Apple", "zone_name": "Aisle 1 - Fruits", "price": 180, "in_stock": true },
        { "name": "Milk 1L", "zone_name": "Aisle 2 - Dairy", "price": 56 }
    ]
  }'
```

### Step 4: Read Data Back
```bash
# Get all products
curl "http://localhost:3900/api/integration/products?api_key=snk_supermarket_api_key_001"

# Get all zones
curl "http://localhost:3900/api/integration/zones?api_key=snk_supermarket_api_key_001"
```

### Integration from Your ERP/POS
In your existing software, add this code to push data whenever products change:

**Node.js Example:**
```javascript
const axios = require('axios');

async function syncToNavigator(products) {
    await axios.post('http://localhost:3900/api/integration/sync-products',
        { products },
        { headers: { 'x-api-key': 'YOUR_API_KEY' } }
    );
}

// Call when product is added/updated in your system
syncToNavigator([
    { name: 'New Product', zone_name: 'Aisle 1', price: 100, in_stock: true }
]);
```

**Python Example:**
```python
import requests

def sync_to_navigator(products):
    response = requests.post(
        'http://localhost:3900/api/integration/sync-products',
        json={'products': products},
        headers={'x-api-key': 'YOUR_API_KEY'}
    )
    return response.json()

sync_to_navigator([
    {'name': 'New Product', 'zone_name': 'Aisle 1', 'price': 100, 'in_stock': True}
])
```

---

## 10. QR CODE SETUP

### Generate QR
1. Login to Admin → Select Shop → Click **"QR Code"** tab
2. QR code is auto-generated linking to `http://YOUR_SERVER/shop/SHOP_ID`

### Print QR
1. Click **"Print QR"** button
2. Print page opens with shop name and QR code
3. Print on A4 paper or sticker

### Place at Shop
- Put QR poster at **entrance** of the shop
- Also place near **billing counter** for waiting customers
- Add text: **"Scan to find any product instantly!"**

### QR URL Format
```
http://YOUR_SERVER_IP:3900/shop/{shopId}
```

For production, replace `localhost` with your actual server IP or domain.

---

## 11. FILE STRUCTURE

```
/var/www/html/shop-navigator/
│
├── DOCUMENTATION.md              ← This file
│
├── backend/
│   ├── .env                      ← Environment variables (DB, JWT secret)
│   ├── package.json              ← Node.js dependencies
│   ├── server.js                 ← Express server entry point
│   ├── database.js               ← MySQL connection pool
│   ├── seed.sql                  ← Database tables + sample data
│   │
│   ├── middleware/
│   │   ├── auth.js               ← JWT + API Key authentication
│   │   └── upload.js             ← Multer photo upload handler
│   │
│   ├── routes/
│   │   ├── auth.js               ← Register / Login / Me
│   │   ├── shops.js              ← Shop CRUD + QR generation
│   │   ├── zones.js              ← Zone CRUD + photo upload
│   │   ├── categories.js         ← Category CRUD
│   │   ├── products.js           ← Product CRUD + CSV import
│   │   ├── offers.js             ← Offer CRUD + banner upload
│   │   ├── integration.js        ← External API sync endpoints
│   │   └── customer.js           ← Public customer data endpoints
│   │
│   ├── uploads/                  ← Uploaded files stored here
│   │   ├── logos/                ← Shop logos
│   │   ├── zones/                ← Zone/aisle photos
│   │   ├── products/             ← Product photos
│   │   └── offers/               ← Offer banner images
│   │
│   └── node_modules/
│
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── build/                    ← Production build (served by Express)
│   └── src/
│       ├── App.js                ← Router + Route definitions
│       ├── App.css               ← All styles
│       ├── index.js              ← React entry point
│       ├── utils/
│       │   └── api.js            ← Axios instance with JWT interceptor
│       └── pages/
│           ├── Login.jsx         ← Admin login page
│           ├── Register.jsx      ← Admin registration page
│           ├── Dashboard.jsx     ← Shop listing + create shop
│           ├── ShopManager.jsx   ← Full shop management (6 tabs)
│           └── CustomerView.jsx  ← Public customer-facing page
│
└── index.html                    ← Original static demo (standalone)
```

---

## 12. TROUBLESHOOTING

### Server won't start
```bash
# Check if port 3900 is in use
lsof -i :3900
# Kill existing process
kill -9 <PID>
# Restart
cd /var/www/html/shop-navigator/backend && node server.js
```

### MySQL connection failed
```bash
# Test connection
mysql -u root -p'Root@123' -e "SELECT 1;"
# Check .env file has correct credentials
cat /var/www/html/shop-navigator/backend/.env
```

### Frontend not loading
```bash
# Rebuild frontend
cd /var/www/html/shop-navigator/frontend
DISABLE_ESLINT_PLUGIN=true npx react-scripts build
```

### Photos not showing
- Check `/var/www/html/shop-navigator/backend/uploads/` directory exists
- Ensure proper file permissions: `chmod -R 755 uploads/`

### QR code not scanning
- Make sure the URL in QR is accessible from the phone
- Phone and server must be on the same network (for local testing)
- Use server IP, not `localhost`: `http://10.167.240.34:3900/shop/1`

### API integration not working
- Verify API key is correct (copy from Admin → API Integration tab)
- Check header: `x-api-key: YOUR_KEY`
- Zone names in sync must match existing zone names for product mapping

### Reset all data
```bash
mysql -u root -p'Root@123' shop_navigator < /var/www/html/shop-navigator/backend/seed.sql
```

---

## QUICK START SUMMARY

```bash
# 1. Start the server
cd /var/www/html/shop-navigator/backend
node server.js

# 2. Open browser
# Admin: http://localhost:3900/login
# Customer: http://localhost:3900/shop/1

# 3. Login credentials
# Email: admin@shop.com
# Password: admin123

# 4. On phone (same WiFi)
# http://10.167.240.34:3900/shop/1
```

---

**Built with:** React.js, Node.js, Express, MySQL
**Author:** Shop Navigator Team
**License:** MIT
