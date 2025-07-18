# 🏗️ Planet bizCORE Architecture Documentation

## System Overview

Planet bizCORE parsing application has evolved from a simple document processor to a sophisticated hierarchical knowledge extraction system designed to train AI agents with surgical precision and reduced hallucinations.

## Architecture Evolution

### Phase 1: Flat Business Model Tagging (Production)
```
Document → Auto-Detection → Business Tags → Database
         ↓
    [JMS3, ai4coaches, SME, bizCore360]
```

### Phase 2: Hierarchical Topic Extraction (Development)
```
Document → Auto-Extraction → Topic Trees → Granular Context
         ↓                      ↓
    Business Models      Topic Hierarchies
         ↓                      ↓
    Auto-Narratives     Surgical AI Context
```

## Database Architecture

### Schema Version 1 (Production - Stable)
```sql
documents
├── id, filename, raw_content
├── business_tags[]           -- Flat array of business models
├── auto-populated narratives -- jms3_description, ai4coaches_technology, etc.
└── metadata                  -- processing status, complexity, etc.

sections
├── document_id (FK)
├── content, section_type
└── extracted intelligence
```

### Schema Version 2 (Development - Enhanced)
```sql
documents (enhanced)
├── [All Schema v1 fields]
└── hierarchical integration hooks

knowledge_topics (NEW)
├── topic_name, short_description, long_narrative
├── parent_topic_id (self-referencing hierarchy)
├── topic_level, topic_path
├── business_tags[], source_documents[]
└── ai_training_priority, accuracy_score

document_topic_associations (NEW)
├── document_id (FK), topic_id (FK)
├── relevance_score, context_snippet
└── extraction_method, confidence_score

topic_hierarchy_paths (NEW)
├── topic_id, ancestor_id, depth
└── path_text (materialized paths for fast queries)
```

## Feature Flag System

### Production Safety Controls
```typescript
FEATURE_FLAGS = {
  ENABLE_HIERARCHICAL_TOPICS: false,    // Production default
  ENABLE_AUTO_TOPIC_EXTRACTION: false,
  DATABASE_SCHEMA_VERSION: '1',
  HIERARCHICAL_TOPICS_PERCENTAGE: 0,    // Gradual rollout
  ENABLE_PRODUCTION_SAFETY: true
}
```

### Development Enhancement
```typescript
FEATURE_FLAGS = {
  ENABLE_HIERARCHICAL_TOPICS: true,     // Development testing
  ENABLE_AUTO_TOPIC_EXTRACTION: true,
  DATABASE_SCHEMA_VERSION: '2',
  ENABLE_DEBUG_MODE: true,
  SHOW_EXTRACTION_DETAILS: true
}
```

## Auto-Extraction Architecture

### Business Model Narrative Detection
```typescript
extractBusinessModelNarratives(text, tags) {
  // For each detected business model:
  // 1. Pattern match for relevant sentences
  // 2. Extract 1-2 sentences of context
  // 3. Populate wide database columns
  // 4. Return narratives for immediate database insertion
}
```

### Hierarchical Topic Extraction (Development)
```typescript
extractHierarchicalTopics(text, businessTags) {
  // 1. Identify main topics from content
  // 2. Detect subtopic relationships
  // 3. Build parent-child hierarchy
  // 4. Generate topic narratives
  // 5. Create document-topic associations
  // 6. Calculate relevance scores
}
```

## Data Flow Architecture

### Upload Processing Pipeline
```
File Upload
    ↓
Content Extraction
    ↓
Business Model Detection
    ↓
Narrative Auto-Population ← Schema v1
    ↓
[IF hierarchical_topics_enabled]
    ↓
Topic Tree Extraction ← Schema v2
    ↓
Hierarchy Path Generation
    ↓
Document-Topic Associations
    ↓
Database Transaction (All Changes)
    ↓
Success Response
```

### AI Agent Query Architecture
```
Agent Request
    ↓
[IF schema_version = 2]
    ↓
Hierarchical Topic Query
    ↓
Granular Context Assembly
    ↓ 
Cross-Reference Resolution
    ↓
Surgical Response Generation

[ELSE schema_version = 1]
    ↓
Flat Tag Query
    ↓
Business Model Context
    ↓
Traditional Response Generation
```

## Development Strategy

### Branch Management
```
master (production)
├── Stable, live application
├── Schema version 1
├── Conservative feature flags
└── Zero-risk deployment

feature/hierarchical-topics (development)
├── Enhanced schema (additive only)
├── New hierarchical extraction
├── Development feature flags
└── Safe testing environment
```

### Deployment Safety
```
Development Testing
    ↓
Feature Flag Validation
    ↓
Schema Migration Testing
    ↓
Gradual Rollout (0% → 10% → 50% → 100%)
    ↓
Production Deployment
    ↓
Monitoring & Fallback Ready
```

## Benefits of Hierarchical Architecture

### AI Agent Accuracy Improvements
1. **Surgical Context Precision**: Access exactly the right level of detail needed
2. **Reduced Hallucinations**: Specific, verified facts at granular topic levels
3. **Cross-Business Intelligence**: Shared topics reduce training data duplication
4. **Contextual Depth**: Can go shallow or deep based on query complexity

### Development Benefits
1. **Safe Feature Development**: Production remains stable during innovation
2. **Gradual Rollout Control**: Measured deployment with instant rollback
3. **Schema Compatibility**: Additive changes preserve existing functionality
4. **Debug Capabilities**: Enhanced extraction details for optimization

### Business Intelligence Benefits
1. **Auto-Population**: Human narrative input → AI-guided deep context extraction
2. **Cross-Reference Intelligence**: Automatic relationship detection
3. **Scalable Growth**: Easy addition of new topics as documents are processed
4. **Quality Metrics**: Accuracy scoring and usage analytics

## File Structure
```
/production (master branch)
├── components/SimpleFileUpload.tsx (stable with auto-narratives)
├── components/DocumentViewer.tsx (business tag display)
├── supabase-schema.sql (schema v1)
└── .env.production (conservative flags)

/development (feature branch)
├── hierarchical_topics_schema.sql (schema v2 enhancement)
├── lib/featureFlags.ts (development controls)
├── .env.development (enhanced features enabled)
├── setup_development.ps1 (Windows setup script)
├── DEVELOPMENT_STRATEGY.md (this architecture)
└── enhanced components (topic-aware versions)
```

## Success Metrics

### Technical Metrics
- Zero production downtime during development
- Successful schema migration without data loss
- Feature flag response time < 10ms
- Build success rate 100%

### AI Accuracy Metrics
- Agent response relevance improvement
- Reduction in generic/hallucinated responses
- Cross-business topic utilization rate
- Context precision scoring

### Business Metrics
- Document processing throughput
- Topic extraction accuracy
- Agent training data quality
- Client response satisfaction

## Future Roadmap

### Phase 3: Advanced Topic Intelligence
- Machine learning topic relationship detection
- Automatic contradiction identification
- Dynamic topic priority adjustment
- Cross-document concept linking

### Phase 4: Client Implementation
- White-label topic hierarchies
- Client-specific topic trees
- Isolated hierarchical training data
- Custom extraction algorithms

---

*This architecture ensures Planet bizCORE can safely innovate on hierarchical topic extraction while maintaining production stability and preparing for advanced AI agent training capabilities.*
