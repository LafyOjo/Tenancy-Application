-- AlterTable
ALTER TABLE "Property" ADD COLUMN "imageUrl" TEXT,
                           ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN "imageUrl" TEXT,
                     ADD COLUMN "deletedAt" TIMESTAMP(3);
