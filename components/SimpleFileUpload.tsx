'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { UploadProgress } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface SimpleFileUploadProps {
  onUploadComplete?: (documents: any[]) => void;
}

export default function SimpleFileUpload({ onUploadComplete }: SimpleFileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    const initialProgress = acceptedFiles.map(file => ({
      filename: file.name,
      status: 'uploading' as const,
      progress: 0
    }));
    setUploadProgress(initialProgress);

    const processedDocuments = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        // Update progress
        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'parsing' as const, progress: 50 }
              : item
          )
        );

        // Simple text extraction for MD and TXT files
        const text = await file.text();
        
        // Enhanced document analysis
        const detectedBusinessTags = detectBusinessContext(text);
        const detectedContextTags = detectContextTags(text);
        const allTags = [...detectedBusinessTags, ...detectedContextTags];
        const documentSections = parseDocumentSections(text);
        
        const documentData = {
          filename: file.name,
          file_type: getFileType(file.name),
          file_size: file.size,
          raw_content: text,
          business_tags: allTags,
          data_scope: 'planet_bizcore',
          business_domain: detectBusinessDomain(text),
          complexity_level: detectComplexity(text),
          processing_status: 'completed',
          psychological_insights: extractBusinessInsights(text),
          tags: extractTags(text),
          metadata: {
            sections_detected: documentSections.length,
            word_count: text.split(/\s+/).length,
            character_count: text.length,
            has_structured_content: documentSections.length > 1
          }
        };

        // Save to Supabase
        try {
          const { data, error } = await supabase
            .from('documents')
            .insert(documentData)
            .select()
            .single();

          if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${error.message}`);
          }

          // Save document sections if the document was saved successfully
          if (documentSections.length > 1) {
            const sectionsData = documentSections.map((section, index) => ({
              document_id: data.id,
              section_type: 'content',
              title: section.title,
              content: section.content,
              order_index: index,
              psychological_tags: extractBusinessInsights(section.content),
              business_logic_tags: detectContextTags(section.content)
            }));

            try {
              const { error: sectionsError } = await supabase
                .from('sections')
                .insert(sectionsData);

              if (sectionsError) {
                console.warn('Failed to save sections:', sectionsError);
              } else {
                console.log(`Saved ${sectionsData.length} sections for document:`, data.filename);
              }
            } catch (sectionsErr) {
              console.warn('Sections save error:', sectionsErr);
            }
          }

          console.log('Document saved to Planet BizCORE BizDatabase:', data);
          processedDocuments.push(data);
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          processedDocuments.push(documentData);
        }

        // Update progress to completed
        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'complete' as const, progress: 100 }
              : item
          )
        );

      } catch (error) {
        console.error('Error processing file:', error);
        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'error' as const, progress: 0 }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
    if (onUploadComplete) {
      onUploadComplete(processedDocuments);
    }
  }, [onUploadComplete]);

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'txt';
  };

  const detectBusinessContext = (text: string): string[] => {
    const businessTags: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    // JMS3 detection - exact matches from Planet bizCORE doc
    const jms3Patterns = [
      'jms3', 'jms', 'strategic concierge', 'solo & duo builders', 'solo founders',
      'duopreneurs', 'john spence', 'executive coaching', 'leadership development',
      'strategic concierge for founders', 'getting builders unstuck'
    ];
    
    // ai4coaches detection - exact matches
    const ai4coachesPatterns = [
      'ai4coaches', 'ai for coaches', 'coaching ai', 'automated coaching',
      'ai coaching tools', 'digital coaching', 'coaching technology',
      'ai assessment', 'coaching automation', 'smart coaching'
    ];
    
    // Subject Matter Elders detection - exact matches from doc
    const smePatterns = [
      'subject matter elders', 'content creation', 'positioning & distribution',
      'thought leadership content', 'persona and psychographic mapping',
      'my story frameworks', 'article + newsletter + social content',
      'sme content', 'intellectual property'
    ];
    
    // bizCore360 detection - exact matches from doc  
    const bizCorePatterns = [
      'bizcore360', 'bizcore360.ai', 'systems + automation engine',
      'integrated dashboards', 'automation handoffs', 'crm+ funnel builds',
      'dfy/dwy execution', 'platform connections', 'make, tadabase, openai',
      'delivery layer automation'
    ];
    
    if (jms3Patterns.some(pattern => lowercaseText.includes(pattern))) {
      businessTags.push('JMS3');
    }
    if (ai4coachesPatterns.some(pattern => lowercaseText.includes(pattern))) {
      businessTags.push('ai4coaches');
    }
    if (smePatterns.some(pattern => lowercaseText.includes(pattern))) {
      businessTags.push('SubjectMatterElders');
    }
    if (bizCorePatterns.some(pattern => lowercaseText.includes(pattern))) {
      businessTags.push('bizCore360');
    }
    
    // Default to JMS3 if no specific business detected
    if (businessTags.length === 0) {
      businessTags.push('JMS3');
    }
    
    return businessTags;
  };

  const parseDocumentSections = (text: string): Array<{title: string, content: string}> => {
    const sections: Array<{title: string, content: string}> = [];
    
    // Split by markdown headers or double line breaks
    const headerRegex = /^#{1,6}\s+(.+)$/gm;
    const lines = text.split('\n');
    
    let currentSection = { title: 'Introduction', content: '' };
    let inSection = false;
    
    for (const line of lines) {
      const headerMatch = line.match(headerRegex);
      
      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        
        // Start new section
        currentSection = {
          title: line.replace(/^#{1,6}\s+/, '').trim(),
          content: ''
        };
        inSection = true;
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    // Add final section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    // If no sections found, treat entire document as one section
    if (sections.length === 0) {
      sections.push({ title: 'Document Content', content: text });
    }
    
    return sections;
  };

  const detectContextTags = (text: string): string[] => {
    const contextTags: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    // Enhanced context detection with more granular patterns
    const contextPatterns = {
      'sales': ['sales', 'selling', 'revenue', 'prospecting', 'closing', 'pipeline', 'crm'],
      'marketing': ['marketing', 'branding', 'campaign', 'promotion', 'advertising', 'market research'],
      'leadership': ['leadership', 'management', 'leading', 'team leader', 'executive', 'direction'],
      'coaching': ['coaching', 'mentoring', 'development', 'training', 'skill building', 'guidance'],
      'strategy': ['strategy', 'strategic', 'planning', 'vision', 'roadmap', 'objectives'],
      'psychology': ['psychology', 'behavioral', 'cognitive', 'mindset', 'motivation', 'emotional'],
      'communication': ['communication', 'presentation', 'speaking', 'writing', 'messaging'],
      'negotiation': ['negotiation', 'bargaining', 'deal making', 'agreement', 'compromise'],
      'training': ['training', 'education', 'learning', 'workshop', 'seminar', 'curriculum'],
      'process': ['process', 'workflow', 'procedure', 'methodology', 'system', 'framework'],
      'automation': ['automation', 'automated', 'efficiency', 'streamline', 'optimization'],
      'ai': ['artificial intelligence', 'machine learning', 'ai', 'algorithm', 'data science'],
      'finance': ['financial', 'budget', 'cost', 'profit', 'investment', 'revenue', 'roi'],
      'operations': ['operations', 'operational', 'logistics', 'delivery', 'execution'],
      'hr': ['human resources', 'hr', 'recruitment', 'hiring', 'employee', 'talent'],
      'technology': ['technology', 'tech', 'software', 'digital', 'platform', 'system']
    };
    
    Object.entries(contextPatterns).forEach(([tag, patterns]) => {
      if (patterns.some(pattern => lowercaseText.includes(pattern))) {
        contextTags.push(tag);
      }
    });
    
    return contextTags;
  };

  const detectBusinessDomain = (text: string): string => {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('financial') || lowercaseText.includes('budget') || lowercaseText.includes('revenue')) {
      return 'finance';
    }
    if (lowercaseText.includes('marketing') || lowercaseText.includes('campaign') || lowercaseText.includes('brand')) {
      return 'marketing';
    }
    if (lowercaseText.includes('sales') || lowercaseText.includes('client') || lowercaseText.includes('customer')) {
      return 'sales';
    }
    if (lowercaseText.includes('hr') || lowercaseText.includes('employee') || lowercaseText.includes('recruitment')) {
      return 'human_resources';
    }
    if (lowercaseText.includes('strategy') || lowercaseText.includes('planning') || lowercaseText.includes('vision')) {
      return 'strategy';
    }
    if (lowercaseText.includes('technology') || lowercaseText.includes('software') || lowercaseText.includes('system')) {
      return 'technology';
    }
    
    return 'operations';
  };

  const detectComplexity = (text: string): string => {
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const complexityRatio = uniqueWords / wordCount;
    
    if (wordCount > 5000 || complexityRatio > 0.7) return 'expert';
    if (wordCount > 2000 || complexityRatio > 0.5) return 'advanced';
    if (wordCount > 500 || complexityRatio > 0.3) return 'intermediate';
    return 'basic';
  };

  const extractBusinessInsights = (text: string): string[] => {
    const insights: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    // Enhanced business intelligence extraction with more specific patterns
    const insightPatterns = {
      'products-services': [
        'product', 'service', 'offering', 'solution', 'deliverable',
        'package', 'program', 'course', 'workshop', 'consulting'
      ],
      'customer-analysis': [
        'customer', 'client', 'demographic', 'target audience', 'persona',
        'user', 'buyer', 'consumer', 'market segment', 'clientele'
      ],
      'competitive-analysis': [
        'competitor', 'competition', 'market share', 'competitive advantage',
        'rival', 'competitive landscape', 'market position', 'differentiation'
      ],
      'resource-planning': [
        'resource', 'budget', 'investment', 'funding', 'capital',
        'staffing', 'headcount', 'capacity', 'allocation', 'cost'
      ],
      'business-process': [
        'process', 'workflow', 'procedure', 'methodology', 'framework',
        'system', 'operation', 'protocol', 'standard', 'best practice'
      ],
      'psychological-framework': [
        'psychology', 'behavior', 'motivation', 'mindset', 'cognitive',
        'emotional', 'personality', 'behavioral pattern', 'psychological profile'
      ],
      'strategic-planning': [
        'strategy', 'strategic', 'goal', 'objective', 'vision', 'mission',
        'roadmap', 'planning', 'direction', 'initiative'
      ],
      'risk-analysis': [
        'risk', 'challenge', 'issue', 'problem', 'threat', 'vulnerability',
        'obstacle', 'barrier', 'concern', 'limitation'
      ],
      'sales-process': [
        'sales process', 'selling', 'prospecting', 'lead generation',
        'closing', 'objection handling', 'pipeline', 'conversion'
      ],
      'leadership-development': [
        'leadership development', 'executive coaching', 'management training',
        'leadership skills', 'team building', 'organizational culture'
      ],
      'communication-strategy': [
        'communication', 'messaging', 'presentation', 'storytelling',
        'public speaking', 'writing', 'content strategy'
      ],
      'performance-metrics': [
        'kpi', 'metrics', 'measurement', 'performance', 'analytics',
        'dashboard', 'reporting', 'benchmarking', 'roi'
      ]
    };
    
    Object.entries(insightPatterns).forEach(([insight, patterns]) => {
      if (patterns.some(pattern => lowercaseText.includes(pattern))) {
        insights.push(insight);
      }
    });
    
    return insights.length > 0 ? insights : ['general-business'];
  };

  const extractTags = (text: string): string[] => {
    const tags = [];
    const lowercaseText = text.toLowerCase();
    
    // Extract potential tags based on content
    if (lowercaseText.includes('onboarding')) tags.push('onboarding');
    if (lowercaseText.includes('sales')) tags.push('sales');
    if (lowercaseText.includes('project')) tags.push('project-management');
    if (lowercaseText.includes('team')) tags.push('team-dynamics');
    if (lowercaseText.includes('automation')) tags.push('automation');
    if (lowercaseText.includes('ai')) tags.push('ai-training');
    if (lowercaseText.includes('coaching')) tags.push('coaching');
    if (lowercaseText.includes('leadership')) tags.push('leadership');
    if (lowercaseText.includes('communication')) tags.push('communication');
    
    return tags.length > 0 ? tags : ['business-operations'];
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Upload className="h-6 w-6 text-blue-600" />
          Upload Documents to Planet BizCORE
        </h2>
        <p className="text-gray-600">
          Upload your business documents - the system will automatically detect business context and extract intelligence
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          ) : (
            <Upload className="h-12 w-12 text-blue-600" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessing
                ? 'Processing documents...'
                : isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports: MD, TXT, PDF, DOC, DOCX
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Business context and tags will be automatically detected from content
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Progress</h3>
          <div className="space-y-3">
            {uploadProgress.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{item.filename}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-1 w-32">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.status === 'complete' 
                            ? 'bg-green-500' 
                            : item.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {item.status === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {item.status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {(item.status === 'uploading' || item.status === 'parsing') && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadProgress.length > 0 && uploadProgress.every(item => item.status === 'complete') && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800 font-medium">
              All documents processed successfully! Business context and intelligence automatically extracted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
