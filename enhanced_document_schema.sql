-- Enhanced Database Schema for Auto-Population (WIDE Strategy)
-- Optimized for automatic extraction during document upload

-- Add wide columns to existing documents table for auto-populated data
ALTER TABLE documents ADD COLUMN IF NOT EXISTS 
  -- JMS3 Business Model Narratives (auto-extracted)
  jms3_description TEXT,
  jms3_methodology TEXT,
  jms3_target_audience TEXT,
  jms3_service_approach TEXT,
  jms3_success_patterns TEXT,
  jms3_coaching_style TEXT,
  
  -- AI4Coaches Business Model Narratives (auto-extracted)
  ai4coaches_description TEXT,
  ai4coaches_technology TEXT,
  ai4coaches_automation_approach TEXT,
  ai4coaches_use_cases TEXT,
  ai4coaches_integration_methods TEXT,
  ai4coaches_ai_models TEXT,
  
  -- Subject Matter Elders Narratives (auto-extracted)
  sme_description TEXT,
  sme_content_strategy TEXT,
  sme_positioning_approach TEXT,
  sme_frameworks TEXT,
  sme_deliverables TEXT,
  sme_thought_leadership TEXT,
  
  -- bizCore360 Business Model Narratives (auto-extracted)
  bizcore360_description TEXT,
  bizcore360_systems TEXT,
  bizcore360_automation_tools TEXT,
  bizcore360_integrations TEXT,
  bizcore360_dashboards TEXT,
  bizcore360_workflows TEXT,
  
  -- Strategic Concierge Narratives (auto-extracted)
  strategic_concierge_description TEXT,
  strategic_concierge_service_levels TEXT,
  strategic_concierge_communication TEXT,
  strategic_concierge_escalation TEXT,
  
  -- Auto-extracted Cross-References (WIDE for speed)
  referenced_concepts TEXT[] DEFAULT '{}',
  similar_documents UUID[] DEFAULT '{}',
  contradicting_documents UUID[] DEFAULT '{}',
  building_upon_documents UUID[] DEFAULT '{}',
  implements_concepts UUID[] DEFAULT '{}',
  
  -- Auto-extracted Content Elements
  key_concepts TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  decision_points TEXT[] DEFAULT '{}',
  success_metrics TEXT[] DEFAULT '{}',
  process_steps TEXT[] DEFAULT '{}',
  tools_mentioned TEXT[] DEFAULT '{}',
  stakeholder_roles TEXT[] DEFAULT '{}',
  
  -- Auto-extraction Metadata
  auto_extraction_version TEXT DEFAULT '1.0',
  extraction_confidence_score INTEGER DEFAULT 50 CHECK (extraction_confidence_score BETWEEN 0 AND 100),
  extraction_method TEXT DEFAULT 'pattern_matching',
  last_auto_processed TIMESTAMPTZ DEFAULT NOW(),
  
  -- Agent Training Ready Data (auto-populated)
  explainer_narrative_snippets TEXT[] DEFAULT '{}',
  doer_instruction_snippets TEXT[] DEFAULT '{}',
  demo_scenario_snippets TEXT[] DEFAULT '{}',
  
  -- Business Impact Analysis (auto-calculated)
  business_model_coverage INTEGER DEFAULT 0 CHECK (business_model_coverage BETWEEN 0 AND 100),
  cross_reference_density INTEGER DEFAULT 0,
  narrative_richness_score INTEGER DEFAULT 0 CHECK (narrative_richness_score BETWEEN 0 AND 100);

-- Create indexes for fast matrix queries
CREATE INDEX IF NOT EXISTS idx_documents_jms3_content ON documents USING GIN(to_tsvector('english', coalesce(jms3_description, '') || ' ' || coalesce(jms3_methodology, '')));
CREATE INDEX IF NOT EXISTS idx_documents_ai4coaches_content ON documents USING GIN(to_tsvector('english', coalesce(ai4coaches_description, '') || ' ' || coalesce(ai4coaches_technology, '')));
CREATE INDEX IF NOT EXISTS idx_documents_sme_content ON documents USING GIN(to_tsvector('english', coalesce(sme_description, '') || ' ' || coalesce(sme_content_strategy, '')));
CREATE INDEX IF NOT EXISTS idx_documents_bizcore360_content ON documents USING GIN(to_tsvector('english', coalesce(bizcore360_description, '') || ' ' || coalesce(bizcore360_systems, '')));

CREATE INDEX IF NOT EXISTS idx_documents_cross_refs ON documents USING GIN(similar_documents);
CREATE INDEX IF NOT EXISTS idx_documents_concepts ON documents USING GIN(key_concepts);
CREATE INDEX IF NOT EXISTS idx_documents_business_coverage ON documents (business_model_coverage) WHERE business_model_coverage > 0;

-- Matrix Query Views for fast access
CREATE OR REPLACE VIEW business_model_matrix AS
SELECT 
    id,
    filename,
    business_tags,
    
    -- JMS3 Matrix Column
    CASE 
        WHEN jms3_description IS NOT NULL THEN 
            jsonb_build_object(
                'description', jms3_description,
                'methodology', jms3_methodology,
                'target_audience', jms3_target_audience,
                'service_approach', jms3_service_approach,
                'success_patterns', jms3_success_patterns
            )
        ELSE NULL 
    END as jms3_data,
    
    -- AI4Coaches Matrix Column
    CASE 
        WHEN ai4coaches_description IS NOT NULL THEN 
            jsonb_build_object(
                'description', ai4coaches_description,
                'technology', ai4coaches_technology,
                'automation', ai4coaches_automation_approach,
                'use_cases', ai4coaches_use_cases,
                'integration', ai4coaches_integration_methods
            )
        ELSE NULL 
    END as ai4coaches_data,
    
    -- SME Matrix Column
    CASE 
        WHEN sme_description IS NOT NULL THEN 
            jsonb_build_object(
                'description', sme_description,
                'content_strategy', sme_content_strategy,
                'positioning', sme_positioning_approach,
                'frameworks', sme_frameworks,
                'deliverables', sme_deliverables
            )
        ELSE NULL 
    END as sme_data,
    
    -- bizCore360 Matrix Column
    CASE 
        WHEN bizcore360_description IS NOT NULL THEN 
            jsonb_build_object(
                'description', bizcore360_description,
                'systems', bizcore360_systems,
                'automation', bizcore360_automation_tools,
                'integrations', bizcore360_integrations,
                'dashboards', bizcore360_dashboards
            )
        ELSE NULL 
    END as bizcore360_data,
    
    -- Cross-reference data
    jsonb_build_object(
        'similar_docs', similar_documents,
        'building_upon', building_upon_documents,
        'contradicts', contradicting_documents,
        'concepts', key_concepts
    ) as cross_reference_data,
    
    -- Extraction metadata
    business_model_coverage,
    extraction_confidence_score,
    narrative_richness_score
    
FROM documents
WHERE business_tags IS NOT NULL AND array_length(business_tags, 1) > 0;

-- Agent Training Data Views
CREATE OR REPLACE VIEW explainer_agent_data AS
SELECT 
    id,
    filename,
    business_tags,
    explainer_narrative_snippets,
    
    -- Combine all business model descriptions for explainer agents
    COALESCE(jms3_description, '') || ' ' ||
    COALESCE(ai4coaches_description, '') || ' ' ||
    COALESCE(sme_description, '') || ' ' ||
    COALESCE(bizcore360_description, '') as combined_descriptions,
    
    key_concepts,
    success_metrics,
    extraction_confidence_score
FROM documents
WHERE explainer_narrative_snippets IS NOT NULL AND array_length(explainer_narrative_snippets, 1) > 0;

CREATE OR REPLACE VIEW doer_agent_data AS
SELECT 
    id,
    filename,
    business_tags,
    doer_instruction_snippets,
    
    -- Combine methodology and process data for doer agents
    COALESCE(jms3_methodology, '') || ' ' ||
    COALESCE(ai4coaches_automation_approach, '') || ' ' ||
    COALESCE(sme_frameworks, '') || ' ' ||
    COALESCE(bizcore360_workflows, '') as combined_methodologies,
    
    action_items,
    decision_points,
    process_steps,
    tools_mentioned,
    stakeholder_roles,
    extraction_confidence_score
FROM documents
WHERE doer_instruction_snippets IS NOT NULL AND array_length(doer_instruction_snippets, 1) > 0;

-- Cross-Reference Analysis View
CREATE OR REPLACE VIEW cross_reference_analysis AS
SELECT 
    d1.id as source_doc_id,
    d1.filename as source_filename,
    d1.business_tags as source_tags,
    unnest(d1.similar_documents) as related_doc_id,
    d2.filename as related_filename,
    d2.business_tags as related_tags,
    
    -- Calculate relationship strength
    CASE 
        WHEN d1.business_tags && d2.business_tags THEN 
            array_length(array(SELECT unnest(d1.business_tags) INTERSECT SELECT unnest(d2.business_tags)), 1) * 100 / 
            GREATEST(array_length(d1.business_tags, 1), array_length(d2.business_tags, 1))
        ELSE 0 
    END as tag_similarity_score,
    
    -- Calculate concept overlap
    CASE 
        WHEN d1.key_concepts && d2.key_concepts THEN 
            array_length(array(SELECT unnest(d1.key_concepts) INTERSECT SELECT unnest(d2.key_concepts)), 1)
        ELSE 0 
    END as concept_overlap_count
    
FROM documents d1
JOIN documents d2 ON d2.id = ANY(d1.similar_documents)
WHERE d1.similar_documents IS NOT NULL AND array_length(d1.similar_documents, 1) > 0;
