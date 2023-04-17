-- AlterTable
ALTER TABLE "user" ADD COLUMN     "nonce_auth_metamask" INTEGER DEFAULT 0,
ALTER COLUMN "nonce_for_earn" DROP NOT NULL,
ALTER COLUMN "nonce_for_earn" SET DEFAULT 0;
