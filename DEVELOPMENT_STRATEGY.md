# Planet bizCORE Development Strategy
## Hierarchical Topics Implementation

### Current Status
- **Production Branch**: `master` - Live at Vercel, fully functional with auto-narrative population
- **Development Branch**: `feature/hierarchical-topics` - Enhanced with hierarchical topic extraction
- **Database**: Production Supabase with Schema v1, development ready for Schema v2
- **Documentation**: Complete agent context documents and architecture documentation
- **Safety Controls**: Feature flag system and backup procedures implemented

### Development Approach

#### Phase 1: Schema Enhancement (Safe)
- Add hierarchical topic tables alongside existing structure
- Use feature flags to enable/disable new functionality
- Existing documents table remains untouched initially

#### Phase 2: Parallel Data Population
- Build hierarchical extraction tools
- Test with sample documents in development mode
- Validate data quality and accuracy improvements

#### Phase 3: Integration & Testing
- Connect hierarchical data to existing upload flow
- Test auto-population with real documents
- Measure AI agent accuracy improvements

#### Phase 4: Production Migration
- Merge to master branch
- Deploy to production
- Gradual feature rollout with fallback options

### Database Strategy

#### Option A: Feature Flag Approach (Recommended)
```sql
-- Add new tables without affecting existing functionality
CREATE TABLE knowledge_topics (...);
CREATE TABLE topic_hierarchies (...);

-- Use environment variable to toggle features
-- ENABLE_HIERARCHICAL_TOPICS=true/false
```

#### Option B: Schema Versioning
```sql
-- Add schema version tracking
ALTER TABLE documents ADD COLUMN schema_version INTEGER DEFAULT 1;

-- Version 2 = hierarchical topics enabled
-- Version 1 = current flat structure
```

### Deployment Safety

#### Rollback Plan
- Keep master branch as safe fallback
- Database changes are additive only (no drops)
- Feature flags allow instant disable
- Vercel deployment history for quick revert

#### Testing Strategy
- Local development testing
- Supabase staging environment (if available)
- Production testing with feature flags
- Gradual user rollout

### File Structure
```
/current-production (preserved)
├── components/SimpleFileUpload.tsx (working)
├── components/DocumentViewer.tsx (working)
└── database schema (stable)

/enhanced-development (new)
├── components/HierarchicalUpload.tsx (new)
├── components/TopicViewer.tsx (new)
├── lib/topicExtraction.ts (new)
└── enhanced schema (additive)
```

### Success Metrics
- Zero downtime during development
- Production app remains fully functional
- Enhanced features improve accuracy measurably
- Smooth transition from flat to hierarchical

### Timeline
- **Week 1**: ✅ Schema design and creation complete
- **Week 2**: Build extraction algorithms and test auto-population
- **Week 3**: Integration testing and accuracy measurement
- **Week 4**: Production deployment with gradual rollout

### Risk Mitigation
- Development branch isolation
- Additive database changes only
- Feature flag controls
- Comprehensive testing before merge
- Quick rollback procedures

---
*This strategy ensures production stability while building enhanced functionality*
