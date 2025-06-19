/*
  Warnings:

  - A unique constraint covering the columns `[issueNumber]` on the table `LotteryResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LotteryResult_issueNumber_key" ON "LotteryResult"("issueNumber");
