-- Clear all processed documents from the database
DELETE FROM sections;
DELETE FROM documents;

-- Reset any sequences
SELECT setval(pg_get_serial_sequence('documents', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('sections', 'id'), 1, false);

-- Verify tables are empty
SELECT COUNT(*) as document_count FROM documents;
SELECT COUNT(*) as sections_count FROM sections;
