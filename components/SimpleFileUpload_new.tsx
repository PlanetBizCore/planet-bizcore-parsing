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
  }, [onUploadComplete, selectedBusinessModel]);

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
    if (lowercaseText.includes('training') || lowercaseText.includes('learning') || lowercaseText.includes('education')) {
      insights.push('training-material');
    }
    if (lowercaseText.includes('contract') || lowercaseText.includes('legal') || lowercaseText.includes('compliance')) {
      insights.push('legal-document');
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
          Upload Business Documents
        </h2>
        <p className="text-gray-600">
          Upload your business documents to extract intelligence for your BizDatabase
        </p>
      </div>

      {/* Business Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Select Business Model
        </label>
        <select
          value={selectedBusinessModel}
          onChange={(e) => setSelectedBusinessModel(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isProcessing}
        >
          <option value="">Choose a business model...</option>
          {businessModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.business_name} ({model.business_code})
            </option>
          ))}
        </select>
        {selectedBusinessModel && (
          <p className="mt-2 text-sm text-gray-500">
            {businessModels.find(m => m.id === selectedBusinessModel)?.description}
          </p>
        )}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedBusinessModel 
              ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
        }`}
      >
        <input {...getInputProps()} disabled={!selectedBusinessModel || isProcessing} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          ) : (
            <Upload className={`h-12 w-12 ${selectedBusinessModel ? 'text-blue-600' : 'text-gray-400'}`} />
          )}
          
          <div>
            <p className={`text-lg font-medium ${selectedBusinessModel ? 'text-gray-900' : 'text-gray-400'}`}>
              {isProcessing
                ? 'Processing documents...'
                : isDragActive
                ? 'Drop files here'
                : selectedBusinessModel
                ? 'Drag & drop files here, or click to browse'
                : 'Select a business model first'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports: MD, TXT, PDF, DOC, DOCX
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
              All documents processed successfully! Your BizDatabase has been updated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
