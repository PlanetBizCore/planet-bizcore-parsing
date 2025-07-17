-- PBC Parsing App - Simplified Client Extensions (Phase 1)
-- Planet BizCORE BizDatabase for owned businesses + Client organization support

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
    
    -- White-Label Branding
    brand_name TEXT, -- Their branded version name
    brand_colors JSONB DEFAULT '{}', -- Custom color scheme
    brand_logo_url TEXT,
    
    -- Access Control (Phase 2 Ready)
    is_active BOOLEAN DEFAULT TRUE,
    access_level TEXT CHECK (access_level IN ('view_only', 'upload_only', 'full_access', 'admin')) DEFAULT 'full_access',
    data_isolation BOOLEAN DEFAULT TRUE, -- TRUE for full client separation
    
    -- Billing & Licensing (Phase 2 Ready)
    subscription_tier TEXT DEFAULT 'standard',
    billing_status TEXT CHECK (billing_status IN ('trial', 'active', 'suspended', 'cancelled')) DEFAULT 'trial',
    monthly_fee DECIMAL(10,2),
    
    -- Planet BizCORE Configuration
    inherits_planet_bizcore_templates BOOLEAN DEFAULT TRUE, -- Use our templates as starting point
    allowed_business_tags TEXT[] DEFAULT '{}', -- Which owned business insights they can access
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend documents table for client separation ONLY
ALTER TABLE documents ADD COLUMN client_organization_id UUID REFERENCES client_organizations(id);
ALTER TABLE documents ADD COLUMN data_scope TEXT CHECK (data_scope IN ('planet_bizcore', 'client_private')) DEFAULT 'planet_bizcore';
ALTER TABLE documents ADD COLUMN business_tags TEXT[] DEFAULT '{}'; -- MD tags for owned businesses

-- Business Intelligence for Planet BizCORE (shared across all owned businesses)
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

-- Client-Specific Intelligence (separate from Planet BizCORE)
CREATE TABLE client_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_organization_id UUID NOT NULL REFERENCES client_organizations(id),
    
    -- Client's extracted intelligence
    products_services TEXT[] DEFAULT '{}',
    customer_demographics JSONB DEFAULT '{}',
    customer_psychographics JSONB DEFAULT '{}',
    value_propositions TEXT[] DEFAULT '{}',
    
    -- Inherited from Planet BizCORE (what they're allowed to see)
    inherited_intelligence JSONB DEFAULT '{}',
    customization_level TEXT CHECK (customization_level IN ('basic', 'moderate', 'extensive', 'fully_custom')) DEFAULT 'basic',
    
    -- Source tracking
    source_document_ids UUID[] DEFAULT '{}',
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score BETWEEN 0 AND 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template Library (Planet BizCORE assets that clients can inherit)
CREATE TABLE template_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('sales_process', 'coaching_framework', 'leadership_model', 'communication_style', 'psychological_assessment')) NOT NULL,
    template_content JSONB NOT NULL,
    
    -- Business attribution
    source_business_tags TEXT[] DEFAULT '{}', -- Which owned businesses this came from
    effectiveness_score INTEGER DEFAULT 50 CHECK (effectiveness_score BETWEEN 0 AND 100),
    usage_count INTEGER DEFAULT 0,
    
    -- Client access control
    is_public BOOLEAN DEFAULT FALSE, -- Available to all clients
    client_access_tier TEXT CHECK (client_access_tier IN ('basic', 'premium', 'enterprise')) DEFAULT 'basic',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_client_org ON documents(client_organization_id);
CREATE INDEX idx_documents_data_scope ON documents(data_scope);
CREATE INDEX idx_documents_business_tags ON documents USING GIN(business_tags);
CREATE INDEX idx_client_intelligence_client ON client_intelligence(client_organization_id);
CREATE INDEX idx_template_library_type ON template_library(template_type);
CREATE INDEX idx_template_library_tags ON template_library USING GIN(source_business_tags);

-- Create views for common queries

-- Planet BizCORE Dashboard (all owned business intelligence)
CREATE VIEW planet_bizcore_dashboard AS
SELECT 
    COUNT(d.id) as total_documents,
    COUNT(DISTINCT d.business_domain) as domains_covered,
    AVG(d.training_priority) as avg_training_priority,
    COUNT(co.id) as active_clients,
    pbi.confidence_score as intelligence_maturity
FROM documents d
LEFT JOIN client_organizations co ON co.is_active = TRUE
LEFT JOIN planet_bizcore_intelligence pbi ON TRUE
WHERE d.data_scope = 'planet_bizcore';

-- Client Dashboard View
CREATE VIEW client_dashboard AS
SELECT 
    co.*,
    COUNT(d.id) as document_count,
    COUNT(DISTINCT d.business_domain) as domains_covered,
    ci.confidence_score as intelligence_maturity
FROM client_organizations co
LEFT JOIN documents d ON co.id = d.client_organization_id
LEFT JOIN client_intelligence ci ON co.id = ci.client_organization_id
GROUP BY co.id, ci.confidence_score;

-- Business Tag Analytics (understand which owned businesses generate most value)
CREATE VIEW business_tag_analytics AS
SELECT 
    tag,
    COUNT(*) as document_count,
    AVG(d.training_priority) as avg_value,
    COUNT(DISTINCT d.business_domain) as domain_coverage
FROM documents d,
UNNEST(d.business_tags) as tag
WHERE d.data_scope = 'planet_bizcore'
GROUP BY tag
ORDER BY document_count DESC;

-- Template Usage Analytics
CREATE VIEW template_usage_analytics AS
SELECT 
    tl.template_name,
    tl.template_type,
    tl.usage_count,
    tl.effectiveness_score,
    array_to_string(tl.source_business_tags, ', ') as source_businesses
FROM template_library tl
ORDER BY tl.usage_count DESC, tl.effectiveness_score DESC;
