-- Complete Database Reset: Drop and Recreate All Tables
-- This will give us a completely fresh start with the enhanced schema

-- WARNING: This will completely remove all tables and data
-- Only run this if you're sure you want to start completely fresh

-- Drop all existing tables (this will cascade and remove all data)
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS document_processing_status CASCADE;
DROP TABLE IF EXISTS agent_knowledge_base CASCADE;
DROP TABLE IF EXISTS cross_references CASCADE;
DROP TABLE IF EXISTS document_lineage CASCADE;
DROP TABLE IF EXISTS parsed_chats CASCADE;
DROP TABLE IF EXISTS chat_insights CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS schema_versions CASCADE;

-- Drop any views that might exist
DROP VIEW IF EXISTS document_processing_status CASCADE;
DROP VIEW IF EXISTS high_value_knowledge CASCADE;
DROP VIEW IF EXISTS ai_context_assembly CASCADE;

-- Drop hierarchical topics tables if they exist
DROP TABLE IF EXISTS document_topic_associations CASCADE;
DROP TABLE IF EXISTS topic_hierarchy_paths CASCADE;
DROP TABLE IF EXISTS knowledge_topics CASCADE;

-- Drop any functions that might exist
DROP FUNCTION IF EXISTS update_document_search_vector() CASCADE;
DROP FUNCTION IF EXISTS update_section_search_vector() CASCADE;
DROP FUNCTION IF EXISTS update_knowledge_search_vector() CASCADE;
DROP FUNCTION IF EXISTS update_hierarchy_paths() CASCADE;
DROP FUNCTION IF EXISTS auto_populate_document_matrix() CASCADE;
DROP FUNCTION IF EXISTS hierarchical_topics_enabled() CASCADE;

-- Display success message
SELECT '🧹 All tables dropped successfully! Ready to apply fresh schema.' as reset_status;

-- Instructions for next steps
SELECT 'Next: Apply either supabase-schema.sql OR hierarchical_topics_schema.sql (which includes the base schema)' as next_step;
