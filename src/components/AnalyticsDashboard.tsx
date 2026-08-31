import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  User, 
  Layers, 
  PieChart, 
  Activity,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { SummaryResponse, TopProductSummary } from '../types';
import { ThinkingOrb } from 'thinking-orbs';
import { apiFetch } from '../services/apiClient';

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/uploads/summary');
      if (res.ok) {
        const data: SummaryResponse = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !summary) {
    return (
      <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100 shadow-xs flex items-center justify-center">
          <ThinkingOrb state="weaving" size={64} speed={2.0} theme="light" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Synthesizing Rack Analytics & Product Share...</p>
        <p className="text-xs text-slate-500 font-mono">Aggregating historical scans from GET /uploads/summary</p>
      </div>
    );
  }

  const topProducts = summary?.top_products || [];
  const maxQty = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.total_quantity)) : 1;
  const successRate = summary ? ((summary.completed_scans / Math.max(1, summary.total_scans)) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono border border-blue-200 font-medium">
              GET /uploads/summary
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Live Field Intel
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Rack Recognition & Product Share Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated rack metrics, product SKU appearances, and merchandiser visual audit throughput.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Rack Scans</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {summary?.total_scans || 0}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>{summary?.completed_scans || 0} Completed ({successRate}%)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Products Detected</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {summary?.total_products_detected || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1.5">
            Total units recognized across shelves
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Unique Products</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {summary?.unique_products_count || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1.5">
            Distinct catalog items identified
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Units / Rack</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {summary && summary.completed_scans > 0
              ? (summary.total_products_detected / summary.completed_scans).toFixed(1)
              : '0'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1.5">
            Average facing count per store rack
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Detected SKUs Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-600" />
              <span>Top Detected Products by Volume</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              top_products (GET /summary)
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {topProducts.length > 0 ? (
              topProducts.map((prod, idx) => {
                const percent = ((prod.total_quantity / maxQty) * 100).toFixed(0);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px] font-bold w-4">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{prod.product_name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-500 text-[11px]">
                          {prod.scan_appearances} racks
                        </span>
                        <span className="font-bold text-blue-600">
                          {prod.total_quantity} units
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No product scans available yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: API Summary Overview & Status Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scan Status Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Scan Processing Status</span>
            </h3>

            {summary && summary.total_scans > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-800 font-medium">Completed Scans</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800">
                    {summary.completed_scans} ({((summary.completed_scans / summary.total_scans) * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-800 font-medium">Processing / Pending</span>
                  </div>
                  <span className="font-mono font-bold text-blue-800">
                    {(summary.processing_scans || 0) + (summary.pending_scans || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-800 font-medium">Failed Scans</span>
                  </div>
                  <span className="font-mono font-bold text-rose-800">
                    {summary.failed_scans || 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No scan data processed yet by backend API.
              </div>
            )}
          </div>

          {/* Recent API Uploads Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Recent Activity Feed</span>
            </h3>

            {summary?.recent_uploads && summary.recent_uploads.length > 0 ? (
              <div className="space-y-2 text-xs">
                {summary.recent_uploads.slice(0, 5).map((upload, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">{upload.shop_id || 'Retail Store'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{upload.upload_id.substring(0, 16)}...</div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        upload.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        upload.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        upload.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {upload.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recent uploads received yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
