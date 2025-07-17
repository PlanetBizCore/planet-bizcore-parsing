'use client';

import React, { useState } from 'react';
import { Download, FileText, Database, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const exportToJSON = async () => {
    setIsExporting(true);
    setExportStatus('Fetching data from BizDatabase...');

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setExportStatus('Preparing export file...');

      // Create comprehensive export data
      const exportData = {
        export_info: {
          exported_at: new Date().toISOString(),
          total_documents: data?.length || 0,
          export_type: 'bizdatabase_complete'
        },
        documents: data?.map(doc => ({
          id: doc.id,
          filename: doc.filename,
          file_type: doc.file_type,
          file_size: doc.file_size,
          business_domain: doc.business_domain,
          complexity_level: doc.complexity_level,
          processing_status: doc.processing_status,
          business_insights: doc.psychological_insights,
          business_tags: doc.tags,
          uploaded_at: doc.created_at,
          content_preview: doc.raw_content?.substring(0, 200) + '...'
        }))
      };

      // Download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizdatabase_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus(`Successfully exported ${data?.length || 0} documents!`);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    setExportStatus('Fetching data for CSV export...');

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setExportStatus('Generating CSV file...');

      // Create CSV headers
      const csvHeaders = [
        'Filename',
        'File Type',
        'File Size (bytes)',
        'Business Domain',
        'Complexity Level',
        'Business Insights',
        'Business Tags',
        'Upload Date',
        'Processing Status'
      ];

      // Create CSV rows
      const csvRows = data?.map(doc => [
        doc.filename,
        doc.file_type,
        doc.file_size,
        doc.business_domain,
        doc.complexity_level,
        Array.isArray(doc.psychological_insights) ? doc.psychological_insights.join('; ') : '',
        Array.isArray(doc.tags) ? doc.tags.join('; ') : '',
        new Date(doc.created_at).toLocaleDateString(),
        doc.processing_status
      ]) || [];

      // Combine headers and rows
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizdatabase_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus(`Successfully exported ${data?.length || 0} documents to CSV!`);
      
    } catch (error) {
      console.error('CSV export error:', error);
      setExportStatus(`CSV export failed: ${error}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <Database className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">Export BizDatabase</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Download your complete business database in different formats for analysis, backup, or integration with other systems.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* JSON Export */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">JSON Export</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Complete data export with full content, metadata, and business insights. Perfect for AI training or system integration.
          </p>
          <button
            onClick={exportToJSON}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Download JSON'}
          </button>
        </div>

        {/* CSV Export */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">CSV Export</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Spreadsheet-friendly format with key business data. Great for analysis in Excel, Google Sheets, or business intelligence tools.
          </p>
          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {exportStatus && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">{exportStatus}</p>
        </div>
      )}

      {/* Export Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">What's Included in Exports:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Document metadata (filename, type, size, upload date)</li>
          <li>• Business insights and categorization</li>
          <li>• Business tags and domain classification</li>
          <li>• Processing status and content previews</li>
          <li>• Complete export timestamp and summary</li>
        </ul>
      </div>
    </div>
  );
}
