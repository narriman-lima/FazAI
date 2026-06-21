/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `PantryItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `PantryItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PantryItem" DROP COLUMN "expiresAt",
DROP COLUMN "unit",
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE TEXT;
