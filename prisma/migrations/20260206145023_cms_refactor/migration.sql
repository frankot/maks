/*
  Warnings:

  - You are about to drop the column `categoryId` on the `GalleryImage` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `GalleryImage` table. All the data in the column will be lost.
  - You are about to drop the column `href` on the `HeroContent` table. All the data in the column will be lost.
  - You are about to drop the column `textHref` on the `HeroContent` table. All the data in the column will be lost.
  - You are about to drop the `GalleryCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `artistId` to the `GalleryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `GalleryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rowId` to the `GalleryImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GalleryLayout" AS ENUM ('THREE_COL', 'FIVE_COL');

-- DropForeignKey
ALTER TABLE "GalleryImage" DROP CONSTRAINT "GalleryImage_categoryId_fkey";

-- AlterTable
ALTER TABLE "GalleryImage" DROP COLUMN "categoryId",
DROP COLUMN "name",
ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "rowId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HeroContent" DROP COLUMN "href",
DROP COLUMN "textHref";

-- DropTable
DROP TABLE "GalleryCategory";

-- CreateTable
CREATE TABLE "PhotoArtist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryRow" (
    "id" TEXT NOT NULL,
    "layout" "GalleryLayout" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarqueeContent" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT,
    "textHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarqueeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavCarouselContent" (
    "id" TEXT NOT NULL,
    "texts" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavCarouselContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoArtist_name_key" ON "PhotoArtist"("name");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "PhotoArtist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "GalleryRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
