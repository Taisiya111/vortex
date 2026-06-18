-- AlterTable
ALTER TABLE "games" ADD COLUMN "priceMin" DOUBLE PRECISION;
ALTER TABLE "games" ADD COLUMN "priceMax" DOUBLE PRECISION;

-- Migrate existing single price into the range (min = max = old price)
UPDATE "games" SET "priceMin" = "price", "priceMax" = "price" WHERE "price" IS NOT NULL;

-- DropColumn
ALTER TABLE "games" DROP COLUMN "price";
