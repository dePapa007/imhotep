-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('nl', 'fr', 'en');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredLocale" "Locale" NOT NULL DEFAULT 'nl';
