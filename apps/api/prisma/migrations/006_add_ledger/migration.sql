CREATE TABLE "LedgerEntry" (
  "id" TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "leaseId" TEXT REFERENCES "Lease"("id") ON DELETE SET NULL,
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "description" TEXT,
  "debitAccount" TEXT NOT NULL,
  "creditAccount" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL
);
