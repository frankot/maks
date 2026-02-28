-- CreateTable
CREATE TABLE "FeaturedSection" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedSectionProduct" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "FeaturedSectionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedSection_slot_key" ON "FeaturedSection"("slot");

-- CreateIndex
CREATE INDEX "FeaturedSectionProduct_sectionId_idx" ON "FeaturedSectionProduct"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedSectionProduct_sectionId_productId_key" ON "FeaturedSectionProduct"("sectionId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedSectionProduct_sectionId_order_key" ON "FeaturedSectionProduct"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "FeaturedSectionProduct" ADD CONSTRAINT "FeaturedSectionProduct_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FeaturedSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedSectionProduct" ADD CONSTRAINT "FeaturedSectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
