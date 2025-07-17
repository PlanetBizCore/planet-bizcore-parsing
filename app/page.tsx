'use client';

import SimpleFileUpload from '@/components/SimpleFileUpload';
import DocumentViewer from '@/components/DocumentViewer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
             Planet BizCORE Parsing App
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Phase 1: Document Processing & BizDatabase Creation
          </p>
          <p className="text-lg text-gray-500">
            Upload business documents to extract structured data for your comprehensive BizDatabase
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <SimpleFileUpload />
        </div>

        <DocumentViewer />
      </div>
    </div>
  );
}
