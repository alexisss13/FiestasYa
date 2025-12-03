-- AlterTable
ALTER TABLE "StoreConfig" ADD COLUMN     "heroButtonLink" TEXT NOT NULL DEFAULT '/search?q=',
ADD COLUMN     "heroButtonText" TEXT NOT NULL DEFAULT 'Ver Productos',
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "heroSubtitle" TEXT NOT NULL DEFAULT 'Todo para tu fiesta en un solo lugar',
ADD COLUMN     "heroTitle" TEXT NOT NULL DEFAULT 'Celebra a lo Grande';

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
