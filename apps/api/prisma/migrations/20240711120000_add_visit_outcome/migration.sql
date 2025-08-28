-- Add visit type and outcome tracking
CREATE TYPE "VisitType" AS ENUM ('inspection', 'engineer');

CREATE TYPE "VisitOutcome" AS ENUM ('completed', 'no_show', 'follow_up_required');

ALTER TABLE "Visit"
  ADD COLUMN     "type" "VisitType" NOT NULL DEFAULT 'inspection',
  ADD COLUMN     "outcome" "VisitOutcome",
  ADD COLUMN     "followUpAt" TIMESTAMP(3);

