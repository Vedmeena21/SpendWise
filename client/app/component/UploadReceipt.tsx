'use client';

import { useState } from 'react';
import axios from 'axios';

const RECEIPT_CATEGORIES = [
  'food',
  'transportation',
  'entertainment',
  'shopping',
  'utilities',
  'healthcare',
  'others'
] as const;

type ReceiptCategory = typeof RECEIPT_CATEGORIES[number];

type ExtractedData = {
  merchant?: string;
  date?: string;
  total?: number;
  items?: { name: string; price: number }[];
  category?: string;
  transcript?: string;
  confidence?: number;
};

const UploadReceipt = () => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<ReceiptCategory>('others');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [polling, setPolling] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const fileType = selectedFile.type;
      if (
        fileType === 'application/pdf' ||
        fileType.startsWith('image/')
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload only PDF or image files');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setExtracted(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await axios.post('https://smart-expense-analyser-backend.onrender.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 && response.data.receipt?.id) {
        setSuccess(true);
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Fetch extracted data
        fetchExtractedData(response.data.receipt.id);
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const fetchExtractedData = async (id: string) => {
    setPolling(true);
    let attempts = 0;
    let found = false;
    while (attempts < 10 && !found) {
      try {
        const res = await axios.get(`https://smart-expense-analyser-backend.onrender.com/api/receipt/${id}`);
        if (res.data.data) {
          setExtracted(res.data.data);
          found = true;
          break;
        }
      } catch  {
        
        
      }
      attempts++;
      await new Promise((res) => setTimeout(res, 2000));
    }
    if (!found) setExtracted({});
    setPolling(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900 text-center">Upload Receipt</h2>
      <p className="text-gray-500 text-center mb-6">Upload a receipt to extract and analyze your expenses.</p>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,image/*"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Choose File
          </label>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Receipt Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ReceiptCategory)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {RECEIPT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Receipt'}
        </button>

        {error && (
          <div className="text-red-500 text-sm mt-2 text-center font-semibold">{error}</div>
        )}
        
        {success && (
          <div className="text-green-500 text-sm mt-2 text-center font-semibold">
            File uploaded successfully!
          </div>
        )}
      </div>

      {/* Extracted Data Card */}
      {polling && (
        <div className="mt-8 flex items-center justify-center text-blue-600">
          <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <span>Processing receipt, please wait...</span>
        </div>
      )}
      {extracted && !polling && (
        <div className="mt-8 bg-gray-50 rounded-xl shadow p-5">
          <h3 className="text-xl font-bold mb-3 text-blue-700">Extracted Receipt Data</h3>
          <div className="space-y-2">
            {extracted.merchant && <div><span className="font-semibold">Merchant:</span> {extracted.merchant}</div>}
            {extracted.date && <div><span className="font-semibold">Date:</span> {new Date(extracted.date).toLocaleDateString()}</div>}
            {extracted.total !== undefined && <div><span className="font-semibold">Total:</span> ${extracted.total.toFixed(2)}</div>}
            {extracted.category && <div><span className="font-semibold">Category:</span> {extracted.category}</div>}
            {extracted.confidence !== undefined && <div><span className="font-semibold">Confidence:</span> {extracted.confidence.toFixed(1)}%</div>}
            {extracted.items && extracted.items.length > 0 && (
              <div>
                <span className="font-semibold">Items:</span>
                <ul className="list-disc ml-6 mt-1">
                  {extracted.items.map((item, idx) => (
                    <li key={idx} className="text-sm">{item.name} <span className="text-gray-500">(${item.price.toFixed(2)})</span></li>
                  ))}
                </ul>
              </div>
            )}
            {extracted.transcript && (
              <div>
                <span className="font-semibold">Transcript:</span>
                <pre className="bg-white rounded p-2 mt-1 text-xs max-h-40 overflow-auto border border-gray-200">{extracted.transcript}</pre>
              </div>
            )}
            {!extracted.merchant && !extracted.date && !extracted.total && !extracted.items && !extracted.transcript && (
              <div className="text-gray-500 text-sm">No extracted data available yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReceipt; 