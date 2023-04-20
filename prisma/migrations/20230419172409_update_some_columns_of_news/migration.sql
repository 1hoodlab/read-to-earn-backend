/*
  Warnings:

  - Added the required column `slug` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_id` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "news" ADD COLUMN     "payment_token" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "token_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "wallet_address" VARCHAR;
