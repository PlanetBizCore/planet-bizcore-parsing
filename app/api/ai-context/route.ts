// API endpoint to provide AI agents with contextual learning data
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface AIContextRequest {
  domain?: string;
  business_tags?: string[];
  complexity_level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  limit?: number;
  learning_context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { domain, business_tags, complexity_level, limit = 10, learning_context }: AIContextRequest = await request.json();

    // Query relevant documents and intelligence
    let query = supabase
      .from('documents')
      .select(`
        id,
        filename,
        business_domain,
        complexity_level,
        business_tags,
        psychological_insights,
        raw_content,
        metadata,
        created_at,
        sections (
          id,
          title,
          content,
          psychological_tags,
          business_logic_tags,
          confidence_score
        )
      `)
      .eq('processing_status', 'completed')
      .eq('data_scope', 'planet_bizcore')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (domain) {
      query = query.eq('business_domain', domain);
    }
    if (complexity_level) {
      query = query.eq('complexity_level', complexity_level);
    }
    if (business_tags && business_tags.length > 0) {
      query = query.overlaps('business_tags', business_tags);
    }

    const { data: documents, error: docError } = await query;
    if (docError) throw docError;

    // Get Planet bizCORE intelligence patterns
    const { data: intelligence, error: intError } = await supabase
      .from('planet_bizcore_intelligence')
      .select('*')
      .limit(1);
    
    if (intError) throw intError;

    // Get high-value knowledge from agent knowledge base
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('agent_knowledge_base')
      .select(`
        primary_concept,
        compressed_content,
        psychological_pattern,
        business_logic,
        business_domain,
        gpt_model_recommendation,
        token_count_compressed,
        success_rate,
        use_frequency
      `)
      .eq('is_active', true)
      .gte('success_rate', 70)
      .order('success_rate', { ascending: false })
      .limit(20);

    // Structure response for AI learning
    const contextData = {
      documents: documents?.map(doc => ({
        id: doc.id,
        title: doc.filename,
        domain: doc.business_domain,
        complexity: doc.complexity_level,
        business_context: doc.business_tags,
        insights: doc.psychological_insights,
        content_preview: doc.raw_content?.slice(0, 1000), // Limited preview
        sections: doc.sections?.map(section => ({
          title: section.title,
          tags: [...(section.psychological_tags || []), ...(section.business_logic_tags || [])],
          confidence: section.confidence_score
        }))
      })),
      intelligence_patterns: intelligence?.[0] || {},
      proven_knowledge: knowledge || [],
      metadata: {
        total_documents: documents?.length || 0,
        learning_context,
        query_timestamp: new Date().toISOString(),
        data_scope: 'planet_bizcore'
      }
    };

    return NextResponse.json({
      success: true,
      context: contextData
    });

  } catch (error) {
    console.error('AI Context API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve AI context' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .eq('data_scope', 'planet_bizcore');

    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      available_documents: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
