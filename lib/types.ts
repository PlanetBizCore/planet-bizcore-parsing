// Core types for PBC Parsing App - Phase 2 Ready

export interface ParsedDocument {
  id: string;
  filename: string;
  file_type: 'md' | 'pdf' | 'doc' | 'docx' | 'txt' | 'chat';
  upload_date: string;
  file_size: number;
  raw_content: string;
  parsed_sections: ParsedSection[];
  tags: string[];
  metadata: DocumentMetadata;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  
  // Phase 2 Agent-Ready Headers
  lineage: DocumentLineage;
  ai_summary: AISummary;
  cross_references: CrossReference[];
  version_history: DocumentVersion[];
}

export interface DocumentLineage {
  original_author: string;
  creation_date: string;
  last_modified: string;
  source_system?: string;
  document_series?: string; // For related docs
  parent_document_id?: string;
  child_document_ids: string[];
  revision_number: number;
  approval_status?: 'draft' | 'review' | 'approved' | 'deprecated';
  stakeholders: string[]; // John, Tony, etc.
}

export interface AISummary {
  executive_summary: string;
  key_concepts: string[];
  psychological_patterns: string[];
  business_logic_complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  token_efficiency_score: number; // 1-100 for GPT selection
  recommended_gpt_model: 'gpt-3.5' | 'gpt-4' | 'gpt-4-turbo' | 'custom';
  context_window_requirement: number; // Estimated tokens needed
}

export interface CrossReference {
  id: string;
  target_document_id: string;
  target_section_id?: string;
  relationship_type: 'builds_on' | 'contradicts' | 'supports' | 'references' | 'supersedes';
  confidence_score: number;
  created_by: 'system' | 'user';
}

export interface DocumentVersion {
  version_id: string;
  timestamp: string;
  changes_summary: string;
  changed_by: string;
  change_type: 'content' | 'structure' | 'metadata' | 'tags';
}

export interface ParsedSection {
  id: string;
  document_id: string;
  section_type: SectionType;
  title?: string;
  content: string;
  order_index: number;
  
  // Enhanced for Agent Access (Wide Strategy)
  psychological_tags: string[];
  workflow_tags: string[];
  business_logic_tags: string[];
  confidence_score: number;
  created_at: string;
  
  // Agent Optimization Fields
  token_count: number;
  complexity_score: number; // 1-10
  dependency_sections: string[]; // IDs of related sections
  action_items: ActionItem[];
  decision_points: DecisionPoint[];
  knowledge_category: KnowledgeCategory;
}

export interface ActionItem {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_effort: string;
  prerequisites: string[];
  stakeholder: string;
}

export interface DecisionPoint {
  id: string;
  question: string;
  options: string[];
  criteria: string[];
  psychological_considerations: string[];
  recommended_approach: string;
}

export interface KnowledgeCategory {
  primary_domain: BusinessDomain;
  secondary_domains: BusinessDomain[];
  psychological_framework: PsychologicalFramework;
  automation_potential: 'low' | 'medium' | 'high';
  client_facing: boolean;
  training_priority: number; // 1-10 for AI training
}

export type BusinessDomain = 
  | 'sales' | 'marketing' | 'operations' | 'finance' | 'hr' | 'strategy'
  | 'customer_success' | 'product' | 'legal' | 'compliance' | 'it'
  | 'leadership' | 'communication' | 'negotiation' | 'analytics';

export type PsychologicalFramework =
  | 'resistance_handling' | 'motivation' | 'decision_making' | 'trust_building'
  | 'change_management' | 'influence' | 'persuasion' | 'rapport_building'
  | 'conflict_resolution' | 'emotional_intelligence' | 'cognitive_bias'
  | 'behavioral_triggers' | 'communication_styles' | 'meta_cognitive_awareness'
  | 'collaborative_problem_solving' | 'strategic_thinking' | 'future_oriented_thinking';

export type SectionType = 
  | 'heading' | 'workflow' | 'calculation' | 'narrative' | 'principle'
  | 'step' | 'psychology' | 'instruction' | 'example' | 'decision_tree'
  | 'checklist' | 'framework' | 'case_study' | 'template' | 'script'
  | 'objection_handling' | 'troubleshooting' | 'best_practice' | 'unknown';

export interface DocumentMetadata {
  author?: string;
  created_date?: string;
  source?: string;
  context?: string;
  client_perspective?: string;
  psychological_insights: string[];
  business_domain: BusinessDomain;
  complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  
  // Enhanced Metadata for AI Training
  training_value: number; // 1-10
  real_world_applications: string[];
  success_metrics: string[];
  common_mistakes: string[];
  prerequisites: string[];
  follow_up_actions: string[];
}

// Wide Table Strategy for Agent Efficiency
export interface AgentKnowledgeBase {
  id: string;
  source_document_id: string;
  source_section_id: string;
  
  // Flattened for fast access (WIDE strategy)
  knowledge_type: string;
  primary_concept: string;
  supporting_concepts: string[];
  psychological_pattern: string;
  business_logic: string;
  automation_instructions: string;
  client_guidance: string;
  
  // Token Optimization
  compressed_content: string; // AI-optimized version
  full_content: string; // Original for deep context
  token_count_compressed: number;
  token_count_full: number;
  
  // Agent Selection Criteria
  gpt_model_recommendation: string;
  context_requirements: string[];
  processing_complexity: number;
  
  // Relationship Mapping (for context assembly)
  related_knowledge_ids: string[];
  prerequisite_knowledge_ids: string[];
  dependent_knowledge_ids: string[];
  
  created_at: string;
  updated_at: string;
  version: number;
}

// Chat-specific structures
export interface ParsedChat {
  id: string;
  filename: string;
  participants: string[];
  message_count: number;
  date_range: {
    start: string;
    end: string;
  };
  extracted_insights: ChatInsight[];
  tags: string[];
  
  // Enhanced for AI Training
  conversation_type: 'client_interaction' | 'internal_discussion' | 'training_session' | 'problem_solving';
  psychological_dynamics: string[];
  business_outcomes: string[];
  lesson_learned: string[];
}

export interface ChatInsight {
  id: string;
  chat_id: string;
  speaker: string;
  timestamp: string;
  content: string;
  insight_type: 'workflow' | 'principle' | 'psychology' | 'instruction' | 'decision' | 'objection' | 'solution';
  confidence_score: number;
  
  // Agent Training Data
  context_before: string;
  context_after: string;
  emotional_tone: string;
  business_impact: 'low' | 'medium' | 'high';
  reusability_score: number; // How often this pattern appears
}

export interface UploadProgress {
  filename: string;
  status: 'uploading' | 'parsing' | 'ai_processing' | 'cross_referencing' | 'complete' | 'error';
  progress: number;
  current_step?: string;
  error?: string;
}

// Schema Evolution Tracking
export interface SchemaVersion {
  version: string;
  timestamp: string;
  changes: SchemaChange[];
  migration_required: boolean;
}

export interface SchemaChange {
  table_name: string;
  change_type: 'add_column' | 'modify_column' | 'add_table' | 'add_index';
  description: string;
  sql_migration?: string;
}

export interface ParsedChat {
  id: string;
  filename: string;
  participants: string[];
  message_count: number;
  date_range: {
    start: string;
    end: string;
  };
  extracted_insights: ChatInsight[];
  tags: string[];
  
  // Enhanced for AI Training
  conversation_type: 'client_interaction' | 'internal_discussion' | 'training_session' | 'problem_solving';
  psychological_dynamics: string[];
  business_outcomes: string[];
  lesson_learned: string[];
}
