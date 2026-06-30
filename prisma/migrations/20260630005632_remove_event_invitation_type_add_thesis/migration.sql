/*
  Warnings:

  - You are about to drop the column `invitationType` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "invitationType",
ADD COLUMN     "thesisTitle" TEXT;
