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

## 🏗️ Architecture Decisions

### 1. Rendering Strategy (Static vs ISR vs Dynamic)
- **Company Pages (`/companies/[slug]`)**: Use **Static Generation with ISR** (`generateStaticParams`). Company profiles are read-heavy, highly cacheable, and crucial for SEO. We query the database at build time to statically generate these pages. ISR ensures that if new companies are added or existing records are updated, the page revalidates in the background without requiring a full rebuild.
- **Salaries Page (`/salaries`)**: Uses **ISR** (Incremental Static Regeneration) with a 5-minute revalidation window. Since it relies heavily on query parameters (filters) and is the most frequently accessed page for live data, making it fully dynamic would hammer the database. ISR provides a healthy balance—serving fast cached responses while updating shortly after a new salary is submitted.
- **Home Page (`/`)**: Uses **ISR**. The homepage aggregates top companies and recent insights, which don't need real-time freshness but should stay up-to-date daily or hourly.
- **Compare Page (`/compare`)**: **Dynamic**. It handles complex, arbitrary query parameters (e.g., comparing any two companies/roles) that are impossible to pre-compute statically.

### 2. Caching TTLs
- **`GET /api/salaries`** (`s-maxage=300, stale-while-revalidate=3600`): Salary data changes frequently as users submit new records. A 5-minute CDN cache (`s-maxage=300`) protects the database from traffic spikes (e.g., a viral post), while `stale-while-revalidate` ensures users get an instant response while the CDN fetches fresh data in the background.
- **`GET /api/companies/:slug`** (`s-maxage=3600, stale-while-revalidate=86400`): Company aggregates change much slower than individual salary records. A 1-hour cache is safe and ensures maximum edge performance, with a full 24-hour window to serve stale data if the origin experiences downtime.

### 3. Pagination Strategy (Page-Based)
We implemented **Page-Based** (Offset) Pagination rather than Cursor-Based. 
- **Why**: Salary data is frequently filtered by multiple dimensions (role, level, location, company) and users often want to jump to a specific page or see the total number of pages. Offset pagination works seamlessly with complex `WHERE` and `ORDER BY` clauses across varied columns (e.g., sorting by total compensation). Cursor-based pagination is more performant for infinite-scroll feeds sorted sequentially by ID or timestamp, but it becomes overly complex and brittle when dealing with highly dynamic, multi-column sorting and filtering.

### 4. What We Would Build Differently With Another Day
- **Authentication & Verified Profiles**: Add NextAuth to allow users to create accounts, verify their employment via work email, and earn a "Verified" badge on their salary submissions.
- **Advanced Data Visualizations**: Integrate a charting library (like Recharts) to plot salary bands over time or display scatter plots of base salary vs. equity for different levels.
- **Redis Caching for Expensive Aggregates**: While CDN caching handles API routes, we would use Upstash Redis to cache expensive database aggregates (e.g., median comp calculation) directly within the Server Components.

### 5. What We Did NOT Build and Why
- **Cursor-Based Pagination**: Skipped due to its incompatibility with arbitrary multi-column sorting without significant architectural overhead.
- **Real-Time WebSockets**: There is no business need for users to see a salary pop up the millisecond it's submitted. ISR provides "near real-time" freshness without the immense infrastructure cost of WebSockets.
- **Complex Full-Text Search Engine**: Skipped Elasticsearch or Algolia in favor of Postgres' built-in `contains` and `mode: 'insensitive'` filtering. Under current scale requirements, Postgres handles these queries perfectly, avoiding the complexity of syncing data to a secondary search index.
