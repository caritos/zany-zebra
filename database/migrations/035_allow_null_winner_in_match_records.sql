-- Migration: Allow null winners for tied matches in amateur tennis
-- Date: 2025-09-25
-- Description: Remove NOT NULL constraint from winner column to support tied matches

-- Allow null winners for tied matches in amateur tennis
ALTER TABLE public.match_records ALTER COLUMN winner DROP NOT NULL;