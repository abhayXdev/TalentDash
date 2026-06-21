# TalentDash

TalentDash is a structured, comparable, and decision-ready career intelligence platform. It provides insights into software engineer compensation across top companies.

## Setup Instructions

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
# Neon PostgreSQL database URL
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"

# Base URL for API fetching (during local development)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Auto-populated by Vercel for the live site
NEXT_PUBLIC_VERCEL_URL=""
```

### Database Initialization & Seeding
We use Prisma with a PostgreSQL database (Neon).
To push the schema and seed the initial company and salary data, run:
```bash
npx prisma db push
npx prisma db seed
```

### Running Locally
```bash
npm install
npm run dev
```

## Architecture Decisions

1. **Framework**: Next.js 15 (App Router). Used for its superior Static Site Generation (SSG) capabilities to generate SEO-friendly static assets.
2. **Styling**: Tailwind CSS built completely from scratch without external UI component libraries to ensure performance and bundle size efficiency.
3. **Database & ORM**: PostgreSQL (hosted on Neon for serverless scale) interacted with via Prisma for type-safe database queries.
4. **Rendering Strategy**:
   - `generateStaticParams` for Company pages, allowing caching of static routes with ISR fallback for dynamic edge cases.
   - Dynamic API route fetching for search queries/comparisons ensuring instant data retrieval.
5. **Data Contract**: `total_compensation` is calculated programmatically (Base + Bonus + Stock) on data ingest, keeping the source-of-truth reliable.
6. **Deployments**: Intended for Edge and Vercel/Cloudflare Pages for near-zero infrastructure cost and infinite global scale.
