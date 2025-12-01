-- CreateTable
CREATE TABLE "StoreConfig" (
    "id" TEXT NOT NULL,
    "whatsappPhone" TEXT NOT NULL DEFAULT '51999999999',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hola FiestasYa, quiero consultar por...',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreConfig_pkey" PRIMARY KEY ("id")
);
