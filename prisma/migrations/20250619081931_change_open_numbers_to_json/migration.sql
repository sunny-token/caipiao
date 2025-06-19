/*
  Warnings:

  - Changed the type of `openNumbers` on the `LotteryResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- 清空表数据，避免类型变更报错
TRUNCATE TABLE "LotteryResult";

-- AlterTable
ALTER TABLE "LotteryResult" DROP COLUMN "openNumbers",
ADD COLUMN     "openNumbers" JSONB NOT NULL;
