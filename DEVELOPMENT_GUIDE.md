# Planet bizCORE Development Guide
## Hierarchical Topics Implementation & Testing

## Quick Start for Developers

### 1. Environment Setup
```bash
# Clone repository and switch to development branch
git clone https://github.com/PlanetBizCore/planet-bizcore-parsing.git
cd planet-bizcore-parsing
git checkout feature/hierarchical-topics

# Automated development setup (Windows)
.\setup_development.ps1

# Manual setup if needed
cp .env.development .env.local
npm install
npm run build
```

### 2. Database Schema Migration
```sql
-- Apply to your Supabase instance via SQL Editor
-- File: hierarchical_topics_schema.sql
-- This is ADDITIVE - safe to apply to production database
-- Creates: knowledge_topics, document_topic_associations, topic_hierarchy_paths
```

### 3. Feature Flag Configuration
```bash
# Development settings in .env.local
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=true
NEXT_PUBLIC_ENABLE_AUTO_TOPIC_EXTRACTION=true
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=2
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## Development Workflow

### Testing Auto-Topic Extraction
1. **Upload Test Documents**: Use overview/summary docs that span multiple topics
2. **Monitor Debug Output**: Check console for extraction details
3. **Validate Topic Creation**: Verify hierarchical structure in database
4. **Test Cross-References**: Ensure topic relationships are detected
5. **Measure Extraction Confidence**: Review auto-population accuracy

### Database Queries for Testing

#### View Generated Topics
```sql
SELECT 
    topic_name,
    topic_level,
    topic_path,
    short_description,
    extraction_confidence,
    parent_name
FROM topic_hierarchy_view 
ORDER BY topic_path;
```

#### Check Document-Topic Associations
```sql
SELECT 
    d.filename,
    kt.topic_path,
    dta.relevance_score,
    dta.context_snippet
FROM documents d
JOIN document_topic_associations dta ON d.id = dta.document_id
JOIN knowledge_topics kt ON dta.topic_id = kt.id
WHERE dta.relevance_score > 70
ORDER BY d.filename, dta.relevance_score DESC;
```

#### Topic Hierarchy Navigation
```sql
-- Get all subtopics under a parent
WITH RECURSIVE topic_tree AS (
    SELECT id, topic_name, topic_path, topic_level, parent_topic_id
    FROM knowledge_topics 
    WHERE topic_path = 'jms3'
    
    UNION ALL
    
    SELECT kt.id, kt.topic_name, kt.topic_path, kt.topic_level, kt.parent_topic_id
    FROM knowledge_topics kt
    JOIN topic_tree tt ON kt.parent_topic_id = tt.id
)
SELECT * FROM topic_tree ORDER BY topic_level, topic_path;
```

## Component Development

### Enhanced File Upload Component
```typescript
// components/SimpleFileUpload.tsx
// Already enhanced with extractBusinessModelNarratives()

// Development additions needed:
const extractHierarchicalTopics = (text: string, businessTags: string[]) => {
  // Auto-generate topic trees from document content
  // Return hierarchical structure with parent-child relationships
}
```

### Topic Viewer Component (New)
```typescript
// components/HierarchicalTopicViewer.tsx
interface TopicViewerProps {
  documentId?: string;
  businessModel?: string;
  maxDepth?: number;
}

const HierarchicalTopicViewer = ({ documentId, businessModel, maxDepth = 4 }) => {
  // Display topic tree with navigation
  // Show document associations
  // Enable topic editing and validation
}
```

### Topic Extraction Interface (New)
```typescript
// components/TopicExtractionInterface.tsx
const TopicExtractionInterface = () => {
  // Manual topic refinement
  // Confidence adjustment
  // Relationship validation
  // Cross-reference management
}
```

## Feature Flag Testing

### Gradual Rollout Simulation
```typescript
// Test percentage-based rollout
const testUser1 = { id: 'user123' }; // Should get features at 50%
const testUser2 = { id: 'user456' }; // Should not get features at 50%

console.log('User 1 enabled:', shouldEnableForUser(testUser1.id));
console.log('User 2 enabled:', shouldEnableForUser(testUser2.id));
```

### Environment Switching
```bash
# Test production mode
cp .env.production .env.local
npm run dev

# Test development mode  
cp .env.development .env.local
npm run dev
```

## Database Performance Testing

### Query Performance Benchmarks
```sql
-- Test topic hierarchy query speed
EXPLAIN ANALYZE
SELECT * FROM topic_hierarchy_view 
WHERE business_tags @> ARRAY['JMS3'] 
AND topic_level <= 3;

-- Test document-topic association speed
EXPLAIN ANALYZE
SELECT d.filename, array_agg(kt.topic_path)
FROM documents d
JOIN document_topic_associations dta ON d.id = dta.document_id
JOIN knowledge_topics kt ON dta.topic_id = kt.id
WHERE dta.relevance_score > 80
GROUP BY d.id, d.filename;
```

### Index Optimization
```sql
-- Ensure proper indexing for performance
CREATE INDEX CONCURRENTLY idx_topics_business_tags 
ON knowledge_topics USING GIN(business_tags);

CREATE INDEX CONCURRENTLY idx_associations_relevance 
ON document_topic_associations(relevance_score) 
WHERE relevance_score > 70;
```

## AI Agent Testing

### Topic Context Assembly Testing
```typescript
// lib/agentContextAssembly.ts
const assembleTopicContext = async (
  agentType: 'explainer' | 'doer',
  topicPaths: string[],
  clientContext: any
) => {
  // Combine topic narratives
  // Add cross-references
  // Include document sources
  // Return assembled context for agent
}

// Test with different topic combinations
const testContext = await assembleTopicContext(
  'explainer',
  ['jms3.strategic_leadership', 'jms3.team_development'],
  { industry: 'healthcare', size: 'small' }
);
```

### Hallucination Reduction Validation
```typescript
// Compare responses with/without hierarchical topics
const testQueries = [
  "How does JMS3 handle strategic planning?",
  "What are the AI4Coaches automation capabilities?",
  "How do Subject Matter Elders create content strategies?"
];

// Test with flat tags (production)
// Test with hierarchical topics (development)
// Measure accuracy, specificity, source attribution
```

## Production Deployment Checklist

### Pre-Deployment Validation
- [ ] All tests pass in development environment
- [ ] Database schema migration tested on copy of production data
- [ ] Feature flags properly configured for gradual rollout
- [ ] Performance benchmarks meet requirements (queries < 200ms)
- [ ] Extraction accuracy > 80% on test document set
- [ ] Rollback procedures tested and documented

### Deployment Process
```bash
# 1. Merge to master
git checkout master
git merge feature/hierarchical-topics

# 2. Apply database schema (additive only)
# Run hierarchical_topics_schema.sql in production Supabase

# 3. Configure production feature flags
# Start with HIERARCHICAL_TOPICS_PERCENTAGE=0
# Gradually increase: 10% → 25% → 50% → 100%

# 4. Deploy to production
git push origin master
npx vercel --prod

# 5. Monitor and validate
# Check application logs
# Verify database performance
# Monitor user experience metrics
```

### Post-Deployment Monitoring
- Query performance metrics
- Feature flag activation rates
- User engagement with hierarchical topics
- AI agent response accuracy improvements
- Error rates and exception tracking

## Troubleshooting Guide

### Common Issues

#### Topic Extraction Not Working
```typescript
// Check feature flags
console.log('Hierarchical topics enabled:', isHierarchicalTopicsEnabled());

// Check extraction function
const result = extractBusinessModelNarratives(testContent, ['JMS3']);
console.log('Extraction result:', result);
```

#### Database Schema Conflicts
```sql
-- Check schema version
SELECT version FROM schema_versions ORDER BY timestamp DESC LIMIT 1;

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('knowledge_topics', 'document_topic_associations');
```

#### Performance Issues
```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('knowledge_topics', 'document_topic_associations');

-- Monitor query performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%knowledge_topics%' 
ORDER BY mean_exec_time DESC;
```

### Debug Mode Features
```typescript
// Enable detailed logging
if (isDebugMode()) {
  console.log('🌳 Topic extraction details:', extractionResults);
  console.log('🔗 Cross-references found:', crossReferences);
  console.log('📊 Relevance scores:', relevanceScores);
}
```

## Best Practices

### Topic Naming Conventions
- Use lowercase with underscores: `strategic_leadership`
- Hierarchical paths with dots: `jms3.strategic_leadership.vision_setting`
- Descriptive but concise: `ai4coaches.coaching_automation.assessment_tools`

### Content Quality Guidelines
- **Short Description**: 1-2 sentences, clear tagline
- **Long Narrative**: 2-3 paragraphs, detailed context for AI training
- **Cross-References**: Only include validated relationships
- **Source Attribution**: Always link to originating documents

### Performance Optimization
- Index frequently queried topic paths
- Cache topic hierarchies for common business models
- Use materialized views for complex topic relationships
- Limit hierarchical depth to 5 levels for optimal performance

---
*This guide should be updated as new features are developed and deployment patterns evolve.*
