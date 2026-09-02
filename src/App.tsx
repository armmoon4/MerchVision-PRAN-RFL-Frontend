import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveRackScanner } from './components/LiveRackScanner';
import { HistoricalScans } from './components/HistoricalScans';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UploadRecord } from './types';
import { ShieldCheck, Cpu, Code2, Heart } from 'lucide-react';
import { apiFetch } from './services/apiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'analytics'>('scanner');
  const [serverHealth, setServerHealth] = useState<'ok' | 'checking' | 'error'>('checking');

  // Check GET /health endpoint using configured api base
  const checkHealth = async () => {
    try {
      const res = await apiFetch('/health');
      if (res.ok) {
        setServerHealth('ok');
      } else {
        setServerHealth('error');
      }
    } catch (e) {
      setServerHealth('error');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleScanCompleted = (record: UploadRecord) => {
    console.log('Rack scan completed:', record);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Application Header */}
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        serverHealth={serverHealth} 
        onHealthCheckTrigger={checkHealth}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'scanner' && (
          <LiveRackScanner onScanCompleted={handleScanCompleted} />
        )}
        {activeTab === 'history' && (
          <HistoricalScans />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MerchVision Engine</span>
            <span>•</span>
            <span className="text-slate-600 font-medium">Product Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>FastAPI Backend Connected</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
