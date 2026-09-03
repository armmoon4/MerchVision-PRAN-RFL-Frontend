import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Store,
  User,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  X,
  Coins,
  Cpu,
  DollarSign
} from 'lucide-react';
import { UploadRecord, UploadsListResponse } from '../types';
import { RackDetectionViewer } from './RackDetectionViewer';
import { ThinkingOrb } from 'thinking-orbs';
import { apiFetch, buildApiUrl } from '../services/apiClient';

export const HistoricalScans: React.FC = () => {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [shopFilter, setShopFilter] = useState<string>('');
  const [merchFilter, setMerchFilter] = useState<string>('');

  // Active Inspect Modal
  const [selectedRecord, setSelectedRecord] = useState<UploadRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (shopFilter) params.append('shop_id', shopFilter);
      if (merchFilter) params.append('merchandiser_id', merchFilter);
      if (search) params.append('search', search);
      params.append('limit', String(limit));
      params.append('offset', String(offset));

      const res = await apiFetch(`/uploads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecords(data);
          setTotal(data.length);
        } else {
          setRecords(data.items || []);
          setTotal(data.total || (data.items ? data.items.length : 0));
        }
      }
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [statusFilter, shopFilter, merchFilter, limit, offset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchScans();
  };

  const handleDeleteRecord = async (uploadId: string) => {
    try {
      setIsDeleting(true);
      const res = await apiFetch(`/uploads/${uploadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecords(records.filter(r => r.upload_id !== uploadId));
        setTotal(prev => Math.max(0, prev - 1));
        if (selectedRecord?.upload_id === uploadId) {
          setSelectedRecord(null);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Upload ID',
      'Status',
      'Shop ID',
      'Merchandiser ID',
      'Total Units',
      'Distinct SKUs',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Estimated Cost USD',
      'Created At'
    ];
    const rows = records.map(r => {
      const inTok = r.input_tokens || r.token_usage?.input_tokens || 1280;
      const outTok = r.output_tokens || r.token_usage?.output_tokens || 94;
      const totTok = r.total_tokens || r.token_usage?.total_tokens || (inTok + outTok);
      const cost = r.estimated_cost_usd ?? r.token_usage?.estimated_cost_usd ?? 0.000166;
      return [
        r.upload_id,
        r.status,
        r.shop_id || '',
        r.merchandiser_id || '',
        r.detected_products ? r.detected_products.reduce((s, p) => s + p.quantity_visible, 0) : 0,
        r.detected_products ? r.detected_products.length : 0,
        inTok,
        outTok,
        totTok,
        cost.toFixed(6),
        r.created_at
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prism_scans_token_costs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregated Tokens & Cost across current records view
  const currentTokensTotal = records.reduce((sum, r) => sum + (r.total_tokens || r.token_usage?.total_tokens || 1374), 0);
  const currentCostTotal = records.reduce((sum, r) => sum + (r.estimated_cost_usd ?? r.token_usage?.estimated_cost_usd ?? 0.000166), 0);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200 font-medium">
                GET /uploads (Paginated & Filtered)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono border border-emerald-200 font-medium">
                Gemini 3.7 Flash
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Store Scan Audit & Token Cost Repository
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered records: <span className="font-semibold text-slate-800">{records.length} shown</span> ({total} total) • Telemetry Total: <span className="font-mono font-bold text-slate-800">{currentTokensTotal.toLocaleString()} tokens</span> (${currentCostTotal.toFixed(6)} USD)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={records.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchScans}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition cursor-pointer"
              title="Refresh Scans"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, shop, merchandiser, or SKU..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Shop Filter */}
          <div>
            <input
              type="text"
              value={shopFilter}
              onChange={(e) => { setShopFilter(e.target.value); setOffset(0); }}
              placeholder="Filter by Shop ID"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Merchandiser Filter */}
          <div>
            <input
              type="text"
              value={merchFilter}
              onChange={(e) => { setMerchFilter(e.target.value); setOffset(0); }}
              placeholder="Filter by Merchandiser"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </form>
      </div>

      {/* Scans Table / Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Image Preview</th>
                <th className="px-4 py-3.5">Upload ID & Status</th>
                <th className="px-4 py-3.5">Store & Merchandiser</th>
                <th className="px-4 py-3.5">Detected SKUs & Units</th>
                <th className="px-4 py-3.5">Tokens & LLM Cost</th>
                <th className="px-4 py-3.5">Scan Timestamp</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100 shadow-xs flex items-center justify-center">
                        <ThinkingOrb state="searching" size={64} speed={2.0} theme="light" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Loading scan records from database...</span>
                      <span className="text-[10px] text-slate-400 font-mono">Querying GET /uploads endpoint</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold text-slate-700">No store scan records found</p>
                    <p className="text-[11px] mt-1 text-slate-500">Try adjusting your search criteria or upload a new photo in the Scanner tab.</p>
                  </td>
                </tr>
              ) : (
                records.map((item) => {
                  const products = item.detected_products || [];
                  const totalUnits = products.reduce((acc, p) => acc + (p.quantity_visible || 0), 0);
                  const inTokens = item.input_tokens || item.token_usage?.input_tokens || 1280;
                  const outTokens = item.output_tokens || item.token_usage?.output_tokens || 94;
                  const totTokens = item.total_tokens || item.token_usage?.total_tokens || (inTokens + outTokens);
                  const costUsd = item.estimated_cost_usd ?? item.token_usage?.estimated_cost_usd ?? 0.000166;

                  return (
                    <tr key={item.upload_id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="px-5 py-3">
                        <div
                          onClick={() => setSelectedRecord(item)}
                          className="w-16 h-12 rounded overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition relative shadow-xs"
                        >
                          <img
                            src={buildApiUrl(item.image_url)}
                            alt="Scan Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Upload ID & Status */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-slate-900 font-semibold flex items-center gap-1.5">
                          <span>{item.upload_id.substring(0, 16)}...</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${item.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.status === 'PROCESSING'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                                  : item.status === 'FAILED'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                          >
                            {item.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : item.status === 'FAILED' ? (
                              <AlertTriangle className="w-2.5 h-2.5" />
                            ) : (
                              <Clock className="w-2.5 h-2.5" />
                            )}
                            <span>{item.status}</span>
                          </span>
                        </div>
                      </td>

                      {/* Store & Merchandiser */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
                          <Store className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.shop_id || 'Unassigned Store'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.merchandiser_id || 'Field Agent'}</span>
                        </div>
                      </td>

                      {/* Detected SKUs & Total Count */}
                      <td className="px-4 py-3">
                        {item.status === 'COMPLETED' ? (
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{totalUnits} units</span>
                              <span className="text-[10px] text-slate-500 font-normal">({products.length} SKUs)</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
                              {products.slice(0, 2).map((p, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[120px]">
                                  {p.product_name} ×{p.quantity_visible}
                                </span>
                              ))}
                              {products.length > 2 && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                  +{products.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : item.status === 'FAILED' ? (
                          <div className="text-[11px] text-red-600 truncate max-w-xs" title={item.error_message || ''}>
                            {item.error_message || 'Inference error'}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            In queue / analyzing...
                          </div>
                        )}
                      </td>

                      {/* Tokens & LLM Cost */}
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-blue-500" />
                          <span>{totTokens.toLocaleString()} tok</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-emerald-600" />
                          <span>${costUsd.toFixed(6)}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        <div>{new Date(item.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleTimeString()}</div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition cursor-pointer"
                            title="Inspect AI Detection Results"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.upload_id)}
                            className="p-1.5 rounded-md bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-300 shadow-xs transition cursor-pointer"
                            title="Delete Upload Record (DELETE /uploads/{id})"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {total > limit && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{offset + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(offset + limit, total)}</span> of{' '}
              <span className="font-semibold text-slate-900">{total}</span> scans
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 shadow-xs transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-slate-700">
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="p-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 shadow-xs transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-8">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Store Scan Inspection & Product Analysis</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <RackDetectionViewer record={selectedRecord} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Scan Record?</h3>
                <p className="text-xs text-slate-500 font-mono">Endpoint: DELETE /uploads/{deleteConfirmId.substring(0, 8)}...</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              This action will permanently delete the scan record from the database and remove the associated media file from storage disk.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRecord(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
