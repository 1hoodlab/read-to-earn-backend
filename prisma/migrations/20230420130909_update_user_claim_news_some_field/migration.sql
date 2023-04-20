-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'success', 'failure');

-- AlterTable
ALTER TABLE "user_claim_news" ADD COLUMN     "status" "ClaimStatus" NOT NULL DEFAULT 'pending';
