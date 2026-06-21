-- CreateEnum
CREATE TYPE "Level" AS ENUM ('L3', 'L4', 'L5', 'L6', 'SDE_I', 'SDE_II', 'SDE_III', 'STAFF', 'PRINCIPAL', 'IC4', 'IC5');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'GBP', 'EUR');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('CONTRIBUTOR', 'SCRAPED', 'AI_INFERRED');

-- CreateEnum
CREATE TYPE "ReviewRating" AS ENUM ('TERRIBLE', 'POOR', 'AVERAGE', 'GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "InterviewResult" AS ENUM ('OFFER', 'REJECT', 'WITHDREW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalarySubmission" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "user_id" TEXT,
    "level" "Level" NOT NULL,
    "location" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "experience_years" DOUBLE PRECISION NOT NULL,
    "company_tenure" DOUBLE PRECISION,
    "base_salary" BIGINT NOT NULL,
    "bonus" BIGINT NOT NULL DEFAULT 0,
    "stock" BIGINT NOT NULL DEFAULT 0,
    "signing_bonus" BIGINT NOT NULL DEFAULT 0,
    "total_compensation" BIGINT NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'CONTRIBUTOR',
    "confidence_score" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalarySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT,
    "rating" "ReviewRating" NOT NULL,
    "title" TEXT NOT NULL,
    "pros" TEXT NOT NULL,
    "cons" TEXT NOT NULL,
    "advice_to_mgmt" TEXT,
    "is_current_emp" BOOLEAN NOT NULL,
    "employment_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "user_id" TEXT,
    "difficulty" INTEGER NOT NULL,
    "process_length" INTEGER,
    "result" "InterviewResult" NOT NULL,
    "experience_desc" TEXT NOT NULL,
    "questions" TEXT,
    "offer_amount" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_normalized_name_key" ON "Company"("normalized_name");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Company_normalized_name_idx" ON "Company"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_category_idx" ON "Role"("category");

-- CreateIndex
CREATE INDEX "SalarySubmission_company_id_level_location_idx" ON "SalarySubmission"("company_id", "level", "location");

-- CreateIndex
CREATE INDEX "SalarySubmission_total_compensation_idx" ON "SalarySubmission"("total_compensation" DESC);

-- CreateIndex
CREATE INDEX "SalarySubmission_company_id_total_compensation_idx" ON "SalarySubmission"("company_id", "total_compensation" DESC);

-- CreateIndex
CREATE INDEX "SalarySubmission_location_role_id_idx" ON "SalarySubmission"("location", "role_id");

-- CreateIndex
CREATE INDEX "SalarySubmission_submitted_at_idx" ON "SalarySubmission"("submitted_at" DESC);

-- CreateIndex
CREATE INDEX "Review_company_id_created_at_idx" ON "Review"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Interview_company_id_role_id_idx" ON "Interview"("company_id", "role_id");

-- CreateIndex
CREATE INDEX "Interview_created_at_idx" ON "Interview"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "SalarySubmission" ADD CONSTRAINT "SalarySubmission_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySubmission" ADD CONSTRAINT "SalarySubmission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySubmission" ADD CONSTRAINT "SalarySubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
