-- AlterTable
ALTER TABLE "Unit" ADD COLUMN "virtualTourEmbedUrl" TEXT,
                      ADD COLUMN "virtualTourImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
