
# 🛒 Marketplace Template - Built with Stellar + Supabase + Next.js

A **ready-to-use template** for building decentralized marketplaces powered by **Stellar**, **Supabase**, and **Next.js**. Designed by the team at **Scaffold Rust**, this template accelerates your journey from idea to production with a clean architecture, secure payment flows, and seamless blockchain integration.

---

## 🚀 What’s Inside?

This project integrates three powerful technologies to build a full-stack Web3 marketplace:

| Layer          | Tech Stack        | Purpose |
|----------------|-------------------|---------|
| **Frontend**   | `Next.js`         | Modern React-based frontend with SSR & API routes |
| **Backend**    | `Supabase`        | Auth, database, and instant APIs for user & product management |
| **Blockchain** | `Stellar`         | Fast, low-fee smart payments with asset support |

---

## 🧱 Architecture Overview

```mermaid
flowchart TD
    A[User] --> B[Next.js Frontend]
    B --> C[Supabase Auth + DB]
    B --> D[Stellar Wallet Interaction]
    D --> E[Smart Payments on Stellar]
    C --> F[Marketplace Logic (Products, Orders, Ratings)]
````

---

## 📦 Features

* ✅ **Web3-Ready**: Accept and send Stellar assets like USDC and XLM with simple integration.
* 🔐 **Supabase Auth**: Email/password and OAuth-ready for secure user onboarding.
* 📊 **PostgreSQL with RLS**: Fine-grained row-level permissions and real-time updates.
* 🧾 **Listings & Orders**: Add products, manage orders, and handle disputes out-of-the-box.
* 📱 **Responsive UI**: Built with TailwindCSS, optimized for desktop and mobile.
* 🛠️ **Developer First**: Fully open-source, modular codebase, TypeScript everywhere.

---

## 🧪 Live Demo

Try the live version here → [marketplace.scaffoldrust.dev](https://marketplace.scaffoldrust.dev)

[coming soon]

---

## 🛠️ Getting Started

```bash
git clone https://github.com/ScaffoldRust/SRust-Marketplace.git
cd SRust-Marketplace
cp .env.example .env
bun install
bun run dev
```

### Environment Variables

| Variable                      | Description               |
| ----------------------------- | ------------------------- |
| `SUPABASE_URL`                | Supabase project URL      |
| `SUPABASE_ANON_KEY`           | Public Supabase API key   |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Testnet or Mainnet        |
| `WALLET_CONNECT_URL`          | Wallet connection handler |

> ℹ️ See `.env.example` for full list

---

## 💳 Stellar Integration

This template uses **Stellar SDK** to:

* Create new trustlines and issue assets
* Build and submit payment operations
* Interact with wallet providers (e.g., Freighter, Albedo)

All Stellar-related logic is abstracted inside:

```ts
/lib/stellar/
  wallet.ts      // Handle wallet connections
  payments.ts    // Build/send operations
  assets.ts      // Trustlines and asset utilities
```

---

## 🧰 Supabase Integration

Supabase handles:

* 👥 **Users**: Auth and metadata
* 🗃 **Marketplace Data**: Listings, Orders, Ratings
* 🔐 **Policies**: Custom RLS rules for secure multi-tenant logic

You can manage all resources from the [Supabase Dashboard](https://app.supabase.com).

---

## 🪄 Folder Structure

```bash
📦 marketplace-template
├── pages/           # Next.js pages and API routes
├── lib/             # Blockchain + Supabase logic
├── components/      # Reusable UI components
├── supabase/        # SQL policies, initial seed data
├── public/          # Static assets
└── styles/          # Tailwind and custom CSS
```

---

## 🎯 Ideal Use Cases

* Creator marketplaces (digital goods, NFTs, music)
* B2B vendor platforms with crypto settlements
* Emergency aid or resource distribution tools
* Web2.5 startups bridging fiat and crypto

---

## 📸 Screenshots [coming soon]

![Home Page](https://user-images.githubusercontent.com/123456/homepage-preview.png)
*Clean, responsive layout with customizable branding.*

![Wallet Flow](https://user-images.githubusercontent.com/123456/wallet-preview.png)
*Secure Stellar payments integrated seamlessly.*

---

## 🙌 Credits & Attribution

Made with ❤️ by [**Scaffold Rust**](https://scaffoldrust.dev)
If you use this template, **we kindly ask you to give us a shoutout!**
Here’s a suggestion:

```markdown
> This project was built using the [Marketplace Template by Scaffold Rust](https://github.com/scaffold-rust/stellar-marketplace-template) 🛠✨
```

Or go wild and add us with a pixel-art goat, ASCII rocket, or haiku. We love creativity.

---

## 📬 Contact Us

Have questions, ideas, or want to contribute?

* GitHub: [@ScaffoldRust](https://github.com/ScaffoldRust)

---

## 📝 License

MIT — free to use, modify, and build on.

