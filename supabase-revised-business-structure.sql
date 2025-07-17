-- PBC Parsing App - Revised Business Model Structure (Phase 1)
-- Planet BizCORE BizDatabase with MD tags for owned businesses
-- Client isolation for true paying clients only

-- Business Models Master Table (Simplified for owned vs client businesses)
CREATE TABLE business_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_code TEXT UNIQUE NOT NULL, -- 'JMS3', 'ai4coaches', 'SubjectMatterElders', 'bizCore360'
    business_name TEXT NOT NULL,
    description TEXT,
    
    -- Business Classification
    ownership_type TEXT CHECK (ownership_type IN ('owned', 'client')) DEFAULT 'owned',
    parent_business_code TEXT, -- For client businesses, which owned business they're under
    
    -- Phase 2 Client Management
    is_active BOOLEAN DEFAULT TRUE,
    data_isolation BOOLEAN DEFAULT FALSE, -- TRUE only for paying clients
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared Planet BizCORE Intelligence (applies to all owned businesses)
CREATE TABLE planet_bizcore_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Universal Business Intelligence (applies across all owned businesses)
    customer_psychology_patterns JSONB DEFAULT '{}',
    universal_objections TEXT[] DEFAULT '{}',
    proven_sales_processes JSONB DEFAULT '{}',
    pricing_psychology JSONB DEFAULT '{}',
    communication_frameworks JSONB DEFAULT '{}',
    leadership_principles TEXT[] DEFAULT '{}',
    
    -- Business Differentiators (what makes each business unique)
    business_specific_context JSONB DEFAULT '{}', -- Keyed by business_code
    
    -- Document Source Tracking
    source_document_ids UUID[] DEFAULT '{}',
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Differentiators Table (Only unique aspects per owned business)
CREATE TABLE business_differentiators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_code TEXT NOT NULL, -- 'JMS3', 'ai4coaches', etc.
    
    -- What makes this business unique
    unique_value_proposition TEXT,
    target_market_specifics JSONB DEFAULT '{}',
    specialized_services TEXT[] DEFAULT '{}',
    unique_methodologies TEXT[] DEFAULT '{}',
    brand_positioning TEXT,
    
    -- Source tracking
    source_document_ids UUID[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(business_code)
);

-- Client Organizations (Only for paying clients who need isolation)
CREATE TABLE client_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_business_code TEXT NOT NULL, -- Which owned business they're a client of
    client_code TEXT NOT NULL, -- e.g., 'JMS3_CLIENT_ACME_CORP'
    client_name TEXT NOT NULL,
    
    -- Business Context
    industry TEXT,
    size_category TEXT CHECK (size_category IN ('solo', 'small', 'medium', 'large', 'enterprise')) DEFAULT 'small',
    
    -- Access Control
    is_active BOOLEAN DEFAULT TRUE,
    access_level TEXT CHECK (access_level IN ('view_only', 'upload_only', 'full_access', 'admin')) DEFAULT 'full_access',
    
    -- Billing
    subscription_tier TEXT DEFAULT 'standard',
    billing_status TEXT CHECK (billing_status IN ('trial', 'active', 'suspended', 'cancelled')) DEFAULT 'trial',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(parent_business_code, client_code)
);

-- Enhanced documents table with simplified business context
ALTER TABLE documents ADD COLUMN business_tags TEXT[] DEFAULT '{}'; -- MD tags like ['JMS3', 'sales', 'leadership']
ALTER TABLE documents ADD COLUMN client_organization_id UUID REFERENCES client_organizations(id);
ALTER TABLE documents ADD COLUMN data_scope TEXT CHECK (data_scope IN ('planet_bizcore', 'client_isolated')) DEFAULT 'planet_bizcore';

-- Document Intelligence Mapping (links documents to extracted intelligence)
CREATE TABLE document_intelligence_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id),
    
    -- What intelligence was extracted from this document
    contributes_to_customer_psychology BOOLEAN DEFAULT FALSE,
    contributes_to_sales_processes BOOLEAN DEFAULT FALSE,
    contributes_to_pricing_strategy BOOLEAN DEFAULT FALSE,
    contributes_to_communication BOOLEAN DEFAULT FALSE,
    contributes_to_leadership BOOLEAN DEFAULT FALSE,
    
    -- Business-specific contributions
    business_specific_insights JSONB DEFAULT '{}', -- Keyed by business_code
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Initial Owned Business Models
INSERT INTO business_models (business_code, business_name, description, ownership_type) VALUES
('JMS3', 'JMS3', 'John Spence business consulting and executive coaching', 'owned'),
('ai4coaches', 'AI for Coaches', 'AI-powered tools and systems for professional coaches', 'owned'),
('SubjectMatterElders', 'Subject Matter Elders', 'Expert knowledge preservation and transfer platform', 'owned'),
('bizCore360', 'BizCore360', 'Comprehensive business intelligence and strategic framework platform', 'owned');

-- Insert Initial Planet BizCORE Intelligence Structure
INSERT INTO planet_bizcore_intelligence (
    customer_psychology_patterns,
    business_specific_context
) VALUES (
    '{"decision_making_triggers": [], "objection_patterns": [], "buying_psychology": []}',
    '{"JMS3": {"focus": "executive_leadership"}, "ai4coaches": {"focus": "ai_integration"}, "SubjectMatterElders": {"focus": "knowledge_transfer"}, "bizCore360": {"focus": "strategic_frameworks"}}'
);

-- Create indexes for performance
CREATE INDEX idx_documents_business_tags ON documents USING GIN(business_tags);
CREATE INDEX idx_documents_client_org ON documents(client_organization_id);
CREATE INDEX idx_documents_data_scope ON documents(data_scope);
CREATE INDEX idx_business_differentiators_code ON business_differentiators(business_code);
CREATE INDEX idx_client_orgs_parent_business ON client_organizations(parent_business_code);

-- Create views for common queries

-- Planet BizCORE Unified Dashboard
CREATE VIEW planet_bizcore_dashboard AS
SELECT 
    COUNT(CASE WHEN 'JMS3' = ANY(business_tags) THEN 1 END) as jms3_documents,
    COUNT(CASE WHEN 'ai4coaches' = ANY(business_tags) THEN 1 END) as ai4coaches_documents,
    COUNT(CASE WHEN 'SubjectMatterElders' = ANY(business_tags) THEN 1 END) as sme_documents,
    COUNT(CASE WHEN 'bizCore360' = ANY(business_tags) THEN 1 END) as bizcore360_documents,
    COUNT(CASE WHEN data_scope = 'client_isolated' THEN 1 END) as client_documents,
    COUNT(*) as total_documents
FROM documents
WHERE data_scope = 'planet_bizcore';

-- Business-Specific Document View
CREATE VIEW business_tagged_documents AS
SELECT 
    d.id,
    d.filename,
    d.business_tags,
    d.business_domain,
    d.psychological_framework,
    d.upload_date,
    CASE 
        WHEN 'JMS3' = ANY(d.business_tags) THEN 'JMS3'
        WHEN 'ai4coaches' = ANY(d.business_tags) THEN 'ai4coaches'
        WHEN 'SubjectMatterElders' = ANY(d.business_tags) THEN 'SubjectMatterElders'
        WHEN 'bizCore360' = ANY(d.business_tags) THEN 'bizCore360'
        ELSE 'multi_business'
    END as primary_business_context
FROM documents d
WHERE d.data_scope = 'planet_bizcore'
ORDER BY d.upload_date DESC;

-- Client Isolation View (for Phase 2)
CREATE VIEW client_isolated_data AS
SELECT 
    d.id,
    d.filename,
    co.client_name,
    co.parent_business_code,
    d.business_domain,
    d.upload_date
FROM documents d
JOIN client_organizations co ON d.client_organization_id = co.id
WHERE d.data_scope = 'client_isolated'
ORDER BY d.upload_date DESC;
