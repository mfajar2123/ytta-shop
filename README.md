# Imani Prima Shop

A modern, high-performance E-Commerce platform and administrative dashboard for showcasing and selling the **ORBCOMM SC1000** device. 

The customer-facing application is designed with an elegant, Apple-inspired light theme focusing on clean aesthetics and animations. The administrative dashboard utilizes a premium Apple Dark Mode aesthetic built with Nuxt UI v4 to manage orders, system settings, and customer data securely.

## 🚀 Tech Stack

### Frontend
- **Framework:** Nuxt 4 (Vue 3)
- **Styling:** Tailwind CSS v4
- **UI Components (Admin):** Nuxt UI v4 (@nuxt/ui)
- **Icons:** Heroicons & Lucide Icons
- **Notifications:** SweetAlert2
- **Typography:** Custom Google Fonts (El Messiri, Raleway)

### Backend & Database
- **Server:** Nitro (Nuxt API routes)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Email Services:** Nodemailer (SMTP)
- **Document Generation:** PDFKit / jsPDF for dynamic invoice generation

## ✨ Key Features

### Customer Storefront
- **Product Landing Page:** High-converting showcase featuring a Hero Section, Bento Box Key Features, and detailed Technical Specifications.
- **E-Commerce Engine:** Fully functional Shop page, Cart management, and dynamic Checkout system supporting multiple quantities and products.
- **Animated UI/UX:** Scroll-triggered Intersection Observer animations (fade, zoom), glassmorphism effects, and premium micro-interactions.
- **Smart Contact Routing:** Interactive Floating Action Button for WhatsApp that routes users to specific sales and technical support agents based on their needs.

### Admin Dashboard (Protected System)
- **Premium Dark Mode UI:** A bespoke "Apple Dark Mode" interface using `#000000` and `#1c1c1e` surfaces for a sleek, professional management experience.
- **Order Management:** View, verify, and complete orders. Features a smooth UI for uploading payment proofs and modifying order statuses.
- **Automated Workflows:** Automatic PDF Proforma Invoice generation and email dispatch upon checkout and order verification.
- **System Settings:** Dynamically update website configuration (e.g., store name, bank details, contact info) and toggle Maintenance Mode.
- **Activity Logging:** Comprehensive audit trails tracking admin logins, status changes, and settings modifications.
- **User Management:** Create, edit, and delete administrator accounts securely.

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- `pnpm` (Package manager)
- A running PostgreSQL database instance.

### 1. Installation
Clone the repository and install the dependencies:
```bash
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and configure the following required variables:
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/imani_shop"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRY="1d"

# SMTP Configuration (For sending invoices and status emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App URL
APP_URL="http://localhost:3000"
```

### 3. Database Migration
Ensure your database is running and apply the schema using Drizzle Kit (if configured in `package.json`):
```bash
pnpm db:push
# or execute your database migration strategy
```

### 4. Development Server
Start the development server on `http://localhost:3000`:
```bash
pnpm run dev
```

### 5. Production Build
Build the application for production:
```bash
pnpm run build
```
Preview the production build locally:
```bash
pnpm run preview
```

---
*Developed for PT Imani Prima.*
