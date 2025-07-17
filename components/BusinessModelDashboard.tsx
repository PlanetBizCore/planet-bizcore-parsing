'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Database, Eye, Plus, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BusinessModel {
  id: string;
  business_code: string;
  business_name: string;
  description: string;
  industry_focus: string[];
  core_services: string[];
  document_count: number;
  knowledge_base_maturity: string;
  is_active: boolean;
  allows_clients: boolean;
  created_at: string;
}

interface BusinessIntelligence {
  business_model_id: string;
  products_services: string[];
  customer_demographics: any;
  customer_psychographics: any;
  competitor_analysis: any;
  value_propositions: string[];
  confidence_score: number;
}

export default function BusinessModelDashboard() {
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [businessIntelligence, setBusinessIntelligence] = useState<Record<string, BusinessIntelligence>>({});
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);

      // Load business models with document counts
      const { data: modelsData, error: modelsError } = await supabase
        .from('business_model_dashboard')
        .select('*')
        .order('business_name');

      if (modelsError) throw modelsError;

      setBusinessModels(modelsData || []);

      // Load business intelligence for each model
      const { data: intelligenceData, error: intelligenceError } = await supabase
        .from('business_model_intelligence')
        .select('*');

      if (intelligenceError) throw intelligenceError;

      const intelligenceMap = (intelligenceData || []).reduce((acc, item) => {
        acc[item.business_model_id] = item;
        return acc;
      }, {} as Record<string, BusinessIntelligence>);

      setBusinessIntelligence(intelligenceMap);
      
      // Auto-select JMS3 if available
      const jms3Model = modelsData?.find(bm => bm.business_code === 'JMS3');
      if (jms3Model) {
        setSelectedModel(jms3Model.id);
      }

    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'building': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'production': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedModelData = businessModels.find(bm => bm.id === selectedModel);
  const selectedIntelligence = selectedModel ? businessIntelligence[selectedModel] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          Business Model Intelligence Dashboard
        </h2>
        <p className="text-gray-600">
          Monitor and analyze your business models within the Planet BizCORE ecosystem
        </p>
      </div>

      {/* Business Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {businessModels.map((model) => (
          <div
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedModel === model.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{model.business_name}</h3>
              <span className="text-xs font-medium text-gray-500">{model.business_code}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents</span>
                <span className="font-medium text-gray-900">{model.document_count || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Maturity</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getMaturityColor(model.knowledge_base_maturity)}`}>
                  {model.knowledge_base_maturity}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  model.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {model.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Model Details */}
      {selectedModelData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Model Overview */}
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {selectedModelData.business_name} Overview
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600">{selectedModelData.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Industry Focus</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedModelData.industry_focus?.map((industry, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Core Services</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedModelData.core_services?.map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Client Readiness */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Readiness
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Allows Client Instances</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedModelData.allows_clients 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedModelData.allows_clients ? 'Ready' : 'Phase 2'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Knowledge Base Maturity</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getMaturityColor(selectedModelData.knowledge_base_maturity)}`}>
                    {selectedModelData.knowledge_base_maturity}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Document Count</span>
                  <span className="font-semibold text-gray-900">{selectedModelData.document_count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Intelligence */}
          <div className="space-y-6">
            {selectedIntelligence ? (
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Extracted Business Intelligence
                </h3>
                
                <div className="space-y-4">
                  {selectedIntelligence.products_services?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Products & Services</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedIntelligence.products_services.map((item, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedIntelligence.value_propositions?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Value Propositions</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedIntelligence.value_propositions.map((prop, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confidence Score</label>
                    <div className="mt-1">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${selectedIntelligence.confidence_score}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 mt-1">{selectedIntelligence.confidence_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Business Intelligence
                </h3>
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No business intelligence data extracted yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Upload documents to begin analysis.</p>
                </div>
              </div>
            )}

            {/* Phase 2 Preview */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Phase 2 Roadmap
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>White-label client instances</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multi-tenant data isolation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Billing & subscription management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Cross-business intelligence sharing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
