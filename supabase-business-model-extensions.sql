-- PBC Parsing App - Unified Planet BizCORE Extensions (Phase 1)
-- Single BizDatabase for ALL owned businesses + Client organization support

-- Add columns to existing documents table for unified approach
ALTER TABLE documents ADD COLUMN IF NOT EXISTS business_tags TEXT[] DEFAULT '{}'; -- MD tags: JMS3, ai4coaches, etc.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS data_scope TEXT CHECK (data_scope IN ('planet_bizcore', 'client_private')) DEFAULT 'planet_bizcore';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS client_organization_id UUID;

-- Planet BizCORE Intelligence (shared across ALL owned businesses)
CREATE TABLE planet_bizcore_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Extracted Business Intelligence (applies to ALL owned businesses)
    products_services TEXT[] DEFAULT '{}',
    customer_demographics JSONB DEFAULT '{}',
    customer_psychographics JSONB DEFAULT '{}',
    competitor_analysis JSONB DEFAULT '{}',
    resource_requirements JSONB DEFAULT '{}',
    
    -- Strategic Insights
    value_propositions TEXT[] DEFAULT '{}',
    market_positioning TEXT,
    growth_strategies TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    
    -- Cross-Business Patterns
    universal_sales_processes TEXT[] DEFAULT '{}',
    common_customer_objections TEXT[] DEFAULT '{}',
    proven_coaching_techniques TEXT[] DEFAULT '{}',
    effective_leadership_approaches TEXT[] DEFAULT '{}',
    
    -- Source Attribution
    source_business_tags TEXT[] DEFAULT '{}', -- Which businesses contributed to this intelligence
    source_document_ids UUID[] DEFAULT '{}',
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
    
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Organizations (TRUE PAYING CLIENTS - Phase 2 Ready)
CREATE TABLE client_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_code TEXT UNIQUE NOT NULL, -- e.g., 'CLIENT_ACME_001'
    client_name TEXT NOT NULL,
    client_type TEXT CHECK (client_type IN ('white_label', 'custom', 'partner', 'internal_test')) DEFAULT 'white_label',
    
    -- Business Context
    industry TEXT,
    size_category TEXT CHECK (size_category IN ('solo', 'small', 'medium', 'large', 'enterprise')) DEFAULT 'small',
    geographic_focus TEXT[] DEFAULT '{}',
    
    -- Access Control (Phase 2 Ready)
    is_active BOOLEAN DEFAULT TRUE,
    access_level TEXT CHECK (access_level IN ('view_only', 'upload_only', 'full_access', 'admin')) DEFAULT 'full_access',
    data_isolation BOOLEAN DEFAULT FALSE, -- TRUE for full client separation in Phase 2
    
    -- Billing & Licensing (Phase 2 Ready)
    subscription_tier TEXT DEFAULT 'standard',
    billing_status TEXT CHECK (billing_status IN ('trial', 'active', 'suspended', 'cancelled')) DEFAULT 'trial',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_client_org ON documents(client_organization_id);
CREATE INDEX idx_documents_data_scope ON documents(data_scope);
CREATE INDEX idx_documents_business_tags ON documents USING GIN(business_tags);
