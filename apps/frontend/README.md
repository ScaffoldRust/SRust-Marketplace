# SRust Marketplace Frontend

## 🚀 Overview

The SRust Marketplace frontend is a modern, SEO-optimized Next.js application that serves as the user interface for our blockchain-powered marketplace. Built with Next.js 15, TypeScript, and TailwindCSS, it provides a seamless shopping experience for digital goods and crypto merchandise.

[![SRust Marketplace Demo](https://img.youtube.com/vi/NqV-F3Kig_Y/0.jpg)](https://www.youtube.com/watch?v=NqV-F3Kig_Y)

*Click the image above to watch the demo video*

## ✨ Features

- **Modern UI/UX** - Clean, responsive design with smooth animations and transitions
- **SEO Optimized** - Comprehensive metadata, structured data, and social media tags
- **Product Showcase** - Dynamic product listings with detailed descriptions and images
- **User Authentication** - Secure login and registration flow
- **Profile Management** - User dashboard with order history and settings
- **Marketplace Navigation** - Intuitive category filtering and search functionality
- **Blockchain Integration** - Seamless connection with Stellar blockchain for payments
- **Responsive Design** - Optimized for all device sizes from mobile to desktop

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Build Tool**: Bun
- **SEO**: Next.js Metadata API, JSON-LD Structured Data

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1. Clone the repository (if not already done):
```bash
git clone https://github.com/ScaffoldRust/SRust-Marketplace.git
cd SRust-Marketplace/apps/frontend
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── components/       # Shared components
│   ├── marketplace/      # Marketplace pages and components
│   ├── profile/          # User profile pages and components
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Homepage
├── lib/                  # Utility functions and hooks
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## 📝 Environment Variables

| Variable                   | Description                               | Required |
|----------------------------|-------------------------------------------|----------|
| `NEXT_PUBLIC_APP_URL`      | Base URL for the application              | Yes      |
| `NEXT_PUBLIC_API_URL`      | API endpoint URL                          | Yes      |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Stellar network (testnet/mainnet)      | Yes      |

## 🧪 Building for Production

```bash
bun run build
```

The build output will be generated in the `.next` directory.

## 🔍 SEO Features

The frontend includes comprehensive SEO optimizations:

- **Metadata** - Complete metadata for all pages using Next.js Metadata API
- **Structured Data** - JSON-LD implementation for products, website, and organization
- **Open Graph** - Rich social media sharing cards
- **Twitter Cards** - Enhanced Twitter sharing experience
- **Canonical URLs** - Proper URL structure for search engines
- **Robots Directives** - Appropriate crawling instructions

## 🧩 Component Library

The frontend includes a rich set of reusable components:

- Product cards and listings
- Navigation components
- Form elements
- Modal dialogs
- Loading states and skeletons
- Structured data components

## 📱 Responsive Design

The UI is fully responsive and tested across multiple device sizes:

- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large Desktop (1280px+)

## 🔒 Security

- Input validation and sanitization
- Protected routes for authenticated users
- Secure API communication
- Environment variable protection
