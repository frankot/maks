-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('SHOP', 'ORDERED', 'SOLD');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productStatus" "ProductStatus" NOT NULL DEFAULT 'SHOP';
