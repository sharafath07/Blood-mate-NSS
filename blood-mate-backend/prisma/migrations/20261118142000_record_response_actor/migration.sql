BEGIN;

ALTER TABLE "DonorResponse" ADD COLUMN "recordedBy" TEXT;

CREATE INDEX "DonorResponse_recordedBy_idx" ON "DonorResponse"("recordedBy");

ALTER TABLE "DonorResponse" ADD CONSTRAINT "DonorResponse_recordedBy_fkey"
FOREIGN KEY ("recordedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
