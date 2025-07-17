-- Clear all previous upload data from PBC Parsing App
-- Run this in your Supabase SQL Editor

-- Clear sections table first (due to foreign key constraints)
DELETE FROM sections;

-- Clear documents table
DELETE FROM documents;

-- If you have the new tables, clear them too:
DELETE FROM planet_bizcore_intelligence WHERE id IS NOT NULL;
DELETE FROM client_organizations WHERE id IS NOT NULL;

-- Reset sequences if needed
ALTER SEQUENCE IF EXISTS documents_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sections_id_seq RESTART WITH 1;

-- Verify deletion
SELECT 'documents' as table_name, COUNT(*) as remaining_rows FROM documents
UNION ALL
SELECT 'sections' as table_name, COUNT(*) as remaining_rows FROM sections
UNION ALL
SELECT 'planet_bizcore_intelligence' as table_name, COUNT(*) as remaining_rows FROM planet_bizcore_intelligence
UNION ALL
SELECT 'client_organizations' as table_name, COUNT(*) as remaining_rows FROM client_organizations;
