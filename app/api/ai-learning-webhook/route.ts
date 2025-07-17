// Webhook endpoint for real-time AI learning notifications
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface DocumentProcessedPayload {
  document_id: string;
  filename: string;
  business_tags: string[];
  business_domain: string;
  complexity_level: string;
  psychological_insights: string[];
  intelligence_extracted: any;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity (you'd set this secret)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AI_WEBHOOK_SECRET;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: DocumentProcessedPayload = await request.json();

    // Extract learning data from the newly processed document
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        sections (*)
      `)
      .eq('id', payload.document_id)
      .single();

    if (error) throw error;

    // Create structured learning notification
    const learningNotification = {
      event: 'document_processed',
      timestamp: new Date().toISOString(),
      document: {
        id: document.id,
        title: document.filename,
        business_context: document.business_tags,
        domain: document.business_domain,
        complexity: document.complexity_level,
        insights: document.psychological_insights,
        sections_count: document.sections?.length || 0
      },
      learning_opportunities: {
        new_patterns: extractNewPatterns(document),
        business_insights: document.psychological_insights,
        cross_business_connections: identifyCrossBusinessConnections(document.business_tags),
        recommended_focus_areas: getRecommendedFocusAreas(document)
      },
      context_enhancement: {
        updated_intelligence: payload.intelligence_extracted,
        confidence_factors: calculateConfidenceFactors(document),
        training_priority: document.training_priority || 5
      }
    };

    // Here you would typically send this to your AI training pipeline
    // For now, we'll log it and store it for retrieval
    console.log('AI Learning Notification:', learningNotification);

    // Store learning notification for AI context retrieval
    await supabase
      .from('ai_learning_notifications')
      .insert({
        document_id: payload.document_id,
        notification_data: learningNotification,
        processed_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Learning notification processed',
      learning_context: learningNotification
    });

  } catch (error) {
    console.error('AI Learning Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process learning notification' },
      { status: 500 }
    );
  }
}

function extractNewPatterns(document: any): string[] {
  // Analyze document for new patterns
  const patterns = [];
  
  if (document.psychological_insights?.length > 0) {
    patterns.push('psychological_insights_detected');
  }
  
  if (document.business_tags?.includes('JMS3') && document.business_tags?.includes('leadership')) {
    patterns.push('jms3_leadership_methodology');
  }
  
  if (document.complexity_level === 'expert') {
    patterns.push('expert_level_intelligence');
  }
  
  return patterns;
}

function identifyCrossBusinessConnections(business_tags: string[]): string[] {
  const connections = [];
  
  if (business_tags?.includes('JMS3') && business_tags?.includes('ai4coaches')) {
    connections.push('leadership_coaching_ai_integration');
  }
  
  if (business_tags?.includes('SubjectMatterElders') && business_tags?.includes('bizCore360')) {
    connections.push('knowledge_transfer_strategic_framework');
  }
  
  return connections;
}

function getRecommendedFocusAreas(document: any): string[] {
  const areas = [];
  
  if (document.business_domain === 'sales') {
    areas.push('sales_process_optimization');
  }
  
  if (document.psychological_insights?.length > 3) {
    areas.push('psychological_pattern_analysis');
  }
  
  if (document.complexity_level === 'expert') {
    areas.push('advanced_business_intelligence');
  }
  
  return areas;
}

function calculateConfidenceFactors(document: any): any {
  return {
    content_quality: document.raw_content?.length > 1000 ? 'high' : 'medium',
    business_context_clarity: document.business_tags?.length > 0 ? 'high' : 'low',
    psychological_depth: document.psychological_insights?.length > 2 ? 'high' : 'medium',
    cross_reference_potential: document.metadata?.sections_detected > 1 ? 'high' : 'low'
  };
}
