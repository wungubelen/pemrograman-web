/*
  Warnings:

  - Added the required column `bookingTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingTime" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Stylist" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
