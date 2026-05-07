'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { endpoints } from '@/lib/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Play, Table as TableIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus(null);

      // Read for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').slice(0, 11).map(row => row.split(','));
        setPreviewData(rows.filter(r => r.length > 1));
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(endpoints.upload, formData);
      if (response.data.status === 'success') {
        setStatus({ type: 'success', message: 'Prediction models re-calculated and reloaded successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Failed to process data: ' + response.data.detail });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'An error occurred during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all group">
          <UploadCloud className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Drag & Drop CSV Dataset</h3>
          <label className="cursor-pointer">
            <span className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all inline-block">
              Select File
            </span>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>
        </div>

        {file && previewData.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <TableIcon className="w-3 h-3" />
                Data Preview (First 10 Rows)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-white">
                    <tr>
                      {previewData[0].map((h, i) => <th key={i} className="px-3 py-2 border-b border-slate-200 font-bold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        {row.map((c, j) => <td key={j} className="px-3 py-1.5 border-b border-slate-100 text-slate-600">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-slate-400" />
                 <span className="text-sm font-bold text-slate-700">{file.name}</span>
               </div>
               <button 
                 onClick={handleUpload}
                 disabled={isUploading}
                 className={cn(
                   "px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg",
                   isUploading ? "bg-slate-200 text-slate-500" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                 )}
               >
                 {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                 Run Prediction Pipeline
               </button>
            </div>
          </div>
        )}

        {status && (
          <div className={cn(
            "mt-8 p-4 rounded-2xl flex items-start gap-4 border",
            status.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
          )}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <p className="text-sm font-bold">{status.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
