-- AlterTable
ALTER TABLE "user" ALTER COLUMN "nonce_auth_metamask" DROP DEFAULT,
ALTER COLUMN "nonce_auth_metamask" SET DATA TYPE TEXT;
