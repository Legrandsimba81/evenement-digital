/*
  Warnings:

  - Added the required column `updatedAt` to the `Guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "gateSecret" TEXT,
ADD COLUMN     "invitationNumber" TEXT,
ADD COLUMN     "invitationType" TEXT;

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gateToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'en_attente';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
