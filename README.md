# 🚀 Planet bizCORE Parsing App - Hierarchical BizDatabase

## Current Status: Hierarchical Topics Development (July 17, 2025)

### ✅ **Production Ready**
- **Live Application**: Fully functional at Vercel production environment
- **Business Model Auto-Detection**: All 4 Planet bizCORE businesses with auto-population
- **Enhanced Parsing**: Auto-extraction of business model narratives during upload
- **Agent Context Documents**: Complete explainer and doer agent training contexts
- **Safe Development**: Feature branch strategy preserving production stability

### 🚧 **Development Branch: Hierarchical Topics**
- **Enhanced Schema**: Topic trees with parent-child relationships and granular narratives
- **Auto-Topic Extraction**: Build hierarchical knowledge from document content
- **Feature Flag System**: Safe development with production fallback controls
- **Surgical AI Precision**: Topic → subtopic → sub-subtopic for reduced hallucinations
- **Cross-Business Intelligence**: Shared topics across JMS3, AI4Coaches, SME, bizCore360

### 🎯 **Core Purpose Evolution**
**Phase 1** (Production): Unified Planet bizCORE BizDatabase with business model auto-detection
**Phase 2** (Development): Hierarchical topic structure for enhanced AI agent accuracy

### 🏢 **Enhanced Business Model Detection & Auto-Population**
System now extracts narratives automatically during upload:

**JMS3 Auto-Extraction**:
- `jms3_description`: Strategic concierge narrative identification
- `jms3_methodology`: Coaching approach and leadership development context

**AI4Coaches Auto-Extraction**:
- `ai4coaches_description`: AI coaching technology narrative
- `ai4coaches_technology`: Automated coaching system details

**Subject Matter Elders Auto-Extraction**:
- `sme_description`: Content creation and thought leadership context  
- `sme_content_strategy`: Positioning and distribution strategies

**bizCore360 Auto-Extraction**:
- `bizcore360_description`: Systems and automation narrative
- `bizcore360_systems`: Platform integration and automation details

### 🌳 **Hierarchical Topics Structure (Development)**
```
Business Model (Level 1)
├── Strategic Leadership (Level 2)
│   ├── Vision Setting (Level 3)
│   └── Decision Frameworks (Level 3)
├── Operational Excellence (Level 2)
│   └── Process Design (Level 3)
└── Team Development (Level 2)
```

Each topic contains:
- **Topic Name**: Clear identifier
- **Short Description**: Tagline for quick context
- **Long Narrative**: Full paragraph for detailed AI context
- **Hierarchical Relationships**: Parent-child topic chains
- **Cross-References**: Related, contradictory, and prerequisite topics

## 🚀 Quick Start

### Production Deployment (Stable)
```bash
git checkout master
npm install
npm run build
npx vercel --prod
```

### Development Environment (Hierarchical Topics)
```bash
git checkout feature/hierarchical-topics
.\setup_development.ps1  # Windows PowerShell
# OR
./setup_development.sh   # Linux/Mac

# Apply enhanced schema
# Copy hierarchical_topics_schema.sql to Supabase SQL Editor and run
```

### Environment Configuration
**Production** (`.env.production`):
```bash
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=false
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=1
# Conservative settings for production stability
```

**Development** (`.env.development`):
```bash
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=true
NEXT_PUBLIC_ENABLE_AUTO_TOPIC_EXTRACTION=true
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=2
# Enhanced features for testing
```

### Database Schema Setup
**Phase 1** (Production): Apply `supabase-schema.sql`
**Phase 2** (Development): Apply `hierarchical_topics_schema.sql` (additive)

### Feature Flag Controls
- **Safe Development**: New features controlled by environment variables
- **Gradual Rollout**: Percentage-based feature activation
- **Instant Rollback**: Feature flags allow immediate disable
- **Production Safety**: Conservative defaults with explicit opt-in

## 🎯 What You'll See Working

### 📄 **Enhanced Document Processing**
- **Auto-Upload Processing**: Documents populate database immediately during upload
- **Business Model Detection**: Automatic tagging and narrative extraction
- **Hierarchical Topic Extraction** (Development): Auto-generation of topic trees
- **Cross-Reference Intelligence**: Related topics and document associations
- **Multi-Format Support**: `.md`, `.pdf`, `.doc`, `.docx`, `.txt` files

### 🧠 **AI-Ready Hierarchical Data Structure**
- **Topic Trees**: Main topics → subtopics → sub-subtopics with full narrative context
- **Granular Context Access**: Surgical precision for AI agent responses
- **Auto-Populated Narratives**: Business model descriptions extracted during upload
- **Cross-Business Intelligence**: Shared topics across all Planet bizCORE models
- **Relevance Scoring**: Document-topic associations with confidence levels

### 🚩 **Feature Flag Controlled Development**
- **Safe Testing**: New hierarchical features controlled by environment flags
- **Production Stability**: Master branch remains untouched during development
- **Gradual Rollout**: Percentage-based feature activation for measured deployment
- **Debug Mode**: Enhanced extraction details visible in development environment

### 🔄 **Meta-Learning Foundation**
- Every document processed improves the system
- Development conversations become training data
- Recursive improvement capability built-in

---

## Quick Test Checklist

### ✅ Phase 1 Validation
- [ ] Upload a Markdown file successfully
- [ ] See parsed sections in the UI
- [ ] Verify psychological tags are extracted
- [ ] Check business domain classification
- [ ] Confirm data is saved to Supabase

### 🎯 Ready for Your 150 Documents
Once the quick test passes, you can:
1. **Batch upload** multiple documents at once
2. **Browse and search** your knowledge base
3. **Export structured data** for AI training
4. **Track processing metrics** and insights

---

## Troubleshooting

### If Upload Fails:
- Check Supabase connection in browser console
- Verify environment variables are set correctly
- Ensure database schema was created successfully

### If Parsing Seems Off:
- Check the confidence scores in the UI
- Review the extracted tags and sections
- The system learns and improves with more documents

---

## Next Phase Preview

### 🤖 Phase 2: AI Agent Training (Coming Soon)
- Train AI agents on your processed documents
- Create client-facing automation tools
- Build BizDatabase templates for Planet BizCORE clients
- Deploy psychological workflow AI assistants

**Your 150 documents will become the foundation for an entire AI agent network!**

---

## Support

The system is designed to be self-documenting and self-improving. As you use it:
- Patterns will emerge from your documents
- The AI will learn your psychological frameworks
- Cross-references will build automatically
- Your expertise will be systematized for reuse

**Ready to transform 30+ years of business wisdom into AI-ready knowledge? Let's go! 🚀**
