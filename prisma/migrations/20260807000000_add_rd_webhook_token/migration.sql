-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "rdWebhookToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_rdWebhookToken_key" ON "Users"("rdWebhookToken");
