/*
  Warnings:

  - Added the required column `min_read` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonce_for_earn` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "news" ADD COLUMN     "min_read" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "nonce_for_earn" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "user_claim_news" (
    "news_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "token_earned" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_claim_news_pkey" PRIMARY KEY ("news_id","user_id")
);

-- AddForeignKey
ALTER TABLE "user_claim_news" ADD CONSTRAINT "user_claim_news_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_claim_news" ADD CONSTRAINT "user_claim_news_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
