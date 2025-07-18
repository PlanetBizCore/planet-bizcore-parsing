-- Troubleshooting Script: Check Database State and Force Clear
-- Run this in Supabase SQL Editor to diagnose and fix the cleanup issue

-- First, let's see what tables actually exist and what's in them
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('documents', 'sections', 'document_processing_status')
ORDER BY tablename;

-- Check current record counts in all relevant tables
SELECT 'documents' as table_name, COUNT(*) as record_count FROM documents
UNION ALL
SELECT 'sections' as table_name, COUNT(*) as record_count FROM sections;

-- Let's see the actual table structure for documents
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any foreign key constraints that might be preventing deletion
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'documents' OR tc.table_name = 'sections');

-- Try a more aggressive cleanup approach
-- Delete sections first (they likely reference documents)
DELETE FROM sections;

-- Then delete documents
DELETE FROM documents;

-- Check counts again after forced deletion
SELECT 'documents_after_delete' as table_name, COUNT(*) as record_count FROM documents
UNION ALL
SELECT 'sections_after_delete' as table_name, COUNT(*) as record_count FROM sections;

-- If records still exist, let's see what's actually in there
SELECT id, filename, created_at FROM documents LIMIT 5;
SELECT id, document_id, title FROM sections LIMIT 5;
