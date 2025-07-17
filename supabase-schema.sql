-- PBC Parsing App - Supabase Schema (Phase 2 Ready)
-- Optimized for AI Agent Access and Token Efficiency

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Document lineage and versioning table
CREATE TABLE document_lineage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    original_author TEXT NOT NULL,
    creation_date TIMESTAMPTZ NOT NULL,
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_system TEXT DEFAULT 'PBC-parsing-app',
    document_series TEXT,
    parent_document_id UUID REFERENCES document_lineage(id),
    revision_number INTEGER DEFAULT 1,
    approval_status TEXT CHECK (approval_status IN ('draft', 'review', 'approved', 'deprecated')) DEFAULT 'draft',
    stakeholders TEXT[] DEFAULT '{}',
    child_document_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main documents table (WIDE strategy for AI efficiency)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    file_type TEXT CHECK (file_type IN ('md', 'pdf', 'doc', 'docx', 'txt', 'chat')) NOT NULL,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    file_size BIGINT NOT NULL,
    raw_content TEXT NOT NULL,
    processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')) DEFAULT 'pending',
    error_message TEXT,
    
    -- Flattened metadata for fast AI access (WIDE strategy)
    business_domain TEXT NOT NULL DEFAULT 'operations',
    complexity_level TEXT CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')) DEFAULT 'basic',
    psychological_framework TEXT DEFAULT 'communication_styles',
    automation_potential TEXT CHECK (automation_potential IN ('low', 'medium', 'high')) DEFAULT 'medium',
    training_priority INTEGER DEFAULT 5 CHECK (training_priority BETWEEN 1 AND 10),
    
    -- AI optimization fields
    token_count INTEGER DEFAULT 0,
    token_efficiency_score INTEGER DEFAULT 50 CHECK (token_efficiency_score BETWEEN 0 AND 100),
    recommended_gpt_model TEXT DEFAULT 'gpt-3.5',
    context_window_requirement INTEGER DEFAULT 1000,
    
    -- Rich metadata (JSON for flexibility)
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    psychological_insights TEXT[] DEFAULT '{}',
    
    -- Search optimization
    search_vector TSVECTOR,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document sections (WIDE strategy with embedded intelligence)
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL DEFAULT 'narrative',
    title TEXT,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    
    -- Enhanced for AI agent access (WIDE strategy)
    psychological_tags TEXT[] DEFAULT '{}',
    workflow_tags TEXT[] DEFAULT '{}',
    business_logic_tags TEXT[] DEFAULT '{}',
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
    
    -- Agent optimization fields
    token_count INTEGER DEFAULT 0,
    complexity_score INTEGER DEFAULT 1 CHECK (complexity_score BETWEEN 1 AND 10),
    dependency_sections UUID[] DEFAULT '{}',
    
    -- Knowledge categorization (flattened for speed)
    primary_domain TEXT DEFAULT 'operations',
    secondary_domains TEXT[] DEFAULT '{}',
    client_facing BOOLEAN DEFAULT FALSE,
    automation_ready BOOLEAN DEFAULT FALSE,
    
    -- Rich structured data
    action_items JSONB DEFAULT '[]',
    decision_points JSONB DEFAULT '[]',
    knowledge_category JSONB DEFAULT '{}',
    
    -- Search optimization
    search_vector TSVECTOR,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Knowledge Base (ULTRA WIDE for maximum AI efficiency)
-- This is the "master table" for AI agent training and quick access
CREATE TABLE agent_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID NOT NULL REFERENCES documents(id),
    source_section_id UUID REFERENCES sections(id),
    
    -- Flattened knowledge for instant AI access
    knowledge_type TEXT NOT NULL,
    primary_concept TEXT NOT NULL,
    supporting_concepts TEXT[] DEFAULT '{}',
    psychological_pattern TEXT,
    business_logic TEXT,
    automation_instructions TEXT,
    client_guidance TEXT,
    
    -- Token optimization (dual content strategy)
    compressed_content TEXT NOT NULL, -- AI-optimized summary
    full_content TEXT NOT NULL,       -- Original for deep context
    token_count_compressed INTEGER DEFAULT 0,
    token_count_full INTEGER DEFAULT 0,
    
    -- Agent selection criteria (pre-computed for speed)
    gpt_model_recommendation TEXT DEFAULT 'gpt-3.5',
    context_requirements TEXT[] DEFAULT '{}',
    processing_complexity INTEGER DEFAULT 1 CHECK (processing_complexity BETWEEN 1 AND 10),
    
    -- Relationship mapping for context assembly
    related_knowledge_ids UUID[] DEFAULT '{}',
    prerequisite_knowledge_ids UUID[] DEFAULT '{}',
    dependent_knowledge_ids UUID[] DEFAULT '{}',
    
    -- Business intelligence
    business_domain TEXT NOT NULL,
    psychological_framework TEXT,
    use_frequency INTEGER DEFAULT 0, -- Track usage patterns
    success_rate DECIMAL(5,2) DEFAULT 0.0, -- Track effectiveness
    
    -- Version control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Search optimization
    search_vector TSVECTOR,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-references for document relationships
CREATE TABLE cross_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID NOT NULL REFERENCES documents(id),
    target_document_id UUID NOT NULL REFERENCES documents(id),
    target_section_id UUID REFERENCES sections(id),
    relationship_type TEXT CHECK (relationship_type IN ('builds_on', 'contradicts', 'supports', 'references', 'supersedes')) NOT NULL,
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document version history
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id),
    version_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changes_summary TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    change_type TEXT CHECK (change_type IN ('content', 'structure', 'metadata', 'tags')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat-specific tables
CREATE TABLE parsed_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    participants TEXT[] NOT NULL,
    message_count INTEGER NOT NULL,
    date_range_start TIMESTAMPTZ,
    date_range_end TIMESTAMPTZ,
    conversation_type TEXT CHECK (conversation_type IN ('client_interaction', 'internal_discussion', 'training_session', 'problem_solving')) DEFAULT 'internal_discussion',
    psychological_dynamics TEXT[] DEFAULT '{}',
    business_outcomes TEXT[] DEFAULT '{}',
    lessons_learned TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES parsed_chats(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    insight_type TEXT CHECK (insight_type IN ('workflow', 'principle', 'psychology', 'instruction', 'decision', 'objection', 'solution')) NOT NULL,
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
    context_before TEXT,
    context_after TEXT,
    emotional_tone TEXT,
    business_impact TEXT CHECK (business_impact IN ('low', 'medium', 'high')) DEFAULT 'medium',
    reusability_score INTEGER DEFAULT 1 CHECK (reusability_score BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema evolution tracking
CREATE TABLE schema_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    migration_required BOOLEAN DEFAULT FALSE,
    migration_sql TEXT,
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ
);

-- Indexes for performance optimization (especially for AI access patterns)

-- Document search indexes
CREATE INDEX idx_documents_business_domain ON documents(business_domain);
CREATE INDEX idx_documents_complexity ON documents(complexity_level);
CREATE INDEX idx_documents_gpt_model ON documents(recommended_gpt_model);
CREATE INDEX idx_documents_training_priority ON documents(training_priority DESC);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Section search indexes
CREATE INDEX idx_sections_document_id ON sections(document_id);
CREATE INDEX idx_sections_type ON sections(section_type);
CREATE INDEX idx_sections_domain ON sections(primary_domain);
CREATE INDEX idx_sections_complexity ON sections(complexity_score);
CREATE INDEX idx_sections_psych_tags ON sections USING GIN(psychological_tags);
CREATE INDEX idx_sections_workflow_tags ON sections USING GIN(workflow_tags);
CREATE INDEX idx_sections_business_tags ON sections USING GIN(business_logic_tags);
CREATE INDEX idx_sections_search ON sections USING GIN(search_vector);

-- Agent knowledge base indexes (critical for AI performance)
CREATE INDEX idx_knowledge_type ON agent_knowledge_base(knowledge_type);
CREATE INDEX idx_knowledge_domain ON agent_knowledge_base(business_domain);
CREATE INDEX idx_knowledge_gpt_model ON agent_knowledge_base(gpt_model_recommendation);
CREATE INDEX idx_knowledge_complexity ON agent_knowledge_base(processing_complexity);
CREATE INDEX idx_knowledge_frequency ON agent_knowledge_base(use_frequency DESC);
CREATE INDEX idx_knowledge_success ON agent_knowledge_base(success_rate DESC);
CREATE INDEX idx_knowledge_active ON agent_knowledge_base(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_knowledge_search ON agent_knowledge_base USING GIN(search_vector);
CREATE INDEX idx_knowledge_related ON agent_knowledge_base USING GIN(related_knowledge_ids);

-- Cross-reference indexes
CREATE INDEX idx_cross_ref_source ON cross_references(source_document_id);
CREATE INDEX idx_cross_ref_target ON cross_references(target_document_id);
CREATE INDEX idx_cross_ref_type ON cross_references(relationship_type);

-- Chat indexes
CREATE INDEX idx_chat_participants ON parsed_chats USING GIN(participants);
CREATE INDEX idx_chat_type ON parsed_chats(conversation_type);
CREATE INDEX idx_chat_insights_chat_id ON chat_insights(chat_id);
CREATE INDEX idx_chat_insights_type ON chat_insights(insight_type);
CREATE INDEX idx_chat_insights_impact ON chat_insights(business_impact);

-- Functions for search vector updates
CREATE OR REPLACE FUNCTION update_document_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.filename, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.raw_content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_section_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.psychological_tags, ' ')), 'C') ||
        setweight(to_tsvector('english', array_to_string(NEW.workflow_tags, ' ')), 'C') ||
        setweight(to_tsvector('english', array_to_string(NEW.business_logic_tags, ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_knowledge_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.primary_concept, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.compressed_content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.supporting_concepts, ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic search vector updates
CREATE TRIGGER documents_search_vector_update 
    BEFORE INSERT OR UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_document_search_vector();

CREATE TRIGGER sections_search_vector_update 
    BEFORE INSERT OR UPDATE ON sections 
    FOR EACH ROW EXECUTE FUNCTION update_section_search_vector();

CREATE TRIGGER knowledge_search_vector_update 
    BEFORE INSERT OR UPDATE ON agent_knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_vector();

-- Insert initial schema version
INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Initial schema with Phase 2 AI agent optimization');

-- Row Level Security (RLS) - Enable when ready for multi-tenancy
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Views for common AI agent queries

-- High-value knowledge for training
CREATE VIEW high_value_knowledge AS
SELECT 
    akb.*,
    d.filename,
    d.business_domain as doc_domain,
    d.complexity_level as doc_complexity
FROM agent_knowledge_base akb
JOIN documents d ON akb.source_document_id = d.id
WHERE 
    akb.is_active = TRUE 
    AND akb.success_rate > 70.0
    AND akb.use_frequency > 5
ORDER BY akb.success_rate DESC, akb.use_frequency DESC;

-- Quick context assembly for AI agents
CREATE VIEW ai_context_assembly AS
SELECT 
    akb.id,
    akb.primary_concept,
    akb.compressed_content,
    akb.token_count_compressed,
    akb.gpt_model_recommendation,
    akb.business_domain,
    akb.psychological_framework,
    akb.related_knowledge_ids,
    akb.prerequisite_knowledge_ids
FROM agent_knowledge_base akb
WHERE akb.is_active = TRUE
ORDER BY akb.processing_complexity, akb.token_count_compressed;

-- Document processing pipeline view
CREATE VIEW document_processing_status AS
SELECT 
    d.id,
    d.filename,
    d.processing_status,
    d.business_domain,
    d.complexity_level,
    d.token_efficiency_score,
    d.created_at,
    COUNT(s.id) as section_count,
    COUNT(akb.id) as knowledge_entries
FROM documents d
LEFT JOIN sections s ON d.id = s.document_id
LEFT JOIN agent_knowledge_base akb ON d.id = akb.source_document_id
GROUP BY d.id, d.filename, d.processing_status, d.business_domain, d.complexity_level, d.token_efficiency_score, d.created_at
ORDER BY d.created_at DESC;
