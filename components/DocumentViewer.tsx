'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileText, Eye, Brain, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  business_domain: string;
  complexity_level: string;
  processing_status: string;
  psychological_insights: string[];
  tags: string[];
  created_at: string;
  raw_content: string;
}

export default function DocumentViewer() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(`Database error: ${error.message}`);
        return;
      }

      setDocuments(data || []);
    } catch (err) {
      setError(`Failed to load documents: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Documents</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={loadDocuments}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 BizDatabase Dashboard
        </h1>
        <p className="text-gray-600">
          Your uploaded documents with extracted business data and structured insights
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Upload some documents to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Processed Documents ({documents.length})
            </h2>
            
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedDoc?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1 break-words overflow-hidden">
                      {doc.filename}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📁 {doc.file_type.toUpperCase()} • {formatFileSize(doc.file_size)}</p>
                      <p>🏢 {doc.business_domain} • {doc.complexity_level}</p>
                      <p>📅 {formatDate(doc.created_at)}</p>
                    </div>
                    
                    {/* Business Insights Preview */}
                    {doc.psychological_insights && doc.psychological_insights.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {doc.psychological_insights.slice(0, 3).map((insight, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Brain className="w-3 h-3 mr-1" />
                              {insight}
                            </span>
                          ))}
                          {doc.psychological_insights.length > 3 && (
                            <span className="text-xs text-gray-500">+{doc.psychological_insights.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Document Details */}
          <div className="sticky top-6">
            {selectedDoc ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Document Analysis
                </h2>
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 break-all">
                    {selectedDoc.filename}
                  </p>
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">File Info</h4>
                    <p className="text-sm text-gray-600">Type: {selectedDoc.file_type.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">Size: {formatFileSize(selectedDoc.file_size)}</p>
                    <p className="text-sm text-gray-600">Status: {selectedDoc.processing_status}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Analysis</h4>
                    <p className="text-sm text-gray-600">Domain: {selectedDoc.business_domain}</p>
                    <p className="text-sm text-gray-600">Complexity: {selectedDoc.complexity_level}</p>
                    <p className="text-sm text-gray-600">Uploaded: {formatDate(selectedDoc.created_at)}</p>
                  </div>
                </div>

                {/* Business Insights */}
                {selectedDoc.psychological_insights && selectedDoc.psychological_insights.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      Business Insights
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.psychological_insights.map((insight, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {insight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Business Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Content Display */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Complete Document Content</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {selectedDoc.raw_content}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Document</h3>
                <p className="text-gray-600">Click on a document to view its analysis and extracted insights</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
