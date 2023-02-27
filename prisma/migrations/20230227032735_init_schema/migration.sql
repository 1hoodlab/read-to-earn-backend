-- CreateEnum
CREATE TYPE "Role" AS ENUM ('writer', 'reader');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "token_expiry_date" TIMESTAMP(6),
    "verify_email_token" VARCHAR,
    "reset_password_token" VARCHAR,
    "auth_email_google" VARCHAR,
    "auth_metamask_wallet" VARCHAR,
    "time_send_token" TIMESTAMP(6),
    "role" "Role" NOT NULL DEFAULT 'reader',
    "stars" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_token" (
    "id" SERIAL NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_times" INTEGER,
    "access_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_email_google_key" ON "user"("auth_email_google");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_metamask_wallet_key" ON "user"("auth_metamask_wallet");

-- CreateIndex
CREATE UNIQUE INDEX "user_token_user_id_key" ON "user_token"("user_id");

-- AddForeignKey
ALTER TABLE "user_token" ADD CONSTRAINT "user_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
