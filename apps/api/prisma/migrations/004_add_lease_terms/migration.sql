-- CreateEnum
CREATE TYPE "RentFrequency" AS ENUM ('weekly', 'monthly', 'yearly');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('draft', 'active', 'renewing', 'ended');

-- AlterTable
ALTER TABLE "Lease"
  ADD COLUMN "rentAmount" DOUBLE PRECISION NOT NULL,
  ADD COLUMN "rentFrequency" "RentFrequency" NOT NULL,
  ADD COLUMN "depositAmount" DOUBLE PRECISION,
  ADD COLUMN "utilityAllowances" JSONB,
  ADD COLUMN "autoRenew" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "breakClause" TEXT,
  ADD COLUMN "status" "LeaseStatus" NOT NULL DEFAULT 'draft';
