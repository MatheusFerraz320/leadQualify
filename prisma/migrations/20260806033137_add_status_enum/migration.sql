/*
  Warnings:

  - You are about to drop the column `Finality` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `Product` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `finality` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "Finality",
DROP COLUMN "Product",
ADD COLUMN     "finality" TEXT NOT NULL,
ADD COLUMN     "product" TEXT NOT NULL,
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'PENDING';
