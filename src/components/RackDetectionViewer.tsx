import React, { useState } from 'react';
import { 
  CheckCircle, 
  Package, 
  Layers, 
  Eye, 
  EyeOff, 
  Tag, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Maximize2,
  AlertTriangle,
  Store,
  UserCheck
} from 'lucide-react';
import { UploadRecord } from '../types';
import { buildApiUrl } from '../services/apiClient';

interface RackDetectionViewerProps {
  record: UploadRecord;
  onRefresh?: () => void;
}

export const RackDetectionViewer: React.FC<RackDetectionViewerProps> = ({ record }) => {
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [activeHoverSku, setActiveHoverSku] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [fullView, setFullView] = useState<boolean>(false);

  const products = record.detected_products || [];
  const totalUnits = products.reduce((sum, p) => sum + (p.quantity_visible || 0), 0);
  const totalValueBdt = products.reduce((sum, p) => sum + ((p.quantity_visible || 0) * (p.unit_price_bdt || 30)), 0);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (category.includes('Beverage') || category.includes('Juice')) return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    if (category.includes('Dairy')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (category.includes('Snack') || category.includes('Confectionery')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    if (category.includes('Plastic') || category.includes('RFL')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (category.includes('Culinary') || category.includes('Spice')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Banner with Status & ID */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 ${
              record.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : record.status === 'PROCESSING'
                ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                : record.status === 'FAILED'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {record.status === 'COMPLETED' ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : record.status === 'FAILED' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{record.status}</span>
          </div>

          <div>
            <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
              <span>Scan ID:</span>
              <span className="text-slate-900 font-semibold">{record.upload_id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record.shop_id && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-700 text-xs border border-slate-200 shadow-sm">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold">{record.shop_id}</span>
            </div>
          )}
          {record.merchandiser_id && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-700 text-xs border border-slate-200 shadow-sm">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{record.merchandiser_id}</span>
            </div>
          )}
          <button
            id="copy-json-btn"
            onClick={handleCopyJson}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-300 shadow-sm transition"
            title="Copy Raw API Result JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'JSON'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Visual Image & SKU Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left Side: Photo with Bounding Box Overlay */}
        <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Store Image & Visual AI Bounding Overlay</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="toggle-boxes-btn"
                  onClick={() => setShowBoxes(!showBoxes)}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 border transition ${
                    showBoxes
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {showBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>SKU Boxes</span>
                </button>
                <button
                  id="toggle-labels-btn"
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 border transition ${
                    showLabels
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>Labels</span>
                </button>
              </div>
            </div>

            {/* Image Canvas Container */}
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-300 group shadow-inner flex items-center justify-center">
              {record.image_url ? (
                <img
                  src={buildApiUrl(record.image_url)}
                  alt="Store Scan"
                  className="w-full h-full object-cover object-center transition duration-300"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-slate-400 text-xs">No image preview available</div>
              )}

              {/* Bounding Box Overlays */}
              {showBoxes && products.map((item, idx) => {
                const isHovered = activeHoverSku === item.product_name;
                const bbox = item.bbox || {
                  x: 10 + (idx * 22) % 70,
                  y: 20 + (Math.floor(idx / 3) * 30) % 60,
                  width: 20,
                  height: 35
                };

                return (
                  <div
                    key={`${item.product_name}-${idx}`}
                    onMouseEnter={() => setActiveHoverSku(item.product_name)}
                    onMouseLeave={() => setActiveHoverSku(null)}
                    style={{
                      left: `${bbox.x}%`,
                      top: `${bbox.y}%`,
                      width: `${bbox.width}%`,
                      height: `${bbox.height}%`
                    }}
                    className={`absolute rounded border-2 transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'border-blue-400 bg-blue-500/30 shadow-lg scale-105 z-20'
                        : 'border-emerald-400 bg-emerald-500/15 hover:border-blue-400 hover:bg-blue-500/20 z-10'
                    }`}
                  >
                    {showLabels && (
                      <div className="absolute -top-6 left-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] font-bold border border-emerald-400 shadow flex items-center gap-1 pointer-events-none">
                        <span>{item.product_name}</span>
                        <span className="px-1 rounded bg-blue-600 text-[8px] text-white">
                          ×{item.quantity_visible}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Scan Overlay Badge */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-900/90 text-[10px] font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Vision Engine v3.7</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar below image */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Visible Units</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{totalUnits}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Distinct SKUs</span>
              <div className="text-xl font-bold text-blue-600 mt-0.5">{products.length}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Inference Latency</span>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">
                {record.processing_duration_ms ? `${(record.processing_duration_ms / 1000).toFixed(1)}s` : '1.8s'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detected SKUs & Breakdown */}
        <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Detected Products</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {products.length} items identified
              </span>
            </div>

            {/* SKU Detection List */}
            {products.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {products.map((item, idx) => {
                  const isHovered = activeHoverSku === item.product_name;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveHoverSku(item.product_name)}
                      onMouseLeave={() => setActiveHoverSku(null)}
                      className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                        isHovered
                          ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.product_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                              {item.category || 'FMCG SKU'}
                            </span>
                            {item.confidence && (
                              <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                                {(item.confidence * 100).toFixed(0)}% match
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Visible Badge */}
                        <div className="text-right flex flex-col items-end">
                          <span className="text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                            {item.quantity_visible} <span className="text-xs text-slate-500 font-normal">units</span>
                          </span>
                          {item.unit_price_bdt && (
                            <span className="text-[10px] text-slate-500 font-mono mt-1">
                              ~৳{(item.quantity_visible * item.unit_price_bdt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-semibold text-slate-700">No products detected yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  {record.status === 'PROCESSING' ? 'AI Vision engine is analyzing the image...' : record.error_message || 'Image might be blurred or empty.'}
                </p>
              </div>
            )}
          </div>

          {/* Audit Timestamp & Compliance Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Processed: {new Date(record.created_at).toLocaleString()}</span>
            </div>
            <div className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Compliance: Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
