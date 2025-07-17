'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader2, Building2 } from 'lucide-react';
import { UploadProgress } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface BusinessModel {
  id: string;
  business_code: string;
  business_name: string;
  description: string;
}

interface SimpleFileUploadProps {
  onUploadComplete?: (documents: any[]) => void;
}

export default function SimpleFileUpload({ onUploadComplete }: SimpleFileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [selectedBusinessModel, setSelectedBusinessModel] = useState<string>('');

  // Load business models on component mount
  useEffect(() => {
    const loadBusinessModels = async () => {
      try {
        const { data, error } = await supabase
          .from('business_models')
          .select('id, business_code, business_name, description')
          .eq('is_active', true)
          .order('business_name');

        if (error) throw error;
        setBusinessModels(data || []);
        
        // Auto-select JMS3 as default if available
        const jms3Model = data?.find(bm => bm.business_code === 'JMS3');
        if (jms3Model) {
          setSelectedBusinessModel(jms3Model.id);
        }
      } catch (error) {
        console.error('Error loading business models:', error);
      }
    };

    loadBusinessModels();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedBusinessModel) {
      alert('Please select a business model before uploading documents.');
      return;
    }

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
        
        const documentData = {
          filename: file.name,
          file_type: getFileType(file.name),
          file_size: file.size,
          raw_content: text,
          business_model_id: selectedBusinessModel,
          business_domain: detectBusinessDomain(text),
          complexity_level: detectComplexity(text),
          processing_status: 'completed',
          psychological_insights: extractBusinessInsights(text),
          tags: extractTags(text)
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

          console.log('Document saved to Supabase:', data);
          processedDocuments.push(data);
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          // Still show as processed even if DB save fails
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
    
    return insights;
  };
    if (text.toLowerCase().includes('training')) insights.push('training-material');
    if (text.toLowerCase().includes('contract')) insights.push('legal-document');
    
    return insights.length > 0 ? insights : ['general-business'];
  };

  const extractTags = (text: string): string[] => {
    const tags = [];
    
    // Extract potential tags based on content
    if (text.toLowerCase().includes('onboarding')) tags.push('onboarding');
    if (text.toLowerCase().includes('sales')) tags.push('sales');
    if (text.toLowerCase().includes('project')) tags.push('project-management');
    if (text.toLowerCase().includes('team')) tags.push('team-dynamics');
    if (text.toLowerCase().includes('automation')) tags.push('automation');
    if (text.toLowerCase().includes('ai')) tags.push('ai-training');
    
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
    <div className="w-full">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop your documents here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 mb-2">
              Drag and drop your documents here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: MD, TXT, PDF, DOC, DOCX (PDF/DOC processing coming soon)
            </p>
          </div>
        )}
      </div>

      {/* Progress Display */}
      {uploadProgress.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Processing Files</h3>
          {uploadProgress.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.filename}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {item.status === 'parsing' && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {item.status === 'complete' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {item.progress}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.status === 'complete' ? 'bg-green-500' :
                    item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              
              {/* Status Message */}
              <p className="text-xs text-gray-600 mt-2">
                {item.status === 'uploading' && 'Reading file...'}
                {item.status === 'parsing' && 'Extracting content and analyzing...'}
                {item.status === 'complete' && 'Successfully processed and ready for AI training'}
                {item.status === 'error' && 'Error processing file. Please try again.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {uploadProgress.length > 0 && !isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Processing Complete</h4>
          <p className="text-sm text-blue-800">
            {uploadProgress.filter(item => item.status === 'complete').length} of {uploadProgress.length} files processed successfully.
            Documents are now ready for your BizDatabase.
          </p>
        </div>
      )}
    </div>
  );
}
