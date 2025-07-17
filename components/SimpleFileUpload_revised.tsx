'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader2, Tag, Database, Building2 } from 'lucide-react';
import { UploadProgress } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface SimpleFileUploadProps {
  onUploadComplete?: (documents: any[]) => void;
}

const OWNED_BUSINESS_TAGS = [
  { code: 'JMS3', name: 'JMS3', description: 'Executive coaching & consulting' },
  { code: 'ai4coaches', name: 'AI for Coaches', description: 'AI-powered coaching tools' },
  { code: 'SubjectMatterElders', name: 'Subject Matter Elders', description: 'Knowledge preservation platform' },
  { code: 'bizCore360', name: 'BizCore360', description: 'Strategic frameworks & BI' }
];

const CONTEXT_TAGS = [
  'sales', 'marketing', 'leadership', 'coaching', 'strategy', 'psychology', 
  'communication', 'negotiation', 'training', 'process', 'automation', 'ai'
];

export default function SimpleFileUpload({ onUploadComplete }: SimpleFileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBusinessTags, setSelectedBusinessTags] = useState<string[]>(['JMS3']); // Default to JMS3
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (selectedBusinessTags.length === 0) {
      alert('Please select at least one business tag before uploading documents.');
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
        
        // Auto-detect additional context tags from content
        const autoDetectedTags = detectContextTags(text);
        const allTags = [...new Set([...selectedBusinessTags, ...selectedContextTags, ...autoDetectedTags])];
        
        const documentData = {
          filename: file.name,
          file_type: getFileType(file.name),
          file_size: file.size,
          raw_content: text,
          business_tags: allTags, // MD tags approach
          data_scope: 'planet_bizcore', // All owned business documents go to shared BizDatabase
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
  }, [selectedBusinessTags, selectedContextTags]);

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'txt';
  };

  const detectContextTags = (text: string): string[] => {
    const detectedTags: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    CONTEXT_TAGS.forEach(tag => {
      if (lowercaseText.includes(tag)) {
        detectedTags.push(tag);
      }
    });
    
    return detectedTags;
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
    
    // Universal Business Intelligence (applies across all owned businesses)
    if (lowercaseText.includes('customer') || lowercaseText.includes('client') || lowercaseText.includes('psychology')) {
      insights.push('customer-psychology');
    }
    if (lowercaseText.includes('objection') || lowercaseText.includes('resistance') || lowercaseText.includes('pushback')) {
      insights.push('objection-handling');
    }
    if (lowercaseText.includes('sales') || lowercaseText.includes('selling') || lowercaseText.includes('close')) {
      insights.push('sales-process');
    }
    if (lowercaseText.includes('pricing') || lowercaseText.includes('cost') || lowercaseText.includes('value')) {
      insights.push('pricing-strategy');
    }
    if (lowercaseText.includes('communication') || lowercaseText.includes('conversation') || lowercaseText.includes('dialogue')) {
      insights.push('communication-framework');
    }
    if (lowercaseText.includes('leadership') || lowercaseText.includes('management') || lowercaseText.includes('influence')) {
      insights.push('leadership-principle');
    }
    
    return insights.length > 0 ? insights : ['general-business'];
  };

  const extractTags = (text: string): string[] => {
    const tags = [];
    const lowercaseText = text.toLowerCase();
    
    // Extract potential tags based on content
    if (lowercaseText.includes('onboarding')) tags.push('onboarding');
    if (lowercaseText.includes('project')) tags.push('project-management');
    if (lowercaseText.includes('team')) tags.push('team-dynamics');
    if (lowercaseText.includes('automation')) tags.push('automation');
    if (lowercaseText.includes('coaching')) tags.push('coaching');
    if (lowercaseText.includes('training')) tags.push('training');
    
    return tags.length > 0 ? tags : ['business-operations'];
  };

  const toggleBusinessTag = (tag: string) => {
    setSelectedBusinessTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleContextTag = (tag: string) => {
    setSelectedContextTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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
          <Database className="h-6 w-6 text-blue-600" />
          Upload to Planet BizCORE BizDatabase
        </h2>
        <p className="text-gray-600">
          Upload documents with MD tags to add to the shared Planet BizCORE intelligence system
        </p>
      </div>

      {/* Business Tags Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Business Context Tags (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {OWNED_BUSINESS_TAGS.map((business) => (
            <button
              key={business.code}
              onClick={() => toggleBusinessTag(business.code)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                selectedBusinessTags.includes(business.code)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-300 hover:border-blue-300'
              }`}
              disabled={isProcessing}
            >
              <div className="font-medium">{business.name}</div>
              <div className="text-sm text-gray-600">{business.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Context Tags Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Additional Context Tags (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleContextTag(tag)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedContextTags.includes(tag)
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-300 hover:border-green-300'
              }`}
              disabled={isProcessing}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Additional tags will be auto-detected from content
        </p>
      </div>

      {/* Selected Tags Preview */}
      {(selectedBusinessTags.length > 0 || selectedContextTags.length > 0) && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Document will be tagged with:</div>
          <div className="flex flex-wrap gap-2">
            {selectedBusinessTags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {selectedContextTags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {tag}
              </span>
            ))}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              + auto-detected tags
            </span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedBusinessTags.length > 0
              ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
        }`}
      >
        <input {...getInputProps()} disabled={selectedBusinessTags.length === 0 || isProcessing} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          ) : (
            <Upload className={`h-12 w-12 ${selectedBusinessTags.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
          )}
          
          <div>
            <p className={`text-lg font-medium ${selectedBusinessTags.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {isProcessing
                ? 'Processing documents...'
                : isDragActive
                ? 'Drop files here'
                : selectedBusinessTags.length > 0
                ? 'Drag & drop files here, or click to browse'
                : 'Select business tags first'
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
              All documents processed successfully! Your Planet BizCORE BizDatabase has been updated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
