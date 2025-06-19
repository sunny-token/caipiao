-- CreateTable
CREATE TABLE "LotteryResult" (
    "id" SERIAL NOT NULL,
    "issueNumber" TEXT NOT NULL,
    "openDate" TEXT NOT NULL,
    "openNumbers" TEXT NOT NULL,
    "ballOrder" TEXT NOT NULL,
    "totalBet" TEXT NOT NULL,
    "jackpot" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryResult_pkey" PRIMARY KEY ("id")
);
