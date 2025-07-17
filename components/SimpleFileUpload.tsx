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
        
        // Auto-detect everything from content
        const detectedBusinessTags = detectBusinessContext(text);
        const detectedContextTags = detectContextTags(text);
        const allTags = [...detectedBusinessTags, ...detectedContextTags];
        
        // Auto-extract business model narratives
        const businessNarratives = extractBusinessModelNarratives(text, detectedBusinessTags);
        
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
          
          // Auto-populated business model narratives (new!)
          ...businessNarratives
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
    
    // Auto-detect business context from content
    if (lowercaseText.includes('jms') || lowercaseText.includes('john spence') || lowercaseText.includes('executive coaching')) {
      businessTags.push('JMS3');
    }
    if (lowercaseText.includes('ai4coaches') || lowercaseText.includes('ai for coaches') || lowercaseText.includes('coaching ai')) {
      businessTags.push('ai4coaches');
    }
    if (lowercaseText.includes('subject matter elders') || lowercaseText.includes('knowledge preservation') || lowercaseText.includes('expert knowledge')) {
      businessTags.push('SubjectMatterElders');
    }
    if (lowercaseText.includes('bizcore') || lowercaseText.includes('business intelligence') || lowercaseText.includes('strategic framework')) {
      businessTags.push('bizCore360');
    }
    
    // Default to JMS3 if no specific business detected
    if (businessTags.length === 0) {
      businessTags.push('JMS3');
    }
    
    return businessTags;
  };

  const detectContextTags = (text: string): string[] => {
    const contextTags: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    const tagPatterns = [
      'sales', 'marketing', 'leadership', 'coaching', 'strategy', 'psychology',
      'communication', 'negotiation', 'training', 'process', 'automation', 'ai'
    ];
    
    tagPatterns.forEach(tag => {
      if (lowercaseText.includes(tag)) {
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
    const insights = [];
    const lowercaseText = text.toLowerCase();
    
    // Business Intelligence Categories
    if (lowercaseText.includes('product') || lowercaseText.includes('service') || lowercaseText.includes('offering')) {
      insights.push('products-services');
    }
    if (lowercaseText.includes('customer') || lowercaseText.includes('client') || lowercaseText.includes('demographic')) {
      insights.push('customer-analysis');
    }
    if (lowercaseText.includes('competitor') || lowercaseText.includes('competition') || lowercaseText.includes('market share')) {
      insights.push('competitive-analysis');
    }
    if (lowercaseText.includes('resource') || lowercaseText.includes('budget') || lowercaseText.includes('investment')) {
      insights.push('resource-planning');
    }
    if (lowercaseText.includes('process') || lowercaseText.includes('workflow') || lowercaseText.includes('procedure')) {
      insights.push('business-process');
    }
    if (lowercaseText.includes('psychology') || lowercaseText.includes('behavior') || lowercaseText.includes('motivation')) {
      insights.push('psychological-framework');
    }
    if (lowercaseText.includes('strategy') || lowercaseText.includes('goal') || lowercaseText.includes('objective')) {
      insights.push('strategic-planning');
    }
    if (lowercaseText.includes('risk') || lowercaseText.includes('challenge') || lowercaseText.includes('issue')) {
      insights.push('risk-analysis');
    }
    
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

  // Auto-extract business model narratives from document content
  const extractBusinessModelNarratives = (text: string, tags: string[]) => {
    const narratives: any = {};
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Helper function to find relevant sentences
    const findRelevantSentences = (patterns: RegExp[], maxSentences = 2) => {
      for (const pattern of patterns) {
        for (let i = 0; i < sentences.length; i++) {
          if (pattern.test(sentences[i])) {
            return sentences.slice(i, i + maxSentences).join('. ').trim();
          }
        }
      }
      return null;
    };
    
    // JMS3 narrative extraction
    if (tags.includes('JMS3')) {
      narratives.jms3_description = findRelevantSentences([
        /strategic concierge/i,
        /solo.*?founders/i,
        /getting.*?builders.*?unstuck/i
      ]);
      narratives.jms3_methodology = findRelevantSentences([
        /coaching.*?approach/i,
        /leadership.*?development/i,
        /executive.*?coaching/i
      ]);
    }
    
    // AI4Coaches narrative extraction
    if (tags.includes('ai4coaches')) {
      narratives.ai4coaches_description = findRelevantSentences([
        /ai.*?coaching/i,
        /automated.*?coaching/i,
        /coaching.*?technology/i
      ]);
      narratives.ai4coaches_technology = findRelevantSentences([
        /ai.*?assessment/i,
        /coaching.*?automation/i,
        /smart.*?coaching/i
      ]);
    }
    
    // Subject Matter Elders narrative extraction
    if (tags.includes('SubjectMatterElders')) {
      narratives.sme_description = findRelevantSentences([
        /subject.*?matter.*?elders/i,
        /content.*?creation/i,
        /thought.*?leadership/i
      ]);
      narratives.sme_content_strategy = findRelevantSentences([
        /positioning.*?distribution/i,
        /article.*?newsletter/i,
        /persona.*?psychographic/i
      ]);
    }
    
    // bizCore360 narrative extraction
    if (tags.includes('bizCore360')) {
      narratives.bizcore360_description = findRelevantSentences([
        /bizcore360/i,
        /systems.*?automation/i,
        /integrated.*?dashboards/i
      ]);
      narratives.bizcore360_systems = findRelevantSentences([
        /automation.*?handoffs/i,
        /crm.*?funnel/i,
        /platform.*?connections/i
      ]);
    }
    
    return narratives;
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
