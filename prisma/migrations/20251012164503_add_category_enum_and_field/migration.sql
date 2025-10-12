-- CreateEnum
CREATE TYPE "Category" AS ENUM ('NECKLACES', 'RINGS', 'EARRINGS');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'RINGS';
