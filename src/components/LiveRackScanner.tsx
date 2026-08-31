import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Sparkles,
  Store,
  User,
  AlertCircle,
  ArrowRight,
  FileImage,
  History,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Eye,
  ScanLine,
  ImagePlus,
  FlaskConical,
  ChevronRight,
  Wifi,
  WifiOff,
  Clock3,
  Package,
  Zap
} from 'lucide-react';
import { UploadRecord } from '../types';
import { RackDetectionViewer } from './RackDetectionViewer';
import { CameraCaptureModal } from './CameraCaptureModal';
import { AiDiscoveryEngine } from './AiDiscoveryEngine';
import { ThinkingOrb } from 'thinking-orbs';
import { apiFetch } from '../services/apiClient';
import { SAMPLE_RACKS } from '../data/pranCatalog';

interface LiveRackScannerProps {
  onScanCompleted?: (record: UploadRecord) => void;
}

type IngestionTab = 'upload' | 'samples';
type ViewMode = 'intake' | 'analyzing' | 'results';

export const LiveRackScanner: React.FC<LiveRackScannerProps> = ({ onScanCompleted }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('intake');
  const [ingestionTab, setIngestionTab] = useState<IngestionTab>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string>('SHOP-Gulshan-102');
  const [merchandiserId, setMerchandiserId] = useState<string>('MER-Rahim-45');
  const [isDragging, setIsDragging] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'UPLOADING' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<UploadRecord | null>(null);
  const [recentScan, setRecentScan] = useState<UploadRecord | null>(null);
  const [isLoadingRecent, setIsLoadingRecent] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMostRecentScan = async () => {
    try {
      setIsLoadingRecent(true);
      const res = await apiFetch('/uploads?limit=5');
      if (res.ok) {
        const data = await res.json();
        const records: UploadRecord[] = Array.isArray(data) ? data : (data.items || []);
        if (records && records.length > 0) {
          const completedRecord = records.find((r) => r.status === 'COMPLETED') || records[0];
          setRecentScan(completedRecord);
        }
        setApiUnavailable(false);
      } else {
        setApiUnavailable(true);
      }
    } catch {
      setApiUnavailable(true);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => { fetchMostRecentScan(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) { setErrorMessage('File size exceeds 10MB limit.'); return; }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setBase64Data(null); setErrorMessage(null); setScanResult(null); setUploadStatus('IDLE');
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.size > 10 * 1024 * 1024) { setErrorMessage('File size exceeds 10MB limit.'); return; }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setBase64Data(null); setErrorMessage(null); setScanResult(null); setUploadStatus('IDLE');
    }
  };

  const handleCameraCapture = (capturedBase64: string) => {
    setBase64Data(capturedBase64); setPreviewUrl(capturedBase64);
    setFile(null); setErrorMessage(null); setScanResult(null); setUploadStatus('IDLE');
    setIsCameraOpen(false);
  };

  const handleSelectSample = (sample: typeof SAMPLE_RACKS[0]) => {
    setPreviewUrl(sample.imageUrl); setBase64Data(null); setFile(null);
    setShopId(sample.shop_id); setMerchandiserId(sample.merchandiser_id);
    setErrorMessage(null); setScanResult(null); setUploadStatus('IDLE');
  };

  const pollForResults = (uploadId: string) => {
    let attempts = 0;
    const maxAttempts = 40;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await apiFetch(`/uploads/${uploadId}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: UploadRecord = await res.json();
        if (data.status === 'PROCESSING') setUploadStatus('PROCESSING');
        else if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setUploadStatus('COMPLETED'); setIsUploading(false);
          setScanResult(data); setRecentScan(data);
          setViewMode('results');
          if (onScanCompleted) onScanCompleted(data);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setUploadStatus('FAILED'); setIsUploading(false);
          setErrorMessage(data.error_message || 'Vision analysis failed. Please try again.');
          setViewMode('intake');
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval); setIsUploading(false);
          setErrorMessage('Analysis is taking too long. Check Scan History for the result.');
          setViewMode('intake');
        }
      } catch { /* silent poll error */ }
    }, 1200);
  };

  const handleStartAnalysis = async () => {
    if (!file && !base64Data && !previewUrl) { setErrorMessage('Please select or upload an image first.'); return; }
    try {
      setIsUploading(true); setErrorMessage(null); setUploadStatus('UPLOADING');
      setScanResult(null); setViewMode('analyzing');
      let uploadId = '';

      const parseError = async (res: Response): Promise<string> => {
        try {
          const body = await res.json();
          // FastAPI validation / HTTPException detail
          if (typeof body.detail === 'string') return body.detail;
          if (Array.isArray(body.detail)) return body.detail.map((d: any) => d.msg).join(', ');
          if (body.message) return body.message;
          if (body.error) return body.error;
        } catch { /* ignore */ }
        if (res.status === 500) return 'Server error (500) — check your Gemini API key is set on the backend.';
        if (res.status === 422) return 'Invalid request (422) — the backend rejected the payload.';
        if (res.status === 401) return 'Unauthorized (401) — Gemini API key may be missing or invalid.';
        if (res.status === 503) return 'Service unavailable (503) — backend or AI service is down.';
        return `Request failed with HTTP ${res.status}.`;
      };

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (shopId) formData.append('shop_id', shopId);
        if (merchandiserId) formData.append('merchandiser_id', merchandiserId);
        const res = await apiFetch('/uploads', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(await parseError(res));
        uploadId = (await res.json()).upload_id;
      } else if (base64Data) {
        const res = await apiFetch('/uploads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64Data, shop_id: shopId, merchandiser_id: merchandiserId })
        });
        if (!res.ok) throw new Error(await parseError(res));
        uploadId = (await res.json()).upload_id;
      } else if (previewUrl) {
        const res = await apiFetch('/uploads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: previewUrl, shop_id: shopId, merchandiser_id: merchandiserId })
        });
        if (!res.ok) throw new Error(await parseError(res));
        uploadId = (await res.json()).upload_id;
      }

      setCurrentUploadId(uploadId); setUploadStatus('PENDING'); pollForResults(uploadId);
    } catch (err: any) {
      setIsUploading(false); setUploadStatus('FAILED'); setViewMode('intake');
      const msg: string = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('load failed')) {
        setApiUnavailable(true);
        setErrorMessage('Cannot connect to the backend API. Make sure your FastAPI server is running on port 8000.');
      } else {
        setErrorMessage(msg || 'Upload failed. Please check the backend logs.');
      }
    }
  };

  const handleReset = () => {
    setFile(null); setPreviewUrl(null); setBase64Data(null);
    setScanResult(null); setErrorMessage(null); setUploadStatus('IDLE');
    setCurrentUploadId(null); setViewMode('intake');
  };

  const activeDisplayRecord = scanResult || recentScan;

  const statusLabel = {
    IDLE: '', UPLOADING: 'Uploading...', PENDING: 'Queued — waiting for worker...',
    PROCESSING: 'Vision engine processing...', COMPLETED: 'Complete', FAILED: 'Failed'
  }[uploadStatus];

  return (
    <div className="space-y-4">

      {/* ── API Unavailable Banner ───────────────────────────── */}
      {apiUnavailable && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Backend API Unreachable</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Cannot reach <code className="font-mono bg-amber-100 px-1 rounded text-amber-800">http://localhost:8000</code>. Start your FastAPI backend or configure the API URL in the header settings. The app works in demo mode with sample images.
            </p>
          </div>
          <button onClick={() => { setApiUnavailable(false); fetchMostRecentScan(); }}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 rounded-xl transition cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* ── Page Header + Tab Switcher ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Scanner</h1>
          <p className="text-xs text-slate-500 mt-0.5">Upload or capture store photos for automated SKU recognition and inventory audit</p>
        </div>

        {/* View Mode Pill Tabs */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-2xl p-1 gap-1">
          <button onClick={() => setViewMode('intake')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              viewMode === 'intake' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <ImagePlus className="w-4 h-4" />
            <span>Image Intake</span>
          </button>
          <button
            onClick={() => {
              if (viewMode === 'analyzing' || viewMode === 'results') return;
              if (activeDisplayRecord) setViewMode('results');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              viewMode === 'analyzing' || viewMode === 'results'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {isUploading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span className="text-blue-600">Processing...</span>
              </div>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Results</span>
                {activeDisplayRecord && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          VIEW 1 — INTAKE
      ═══════════════════════════════════════════════════════ */}
      {viewMode === 'intake' && (
        <div className="animate-fadeInScale">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

            {/* Left Panel — Image Staging (3/5 width) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <ScanLine className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Image Staging Area</p>
                      <p className="text-xs text-slate-500">Upload, snap, or load a sample photo</p>
                    </div>
                  </div>
                  {previewUrl && (
                    <button onClick={handleReset}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1.5 rounded-xl transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Source Toggle (visible when no preview) */}
                {!previewUrl && (
                  <div className="px-4 pt-3">
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button onClick={() => setIngestionTab('upload')}
                        className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          ingestionTab === 'upload' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}>
                        <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                        Upload File
                      </button>
                      <button onClick={() => setIngestionTab('samples')}
                        className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          ingestionTab === 'samples' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}>
                        <FlaskConical className="w-3.5 h-3.5 text-violet-500" />
                        Sample Images
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Body */}
                <div className="p-4 space-y-3">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />

                  {previewUrl ? (
                    /* ── Loaded Preview ── */
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 group" style={{ aspectRatio: '4/3' }}>
                      <img src={previewUrl} alt="Staged Image" className="w-full h-full object-cover opacity-95" />

                      {/* Success badge */}
                      <div className="absolute top-2 left-2">
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready for Analysis
                        </span>
                      </div>

                      {/* File info badge */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                          <span className="text-white/90 text-xs font-medium truncate max-w-[200px]">
                            {file ? file.name : base64Data ? 'Camera Snapshot' : 'Sample Image'}
                          </span>
                          <span className="text-white/60 text-xs font-mono shrink-0 ml-2">
                            {file ? `${(file.size / 1024).toFixed(0)} KB` : 'Loaded'}
                          </span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-800 rounded-xl text-sm font-semibold shadow-xl hover:bg-slate-50 transition">
                          <UploadCloud className="w-4 h-4 text-blue-500" /> Change Photo
                        </button>
                        <button onClick={() => setIsCameraOpen(true)}
                          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition">
                          <Camera className="w-4 h-4" /> Camera
                        </button>
                      </div>
                    </div>
                  ) : ingestionTab === 'samples' ? (
                    /* ── Sample Grid ── */
                    <div className="grid grid-cols-2 gap-2.5 animate-fadeIn">
                      {SAMPLE_RACKS.slice(0, 4).map((sample) => (
                        <button key={sample.id} onClick={() => handleSelectSample(sample)}
                          className="relative group rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all cursor-pointer bg-white shadow-xs hover:shadow-md">
                          <img src={sample.imageUrl} alt={sample.title}
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-xs font-bold leading-tight truncate">{sample.category}</p>
                            <p className="text-white/60 text-[10px] font-mono truncate mt-0.5">{sample.shop_id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* ── Upload Zone ── */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-10 ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                          : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isDragging ? 'bg-blue-100 border-blue-200' : 'bg-white border-slate-200'} border shadow-sm`}>
                        <UploadCloud className={`w-6 h-6 transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">
                          {isDragging ? 'Drop to stage image' : 'Drop image here or click to browse'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">JPEG, PNG or WebP — up to 10MB</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition">
                        <Camera className="w-3.5 h-3.5 text-emerald-500" />
                        Use Live Camera
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {errorMessage && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel — Config + CTA (2/5 width) */}
            <div className="lg:col-span-2 space-y-3">

              {/* Context Config Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Store className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Audit Context</p>
                    <p className="text-xs text-slate-500">Store & merchandiser metadata</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        Store / Hub ID
                      </span>
                    </label>
                    <input type="text" value={shopId} onChange={(e) => setShopId(e.target.value)}
                      placeholder="SHOP-Gulshan-102"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Merchandiser ID
                      </span>
                    </label>
                    <input type="text" value={merchandiserId} onChange={(e) => setMerchandiserId(e.target.value)}
                      placeholder="MER-Rahim-45"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition" />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Presets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['SHOP-Gulshan-102', 'SHOP-Dhanmondi-204', 'SHOP-Uttara-305'].map((id) => (
                      <button key={id} onClick={() => setShopId(id)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition ${shopId === id ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'}`}>
                        {id.replace('SHOP-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Run Analysis Button */}
              <button
                id="start-analysis-btn"
                onClick={handleStartAnalysis}
                disabled={isUploading || (!file && !base64Data && !previewUrl)}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {uploadStatus === 'UPLOADING' ? 'Uploading...' :
                        uploadStatus === 'PENDING' ? 'Queued...' : 'Analyzing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white/90" />
                    <span>Run AI Product Discovery</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </>
                )}
              </button>

              {/* Recent Scan Badge */}
              {!isLoadingRecent && recentScan && viewMode === 'intake' && (
                <button onClick={() => setViewMode('results')}
                  className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all group text-left animate-fadeIn">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={recentScan.image_url || ''} alt="Recent scan" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">View Last Scan Result</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{recentScan.shop_id || 'Unknown store'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          VIEW 2 — ANALYZING
      ═══════════════════════════════════════════════════════ */}
      {viewMode === 'analyzing' && (
        <div className="animate-fadeInScale">
          <AiDiscoveryEngine
            previewUrl={previewUrl}
            status={uploadStatus}
            uploadId={currentUploadId}
            shopId={shopId}
            merchandiserId={merchandiserId}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          VIEW 3 — RESULTS
      ═══════════════════════════════════════════════════════ */}
      {viewMode === 'results' && (
        <div className="space-y-4 animate-fadeInScale">
          {/* Results Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Recognition Results</p>
                <p className="text-xs text-slate-500">
                  {activeDisplayRecord?.created_at
                    ? `Scanned ${new Date(activeDisplayRecord.created_at).toLocaleString()}`
                    : 'Most recent completed audit'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('intake')}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer">
                <ImagePlus className="w-3.5 h-3.5 text-blue-500" />
                New Scan
              </button>
              <button onClick={() => { fetchMostRecentScan(); }}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Refresh
              </button>
            </div>
          </div>

          {activeDisplayRecord ? (
            <RackDetectionViewer record={activeDisplayRecord} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50 to-slate-50 border border-blue-100">
                <ThinkingOrb state="breathing" size={64} speed={1.5} theme="light" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No Scans Yet</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Upload a store photo in the Image Intake tab to run your first recognition analysis.</p>
              </div>
              <button onClick={() => setViewMode('intake')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
                <ImagePlus className="w-4 h-4" /> Go to Intake
              </button>
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} />
    </div>
  );
};
