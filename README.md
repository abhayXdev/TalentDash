<div align="center">
  <h1>🚀 TalentDash</h1>
  <p><strong>A Structured, Comparable, and Decision-Ready Career Intelligence Platform</strong></p>
</div>

---

## 📖 Overview

TalentDash is an advanced career intelligence platform designed to democratize compensation data for software engineers. By aggregating, validating, and structuring compensation insights across top-tier technology companies, TalentDash empowers professionals to make informed, data-driven career decisions.

## ✨ Key Features

- **Standardized Compensation Metrics**: Automatically calculates and verifies total compensation (Base + Bonus + Equity) for accurate, apples-to-apples comparisons.
- **Instant Search & Filtering**: Lightning-fast API routes for querying specific roles, levels, and geographic locations.
- **SEO-Optimized Static Pages**: Company profiles are pre-rendered at build time with ISR (Incremental Static Regeneration) for unparalleled performance and search engine visibility.
- **Responsive & Accessible UI**: A fully custom-built Tailwind CSS interface designed from the ground up to ensure minimal bundle size and maximum responsiveness.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Serverless via [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Deployment**: Optimized for Vercel / Cloudflare Pages Edge infrastructure

## 🚀 Getting Started

Follow these instructions to set up the project locally.

## Environment Variables
Copy `.env.example` to `.env` and fill in your values:
- `DATABASE_URL` — Neon PostgreSQL connection string (found in your Neon dashboard)
- `UPSTASH_REDIS_REST_URL` — Upstash Redis REST URL (optional, rate limiting only)
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis token (optional, rate limiting only)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/talent-dash.git
cd talent-dash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and configure the required environment variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"

# Application URLs
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_VERCEL_URL=""
```
*(Note: Keep your database credentials secure. Never commit your `.env` file to version control.)*

### 3. Database Initialization & Seeding

We utilize Prisma to manage our PostgreSQL schema. To initialize the database and populate it with initial data, run:

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture & Engineering Decisions

1. **Next.js App Router**: Chosen for its superior Static Site Generation (SSG) capabilities, enabling fast, SEO-friendly static asset generation.
2. **Custom Tailwind CSS**: Built completely from scratch without external component libraries to enforce strict performance budgets and reduce bundle size.
3. **Database Architecture**: PostgreSQL hosted on Neon provides serverless scalability, interfaced via Prisma to guarantee type-safe database queries and migrations.
4. **Rendering Strategy**:
   - `generateStaticParams` handles Company pages, utilizing aggressive caching with ISR fallback for dynamic edge cases.
   - Real-time API route fetching handles complex search queries and comparisons, ensuring instant data retrieval.
5. **Data Integrity**: The `total_compensation` metric is strictly calculated programmatically upon data ingestion, maintaining a highly reliable source-of-truth.
