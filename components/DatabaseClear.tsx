'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DatabaseClear() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const clearDatabase = async () => {
    setIsClearing(true);
    setResult(null);

    try {
      // First delete sections (foreign key dependency)
      const { error: sectionsError } = await supabase
        .from('sections')
        .delete()
        .neq('id', 0); // Delete all records

      if (sectionsError) {
        throw new Error(`Failed to delete sections: ${sectionsError.message}`);
      }

      // Then delete documents
      const { error: documentsError } = await supabase
        .from('documents')
        .delete()
        .neq('id', 0); // Delete all records

      if (documentsError) {
        throw new Error(`Failed to delete documents: ${documentsError.message}`);
      }

      setResult('✅ All documents and sections cleared successfully! You can now re-upload your documents.');
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsClearing(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Clear Database</h2>
        <p className="text-gray-600">
          Remove all processed documents to re-upload with fixed business tag detection
        </p>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Clear All Documents
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">Are you sure?</p>
              <p className="text-sm text-yellow-700">This will permanently delete all processed documents and sections.</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={clearDatabase}
              disabled={isClearing}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isClearing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Clearing...
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, Clear All
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isClearing}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.includes('✅') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}
