'use client';

import React, { useState, useEffect } from 'react';
import { Database, Network, Plus, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContextMatrix {
  [category: string]: {
    count: number;
    documents: string[];
    related_tags: string[];
    business_impact: string;
  };
}

export default function ContextDataMatrix() {
  const [matrix, setMatrix] = useState<ContextMatrix>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    buildContextMatrix();
  }, []);

  const buildContextMatrix = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('psychological_insights, tags, filename, business_domain');

      if (error) throw error;

      const newMatrix: ContextMatrix = {};

      // Process each document to build dynamic matrix
      data?.forEach(doc => {
        // Process business insights (psychological_insights field)
        if (doc.psychological_insights) {
          doc.psychological_insights.forEach((insight: string) => {
            if (!newMatrix[insight]) {
              newMatrix[insight] = {
                count: 0,
                documents: [],
                related_tags: [],
                business_impact: getBusinessImpact(insight)
              };
            }
            newMatrix[insight].count++;
            newMatrix[insight].documents.push(doc.filename);
            
            // Add related tags
            if (doc.tags) {
              doc.tags.forEach((tag: string) => {
                if (!newMatrix[insight].related_tags.includes(tag)) {
                  newMatrix[insight].related_tags.push(tag);
                }
              });
            }
          });
        }

        // Process tags as separate matrix entries
        if (doc.tags) {
          doc.tags.forEach((tag: string) => {
            const tagKey = `tag_${tag}`;
            if (!newMatrix[tagKey]) {
              newMatrix[tagKey] = {
                count: 0,
                documents: [],
                related_tags: [],
                business_impact: getTagImpact(tag)
              };
            }
            newMatrix[tagKey].count++;
            newMatrix[tagKey].documents.push(doc.filename);
          });
        }
      });

      setMatrix(newMatrix);
    } catch (error) {
      console.error('Error building context matrix:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBusinessImpact = (insight: string): string => {
    const impactMap: { [key: string]: string } = {
      'business-process': 'Operational Efficiency',
      'policy-document': 'Compliance & Governance',
      'meeting-record': 'Decision Tracking',
      'project-data': 'Project Management',
      'client-relations': 'Customer Experience',
      'financial-data': 'Financial Planning',
      'strategic-planning': 'Strategic Direction',
      'technical-documentation': 'Technical Knowledge',
      'training-material': 'Knowledge Transfer',
      'legal-document': 'Risk Management'
    };
    return impactMap[insight] || 'General Business';
  };

  const getTagImpact = (tag: string): string => {
    const tagImpactMap: { [key: string]: string } = {
      'onboarding': 'HR & Talent',
      'sales': 'Revenue Generation',
      'project-management': 'Delivery Excellence',
      'team-dynamics': 'Organizational Culture',
      'automation': 'Process Optimization',
      'ai-training': 'Technology Innovation'
    };
    return tagImpactMap[tag] || 'Operational Support';
  };

  const updateMatrix = async () => {
    setIsUpdating(true);
    await buildContextMatrix();
    setIsUpdating(false);
  };

  const exportMatrix = () => {
    const exportData = {
      generated_at: new Date().toISOString(),
      matrix_type: 'context_data_matrix',
      total_categories: Object.keys(matrix).length,
      matrix: matrix
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `context_data_matrix_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Network className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">Context Data Matrix</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={updateMatrix}
            disabled={isUpdating}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
            Update
          </button>
          <button
            onClick={exportMatrix}
            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Database className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Dynamic context matrix automatically built from your document tags and insights. 
        Creates relational data tables that update as new content is processed.
      </p>

      {Object.keys(matrix).length === 0 ? (
        <div className="text-center py-8">
          <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Context Data Yet</h3>
          <p className="text-gray-600">Upload documents to start building your context matrix</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(matrix)
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([category, data]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {category.replace('tag_', '').replace('-', ' ').toUpperCase()}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {data.count}
                    </span>
                  </div>
                  
                  <p className="text-xs text-purple-600 font-medium mb-2">
                    {data.business_impact}
                  </p>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    <strong>Documents:</strong> {data.documents.length}
                  </div>
                  
                  {data.related_tags.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <strong>Related:</strong> {data.related_tags.slice(0, 3).join(', ')}
                      {data.related_tags.length > 3 && ` +${data.related_tags.length - 3} more`}
                    </div>
                  )}
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {data.documents.slice(0, 2).map((doc, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded truncate max-w-[100px]" title={doc}>
                          {doc.length > 15 ? doc.substring(0, 15) + '...' : doc}
                        </span>
                      ))}
                      {data.documents.length > 2 && (
                        <span className="text-xs text-gray-500">+{data.documents.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Matrix Statistics:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-600 font-medium">Total Categories:</span>
                <span className="ml-2 text-purple-900">{Object.keys(matrix).length}</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Business Insights:</span>
                <span className="ml-2 text-purple-900">
                  {Object.keys(matrix).filter(k => !k.startsWith('tag_')).length}
                </span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Tag Categories:</span>
                <span className="ml-2 text-purple-900">
                  {Object.keys(matrix).filter(k => k.startsWith('tag_')).length}
                </span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Total References:</span>
                <span className="ml-2 text-purple-900">
                  {Object.values(matrix).reduce((sum, data) => sum + data.count, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
