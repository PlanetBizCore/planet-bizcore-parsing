# Efficient Wide/Deep Database Structure for Planet bizCORE

## Strategy: Hybrid Wide/Deep with Smart Indexing

### Core Principle
- **GO WIDE**: Store frequently accessed data in flattened columns for speed
- **GO DEEP**: Use JSONB and related tables only when complex relationships are needed
- **SMART INDEXING**: Optimize for common query patterns

## Optimized Structure

### 1. Enhanced Documents Table (GO WIDE)
```sql
-- Add columns to existing documents table for efficient querying
ALTER TABLE documents ADD COLUMN IF NOT EXISTS narrative_summary TEXT; -- One-sentence summary
ALTER TABLE documents ADD COLUMN IF NOT EXISTS key_concepts TEXT[]; -- Top 5 concepts
ALTER TABLE documents ADD COLUMN IF NOT EXISTS cross_references TEXT[]; -- Related document IDs as text
ALTER TABLE documents ADD COLUMN IF NOT EXISTS implementation_level TEXT CHECK (implementation_level IN ('concept', 'process', 'template', 'example')); 
ALTER TABLE documents ADD COLUMN IF NOT EXISTS business_impact_score INTEGER DEFAULT 50 CHECK (business_impact_score BETWEEN 0 AND 100);

-- Wide tag narrative columns (most frequently accessed)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS jms3_narrative TEXT; -- How this doc relates to JMS3
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai4coaches_narrative TEXT; -- How this doc relates to AI4Coaches
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sme_narrative TEXT; -- Subject Matter Elders context
ALTER TABLE documents ADD COLUMN IF NOT EXISTS bizcore360_narrative TEXT; -- bizCore360 context
ALTER TABLE documents ADD COLUMN IF NOT EXISTS strategic_concierge_narrative TEXT; -- Strategic Concierge context
```

### 2. Tag Context Matrix (GO WIDE for Speed)
```sql
-- One record per document with ALL tag narratives flattened
CREATE TABLE document_tag_matrix (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Business Model Narratives (WIDE)
    jms3_relevance INTEGER DEFAULT 0 CHECK (jms3_relevance BETWEEN 0 AND 100),
    jms3_context TEXT,
    jms3_key_points TEXT[],
    
    ai4coaches_relevance INTEGER DEFAULT 0 CHECK (ai4coaches_relevance BETWEEN 0 AND 100),
    ai4coaches_context TEXT,
    ai4coaches_key_points TEXT[],
    
    sme_relevance INTEGER DEFAULT 0 CHECK (sme_relevance BETWEEN 0 AND 100),
    sme_context TEXT,
    sme_key_points TEXT[],
    
    bizcore360_relevance INTEGER DEFAULT 0 CHECK (bizcore360_relevance BETWEEN 0 AND 100),
    bizcore360_context TEXT,
    bizcore360_key_points TEXT[],
    
    strategic_concierge_relevance INTEGER DEFAULT 0 CHECK (strategic_concierge_relevance BETWEEN 0 AND 100),
    strategic_concierge_context TEXT,
    strategic_concierge_key_points TEXT[],
    
    -- Cross-Reference Summary (WIDE for speed)
    related_documents UUID[],
    contradictory_documents UUID[],
    prerequisite_documents UUID[],
    next_step_documents UUID[],
    
    -- Agent Training Data (WIDE)
    explainer_talking_points TEXT[],
    doer_action_items TEXT[],
    demo_scenarios TEXT[],
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Minimal Deep Tables (GO DEEP when needed)
```sql
-- Only for complex relationships that can't be flattened
CREATE TABLE deep_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID REFERENCES documents(id),
    target_document_id UUID REFERENCES documents(id),
    relationship_type TEXT,
    relationship_narrative TEXT,
    strength_score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only for evolving tag definitions
CREATE TABLE tag_definitions (
    tag_name TEXT PRIMARY KEY,
    short_description TEXT,
    detailed_narrative TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Query Efficiency Examples

### Super Fast Agent Context (GO WIDE)
```sql
-- Single query gets everything for agent training
SELECT 
    d.filename,
    d.narrative_summary,
    d.key_concepts,
    dtm.jms3_context,
    dtm.ai4coaches_context,
    dtm.explainer_talking_points,
    dtm.doer_action_items
FROM documents d
JOIN document_tag_matrix dtm ON d.id = dtm.document_id
WHERE d.business_tags @> ARRAY['JMS3']
  AND dtm.jms3_relevance > 70;
```

### Deep Dive When Needed (GO DEEP)
```sql
-- Only when complex analysis is required
SELECT 
    dr.relationship_narrative,
    target_doc.filename,
    target_dtm.jms3_context
FROM deep_relationships dr
JOIN documents target_doc ON dr.target_document_id = target_doc.id
JOIN document_tag_matrix target_dtm ON target_doc.id = target_dtm.document_id
WHERE dr.source_document_id = $document_id
  AND dr.relationship_type = 'implements';
```

## Implementation Strategy

### Phase 1: Add Wide Columns (Immediate)
1. Alter existing documents table with narrative columns
2. Create document_tag_matrix table
3. Backfill data from existing documents

### Phase 2: Matrix Population Interface
1. Build UI to fill tag narratives
2. Auto-populate from existing content where possible
3. Manual refinement interface

### Phase 3: Deep Tables (As Needed)
1. Add deep_relationships only for complex cases
2. Keep tag_definitions minimal and focused

## Efficiency Benefits

### GO WIDE Advantages
- **Single Query**: Get all tag contexts in one SELECT
- **No Joins**: Narrative data co-located with document
- **Fast Inserts**: Simple column updates
- **Cache Friendly**: Related data stored together

### GO DEEP Advantages  
- **Flexible Relationships**: Complex cross-references when needed
- **Normalized**: Avoid data duplication for evolving definitions
- **Extensible**: Add new relationship types without schema changes

## Data Matrix Population Interface Design

### Efficient Input Form
```typescript
interface DocumentTagMatrix {
  document_id: string;
  
  // Business Model Contexts (GO WIDE)
  jms3: {
    relevance: number;
    context: string;
    key_points: string[];
  };
  ai4coaches: {
    relevance: number;
    context: string;
    key_points: string[];
  };
  // ... etc for each business model
  
  // Cross-References (GO WIDE)
  related_documents: string[];
  
  // Agent Training (GO WIDE)
  explainer_talking_points: string[];
  doer_action_items: string[];
}
```

### Auto-Population from Existing Content
```typescript
const autoPopulateMatrix = (document: Document) => {
  return {
    jms3: {
      relevance: calculateRelevance(document.raw_content, 'jms3'),
      context: extractContext(document.raw_content, 'jms3'),
      key_points: extractKeyPoints(document.raw_content, 'jms3')
    },
    // ... auto-detect for other business models
  };
};
```

## Benefits of This Approach

1. **Speed**: 90% of queries hit wide columns only
2. **Flexibility**: Deep tables available for complex analysis
3. **Scalability**: Easy to add new wide columns for new business models
4. **Maintainability**: Clear separation between speed-optimized and flexibility-optimized data
5. **Agent Ready**: Single query gets complete agent context
6. **Fillable**: Easy interface for manual data entry and refinement

## Questions for Implementation

1. **Should we start by adding the wide columns to your existing documents table?**
2. **Which business model narratives do you want to prioritize for the matrix?**
3. **Do you want auto-population from existing content, or manual entry first?**
4. **Should the matrix interface be part of the main app or a separate admin tool?**

This hybrid approach gives you the best of both worlds - blazing fast queries for common cases, with deep relationship modeling available when you need it.
