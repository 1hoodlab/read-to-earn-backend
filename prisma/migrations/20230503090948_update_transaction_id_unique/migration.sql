/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `user_claim_news` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_claim_news_transaction_id_key" ON "user_claim_news"("transaction_id");
