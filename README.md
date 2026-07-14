# Imani Prima Shop

A modern, high-performance web application for showcasing and selling the ORBCOMM SC1000 device. Designed with an elegant, Apple-inspired light theme, focusing on clean aesthetics, responsive layouts, and a seamless user experience.

## Technologies

- Framework: Nuxt 3 (Vue 3)
- Styling: Tailwind CSS
- State Management: Nuxt Composables
- Image Optimization: @nuxt/image
- Notifications: SweetAlert2
- Icons: Heroicons
- Package Manager: pnpm

## Key Features

- Product Landing Page: High-converting showcase featuring a Hero Section, Bento Box Key Features, and detailed Technical Specifications.
- E-Commerce Engine: Fully functional Shop page, Cart management, and dynamic Checkout system supporting multiple quantities and products.
- Automated Invoice Generation: Dynamic, multi-product PDF invoice rendering with isolated print styling, automatic cart reset, and redirection logic.
- Smart Contact Routing: Interactive Floating Action Button for WhatsApp that routes users to specific sales and technical support agents based on their needs.
- Fully Responsive: Strictly optimized for mobile, tablet, and desktop environments ensuring zero layout shifts and high accessibility.

## UI/UX and Animations

- Apple Light Theme: Custom design system utilizing bespoke color palettes and native system typography for a premium, high-end feel.
- Scroll-Triggered Animations: Custom Intersection Observer implementation triggering seamless fade-up, fade-down, fade-right, and zoom-in effects as elements enter the viewport.
- Micro-Interactions: Smooth transition transforms, group-hover scaling on product cards and specification containers, and highly responsive button states.
- Glassmorphism: Advanced backdrop-blur effects applied to navigation and modal overlays to create depth and visual hierarchy.

## Development Setup

### Prerequisites

Ensure that Node.js and pnpm are installed on your machine.

### Installation

Install the project dependencies:
```bash
pnpm install
```

### Development Server

Start the development server on http://localhost:3000:
```bash
pnpm run dev
```

### Production Build

Build the application for production:
```bash
pnpm run build
```

Preview the production build locally:
```bash
pnpm run preview
```
