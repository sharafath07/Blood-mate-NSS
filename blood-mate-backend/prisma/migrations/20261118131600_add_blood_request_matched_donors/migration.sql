BEGIN;

CREATE TABLE "_BloodRequestMatchedDonors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BloodRequestMatchedDonors_AB_pkey" PRIMARY KEY ("A", "B")
);

CREATE INDEX "_BloodRequestMatchedDonors_B_index" ON "_BloodRequestMatchedDonors"("B");

ALTER TABLE "_BloodRequestMatchedDonors"
ADD CONSTRAINT "_BloodRequestMatchedDonors_A_fkey"
FOREIGN KEY ("A") REFERENCES "BloodRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_BloodRequestMatchedDonors"
ADD CONSTRAINT "_BloodRequestMatchedDonors_B_fkey"
FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match existing requests using the same eligibility rules as new requests.
INSERT INTO "_BloodRequestMatchedDonors" ("A", "B")
SELECT request."id", student."id"
FROM "BloodRequest" AS request
JOIN "Student" AS student ON student."bloodGroup" = request."bloodGroup"
WHERE student."willingToDonate"
  AND student."isDonor"
  AND student."donorStatus" = 'AVAILABLE';

COMMIT;
