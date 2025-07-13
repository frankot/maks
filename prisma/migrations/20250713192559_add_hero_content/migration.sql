-- CreateTable
CREATE TABLE "HeroContent" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imagePaths" TEXT[],
    "href" TEXT,
    "textHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroContent_pkey" PRIMARY KEY ("id")
);
