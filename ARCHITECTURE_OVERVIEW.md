# Planet bizCORE Architecture Overview
## Hierarchical Topics System for Enhanced AI Agent Training

### System Overview
Planet bizCORE parsing application has evolved from a simple document processor to a sophisticated hierarchical knowledge system designed for AI agent training and enhanced business intelligence. The system now operates on two parallel tracks: a stable production environment and an enhanced development environment with hierarchical topics capabilities.

## Architecture Principles

### 1. Safe Development Strategy
- **Production Stability**: Master branch remains fully functional and deployed
- **Feature Branch Development**: Enhanced capabilities developed in isolation
- **Feature Flag Controls**: New functionality controlled by environment variables
- **Gradual Rollout**: Percentage-based activation for measured deployment
- **Instant Rollback**: Environment changes can disable features immediately

### 2. Hierarchical Knowledge Structure
- **Topic Trees**: Main topics → subtopics → sub-subtopics with unlimited depth
- **Narrative Context**: Each topic contains tagline + detailed paragraph for AI training
- **Cross-References**: Related, contradictory, and prerequisite topic relationships
- **Auto-Population**: Topic extraction from document content during upload
- **Relevance Scoring**: Document-topic associations with confidence levels (0-100)

### 3. Surgical AI Precision
- **Granular Context Access**: AI agents can access exactly the right level of detail
- **Hallucination Reduction**: Specific, verified facts at every hierarchical level
- **Cross-Business Intelligence**: Shared topics across all Planet bizCORE business models
- **Dynamic Context Assembly**: Build agent instructions from topic combinations

## Technical Architecture

### Database Schema Evolution

#### Production Schema (Version 1)
```sql
-- Current stable production
documents (
    id, filename, raw_content, business_tags[], 
    jms3_description, ai4coaches_technology, 
    sme_content_strategy, bizcore360_systems,
    -- Auto-populated wide columns for fast AI access
)
```

#### Development Schema (Version 2) - Additive Enhancement
```sql
-- Hierarchical topic structure (additive to Version 1)
knowledge_topics (
    id, topic_name, short_description, long_narrative,
    parent_topic_id, topic_level, topic_path,
    business_tags[], extraction_confidence,
    ai_training_priority, context_complexity
)

document_topic_associations (
    document_id, topic_id, relevance_score,
    context_snippet, validation_status
)

topic_hierarchy_paths (
    topic_id, ancestor_id, depth, path_text
    -- Materialized paths for efficient queries
)
```

### Application Architecture

#### Frontend (Next.js 15.4.1 + TypeScript)
```typescript
// Feature flag controlled enhancement
components/
├── SimpleFileUpload.tsx           // Auto-population + topic extraction
├── DocumentViewer.tsx             // Hierarchical topic navigation
├── HierarchicalTopicViewer.tsx    // (Development) Topic tree display
└── TopicExtractionInterface.tsx   // (Development) Manual refinement

lib/
├── featureFlags.ts                // Safe development controls
├── topicExtraction.ts             // (Development) Auto-extraction algorithms
└── supabase.ts                    // Database connectivity
```

#### Backend (Supabase + PostgreSQL)
```sql
-- Production: Wide columns for speed
-- Development: Hierarchical relationships for precision
-- Auto-population: Pattern matching algorithms
-- Cross-references: Topic relationship detection
```

### Feature Flag System

#### Production Environment
```bash
# Conservative settings for stability
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=false
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=1
NEXT_PUBLIC_HIERARCHICAL_TOPICS_PERCENTAGE=0
```

#### Development Environment
```bash
# Full feature access for testing
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=true
NEXT_PUBLIC_ENABLE_AUTO_TOPIC_EXTRACTION=true
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=2
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## Business Model Integration

### Auto-Population System
During document upload, the system automatically extracts:

#### JMS3 (John's Management System 3)
- **Strategic Leadership**: Vision setting, decision frameworks
- **Operational Excellence**: Process design, performance measurement
- **Team Development**: Hiring strategies, performance management

#### AI4Coaches
- **Coaching Automation**: AI assessment tools, digital platforms
- **Coach Training**: AI integration protocols, technology adoption
- **Client Engagement**: Automated workflows, progress tracking

#### Subject Matter Elders
- **Content Creation**: Thought leadership, expertise documentation
- **Knowledge Preservation**: Expert capture, institutional memory
- **Distribution Strategies**: Platform positioning, audience engagement

#### bizCore360
- **Systems Integration**: Platform connections, automation handoffs
- **Business Intelligence**: Dashboard integration, performance analytics
- **Client Delivery**: CRM automation, service delivery optimization

### Cross-Business Intelligence
The hierarchical system identifies shared topics across business models:
- **Leadership Development**: Common across JMS3, AI4Coaches, SME
- **Technology Integration**: Shared between AI4Coaches and bizCore360
- **Content Strategy**: Overlaps between SME and all other models
- **Client Engagement**: Universal methodology across all business models

## AI Agent Training Enhancement

### Precision Context Access
```typescript
// Agent can request specific topic depth
const getTopicContext = (topicPath: string, depth: number) => {
  // "jms3.leadership.vision_setting" with depth 2
  // Returns parent context + current topic + child summaries
}
```

### Dynamic Instruction Assembly
```typescript
// Build agent instructions from topic combinations
const assembleInstructions = (
  agentType: 'explainer' | 'doer',
  topicPaths: string[],
  businessModel: string
) => {
  // Combine base instructions + topic narratives + cross-references
  // Result: Surgical precision for specific client situations
}
```

### Hallucination Reduction Strategy
1. **Granular Facts**: Specific details at appropriate topic levels
2. **Source Attribution**: Each fact linked to specific documents
3. **Confidence Scoring**: Extraction confidence tracked per topic
4. **Validation Status**: Human verification of auto-extracted topics
5. **Cross-Reference Validation**: Topic relationships verified against source material

## Development Workflow

### Safe Development Process
1. **Feature Branch Creation**: `git checkout feature/hierarchical-topics`
2. **Development Environment Setup**: `.\setup_development.ps1`
3. **Schema Enhancement**: Apply `hierarchical_topics_schema.sql`
4. **Feature Development**: Build and test hierarchical capabilities
5. **Production Merge**: When ready, merge to master and deploy

### Testing Strategy
1. **Upload Overview Documents**: Test auto-topic extraction
2. **Validate Topic Hierarchies**: Ensure accurate parent-child relationships
3. **Cross-Reference Testing**: Verify topic relationship detection
4. **AI Agent Accuracy**: Measure improvement in response precision
5. **Performance Validation**: Ensure query speed with hierarchical structure

### Rollback Safety
- **Feature Flags**: Instant disable via environment variables
- **Branch Isolation**: Master branch remains stable during development
- **Database Safety**: Additive schema changes only (no drops)
- **Deployment History**: Vercel maintains deployment rollback capability

## Success Metrics

### Technical Metrics
- **Query Performance**: Topic hierarchy queries < 200ms
- **Extraction Accuracy**: Auto-topic extraction confidence > 80%
- **Schema Migration**: Zero downtime during enhancement deployment
- **Feature Flag Response**: Environment changes effective within 1 minute

### Business Intelligence Metrics
- **Topic Coverage**: Percentage of documents with topic associations
- **Cross-Business Patterns**: Shared topics identified across business models
- **Agent Accuracy**: Improvement in AI response relevance and precision
- **Hallucination Reduction**: Decreased fabricated information in agent responses

### User Experience Metrics
- **Document Processing Speed**: Upload to topic extraction completion time
- **Topic Navigation**: User engagement with hierarchical topic browsing
- **Agent Interaction**: Client satisfaction with precise, contextual responses
- **Content Discovery**: Improved ability to find relevant methodologies

## Future Roadmap

### Phase 3: Query Suggestion System
- **Intelligent Query Generation**: Based on actual database content
- **Context-Aware Suggestions**: Relevant to user's current business situation
- **Cross-Model Recommendations**: Suggest related topics across business models

### Phase 4: Dynamic Instruction Assembly
- **Real-Time Agent Creation**: Assemble agent instructions from topic combinations
- **Client-Specific Agents**: Customize based on client's specific topic usage
- **Layered Context**: Build complex instructions from simple topic components

### Phase 5: Production Embedding
- **Client Application Integration**: Embed in client business applications
- **Multi-Tenant Architecture**: Isolated topic trees per client organization
- **Template Inheritance**: Clients inherit Planet bizCORE proven methodologies

## Conclusion

The hierarchical topics architecture represents a fundamental evolution in AI agent training methodology. By providing surgical precision in context access while maintaining safe development practices, the system enables unprecedented accuracy in business intelligence and client guidance.

The feature flag system ensures production stability while allowing continuous enhancement, and the hierarchical structure provides the foundation for advanced AI applications that can scale across multiple business models and client organizations.

This architecture positions Planet bizCORE as a leader in precision business intelligence and AI-powered client guidance systems.

---
*Last Updated: July 17, 2025 - Development Branch: feature/hierarchical-topics*
