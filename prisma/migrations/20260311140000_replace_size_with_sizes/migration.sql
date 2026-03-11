-- AlterTable: replace scalar size with sizes array
ALTER TABLE "Product" DROP COLUMN IF EXISTS "size";
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
