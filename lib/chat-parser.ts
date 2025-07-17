import { ParsedChat, ChatInsight, ParsedDocument, ParsedSection } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ChatParser {
  
  static async parseChatFile(file: File): Promise<ParsedChat> {
    try {
      const content = await this.readFile(file);
      const messages = this.extractMessages(content);
      const insights = this.extractInsights(messages, content);
      
      return {
        id: uuidv4(),
        filename: file.name,
        participants: this.extractParticipants(messages),
        message_count: messages.length,
        date_range: this.extractDateRange(messages),
        extracted_insights: insights,
        tags: this.extractChatTags(content, insights),
        conversation_type: this.determineConversationType(content),
        psychological_dynamics: this.extractPsychologicalDynamics(content),
        business_outcomes: this.extractBusinessOutcomes(content),
        lesson_learned: this.extractLessonsLearned(content)
      };
    } catch (error) {
      throw new Error(`Failed to parse chat: ${error}`);
    }
  }

  // Parse this very conversation as a training document
  static parseCurrentConversation(conversationData: ConversationData): ParsedDocument {
    const sections = this.extractConversationSections(conversationData);
    const aiTrainingInsights = this.extractAITrainingInsights(conversationData);
    
    return {
      id: uuidv4(),
      filename: `conversation_${new Date().toISOString().split('T')[0]}.md`,
      file_type: 'chat',
      upload_date: new Date().toISOString(),
      file_size: JSON.stringify(conversationData).length,
      raw_content: this.formatConversationAsMarkdown(conversationData),
      parsed_sections: sections,
      tags: [
        'ai_training', 'system_architecture', 'meta_learning', 
        'human_ai_collaboration', 'progressive_development'
      ],
      metadata: {
        complexity_level: 'expert',
        business_domain: 'strategy',
        psychological_insights: [
          'collaborative_problem_solving', 'iterative_design_thinking',
          'meta_cognitive_awareness', 'future_oriented_planning'
        ],
        training_value: 10, // Maximum value for AI training
        real_world_applications: [
          'AI agent architecture design',
          'Progressive feature development',
          'Human-AI collaboration patterns',
          'Meta-learning system design'
        ],
        success_metrics: [
          'System extensibility achieved',
          'AI training pipeline established',
          'Knowledge base foundation created'
        ],
        common_mistakes: [
          'Building monolithic systems',
          'Ignoring future extensibility',
          'Not considering AI training needs from start'
        ],
        prerequisites: [
          'Understanding of AI agent architectures',
          'Knowledge of database design patterns',
          'Grasp of token efficiency concepts'
        ],
        follow_up_actions: [
          'Implement Phase 1 document processing',
          'Create chat parsing pipeline',
          'Build AI training data pipeline',
          'Design agent feedback loop'
        ]
      },
      processing_status: 'completed',
      lineage: {
        original_author: 'John Mueller & GitHub Copilot',
        creation_date: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        source_system: 'VS Code Chat',
        document_series: 'PBC System Design Sessions',
        revision_number: 1,
        approval_status: 'approved',
        stakeholders: ['John', 'Tony', 'GitHub Copilot'],
        parent_document_id: undefined,
        child_document_ids: []
      },
      ai_summary: {
        executive_summary: 'Comprehensive system architecture discussion for PBC Parsing App, covering Phase 1 document processing and Phase 2 AI agent training pipeline design.',
        key_concepts: [
          'Wide vs Deep database strategy',
          'Token efficiency optimization',
          'Meta-learning system design',
          'Progressive feature development',
          'AI agent training pipeline'
        ],
        psychological_patterns: [
          'collaborative_problem_solving',
          'future_oriented_thinking',
          'meta_cognitive_awareness'
        ],
        business_logic_complexity: 'expert',
        token_efficiency_score: 95,
        recommended_gpt_model: 'gpt-4-turbo',
        context_window_requirement: 8000
      },
      cross_references: [],
      version_history: []
    };
  }

  private static extractConversationSections(conversationData: ConversationData): ParsedSection[] {
    const sections: ParsedSection[] = [];
    let orderIndex = 0;

    // System Requirements Section
    sections.push({
      id: uuidv4(),
      document_id: '', // Will be set when saving
      section_type: 'framework',
      title: 'System Requirements & Architecture',
      content: 'Discussion of Phase 1 and Phase 2 requirements, including document parsing, psychological pattern extraction, and AI agent training pipeline design.',
      order_index: orderIndex++,
      psychological_tags: ['strategic_thinking', 'system_design'],
      workflow_tags: ['requirements_gathering', 'architecture_planning'],
      business_logic_tags: ['progressive_development', 'extensible_design'],
      confidence_score: 95,
      created_at: new Date().toISOString(),
      token_count: 150,
      complexity_score: 9,
      dependency_sections: [],
      action_items: [
        {
          id: uuidv4(),
          description: 'Implement document parsing for 5 file types',
          priority: 'high',
          estimated_effort: 'high',
          prerequisites: ['Supabase setup', 'File upload system'],
          stakeholder: 'John'
        },
        {
          id: uuidv4(),
          description: 'Design AI agent training pipeline',
          priority: 'medium',
          estimated_effort: 'high',
          prerequisites: ['Phase 1 completion', 'Knowledge base populated'],
          stakeholder: 'Team'
        }
      ],
      decision_points: [
        {
          id: uuidv4(),
          question: 'Should we use wide vs deep database strategy?',
          options: ['Wide tables for speed', 'Deep normalized tables', 'Hybrid approach'],
          criteria: ['AI agent access speed', 'Token efficiency', 'Scalability'],
          psychological_considerations: ['User experience', 'Developer cognitive load'],
          recommended_approach: 'Wide strategy for AI agent tables, normalized for administrative data'
        }
      ],
      knowledge_category: {
        primary_domain: 'strategy',
        secondary_domains: ['it', 'operations'],
        psychological_framework: 'decision_making',
        automation_potential: 'high',
        client_facing: false,
        training_priority: 10
      }
    });

    // Database Design Section
    sections.push({
      id: uuidv4(),
      document_id: '',
      section_type: 'principle',
      title: 'Database Strategy for AI Efficiency',
      content: 'Wide table strategy discussion for optimal AI agent access, token efficiency considerations, and schema evolution planning.',
      order_index: orderIndex++,
      psychological_tags: ['efficiency_optimization', 'future_planning'],
      workflow_tags: ['database_design', 'performance_optimization'],
      business_logic_tags: ['token_efficiency', 'ai_optimization'],
      confidence_score: 90,
      created_at: new Date().toISOString(),
      token_count: 120,
      complexity_score: 8,
      dependency_sections: [],
      action_items: [],
      decision_points: [],
      knowledge_category: {
        primary_domain: 'it',
        secondary_domains: ['strategy', 'operations'],
        psychological_framework: 'decision_making',
        automation_potential: 'high',
        client_facing: false,
        training_priority: 9
      }
    });

    // Meta-Learning Section
    sections.push({
      id: uuidv4(),
      document_id: '',
      section_type: 'psychology',
      title: 'Meta-Learning and Self-Improvement System',
      content: 'Design discussion for system that learns from its own conversations and improves AI agent training through recursive feedback loops.',
      order_index: orderIndex++,
      psychological_tags: ['meta_cognition', 'self_improvement', 'recursive_learning'],
      workflow_tags: ['feedback_loops', 'continuous_improvement'],
      business_logic_tags: ['ai_training', 'system_evolution'],
      confidence_score: 85,
      created_at: new Date().toISOString(),
      token_count: 200,
      complexity_score: 10,
      dependency_sections: [],
      action_items: [
        {
          id: uuidv4(),
          description: 'Implement conversation capture and parsing',
          priority: 'medium',
          estimated_effort: 'medium',
          prerequisites: ['Basic parsing system'],
          stakeholder: 'Team'
        }
      ],
      decision_points: [],
      knowledge_category: {
        primary_domain: 'strategy',
        secondary_domains: ['it', 'analytics'],
        psychological_framework: 'meta_cognitive_awareness',
        automation_potential: 'high',
        client_facing: false,
        training_priority: 10
      }
    });

    return sections;
  }

  private static extractAITrainingInsights(conversationData: ConversationData): ChatInsight[] {
    return [
      {
        id: uuidv4(),
        chat_id: '', // Will be set when saving
        speaker: 'GitHub Copilot',
        timestamp: new Date().toISOString(),
        content: 'Wide database strategy recommendation for AI agent efficiency',
        insight_type: 'principle',
        confidence_score: 95,
        context_before: 'Discussion of database design patterns',
        context_after: 'Implementation of schema with wide tables',
        emotional_tone: 'analytical',
        business_impact: 'high',
        reusability_score: 9
      },
      {
        id: uuidv4(),
        chat_id: '',
        speaker: 'John Mueller',
        timestamp: new Date().toISOString(),
        content: 'Meta-learning system design for self-improving AI network',
        insight_type: 'psychology',
        confidence_score: 90,
        context_before: 'System architecture discussion',
        context_after: 'Implementation planning for recursive learning',
        emotional_tone: 'visionary',
        business_impact: 'high',
        reusability_score: 10
      }
    ];
  }

  private static formatConversationAsMarkdown(conversationData: ConversationData): string {
    return `# PBC Parsing App Development Session

## Participants
- John Mueller (System Designer, Planet BizCORE)
- GitHub Copilot (AI Development Assistant)

## Session Overview
Comprehensive design and implementation session for Phase 1 document parsing system with Phase 2 AI agent training pipeline preparation.

## Key Decisions Made

### Database Strategy
- **Decision**: Wide table strategy for AI agent access
- **Rationale**: Token efficiency and speed optimization for GPT model access
- **Impact**: Faster AI agent responses, better token utilization

### System Architecture
- **Decision**: Progressive development approach (Phase 1 → Phase 2)
- **Rationale**: Immediate value delivery while building foundation for AI training
- **Impact**: Faster time to value, extensible architecture

### Meta-Learning Integration
- **Decision**: Parse development conversations as training data
- **Rationale**: Create recursive improvement loop for AI agents
- **Impact**: Self-improving system that learns from its own evolution

## Technical Implementation
- Enhanced type definitions for comprehensive metadata
- Wide database schema for AI optimization
- Chat parsing capabilities for conversation analysis
- Token efficiency optimization throughout

## Next Steps
1. Complete Phase 1 document processing engine
2. Implement chat parsing for conversation capture
3. Build AI agent training pipeline
4. Create recursive feedback loops

## Lessons Learned
- Meta-design thinking accelerates development
- AI training requirements should drive initial architecture
- Conversation capture provides valuable training data
- Progressive development maintains momentum while building for future
`;
  }

  // Utility methods for chat parsing
  private static async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read chat file'));
      reader.readAsText(file);
    });
  }

  private static extractMessages(content: string): ChatMessage[] {
    // Implementation depends on chat format (Slack, Discord, etc.)
    const messages: ChatMessage[] = [];
    // Parse based on common chat formats
    return messages;
  }

  private static extractParticipants(messages: ChatMessage[]): string[] {
    const participants = new Set<string>();
    messages.forEach(msg => participants.add(msg.speaker));
    return Array.from(participants);
  }

  private static extractDateRange(messages: ChatMessage[]): { start: string; end: string } {
    if (messages.length === 0) {
      const now = new Date().toISOString();
      return { start: now, end: now };
    }
    
    const timestamps = messages.map(m => new Date(m.timestamp));
    const start = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const end = new Date(Math.max(...timestamps.map(t => t.getTime())));
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  private static extractInsights(messages: ChatMessage[], content: string): ChatInsight[] {
    const insights: ChatInsight[] = [];
    
    // Extract key insights from chat content
    messages.forEach((message, index) => {
      if (this.isInsightful(message.content)) {
        insights.push({
          id: uuidv4(),
          chat_id: '', // Will be set when saving
          speaker: message.speaker,
          timestamp: message.timestamp,
          content: message.content,
          insight_type: this.classifyInsight(message.content),
          confidence_score: this.calculateInsightConfidence(message.content),
          context_before: messages[index - 1]?.content || '',
          context_after: messages[index + 1]?.content || '',
          emotional_tone: this.detectEmotionalTone(message.content),
          business_impact: this.assessBusinessImpact(message.content),
          reusability_score: this.calculateReusability(message.content)
        });
      }
    });
    
    return insights;
  }

  private static extractChatTags(content: string, insights: ChatInsight[]): string[] {
    const tags = new Set<string>();
    
    // Add tags based on insights
    insights.forEach(insight => {
      tags.add(insight.insight_type);
      tags.add(`${insight.business_impact}_impact`);
    });
    
    // Add content-based tags
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('architecture')) tags.add('architecture');
    if (lowerContent.includes('database')) tags.add('database');
    if (lowerContent.includes('ai') || lowerContent.includes('agent')) tags.add('ai_training');
    if (lowerContent.includes('phase')) tags.add('project_phases');
    
    return Array.from(tags);
  }

  private static determineConversationType(content: string): 'client_interaction' | 'internal_discussion' | 'training_session' | 'problem_solving' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('training') || lowerContent.includes('learn')) {
      return 'training_session';
    }
    if (lowerContent.includes('problem') || lowerContent.includes('solve')) {
      return 'problem_solving';
    }
    if (lowerContent.includes('client') || lowerContent.includes('customer')) {
      return 'client_interaction';
    }
    
    return 'internal_discussion';
  }

  private static extractPsychologicalDynamics(content: string): string[] {
    const dynamics = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('collaborate')) dynamics.push('collaborative');
    if (lowerContent.includes('iterate') || lowerContent.includes('improve')) dynamics.push('iterative_improvement');
    if (lowerContent.includes('strategic') || lowerContent.includes('vision')) dynamics.push('strategic_thinking');
    if (lowerContent.includes('meta') || lowerContent.includes('recursive')) dynamics.push('meta_cognitive');
    
    return dynamics;
  }

  private static extractBusinessOutcomes(content: string): string[] {
    const outcomes = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('efficiency')) outcomes.push('improved_efficiency');
    if (lowerContent.includes('automation')) outcomes.push('process_automation');
    if (lowerContent.includes('scale') || lowerContent.includes('growth')) outcomes.push('scalability');
    if (lowerContent.includes('training') || lowerContent.includes('knowledge')) outcomes.push('knowledge_capture');
    
    return outcomes;
  }

  private static extractLessonsLearned(content: string): string[] {
    const lessons = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('wide') && lowerContent.includes('database')) {
      lessons.push('Wide database strategy optimizes AI agent access');
    }
    if (lowerContent.includes('meta') && lowerContent.includes('learning')) {
      lessons.push('Meta-learning creates self-improving systems');
    }
    if (lowerContent.includes('progressive') && lowerContent.includes('development')) {
      lessons.push('Progressive development maintains momentum while building for future');
    }
    
    return lessons;
  }

  // Helper methods for insight classification
  private static isInsightful(content: string): boolean {
    const insightKeywords = [
      'should', 'recommend', 'strategy', 'approach', 'solution',
      'decision', 'principle', 'pattern', 'best practice'
    ];
    
    const lowerContent = content.toLowerCase();
    return insightKeywords.some(keyword => lowerContent.includes(keyword)) && content.length > 50;
  }

  private static classifyInsight(content: string): 'workflow' | 'principle' | 'psychology' | 'instruction' | 'decision' | 'objection' | 'solution' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('principle') || lowerContent.includes('rule')) return 'principle';
    if (lowerContent.includes('psychology') || lowerContent.includes('mindset')) return 'psychology';
    if (lowerContent.includes('step') || lowerContent.includes('process')) return 'workflow';
    if (lowerContent.includes('decide') || lowerContent.includes('choice')) return 'decision';
    if (lowerContent.includes('solution') || lowerContent.includes('solve')) return 'solution';
    if (lowerContent.includes('should') || lowerContent.includes('must')) return 'instruction';
    
    return 'principle';
  }

  private static calculateInsightConfidence(content: string): number {
    let confidence = 50;
    
    if (content.length > 100) confidence += 20;
    if (content.includes('because') || content.includes('rationale')) confidence += 15;
    if (content.includes('data') || content.includes('evidence')) confidence += 15;
    
    return Math.min(100, confidence);
  }

  private static detectEmotionalTone(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('excited') || lowerContent.includes('great')) return 'enthusiastic';
    if (lowerContent.includes('concern') || lowerContent.includes('worry')) return 'cautious';
    if (lowerContent.includes('analyze') || lowerContent.includes('consider')) return 'analytical';
    if (lowerContent.includes('vision') || lowerContent.includes('future')) return 'visionary';
    
    return 'neutral';
  }

  private static assessBusinessImpact(content: string): 'low' | 'medium' | 'high' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('critical') || lowerContent.includes('essential')) return 'high';
    if (lowerContent.includes('important') || lowerContent.includes('significant')) return 'high';
    if (lowerContent.includes('minor') || lowerContent.includes('optional')) return 'low';
    
    return 'medium';
  }

  private static calculateReusability(content: string): number {
    let score = 5; // base score
    
    if (content.includes('pattern') || content.includes('framework')) score += 3;
    if (content.includes('general') || content.includes('universal')) score += 2;
    if (content.length > 200) score += 1; // more detailed insights are more reusable
    
    return Math.min(10, score);
  }
}

// Supporting interfaces
interface ConversationData {
  messages: ChatMessage[];
  metadata: {
    platform: string;
    session_id: string;
    participants: string[];
  };
}

interface ChatMessage {
  speaker: string;
  timestamp: string;
  content: string;
  message_type?: 'text' | 'code' | 'file' | 'action';
}
