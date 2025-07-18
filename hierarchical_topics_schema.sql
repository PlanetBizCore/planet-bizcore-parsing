-- Hierarchical Topics Schema Enhancement
-- ADDITIVE CHANGES ONLY - Production Safe
-- Run on feature branch only, controlled by environment variables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Documents Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    content_type TEXT DEFAULT 'text',
    file_name TEXT,
    file_size INTEGER,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT false,
    processing_status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    business_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hierarchical Knowledge Topics Table
CREATE TABLE IF NOT EXISTS knowledge_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core Topic Data (Your Vision)
    topic_name TEXT NOT NULL,                    -- "Strategic Leadership"
    short_description TEXT NOT NULL,             -- "Guiding teams through change" (tagline)
    long_narrative TEXT NOT NULL,                -- Full paragraph context
    
    -- Hierarchy Structure
    parent_topic_id UUID REFERENCES knowledge_topics(id),
    topic_level INTEGER DEFAULT 1,              -- 1=main, 2=sub, 3=sub-sub, etc.
    topic_path TEXT UNIQUE,                     -- "jms3.leadership.strategic_guidance"
    topic_order INTEGER DEFAULT 0,              -- Order within same level
    
    -- Business Model Association
    business_tags TEXT[] DEFAULT '{}',          -- ['JMS3', 'ai4coaches']
    primary_business_model TEXT,                -- Main business model this belongs to
    
    -- Auto-Population Metadata
    source_documents UUID[] DEFAULT '{}',       -- Documents this topic was extracted from
    extracted_automatically BOOLEAN DEFAULT false,
    extraction_confidence INTEGER DEFAULT 50,   -- 0-100 confidence in auto-extraction
    manual_refinement BOOLEAN DEFAULT false,    -- Has been manually refined
    
    -- AI Training Optimization
    context_complexity INTEGER DEFAULT 1 CHECK (context_complexity BETWEEN 1 AND 10),
    ai_training_priority INTEGER DEFAULT 5 CHECK (ai_training_priority BETWEEN 1 AND 10),
    usage_frequency INTEGER DEFAULT 0,          -- How often this topic is queried
    accuracy_score INTEGER DEFAULT 50,          -- Measured AI accuracy improvement
    
    -- Content Relationships
    related_topic_ids UUID[] DEFAULT '{}',      -- Cross-references to other topics
    contradictory_topic_ids UUID[] DEFAULT '{}',-- Topics that contradict this one
    prerequisite_topic_ids UUID[] DEFAULT '{}', -- Topics needed to understand this one
    
    -- Metadata
    created_by TEXT DEFAULT 'system',
    validated_by TEXT,
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'disputed', 'archived')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document-Topic Association Table
CREATE TABLE IF NOT EXISTS document_topic_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES knowledge_topics(id) ON DELETE CASCADE,
    
    -- Association Metadata
    association_type TEXT DEFAULT 'extracted' CHECK (association_type IN ('extracted', 'manual', 'inferred')),
    relevance_score INTEGER DEFAULT 50 CHECK (relevance_score BETWEEN 0 AND 100),
    context_snippet TEXT,                       -- Specific text that relates to topic
    page_reference TEXT,                        -- Page/section where topic appears
    
    -- Learning Data
    extraction_method TEXT,                     -- How this association was discovered
    confidence_score INTEGER DEFAULT 50,
    validated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topic Hierarchy Helper Table (for complex queries)
CREATE TABLE IF NOT EXISTS topic_hierarchy_paths (
    topic_id UUID NOT NULL REFERENCES knowledge_topics(id) ON DELETE CASCADE,
    ancestor_id UUID NOT NULL REFERENCES knowledge_topics(id) ON DELETE CASCADE,
    depth INTEGER NOT NULL,                     -- How many levels between topic and ancestor
    path_text TEXT NOT NULL,                    -- Full path like "jms3.leadership.communication"
    
    PRIMARY KEY (topic_id, ancestor_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_documents_business_tags ON documents USING GIN(business_tags);
CREATE INDEX IF NOT EXISTS idx_documents_processed ON documents(processed);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_topics_parent ON knowledge_topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_topics_path ON knowledge_topics(topic_path);
CREATE INDEX IF NOT EXISTS idx_knowledge_topics_business_tags ON knowledge_topics USING GIN(business_tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_topics_level ON knowledge_topics(topic_level);
CREATE INDEX IF NOT EXISTS idx_knowledge_topics_priority ON knowledge_topics(ai_training_priority DESC);

CREATE INDEX IF NOT EXISTS idx_doc_topic_assoc_document ON document_topic_associations(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_topic_assoc_topic ON document_topic_associations(topic_id);
CREATE INDEX IF NOT EXISTS idx_doc_topic_assoc_relevance ON document_topic_associations(relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_hierarchy_paths_topic ON topic_hierarchy_paths(topic_id);
CREATE INDEX IF NOT EXISTS idx_hierarchy_paths_ancestor ON topic_hierarchy_paths(ancestor_id);

-- Auto-update hierarchy paths function
CREATE OR REPLACE FUNCTION update_hierarchy_paths()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete old paths for this topic
    DELETE FROM topic_hierarchy_paths WHERE topic_id = NEW.id;
    
    -- Insert new paths (including self)
    WITH RECURSIVE topic_ancestors AS (
        -- Base case: self reference
        SELECT NEW.id as topic_id, NEW.id as ancestor_id, 0 as depth, NEW.topic_path as path_text
        
        UNION ALL
        
        -- Recursive case: traverse up the hierarchy
        SELECT ta.topic_id, kt.id as ancestor_id, ta.depth + 1, kt.topic_path
        FROM topic_ancestors ta
        JOIN knowledge_topics kt ON ta.ancestor_id = kt.parent_topic_id
    )
    INSERT INTO topic_hierarchy_paths (topic_id, ancestor_id, depth, path_text)
    SELECT topic_id, ancestor_id, depth, path_text FROM topic_ancestors;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain hierarchy paths
DROP TRIGGER IF EXISTS update_hierarchy_paths_trigger ON knowledge_topics;
CREATE TRIGGER update_hierarchy_paths_trigger
    AFTER INSERT OR UPDATE OF parent_topic_id, topic_path ON knowledge_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_hierarchy_paths();

-- View for easy topic hierarchy browsing
CREATE OR REPLACE VIEW topic_hierarchy_view AS
SELECT 
    kt.id,
    kt.topic_name,
    kt.short_description,
    kt.topic_level,
    kt.topic_path,
    kt.business_tags,
    
    -- Parent information
    parent.topic_name as parent_name,
    parent.topic_path as parent_path,
    
    -- Child count
    (SELECT COUNT(*) FROM knowledge_topics children WHERE children.parent_topic_id = kt.id) as child_count,
    
    -- Document associations
    (SELECT COUNT(*) FROM document_topic_associations dta WHERE dta.topic_id = kt.id) as document_count,
    
    -- Metadata
    kt.extraction_confidence,
    kt.ai_training_priority,
    kt.validation_status,
    kt.created_at
    
FROM knowledge_topics kt
LEFT JOIN knowledge_topics parent ON kt.parent_topic_id = parent.id
ORDER BY kt.topic_path;

-- Feature flag check function
CREATE OR REPLACE FUNCTION hierarchical_topics_enabled()
RETURNS BOOLEAN AS $$
BEGIN
    -- This will be controlled by environment variable
    -- For now, return true in development
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (JMS3 hierarchy example)
INSERT INTO knowledge_topics (topic_name, short_description, long_narrative, topic_level, topic_path, business_tags, primary_business_model) VALUES
('JMS3 Framework', 'John''s Management System 3 - Complete business development approach', 'Comprehensive business development system focusing on getting solo founders and duopreneurs unstuck through strategic guidance, executive coaching, and leadership development. Combines strategic planning, operational excellence, and leadership development into a unified approach.', 1, 'jms3', ARRAY['JMS3'], 'JMS3'),

('Strategic Leadership', 'Executive leadership and strategic planning', 'Development of strategic thinking, vision setting, and executive leadership capabilities for solo founders and duo entrepreneurs. Focuses on big-picture thinking, decision-making frameworks, and organizational direction.', 2, 'jms3.strategic_leadership', ARRAY['JMS3', 'leadership'], 'JMS3'),

('Operational Excellence', 'Systems and process optimization', 'Building robust operational systems, processes, and procedures that enable sustainable business growth. Includes workflow design, quality assurance, and performance measurement systems.', 2, 'jms3.operational_excellence', ARRAY['JMS3', 'operations'], 'JMS3'),

('Team Development', 'Building and leading high-performance teams', 'Comprehensive approach to hiring, developing, and retaining top talent. Includes team dynamics, performance management, and leadership development for growing organizations.', 2, 'jms3.team_development', ARRAY['JMS3', 'team', 'leadership'], 'JMS3')

ON CONFLICT (topic_path) DO UPDATE SET
    topic_name = EXCLUDED.topic_name,
    short_description = EXCLUDED.short_description,
    long_narrative = EXCLUDED.long_narrative,
    updated_at = NOW();

-- Update parent relationships
UPDATE knowledge_topics SET parent_topic_id = (
    SELECT id FROM knowledge_topics WHERE topic_path = 'jms3'
) WHERE topic_path IN ('jms3.strategic_leadership', 'jms3.operational_excellence', 'jms3.team_development');

-- Add some third-level topics
INSERT INTO knowledge_topics (topic_name, short_description, long_narrative, topic_level, topic_path, business_tags, primary_business_model, parent_topic_id) VALUES
('Vision Setting', 'Creating compelling organizational vision', 'Process of developing clear, inspiring, and actionable organizational vision that guides strategic decision-making and motivates team performance.', 3, 'jms3.strategic_leadership.vision_setting', ARRAY['JMS3', 'leadership', 'strategy'], 'JMS3', 
    (SELECT id FROM knowledge_topics WHERE topic_path = 'jms3.strategic_leadership')),

('Decision Frameworks', 'Structured approaches to complex decisions', 'Systematic methodologies for making high-stakes business decisions with limited information, including risk assessment, stakeholder analysis, and outcome evaluation.', 3, 'jms3.strategic_leadership.decision_frameworks', ARRAY['JMS3', 'leadership', 'strategy'], 'JMS3',
    (SELECT id FROM knowledge_topics WHERE topic_path = 'jms3.strategic_leadership')),

('Process Design', 'Creating efficient business processes', 'Methodology for designing, implementing, and optimizing business processes that scale with organizational growth while maintaining quality and efficiency.', 3, 'jms3.operational_excellence.process_design', ARRAY['JMS3', 'operations', 'process'], 'JMS3',
    (SELECT id FROM knowledge_topics WHERE topic_path = 'jms3.operational_excellence'))

ON CONFLICT (topic_path) DO UPDATE SET
    topic_name = EXCLUDED.topic_name,
    short_description = EXCLUDED.short_description,
    long_narrative = EXCLUDED.long_narrative,
    parent_topic_id = EXCLUDED.parent_topic_id,
    updated_at = NOW();

COMMENT ON TABLE knowledge_topics IS 'Hierarchical topic structure for enhanced AI agent training and context accuracy';
COMMENT ON TABLE document_topic_associations IS 'Links documents to specific topics with relevance scoring';
COMMENT ON TABLE topic_hierarchy_paths IS 'Materialized hierarchy paths for efficient topic relationship queries';
