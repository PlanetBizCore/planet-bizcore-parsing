# Enhanced Document Processing Architecture
## Auto-Population of Data Matrix from Parsed Documents

### Current Process vs Enhanced Process

**Current:**
Document Upload → Basic Tag Detection → Store as Markdown

**Enhanced:**
Document Upload → Advanced Parsing → Tag Extraction → Narrative Chunk Extraction → Data Matrix Population → Cross-Reference Building

### Enhanced Processing Pipeline

```typescript
interface EnhancedDocumentProcessor {
  // Phase 1: Content Analysis
  parseDocument(content: string): {
    sections: DocumentSection[];
    detectedTags: BusinessTag[];
    narrativeChunks: NarrativeChunk[];
    concepts: ExtractedConcept[];
    crossReferences: CrossReference[];
  };
  
  // Phase 2: Knowledge Extraction
  extractBusinessNarratives(sections: DocumentSection[]): BusinessNarrative[];
  buildTagRelationships(tags: BusinessTag[], content: string): TagRelationship[];
  identifyCrossReferences(content: string, existingDocs: Document[]): CrossReference[];
  
  // Phase 3: Data Population
  populateTagDefinitions(narratives: BusinessNarrative[]): void;
  updateCrossReferenceMatrix(references: CrossReference[]): void;
  buildConceptGraph(concepts: ExtractedConcept[]): void;
}
```

### Auto-Extraction Algorithms

#### 1. Narrative Chunk Extraction
```typescript
const extractNarrativeChunks = (content: string, tags: string[]) => {
  const chunks: NarrativeChunk[] = [];
  
  for (const tag of tags) {
    // Find paragraphs that discuss this tag
    const relevantSections = findSectionsContaining(content, tag);
    
    for (const section of relevantSections) {
      chunks.push({
        tagName: tag,
        shortDescription: extractFirstSentence(section),
        detailedNarrative: extractFullParagraph(section),
        contextualUsage: extractUsageExamples(section),
        implementationNotes: extractActionItems(section),
        sourceDocumentId: documentId,
        sourceSection: section.title,
        confidenceScore: calculateRelevanceScore(section, tag)
      });
    }
  }
  
  return chunks;
};
```

#### 2. Cross-Reference Detection
```typescript
const detectCrossReferences = (currentDoc: string, existingDocs: Document[]) => {
  const references: CrossReference[] = [];
  
  // Pattern matching for explicit references
  const explicitRefs = findExplicitReferences(currentDoc); // "as mentioned in...", "similar to..."
  
  // Semantic similarity detection
  const semanticRefs = findSemanticSimilarities(currentDoc, existingDocs);
  
  // Concept co-occurrence analysis
  const conceptRefs = findConceptOverlaps(currentDoc, existingDocs);
  
  return [...explicitRefs, ...semanticRefs, ...conceptRefs];
};
```

#### 3. Business Model Pattern Recognition
```typescript
const recognizeBusinessPatterns = (content: string) => {
  const patterns = {
    // JMS3 Patterns
    jms3: {
      indicators: ['strategic concierge', 'solo founders', 'getting unstuck'],
      extractionRules: [
        { pattern: /strategic concierge.*?(?=\n\n|\.|$)/gi, type: 'service_description' },
        { pattern: /solo.*?founder.*?(?=\n\n|\.|$)/gi, type: 'target_audience' },
        { pattern: /coaching.*?approach.*?(?=\n\n|\.|$)/gi, type: 'methodology' }
      ]
    },
    
    // AI4Coaches Patterns
    ai4coaches: {
      indicators: ['ai coaching', 'automated coaching', 'coaching technology'],
      extractionRules: [
        { pattern: /ai.*?coaching.*?(?=\n\n|\.|$)/gi, type: 'technology_description' },
        { pattern: /automation.*?coaching.*?(?=\n\n|\.|$)/gi, type: 'automation_approach' }
      ]
    }
    
    // Add patterns for other business models...
  };
  
  return extractPatternsFromContent(content, patterns);
};
```

### Database Schema for Auto-Population

```sql
-- Wide columns for fast auto-population
ALTER TABLE documents ADD COLUMN IF NOT EXISTS 
  -- Auto-extracted narratives (WIDE strategy)
  jms3_description TEXT,
  jms3_methodology TEXT,
  jms3_target_audience TEXT,
  jms3_success_patterns TEXT,
  
  ai4coaches_description TEXT,
  ai4coaches_technology TEXT,
  ai4coaches_automation TEXT,
  ai4coaches_use_cases TEXT,
  
  sme_description TEXT,
  sme_content_strategy TEXT,
  sme_positioning TEXT,
  sme_frameworks TEXT,
  
  bizcore360_description TEXT,
  bizcore360_systems TEXT,
  bizcore360_automation TEXT,
  bizcore360_integrations TEXT,
  
  -- Cross-reference data (WIDE)
  referenced_concepts TEXT[],
  similar_documents UUID[],
  contradicting_approaches UUID[],
  building_upon UUID[],
  
  -- Auto-extracted metadata
  key_concepts TEXT[],
  action_items TEXT[],
  decision_points TEXT[],
  success_metrics TEXT[],
  
  -- Processing metadata
  auto_extraction_version TEXT DEFAULT '1.0',
  extraction_confidence_score INTEGER DEFAULT 50,
  last_processed TIMESTAMPTZ DEFAULT NOW();
```

### Enhanced Upload Component

```typescript
const processDocumentEnhanced = async (file: File) => {
  const content = await file.text();
  
  // Phase 1: Enhanced parsing
  const parseResults = await enhancedDocumentParser.parse(content);
  
  // Phase 2: Auto-extract business model narratives
  const businessNarratives = extractBusinessModelNarratives(content, parseResults.tags);
  
  // Phase 3: Build cross-references with existing documents
  const crossReferences = await buildCrossReferences(content, parseResults.concepts);
  
  // Phase 4: Populate wide columns
  const documentData = {
    // Standard fields
    filename: file.name,
    raw_content: content,
    business_tags: parseResults.tags,
    
    // Auto-populated narratives (WIDE)
    jms3_description: businessNarratives.jms3?.description,
    jms3_methodology: businessNarratives.jms3?.methodology,
    jms3_target_audience: businessNarratives.jms3?.targetAudience,
    
    ai4coaches_description: businessNarratives.ai4coaches?.description,
    ai4coaches_technology: businessNarratives.ai4coaches?.technology,
    
    // Auto-populated cross-references (WIDE)
    referenced_concepts: parseResults.concepts.map(c => c.name),
    similar_documents: crossReferences.similar.map(r => r.documentId),
    building_upon: crossReferences.buildingUpon.map(r => r.documentId),
    
    // Auto-extracted metadata
    key_concepts: parseResults.keyConcepts,
    action_items: parseResults.actionItems,
    decision_points: parseResults.decisionPoints,
    
    extraction_confidence_score: calculateOverallConfidence(parseResults)
  };
  
  // Phase 5: Save to database with all auto-populated data
  const savedDoc = await supabase.from('documents').insert(documentData);
  
  // Phase 6: Update cross-reference matrix
  await updateCrossReferenceMatrix(savedDoc.id, crossReferences);
  
  return savedDoc;
};
```

### Auto-Population Rules Engine

```typescript
const businessModelExtractionRules = {
  jms3: {
    description: {
      patterns: [
        /strategic concierge for (.*?)(?=\.|,|\n)/gi,
        /solo.*?founders.*?who (.*?)(?=\.|,|\n)/gi,
        /getting.*?builders.*?unstuck.*?(.*?)(?=\.|,|\n)/gi
      ],
      combineStrategy: 'longest_match'
    },
    methodology: {
      patterns: [
        /coaching approach.*?(.*?)(?=\n\n)/gi,
        /leadership development.*?(.*?)(?=\n\n)/gi,
        /executive coaching.*?(.*?)(?=\n\n)/gi
      ],
      combineStrategy: 'concatenate'
    },
    targetAudience: {
      patterns: [
        /solo founders/gi,
        /duopreneurs/gi,
        /solo & duo builders/gi
      ],
      combineStrategy: 'unique_list'
    }
  },
  
  ai4coaches: {
    description: {
      patterns: [
        /ai.*?coaching.*?platform.*?(.*?)(?=\.|,|\n)/gi,
        /automated coaching.*?(.*?)(?=\.|,|\n)/gi,
        /coaching technology.*?(.*?)(?=\.|,|\n)/gi
      ]
    },
    technology: {
      patterns: [
        /ai assessment.*?(.*?)(?=\n\n)/gi,
        /coaching automation.*?(.*?)(?=\n\n)/gi,
        /smart coaching.*?(.*?)(?=\n\n)/gi
      ]
    }
  }
  
  // Continue for other business models...
};
```

### Matrix Visualization After Auto-Population

```typescript
// The ContextDataMatrix component would now display:
const matrixData = {
  businessModels: ['JMS3', 'AI4Coaches', 'SME', 'bizCore360'],
  narrativeCategories: ['Description', 'Methodology', 'Target Audience', 'Technology'],
  crossReferences: ['Similar Docs', 'Building Upon', 'Contradicts', 'Implements'],
  
  // Auto-populated from document processing
  cellData: {
    'JMS3-Description': extractedData.jms3_description,
    'JMS3-Methodology': extractedData.jms3_methodology,
    'AI4Coaches-Technology': extractedData.ai4coaches_technology,
    // etc...
  }
};
```
