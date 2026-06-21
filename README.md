# TalentDash
3-Day Engineering Trial Task - Full Stack Development

## Getting Started

First, ensure you have the `.env` configured with the Neon PostgreSQL database URL.

```bash
# 1. Install dependencies
npm install

# 2. Sync database schema
npx prisma db push

# 3. Seed the database (creates 60+ realistic records and edge cases)
npx prisma db seed

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Decisions

### Rendering Strategies
- **Homepage (if applicable):** ISR (`revalidate: 3600`) - Changes daily (trending companies, recent salaries). Too dynamic for full static build.
- **Company Pages (`/companies/[slug]`):** Static with `generateStaticParams()` and ISR (`revalidate: 86400`). Company metadata changes rarely. Pre-built for every known company at build time for fast delivery, with ISR to catch updates.
- **Salary Table (`/salaries`):** Dynamic Server Component (React Server Component without explicit cache for user-specific search filters). Because of the multi-filter combinations, prebuilding all combinations is impossible.
- **Compare Page (`/compare`):** Client component fetching from an API. Selecting arbitrary records combinations dynamically cannot be pre-built easily and relies on highly specific user input.

### Pagination Strategy
We implemented **page-based pagination** rather than cursor-based for the `/api/salaries` API. The rationale:
- Salary viewers often want to jump across pages (e.g., jump to the middle of the dataset) which cursor-based pagination makes difficult.
- Offset pagination works well enough at the targeted MVP scale, especially since the `total_compensation` sort index mitigates some of the deep-offset query performance costs.
- The UX requirement explicitly requested "Showing 26–50 of 312 records" and "Previous/Next" with clear page counts.

### Data Normalisation & Database Integrity
We enforce data integrity strictly at the database level:
- Use of `BigInt` for all financial figures to avoid precision loss on large compensation packages (e.g., massive equity grants).
- Hard enum validation at the Prisma level (`L3`, `L4`, `SDE_I`, etc.) to prevent dirty data ingestion.
- `total_compensation` is **computed strictly server-side** on ingestion, never trusted from client payloads.
- Added a `48-hour` duplicate detection window on the ingestion pipeline to avoid duplicate scraping overlap.

### Scope & Trade-Offs under Time Pressure
- **Simplified GBP/EUR Currency Conversions:** The currency formatter handles dynamic INR/USD conversion, but GBP and EUR use a simplistic fallback for this MVP scope.
- **Client Component on `/compare`:** Due to rapid dynamic state interactions, the compare page leans heavily on client-side React. While SSR is generally preferred, the interactivity and real-time dropdown population justified a standard SPA approach here.
