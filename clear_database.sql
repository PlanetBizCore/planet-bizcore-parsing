-- Database Cleanup Script for Fresh Start with Hierarchical Topics
-- Run this in Supabase SQL Editor to clear existing data and prepare for enhanced testing

-- WARNING: This will delete all processed documents and related data
-- Ensure you have backups if needed

-- Clear document processing data (cascade will handle related records)
-- Note: document_processing_status is a view, so we don't delete from it directly
DELETE FROM sections WHERE 1=1;
DELETE FROM documents WHERE 1=1;

-- Clear any existing hierarchical topics data (only if tables exist)
-- Use DO blocks to conditionally delete only if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_topic_associations') THEN
        DELETE FROM document_topic_associations WHERE 1=1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_hierarchy_paths') THEN
        DELETE FROM topic_hierarchy_paths WHERE 1=1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_topics') THEN
        DELETE FROM knowledge_topics WHERE 1=1;
    END IF;
END $$;

-- Reset any sequences (optional, keeps IDs starting fresh)
-- This is safe and doesn't affect structure
SELECT setval(pg_get_serial_sequence('documents', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('sections', 'id'), 1, false);

-- Verify cleanup - show current state
SELECT 'documents' as table_name, COUNT(*) as remaining_records FROM documents
UNION ALL
SELECT 'sections' as table_name, COUNT(*) as remaining_records FROM sections;

-- Try to check hierarchical tables (will show status if tables exist or not)
DO $$
DECLARE
    knowledge_topics_count text;
    doc_topic_assoc_count text;
BEGIN
    -- Check knowledge_topics table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_topics') THEN
        SELECT COUNT(*)::text INTO knowledge_topics_count FROM knowledge_topics;
    ELSE
        knowledge_topics_count := 'table not created yet';
    END IF;
    
    -- Check document_topic_associations table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_topic_associations') THEN
        SELECT COUNT(*)::text INTO doc_topic_assoc_count FROM document_topic_associations;
    ELSE
        doc_topic_assoc_count := 'table not created yet';
    END IF;
    
    -- Display results
    RAISE NOTICE 'knowledge_topics: %', knowledge_topics_count;
    RAISE NOTICE 'document_topic_associations: %', doc_topic_assoc_count;
END $$;

-- Display success message
SELECT '🎉 Database cleaned successfully! Ready for fresh document uploads with enhanced hierarchical topic extraction.' as cleanup_status;
