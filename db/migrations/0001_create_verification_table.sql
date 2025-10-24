-- SPDX-FileCopyrightText: 2014-present Kriasoft
-- SPDX-License-Identifier: MIT

-- Create verification table for OTP codes and email verification tokens
-- Used by Better Auth for email verification and OTP authentication

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by identifier
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification"("identifier");

-- Create index for faster cleanup of expired codes
CREATE INDEX IF NOT EXISTS "idx_verification_expires_at" ON "verification"("expires_at");

-- Add unique constraint on identifier to ensure one active code per email
-- This allows ON CONFLICT handling in the application
ALTER TABLE "verification" ADD CONSTRAINT IF NOT EXISTS "unique_verification_identifier" UNIQUE ("identifier");
