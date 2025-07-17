-- Efficient Wide/Deep Hybrid Structure for Planet bizCORE
-- Add wide columns for fast access, keep deep tables minimal

-- Add wide narrative columns to existing documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS narrative_summary TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS key_concepts TEXT[] DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS implementation_level TEXT CHECK (implementation_level IN ('concept', 'process', 'template', 'example')) DEFAULT 'concept';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS business_impact_score INTEGER DEFAULT 50 CHECK (business_impact_score BETWEEN 0 AND 100);

-- Wide tag narrative columns (most frequently accessed)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS jms3_narrative TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai4coaches_narrative TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sme_narrative TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS bizcore360_narrative TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS strategic_concierge_narrative TEXT;

-- Document Tag Matrix (GO WIDE for maximum speed)
CREATE TABLE IF NOT EXISTS document_tag_matrix (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    
    -- JMS3 Context (WIDE)
    jms3_relevance INTEGER DEFAULT 0 CHECK (jms3_relevance BETWEEN 0 AND 100),
    jms3_context TEXT,
    jms3_key_points TEXT[] DEFAULT '{}',
    jms3_implementation_notes TEXT,
    
    -- AI4Coaches Context (WIDE)  
    ai4coaches_relevance INTEGER DEFAULT 0 CHECK (ai4coaches_relevance BETWEEN 0 AND 100),
    ai4coaches_context TEXT,
    ai4coaches_key_points TEXT[] DEFAULT '{}',
    ai4coaches_implementation_notes TEXT,
    
    -- Subject Matter Elders Context (WIDE)
    sme_relevance INTEGER DEFAULT 0 CHECK (sme_relevance BETWEEN 0 AND 100),
    sme_context TEXT,
    sme_key_points TEXT[] DEFAULT '{}',
    sme_implementation_notes TEXT,
    
    -- bizCore360 Context (WIDE)
    bizcore360_relevance INTEGER DEFAULT 0 CHECK (bizcore360_relevance BETWEEN 0 AND 100),
    bizcore360_context TEXT,
    bizcore360_key_points TEXT[] DEFAULT '{}',
    bizcore360_implementation_notes TEXT,
    
    -- Strategic Concierge Context (WIDE)
    strategic_concierge_relevance INTEGER DEFAULT 0 CHECK (strategic_concierge_relevance BETWEEN 0 AND 100),
    strategic_concierge_context TEXT,
    strategic_concierge_key_points TEXT[] DEFAULT '{}',
    strategic_concierge_implementation_notes TEXT,
    
    -- Cross-Reference Summary (WIDE for speed)
    related_documents UUID[] DEFAULT '{}',
    contradictory_documents UUID[] DEFAULT '{}',
    prerequisite_documents UUID[] DEFAULT '{}',
    next_step_documents UUID[] DEFAULT '{}',
    
    -- Agent Training Data (WIDE)
    explainer_talking_points TEXT[] DEFAULT '{}',
    doer_action_items TEXT[] DEFAULT '{}',
    demo_scenarios TEXT[] DEFAULT '{}',
    
    -- Metadata
    last_updated_by TEXT DEFAULT 'system',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Minimal deep table for complex relationships only when needed
CREATE TABLE IF NOT EXISTS deep_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    target_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    relationship_narrative TEXT,
    strength_score INTEGER DEFAULT 50 CHECK (strength_score BETWEEN 0 AND 100),
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'disputed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tag definitions table (minimal, for evolving definitions only)
CREATE TABLE IF NOT EXISTS tag_definitions (
    tag_name TEXT PRIMARY KEY,
    short_description TEXT NOT NULL,
    detailed_narrative TEXT,
    agent_instructions TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial tag definitions
INSERT INTO tag_definitions (tag_name, short_description, detailed_narrative) VALUES
('JMS3', 'John''s Management System 3 - Strategic concierge for solo & duo builders', 'Comprehensive business development system focusing on getting solo founders and duopreneurs unstuck through strategic guidance, executive coaching, and leadership development.'),
('ai4coaches', 'AI-powered coaching tools and methodologies', 'Automated coaching systems that provide AI assessment, digital coaching tools, and smart coaching automation to enhance coaching effectiveness and reach.'),
('SubjectMatterElders', 'Expert content creation and thought leadership framework', 'System for positioning and distributing thought leadership content through persona mapping, story frameworks, and comprehensive content strategies.'),
('bizCore360', 'Integrated business systems and automation platform', 'Complete systems and automation engine with integrated dashboards, CRM builds, and delivery layer automation connecting multiple platforms.'),
('strategic_concierge', 'High-touch strategic guidance service', 'Premium service model providing personalized strategic guidance and implementation support for business leaders and entrepreneurs.')
ON CONFLICT (tag_name) DO UPDATE SET
detailed_narrative = EXCLUDED.detailed_narrative,
last_updated = NOW();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_tag_matrix_jms3 ON document_tag_matrix(jms3_relevance) WHERE jms3_relevance > 0;
CREATE INDEX IF NOT EXISTS idx_document_tag_matrix_ai4coaches ON document_tag_matrix(ai4coaches_relevance) WHERE ai4coaches_relevance > 0;
CREATE INDEX IF NOT EXISTS idx_document_tag_matrix_sme ON document_tag_matrix(sme_relevance) WHERE sme_relevance > 0;
CREATE INDEX IF NOT EXISTS idx_document_tag_matrix_bizcore360 ON document_tag_matrix(bizcore360_relevance) WHERE bizcore360_relevance > 0;
CREATE INDEX IF NOT EXISTS idx_document_tag_matrix_strategic_concierge ON document_tag_matrix(strategic_concierge_relevance) WHERE strategic_concierge_relevance > 0;

-- Function to auto-populate matrix from existing documents
CREATE OR REPLACE FUNCTION auto_populate_document_matrix()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-create matrix entry for new documents
    INSERT INTO document_tag_matrix (document_id, completion_percentage)
    VALUES (NEW.id, 0)
    ON CONFLICT (document_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create matrix entries
DROP TRIGGER IF EXISTS auto_populate_matrix_trigger ON documents;
CREATE TRIGGER auto_populate_matrix_trigger
    AFTER INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_document_matrix();

-- View for efficient agent queries (GO WIDE optimization)
CREATE OR REPLACE VIEW agent_training_context AS
SELECT 
    d.id,
    d.filename,
    d.narrative_summary,
    d.key_concepts,
    d.business_tags,
    d.implementation_level,
    d.business_impact_score,
    
    -- JMS3 Context
    dtm.jms3_relevance,
    dtm.jms3_context,
    dtm.jms3_key_points,
    
    -- AI4Coaches Context  
    dtm.ai4coaches_relevance,
    dtm.ai4coaches_context,
    dtm.ai4coaches_key_points,
    
    -- SME Context
    dtm.sme_relevance,
    dtm.sme_context,
    dtm.sme_key_points,
    
    -- bizCore360 Context
    dtm.bizcore360_relevance,
    dtm.bizcore360_context,
    dtm.bizcore360_key_points,
    
    -- Strategic Concierge Context
    dtm.strategic_concierge_relevance,
    dtm.strategic_concierge_context,
    dtm.strategic_concierge_key_points,
    
    -- Agent Training Data
    dtm.explainer_talking_points,
    dtm.doer_action_items,
    dtm.demo_scenarios,
    
    -- Cross-References
    dtm.related_documents,
    dtm.prerequisite_documents,
    
    -- Metadata
    dtm.completion_percentage,
    dtm.updated_at as matrix_updated_at
    
FROM documents d
LEFT JOIN document_tag_matrix dtm ON d.id = dtm.document_id;
