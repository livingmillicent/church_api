ALTER TABLE contributions DROP CONSTRAINT "FK_d100de32b0aedd205c9d7a9c34c";
ALTER TABLE contributions ADD CONSTRAINT "FK_contributions_memberId_members" FOREIGN KEY ("memberId") REFERENCES members(id) ON DELETE CASCADE;
