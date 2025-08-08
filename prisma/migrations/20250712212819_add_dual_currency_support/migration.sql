/*
  Warnings:

  - You are about to drop the column `pricePerItems` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `priceInGrosz` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceInCents` to the `Product` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with temporary default values
ALTER TABLE "OrderItem" ADD COLUMN "priceInGrosz" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'PLN';
ALTER TABLE "Product" ADD COLUMN "priceInCents" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Copy data from old column to new column
UPDATE "OrderItem" SET "priceInGrosz" = "pricePerItems";

-- Step 3: Calculate EUR prices for products (approximate conversion: 1 EUR = 4.3 PLN)
UPDATE "Product" SET "priceInCents" = ROUND("priceInGrosz" / 4.3);

-- Step 4: Drop the old column
ALTER TABLE "OrderItem" DROP COLUMN "pricePerItems";

-- Step 5: Remove default values (make them required)
ALTER TABLE "OrderItem" ALTER COLUMN "priceInGrosz" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "priceInCents" DROP DEFAULT;
