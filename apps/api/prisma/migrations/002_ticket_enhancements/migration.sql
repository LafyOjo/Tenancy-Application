-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'accepted', 'declined');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "assignedToId" TEXT,
ADD COLUMN "assignmentStatus" "AssignmentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "eta" TIMESTAMP(3),
ADD COLUMN "partsCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "labourCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "rating" INTEGER,
ADD COLUMN "review" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
