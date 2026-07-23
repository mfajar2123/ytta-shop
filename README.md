# Imani Prima Shop Architecture & Documentation

## Overview

Imani Prima Shop is a high-performance E-Commerce platform and administrative dashboard engineered specifically for showcasing and managing the sales lifecycle of the ORBCOMM SC1000 device. 

The architecture is divided into two primary interfaces: a customer-facing portal designed with an Apple-inspired light theme to ensure clean aesthetics and optimal conversion rates, and a protected administrative dashboard utilizing a native dark mode UI. The system is built to facilitate seamless order management, dynamic system configuration, and comprehensive customer data administration.

## Technology Stack

The application leverages a modern, decoupled architecture to ensure scalability, security, and maintainability.

### Frontend Application
- **Core Framework:** Nuxt 4 (Vue 3)
- **Styling Engine:** Tailwind CSS v4
- **Component Library:** Nuxt UI v4 (@nuxt/ui)
- **Iconography:** Heroicons & Lucide Icons
- **State & Notifications:** Vue Composables, SweetAlert2
- **Typography:** Custom Web Fonts (El Messiri, Raleway)

### Backend Services & Infrastructure
- **API Gateway & Server:** Nitro (Nuxt API routes)
- **Database System:** PostgreSQL
- **Object-Relational Mapping (ORM):** Drizzle ORM
- **Authentication & Security:** JSON Web Tokens (JWT) with bcrypt password hashing
- **Communication:** Nodemailer (SMTP Integration)
- **Document Rendering:** PDFKit / jsPDF for dynamic invoice generation

## Core System Capabilities

### Customer-Facing Portal
- **Showcase & Conversion:** A highly optimized landing page featuring a Hero Section, Bento Box feature presentation, and detailed Technical Specifications.
- **E-Commerce Engine:** A fully integrated Shop module featuring stateful Cart management and a dynamic Checkout system capable of handling multiple product variants and quantities.
- **Interactive UI/UX:** Advanced intersection observer implementations for scroll-triggered animations (fade, zoom), glassmorphism layering, and optimized micro-interactions.
- **Intelligent Routing:** A contextual Floating Action Button (FAB) for WhatsApp that routes inquiries directly to specific sales or technical support agents based on user selection.

### Administrative Dashboard (Protected System)
- **Command Center Interface:** A bespoke dark mode administrative interface utilizing `#000000` and `#1c1c1e` surfaces to minimize eye strain and improve data readability.
- **Order Lifecycle Management:** A streamlined module to view, verify, and complete incoming orders, featuring asynchronous payment proof uploads and status mutation workflows.
- **Automated Workflows:** Event-driven generation of PDF Proforma Invoices and automated SMTP email dispatch upon successful checkout and administrative verification.
- **Dynamic System Configuration:** Real-time mutation of global website settings (e.g., store nomenclature, financial credentials, contact endpoints) and Maintenance Mode toggles.
- **Audit & Compliance:** Comprehensive activity logging mechanisms tracking administrative authentication events, status modifications, and configuration changes.
- **Access Control:** Secure user management allowing the creation, modification, and revocation of administrative privileges.

## Development Environment Setup

The following instructions outline the procedure for provisioning a local development environment.

### Prerequisites
- Node.js (v18.x or higher recommended)
- `pnpm` (Package Manager)
- A running PostgreSQL database instance

### 1. Dependency Installation
Clone the repository and initialize the project dependencies:
```bash
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the project root directory and define the following environment variables:
```env
# Database Credentials
DATABASE_URL="postgresql://user:password@localhost:5432/imani_shop"

# Authentication Security
JWT_SECRET="your-secure-jwt-key"
JWT_EXPIRY="1d"

# SMTP Service Configuration (Required for transactional emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application Endpoint
APP_URL="http://localhost:3000"
```

### 3. Database Migration
Ensure the PostgreSQL instance is accessible and apply the latest schema definitions via Drizzle Kit:
```bash
pnpm db:push
```
*(Alternatively, execute the specific database migration strategy defined for this project).*

### 4. Service Initialization
Start the local development server:
```bash
pnpm run dev
```
The application will be accessible at `http://localhost:3000`.

### 5. Production Build Deployment
To compile the application for a production environment:
```bash
pnpm run build
```
To preview the compiled production artifact locally:
```bash
pnpm run preview
```

---
*Proprietary software developed for PT Imani Prima.*
