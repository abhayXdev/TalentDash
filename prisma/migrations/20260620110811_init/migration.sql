-- CreateEnum
CREATE TYPE "Level" AS ENUM ('ENTRY', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'INR', 'CAD');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('VERIFIED', 'UNVERIFIED', 'EXTERNAL');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "industry" TEXT,
    "headquarters" TEXT,
    "founded_year" INTEGER,
    "headcount_range" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "location" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "experience_years" DOUBLE PRECISION NOT NULL,
    "base_salary" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "total_compensation" INTEGER NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'UNVERIFIED',
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "company_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Salary_company_id_level_location_idx" ON "Salary"("company_id", "level", "location");

-- CreateIndex
CREATE INDEX "Salary_total_compensation_idx" ON "Salary"("total_compensation");

-- CreateIndex
CREATE INDEX "Salary_submitted_at_idx" ON "Salary"("submitted_at");

-- CreateIndex
CREATE INDEX "Salary_location_level_idx" ON "Salary"("location", "level");

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
