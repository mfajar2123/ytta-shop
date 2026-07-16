# PRD & Implementation Plan: Imani Prima Shop — Full-Stack Upgrade

## Executive Summary

Upgrade the existing Imani Prima Shop (Nuxt 3 frontend) into a production-grade, full-stack e-commerce application within a **single repository**. This includes a PostgreSQL database via Drizzle ORM, JWT-based authentication, an admin dashboard at `/admin`, automated email notifications with PDF invoice attachments, and a complete order lifecycle management system.

> [!IMPORTANT]
> All changes are additive. The existing public-facing UI, layout, animations, and color palette remain untouched. The admin dashboard will inherit the same Apple Light Theme design system.

---

## 1. Architecture Overview

```mermaid
graph TB
    subgraph "Single Nuxt 3 Repository"
        subgraph "Public Frontend (Existing)"
            A["/ — Landing Page"]
            B["/shop — Product Listing"]
            C["/cart — Cart"]
            D["/checkout — Checkout"]
        end

        subgraph "Admin Frontend (New)"
            E["/admin/login — Auth"]
            F["/admin — Dashboard"]
            G["/admin/products — CRUD"]
            H["/admin/orders — Management"]
            I["/admin/orders/:id — Detail"]
        end

        subgraph "Nuxt Server API (Nitro)"
            J["/api/auth/** — JWT Auth"]
            K["/api/products/** — Product CRUD"]
            L["/api/orders/** — Order Management"]
            M["/api/upload/** — File Upload"]
            N["/api/email/** — Email Service"]
        end

        subgraph "Database Layer"
            O["Drizzle ORM"]
            P["PostgreSQL"]
        end
    end

    A --> K
    B --> K
    D --> L
    D --> N
    G --> K
    G --> M
    H --> L
    H --> N
    J --> O
    K --> O
    L --> O
    O --> P
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Nuxt 3 (existing) | Full-stack capable via Nitro server engine |
| Database | PostgreSQL | Industry-standard RDBMS for transactional e-commerce |
| ORM | Drizzle ORM | Type-safe, lightweight, zero-dependency SQL toolkit for TypeScript |
| Authentication | JWT (jsonwebtoken) + bcrypt | Stateless token-based auth, industry standard |
| Email | Nodemailer + Handlebars templates | Professional HTML email rendering with dynamic data |
| PDF Generation | jsPDF + html2canvas (server-side) | Generate invoice PDFs as email attachments |
| File Upload | Multer | Multipart form handling for product images and payment proofs |
| Validation | Zod | Runtime schema validation on all API endpoints |
| Icons | Heroicons (existing) | Consistency across public and admin |
| Styling | Tailwind CSS with Apple Light Theme (existing) | Unified design language |
| Rate Limiting | nuxt-security module | Prevent brute force and abuse |
| CSRF Protection | Built-in Nitro CSRF | Cross-site request forgery prevention |

---

## 3. Database Schema (Drizzle ORM)

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    ADMINS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        enum role "helpdesk | superadmin"
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        serial id PK
        varchar name
        varchar slug UK
        varchar category
        text description
        integer price
        varchar image_url
        varchar image_type "device | bundle | sub"
        varchar sku
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        uuid id PK
        varchar invoice_number UK
        enum status "pending_payment | payment_uploaded | verified | processing | completed | cancelled"
        integer subtotal
        integer unique_code
        integer total
        jsonb billing_details
        jsonb vessel_details
        varchar customer_email
        varchar customer_phone
        varchar payment_proof_url
        text admin_notes
        uuid verified_by FK
        timestamp paid_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        serial id PK
        uuid order_id FK
        integer product_id FK
        varchar product_name
        varchar product_sku
        integer quantity
        integer unit_price
        integer line_total
    }

    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDER_ITEMS }o--|| PRODUCTS : references
    ORDERS }o--o| ADMINS : verified_by
```

### 3.2 Table Definitions

#### [NEW] `server/db/schema.ts`

Drizzle schema definitions for all 4 tables above with proper TypeScript types, relations, indexes, and constraints. Key design decisions:

- `orders.billing_details` is JSONB (stores: fullName, phone, address, npwp, nik, email)
- `orders.vessel_details` is JSONB (stores: vesselName, vesselId, serialNumber, transmitterId)
- `orders.invoice_number` format: `INV.{YYYY}.SC.{5-digit-sequential}` — sequential, not random
- `order_items` denormalizes product name/sku/price at time of purchase for historical integrity
- `admins.password_hash` uses bcrypt with 12 salt rounds
- All timestamps use `defaultNow()` and `$onUpdate`

---

## 4. API Endpoints

### 4.1 Authentication (`server/api/auth/`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Admin login, returns JWT token | Public |
| POST | `/api/auth/logout` | Clears auth cookie | Authenticated |
| GET | `/api/auth/me` | Returns current admin profile | Authenticated |

**Security measures:**
- JWT stored in httpOnly, secure, sameSite cookie (not localStorage)
- Token expiry: 8 hours
- bcrypt password hashing with 12 salt rounds
- Rate limiting: 5 attempts per minute per IP on login
- Zod validation on all inputs

---

### 4.2 Products (`server/api/products/`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/products` | List all active products | Public |
| GET | `/api/products/[id]` | Get single product | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/[id]` | Update product | Admin |
| DELETE | `/api/products/[id]` | Soft-delete product (set is_active=false) | Admin |

**Product image upload:**
- Accepted formats: PNG, JPG, WebP
- Max size: 5MB
- Stored in: `public/uploads/products/`
- Filename: `{slug}-{timestamp}.{ext}`

---

### 4.3 Orders (`server/api/orders/`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/orders` | Place new order (from checkout) | Public |
| GET | `/api/orders` | List all orders (filterable) | Admin |
| GET | `/api/orders/[id]` | Get order detail | Admin |
| PATCH | `/api/orders/[id]/status` | Update order status | Admin |
| POST | `/api/orders/[id]/upload-proof` | Upload payment proof | Admin |
| GET | `/api/orders/[id]/invoice-pdf` | Download/stream invoice PDF | Admin |

---

### 4.4 Upload (`server/api/upload/`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/upload/product-image` | Upload product image | Admin |
| POST | `/api/upload/payment-proof` | Upload payment proof | Admin |

---

## 5. Email Notification System

### 5.1 Email Templates (Handlebars)

All emails use professional HTML templates with the Imani Prima branding (Apple Light Theme colors).

#### [NEW] `server/email/templates/`

| Template | Trigger | Recipients | Attachments |
|---|---|---|---|
| `order-placed.hbs` | Order created | Customer, Helpdesk, Sales, Accounting | Invoice PDF (WITHOUT "PAID" stamp) |
| `payment-uploaded.hbs` | Payment proof uploaded | Helpdesk, Accounting | Payment proof image |
| `payment-verified.hbs` | Status → Verified | Customer, Helpdesk | Invoice PDF (WITH "PAID" stamp) + Payment proof |
| `order-processing.hbs` | Status → Processing | Customer | — |
| `order-completed.hbs` | Status → Completed | Customer, Sales | Invoice PDF (WITH "PAID" stamp) |

### 5.2 Email Content Structure

Each email template contains:
- Imani Prima header with logo and branding
- Order summary table (products, quantities, prices)
- Invoice number, order date
- Current order status with visual badge
- Billing and vessel details
- Call-to-action button (e.g., "View Order" for admin, "Contact Support" for customer)
- Footer with company address and contact info

### 5.3 Invoice PDF Variants

| Variant | When | Differences |
|---|---|---|
| **Proforma Invoice** | Order placed, payment not yet confirmed | No "PAID" watermark, status shows "Awaiting Payment" |
| **Paid Invoice** | Payment verified by admin | "PAID" watermark stamp (red, rotated), status shows "Paid" |

### 5.4 Email Recipients Configuration

```
SMTP_HOST=smtp.gmail.com (or company SMTP)
SMTP_PORT=587
SMTP_USER=noreply@imaniprima.co.id
SMTP_PASS=****

EMAIL_HELPDESK=helpdesk@imaniprima.co.id
EMAIL_ACCOUNTING=accounting@imaniprima.co.id
EMAIL_SALES=sales@imaniprima.co.id
```

---

## 6. Admin Dashboard Pages

All admin pages use a dedicated `layouts/admin.vue` with:
- Collapsible sidebar navigation
- Top bar with admin name, role badge, and logout
- Apple Light Theme (same `apple-*` Tailwind colors)
- Heroicons throughout
- Scroll-triggered animations (same `v-animate` system)
- Responsive: works on tablet and desktop

### 6.1 Page Specifications

---

#### [NEW] `/admin/login` — Login Page

- Full-screen centered card layout with subtle background gradient
- Email + Password fields with Zod client-side validation
- "Remember me" checkbox (extends JWT to 7 days)
- Error states with inline messages
- SweetAlert2 for login success/failure feedback
- Auto-redirect to `/admin` on successful auth
- Redirect to `/admin/login` if accessing any `/admin/*` without valid token

---

#### [NEW] `/admin` — Dashboard Overview

Key metrics cards at the top:
- Total Orders (all time)
- Pending Payment (orders awaiting transfer)
- Revenue This Month (completed orders)
- Active Products count

Charts/Visuals:
- Recent orders table (last 10) with status badges
- Quick-action buttons: "View All Orders", "Add Product"

---

#### [NEW] `/admin/products` — Product Management

**List View:**
- Table with columns: Image thumbnail, Name, SKU, Category, Price, Status (Active/Inactive), Actions
- Search bar and category filter
- "Add Product" button

**Create/Edit Modal:**
- Form fields: Name, SKU, Category (dropdown), Price (IDR), Description (textarea), Image upload (drag-and-drop zone with preview), Active toggle
- Image upload shows real-time preview
- Zod validation with inline error messages
- SweetAlert2 confirmation on save/delete

**Delete:**
- Soft delete (sets `is_active = false`)
- SweetAlert2 confirmation dialog
- Product remains in database for historical order integrity

---

#### [NEW] `/admin/orders` — Order Management

**List View:**
- Table with columns: Invoice Number, Customer Name, Date, Items Count, Total, Status, Actions
- Status filter tabs: All | Pending Payment | Payment Uploaded | Verified | Processing | Completed | Cancelled
- Search by invoice number or customer name
- Date range filter
- Pagination (20 per page)

**Status Badges (color-coded):**
| Status | Color | Label |
|---|---|---|
| pending_payment | Yellow/Amber | Pending Payment |
| payment_uploaded | Blue | Payment Uploaded |
| verified | Cyan | Verified |
| processing | Indigo | Processing |
| completed | Green | Completed |
| cancelled | Red | Cancelled |

---

#### [NEW] `/admin/orders/[id]` — Order Detail

**Sections:**

1. **Order Header**: Invoice number, date, status badge, action buttons
2. **Customer Information**: Full name, email, phone, address, NPWP, NIK
3. **Vessel Information**: Vessel name, vessel ID
4. **Order Items Table**: Product name, SKU, qty, unit price, line total
5. **Order Totals**: Subtotal, unique code, total
6. **Payment Section**:
   - If no proof uploaded: "No payment proof uploaded yet" message
   - If proof uploaded: Image preview of payment proof with zoom capability
7. **Invoice Preview**: Embedded PDF preview (iframe) with download button
8. **Status Timeline**: Visual timeline showing order progression with timestamps
9. **Admin Actions**:
   - Upload payment proof (drag-and-drop)
   - Change status dropdown with confirmation
   - Add admin notes (textarea)
   - Resend email notification button

**Status Change Flow:**
```
pending_payment → payment_uploaded (when proof is uploaded)
payment_uploaded → verified (admin confirms payment)
verified → processing (admin starts processing)
processing → completed (order fulfilled)
any status → cancelled (with reason required)
```

Each status change triggers the corresponding email notification.

---

## 7. Order Lifecycle Flow

```mermaid
sequenceDiagram
    actor Customer as Helpdesk (Customer)
    participant Shop as Shop Frontend
    participant API as Nuxt Server API
    participant DB as PostgreSQL
    participant Email as Email Service

    Customer->>Shop: Browse products, add to cart
    Customer->>Shop: Fill billing form, click "Place Order"
    Shop->>API: POST /api/orders (cart items + billing data)
    API->>DB: Insert order (status: pending_payment)
    API->>DB: Insert order_items
    API->>API: Generate Proforma Invoice PDF (no PAID stamp)
    API->>Email: Send "Order Placed" email to all recipients
    Note over Email: Attach: Proforma Invoice PDF
    API->>Shop: Return order confirmation
    Shop->>Customer: Show success message, redirect to /shop

    Customer->>Shop: Navigate to /admin/login
    Customer->>Shop: Login as Helpdesk
    Customer->>Shop: Go to /admin/orders/{id}
    Customer->>API: POST /api/orders/{id}/upload-proof
    API->>DB: Update payment_proof_url
    API->>DB: Update status → payment_uploaded
    API->>Email: Send "Payment Uploaded" email to Helpdesk + Accounting
    Note over Email: Attach: Payment proof image

    Customer->>Shop: Change status → verified
    API->>DB: Update status → verified, set verified_by, paid_at
    API->>API: Generate Paid Invoice PDF (WITH "PAID" stamp)
    API->>Email: Send "Payment Verified" email to Customer
    Note over Email: Attach: Paid Invoice PDF + Payment proof

    Customer->>Shop: Change status → processing
    API->>DB: Update status → processing
    API->>Email: Send "Order Processing" email to Customer

    Customer->>Shop: Change status → completed
    API->>DB: Update status → completed, set completed_at
    API->>Email: Send "Order Completed" email to Customer + Sales
    Note over Email: Attach: Final Paid Invoice PDF
```

---

## 8. Security Measures

### 8.1 Authentication & Authorization

- JWT tokens stored in **httpOnly, Secure, SameSite=Strict** cookies (never localStorage)
- Password hashing: **bcrypt with 12 salt rounds**
- Server middleware `server/middleware/auth.ts` validates JWT on all `/api/admin/**` routes
- Page middleware `middleware/admin-auth.ts` guards all `/admin/**` routes client-side
- Role-based access: `helpdesk` and `superadmin` roles

### 8.2 Input Validation

- **Zod schemas** on every API endpoint (request body, params, query)
- SQL injection prevention via Drizzle ORM parameterized queries
- File upload validation: MIME type check, file size limit, filename sanitization

### 8.3 Rate Limiting & Protection

- Login endpoint: 5 requests per minute per IP
- API endpoints: 100 requests per minute per IP
- CSRF protection via Nuxt Security module
- Helmet-style security headers
- Content Security Policy headers

### 8.4 Data Protection

- Sensitive fields (NPWP, NIK) encrypted at rest in JSONB
- Admin passwords never logged or returned in API responses
- File uploads sanitized and stored outside web root where possible
- Database connection via SSL in production

---

## 9. File Structure (New & Modified Files)

```
coba-web/
├── .env                                    [NEW] Environment variables
├── .env.example                            [NEW] Template for env vars
├── drizzle.config.ts                       [NEW] Drizzle Kit configuration
│
├── server/
│   ├── db/
│   │   ├── index.ts                        [NEW] Database connection (pg + drizzle)
│   │   ├── schema.ts                       [NEW] All Drizzle table definitions
│   │   ├── migrate.ts                      [NEW] Migration runner
│   │   └── seed.ts                         [NEW] Seed data (default admin + products)
│   │
│   ├── middleware/
│   │   └── auth.ts                         [NEW] JWT verification middleware
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts               [NEW]
│   │   │   ├── logout.post.ts              [NEW]
│   │   │   └── me.get.ts                   [NEW]
│   │   │
│   │   ├── products/
│   │   │   ├── index.get.ts                [NEW] List products (public)
│   │   │   ├── index.post.ts               [NEW] Create product (admin)
│   │   │   ├── [id].get.ts                 [NEW] Get product
│   │   │   ├── [id].put.ts                 [NEW] Update product (admin)
│   │   │   └── [id].delete.ts              [NEW] Soft-delete product (admin)
│   │   │
│   │   ├── orders/
│   │   │   ├── index.get.ts                [NEW] List orders (admin)
│   │   │   ├── index.post.ts               [NEW] Place order (public)
│   │   │   ├── [id].get.ts                 [NEW] Get order detail (admin)
│   │   │   ├── [id]/
│   │   │   │   ├── status.patch.ts         [NEW] Update status (admin)
│   │   │   │   ├── upload-proof.post.ts    [NEW] Upload payment proof (admin)
│   │   │   │   └── invoice-pdf.get.ts      [NEW] Generate/download PDF (admin)
│   │   │
│   │   └── upload/
│   │       ├── product-image.post.ts       [NEW]
│   │       └── payment-proof.post.ts       [NEW]
│   │
│   ├── utils/
│   │   ├── jwt.ts                          [NEW] JWT sign/verify helpers
│   │   ├── password.ts                     [NEW] bcrypt hash/compare helpers
│   │   ├── invoice-pdf.ts                  [NEW] PDF generation (proforma + paid)
│   │   ├── email.ts                        [NEW] Nodemailer transport + send helper
│   │   └── validation.ts                   [NEW] Zod schemas for all endpoints
│   │
│   └── email/
│       └── templates/
│           ├── order-placed.hbs            [NEW]
│           ├── payment-uploaded.hbs        [NEW]
│           ├── payment-verified.hbs        [NEW]
│           ├── order-processing.hbs        [NEW]
│           └── order-completed.hbs         [NEW]
│
├── layouts/
│   ├── default.vue                         (existing, untouched)
│   └── admin.vue                           [NEW] Admin layout with sidebar
│
├── middleware/
│   └── admin-auth.ts                       [NEW] Client-side route guard
│
├── pages/
│   ├── index.vue                           (existing, untouched)
│   ├── shop.vue                            [MODIFY] Fetch products from API
│   ├── cart.vue                            (existing, untouched)
│   ├── checkout.vue                        (existing, untouched)
│   ├── privacy-policy.vue                  (existing, untouched)
│   │
│   └── admin/
│       ├── login.vue                       [NEW]
│       ├── index.vue                       [NEW] Dashboard
│       ├── products.vue                    [NEW] Product CRUD
│       ├── orders/
│       │   ├── index.vue                   [NEW] Order list
│       │   └── [id].vue                    [NEW] Order detail
│
├── components/
│   ├── admin/
│   │   ├── Sidebar.vue                     [NEW]
│   │   ├── Topbar.vue                      [NEW]
│   │   ├── StatsCard.vue                   [NEW]
│   │   ├── StatusBadge.vue                 [NEW]
│   │   ├── ProductFormModal.vue            [NEW]
│   │   ├── OrderStatusTimeline.vue         [NEW]
│   │   ├── PaymentProofUploader.vue        [NEW]
│   │   └── InvoicePreview.vue              [NEW]
│   │
│   ├── checkout/
│   │   └── OrderSummary.vue                [MODIFY] POST to /api/orders on place order
│
├── composables/
│   ├── useCart.ts                           (existing, untouched)
│   ├── useCheckout.ts                      (existing, untouched)
│   ├── useIntersectionObserver.ts          (existing, untouched)
│   ├── useAdminAuth.ts                     [NEW] Auth state management
│   └── useApi.ts                           [NEW] Typed API fetch wrapper
│
├── drizzle/
│   └── migrations/                         [NEW] Auto-generated SQL migrations
```

---

## 10. Modified Existing Files

### 10.1 [MODIFY] `pages/shop.vue`

**Current:** Products are hardcoded in a `const products = [...]` array.  
**Change:** Fetch products from `/api/products` using `useFetch`. Maintain the same UI, sorting, and modal behavior. Fallback to hardcoded data if API is unavailable (graceful degradation).

### 10.2 [MODIFY] `components/checkout/OrderSummary.vue`

**Current:** `handleOrder()` shows the `InvoiceModal` directly.  
**Change:** `handleOrder()` now POSTs to `/api/orders` with cart items + billing data. On success:
- Server generates Proforma Invoice PDF
- Server sends email to all recipients with PDF attachment
- Frontend shows SweetAlert success with order confirmation and invoice number
- Cart is cleared and user is redirected to `/shop`
- The `InvoiceModal` component is no longer used on the public frontend

### 10.3 [MODIFY] `nuxt.config.ts`

Add runtime config for environment variables, register new modules, and configure server middleware.

### 10.4 [MODIFY] `package.json`

Add new dependencies:
```
dependencies:
  drizzle-orm, pg, jsonwebtoken, bcrypt, nodemailer, handlebars, jspdf, zod, multer

devDependencies:
  drizzle-kit, @types/jsonwebtoken, @types/bcrypt, @types/nodemailer, @types/multer, @types/pg
```

---

## 11. Environment Variables

#### [NEW] `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/imani_shop

# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRY=8h

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@imaniprima.co.id
SMTP_PASS=your-app-password

# Email Recipients
EMAIL_HELPDESK=helpdesk@imaniprima.co.id
EMAIL_ACCOUNTING=accounting@imaniprima.co.id
EMAIL_SALES=sales@imaniprima.co.id

# App
APP_URL=https://shop.imaniprima.co.id
```

---

## 12. Seed Data

#### [NEW] `server/db/seed.ts`

Seed script creates:
1. Default admin account: `helpdesk@imaniprima.co.id` / `ImaniPrima2026!` (role: helpdesk)
2. The 3 existing products (Device Only, Bundle, Subscription)

Run: `pnpm run db:seed`

---

## 13. New npm Scripts

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx server/db/seed.ts"
}
```

---

## 14. Implementation Phases

### Phase 1: Foundation (Database + Auth)
1. Install all dependencies
2. Configure Drizzle ORM + PostgreSQL connection
3. Create database schema and run migrations
4. Implement JWT auth utilities + bcrypt
5. Create auth API endpoints (login, logout, me)
6. Create admin auth middleware (server + client)
7. Create seed script
8. **Verify:** Admin can login/logout, JWT works correctly

### Phase 2: Product Management
1. Create product API endpoints (CRUD)
2. Create file upload API for product images
3. Modify `shop.vue` to fetch from API
4. Create admin layout (`layouts/admin.vue`)
5. Create admin sidebar and topbar components
6. Build `/admin/products` page with create/edit/delete
7. **Verify:** Products created in admin appear on public shop

### Phase 3: Order System
1. Create order API endpoints
2. Modify `OrderSummary.vue` to POST order to API
3. Build `/admin/orders` list page with filters
4. Build `/admin/orders/[id]` detail page
5. Implement payment proof upload
6. Implement status change workflow
7. Build `/admin` dashboard overview page
8. **Verify:** Full order lifecycle works end-to-end

### Phase 4: Email & PDF System
1. Configure Nodemailer transport
2. Create all 5 Handlebars email templates
3. Implement PDF generation (proforma + paid variants)
4. Wire email triggers to status changes
5. Test email delivery with all attachments
6. **Verify:** Every status change sends correct email with correct attachments

### Phase 5: Security & Polish
1. Add Zod validation to all endpoints
2. Add rate limiting
3. Add CSRF protection
4. Add security headers
5. Input sanitization audit
6. Error handling and logging
7. Loading states and error boundaries on admin pages
8. Final responsive testing on admin pages
9. **Verify:** Passes security checklist, no vulnerabilities

---

## 15. Verification Plan

### Automated Tests
```bash
# Database connection and schema
pnpm run db:push    # Verify schema applies cleanly

# API endpoint tests (manual via curl or Thunder Client)
# Auth: login → get token → access protected route → logout
# Products: CRUD lifecycle
# Orders: create → upload proof → change status chain
```

### Manual Verification
- Login flow: email + password → dashboard redirect
- Product CRUD: create with image → appears on shop → edit → delete (soft)
- Order flow: place order from shop → check in admin → upload proof → verify → process → complete
- Email verification: check all 5 email types arrive with correct content and attachments
- PDF verification: proforma has no PAID stamp, paid invoice has PAID stamp
- Security: try accessing `/admin` without login → redirect to login
- Security: try accessing `/api/products` POST without token → 401
- Responsive: admin dashboard works on tablet and mobile

---

## Open Questions

> [!IMPORTANT]
> **PostgreSQL Setup:** Do you already have PostgreSQL installed locally, or should I include Docker setup instructions (`docker-compose.yml`) for the database?

> [!IMPORTANT]
> **SMTP Credentials:** Do you have access to an SMTP server (Gmail App Password, company email, or service like SendGrid/Resend)? This is required for the email system to work.

> [!WARNING]
> **Deployment Target:** Where will this be deployed? (Vercel, VPS, Docker?) This affects how file uploads and the database connection are configured in production.
