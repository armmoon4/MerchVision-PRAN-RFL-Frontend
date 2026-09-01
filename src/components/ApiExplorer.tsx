import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

import { apiFetch } from '../services/apiClient';

interface EndpointDef {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  section: string;
  statusSuccess: string;
  params?: {
    name: string;
    type: string;
    required: boolean;
    location: 'path' | 'query' | 'formData' | 'body';
    description: string;
    defaultVal?: string;
  }[];
  sampleCurl: string;
  samplePython: string;
  sampleJs: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'health',
    name: 'Server Health & Liveness Probe',
    method: 'GET',
    path: '/health',
    description: 'Liveness probe to verify server availability and uptime.',
    section: '3.1. System & Health',
    statusSuccess: '200 OK',
    sampleCurl: 'curl -X GET http://localhost:8000/health',
    samplePython: `import requests\nres = requests.get("http://localhost:8000/health")\nprint(res.json())`,
    sampleJs: `fetch("http://localhost:8000/health")\n  .then(r => r.json())\n  .then(console.log);`
  },
  {
    id: 'upload',
    name: 'Upload Rack Photo (Multipart File) & Enqueue Recognition',
    method: 'POST',
    path: '/uploads',
    description: 'Uploads a rack image file and enqueues a background AI recognition job.',
    section: '3.2. Rack Uploads & Analysis',
    statusSuccess: '202 Accepted',
    params: [
      { name: 'file', type: 'Binary File', required: true, location: 'formData', description: 'Image file (image/jpeg, image/png, image/webp). Max size: 10 MB.' },
      { name: 'shop_id', type: 'String', required: false, location: 'formData', description: 'Unique shop identifier', defaultVal: 'SHOP-Gulshan-102' },
      { name: 'merchandiser_id', type: 'String', required: false, location: 'formData', description: 'Merchandiser identifier or name', defaultVal: 'MER-Rahim-45' }
    ],
    sampleCurl: `curl -X POST http://localhost:8000/uploads \\\n  -F "file=@/path/to/store_rack.jpg" \\\n  -F "shop_id=SHOP-102" \\\n  -F "merchandiser_id=MER-45"`,
    samplePython: `import requests\nfiles = {"file": open("store_rack.jpg", "rb")}\ndata = {"shop_id": "SHOP-102", "merchandiser_id": "MER-45"}\nres = requests.post("http://localhost:8000/uploads", files=files, data=data)\nprint(res.json()) # {"upload_id": "...", "status": "PENDING"}`,
    sampleJs: `const form = new FormData();\nform.append("file", fileInput.files[0]);\nform.append("shop_id", "SHOP-102");\nform.append("merchandiser_id", "MER-45");\n\nconst res = await fetch("http://localhost:8000/uploads", {\n  method: "POST",\n  body: form\n});\nconst data = await res.json();\nconsole.log(data);`
  },
  {
    id: 'upload-url',
    name: 'Analyze from Image URL (JSON Payload)',
    method: 'POST',
    path: '/uploads/url',
    description: 'Accepts a publicly accessible rack image URL, downloads and validates the image, and enqueues a background AI recognition job.',
    section: '3.2. Rack Uploads & Analysis',
    statusSuccess: '202 Accepted',
    params: [
      { name: 'image_url', type: 'String', required: true, location: 'body', description: 'Public HTTP/HTTPS image URL (JPEG, PNG, WebP). Max 10MB.', defaultVal: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80' },
      { name: 'shop_id', type: 'String', required: false, location: 'body', description: 'Unique shop identifier', defaultVal: 'SHOP-Gulshan-102' },
      { name: 'merchandiser_id', type: 'String', required: false, location: 'body', description: 'Merchandiser identifier or name', defaultVal: 'MER-Rahim-45' }
    ],
    sampleCurl: `curl -X POST http://localhost:8000/uploads/url \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "image_url": "https://example.com/rack_shelf.jpg",\n    "shop_id": "SHOP-102",\n    "merchandiser_id": "MER-45"\n  }'`,
    samplePython: `import requests\npayload = {\n    "image_url": "https://example.com/rack_shelf.jpg",\n    "shop_id": "SHOP-102",\n    "merchandiser_id": "MER-45"\n}\nres = requests.post("http://localhost:8000/uploads/url", json=payload)\nprint(res.json()) # {"upload_id": "...", "status": "PENDING"}`,
    sampleJs: `const res = await fetch("http://localhost:8000/uploads/url", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    image_url: "https://example.com/rack_shelf.jpg",\n    shop_id: "SHOP-102",\n    merchandiser_id: "MER-45"\n  })\n});\nconst data = await res.json();\nconsole.log(data);`
  },
  {
    id: 'get-upload-result',
    name: 'Get Scan Status & Detected Products',
    method: 'GET',
    path: '/uploads/{upload_id}',
    description: 'Retrieves the status, detected products, and unit counts for a specific upload ID.',
    section: '3.2. Rack Uploads & Analysis',
    statusSuccess: '200 OK',
    params: [
      { name: 'upload_id', type: 'UUID String', required: true, location: 'path', description: 'UUID string returned from POST /uploads or /uploads/url', defaultVal: 'f0051207-7e9f-4f5d-a8a1-8b1fed212103' }
    ],
    sampleCurl: `curl -X GET http://localhost:8000/uploads/f0051207-7e9f-4f5d-a8a1-8b1fed212103`,
    samplePython: `import requests\nres = requests.get("http://localhost:8000/uploads/f0051207-7e9f-4f5d-a8a1-8b1fed212103")\nprint(res.json())`,
    sampleJs: `const res = await fetch("http://localhost:8000/uploads/f0051207-7e9f-4f5d-a8a1-8b1fed212103");\nconst data = await res.json();\nconsole.log("Status:", data.status, "Products:", data.detected_products);`
  },
  {
    id: 'list-uploads',
    name: 'List Historical Scans & Search',
    method: 'GET',
    path: '/uploads',
    description: 'Returns a paginated list of analysis records with search and filter capabilities.',
    section: '3.2. Rack Uploads & Analysis',
    statusSuccess: '200 OK',
    params: [
      { name: 'status', type: 'String', required: false, location: 'query', description: 'Filter by status: PENDING, PROCESSING, COMPLETED, FAILED' },
      { name: 'shop_id', type: 'String', required: false, location: 'query', description: 'Filter by shop identifier' },
      { name: 'merchandiser_id', type: 'String', required: false, location: 'query', description: 'Filter by merchandiser identifier' },
      { name: 'search', type: 'String', required: false, location: 'query', description: 'Keyword search across shop, merch, upload ID' },
      { name: 'limit', type: 'Integer', required: false, location: 'query', description: 'Max records (1 to 100)', defaultVal: '20' },
      { name: 'offset', type: 'Integer', required: false, location: 'query', description: 'Starting offset', defaultVal: '0' }
    ],
    sampleCurl: `curl -X GET "http://localhost:8000/uploads?status=COMPLETED&shop_id=SHOP-102&limit=20&offset=0"`,
    samplePython: `import requests\nparams = {"status": "COMPLETED", "limit": 20, "offset": 0}\nres = requests.get("http://localhost:8000/uploads", params=params)\nprint(res.json())`,
    sampleJs: `const res = await fetch("http://localhost:8000/uploads?status=COMPLETED&limit=20");\nconst data = await res.json();\nconsole.log("Total:", data.total, "Items:", data.items);`
  },
  {
    id: 'get-summary',
    name: 'Aggregated Product Recognition Summary',
    method: 'GET',
    path: '/uploads/summary',
    description: 'Returns aggregated metrics and top detected products across all historical scans.',
    section: '3.2. Rack Uploads & Analysis',
    statusSuccess: '200 OK',
    sampleCurl: `curl -X GET http://localhost:8000/uploads/summary`,
    samplePython: `import requests\nres = requests.get("http://localhost:8000/uploads/summary")\nprint(res.json())`,
    sampleJs: `const res = await fetch("http://localhost:8000/uploads/summary");\nconst data = await res.json();\nconsole.log("Top Products:", data.top_products);`
  },
  {
    id: 'delete-upload',
    name: 'Delete Upload Record & Associated Media',
    method: 'DELETE',
    path: '/uploads/{upload_id}',
    description: 'Permanently deletes an upload record from the database and removes the saved image file from disk.',
    section: '3.2. Rack Uploads & Analysis',
    statusSuccess: '200 OK',
    params: [
      { name: 'upload_id', type: 'UUID String', required: true, location: 'path', description: 'UUID string to delete', defaultVal: 'f0051207-7e9f-4f5d-a8a1-8b1fed212103' }
    ],
    sampleCurl: `curl -X DELETE http://localhost:8000/uploads/f0051207-7e9f-4f5d-a8a1-8b1fed212103`,
    samplePython: `import requests\nres = requests.delete("http://localhost:8000/uploads/f0051207-7e9f-4f5d-a8a1-8b1fed212103")\nprint(res.json())`,
    sampleJs: `const res = await fetch("http://localhost:8000/uploads/f0051207-7e9f-4f5d-a8a1-8b1fed212103", {\n  method: "DELETE"\n});\nconst data = await res.json();\nconsole.log(data);`
  }
];

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'js'>('curl');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // Live test parameters
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    upload_id: 'f0051207-7e9f-4f5d-a8a1-8b1fed212103',
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    shop_id: 'SHOP-Gulshan-102',
    merchandiser_id: 'MER-Rahim-45',
    status: 'COMPLETED',
    limit: '20',
    offset: '0',
    search: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);

  const handleInputChange = (name: string, val: string) => {
    setInputValues(prev => ({ ...prev, [name]: val }));
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const startTime = Date.now();

    try {
      let url = selectedEndpoint.path;

      // Replace path parameters
      if (url.includes('{upload_id}')) {
        url = url.replace('{upload_id}', inputValues.upload_id || 'f0051207-7e9f-4f5d-a8a1-8b1fed212103');
      }

      // Query parameters for GET /uploads
      if (selectedEndpoint.id === 'list-uploads') {
        const query = new URLSearchParams();
        if (inputValues.status) query.append('status', inputValues.status);
        if (inputValues.shop_id) query.append('shop_id', inputValues.shop_id);
        if (inputValues.search) query.append('search', inputValues.search);
        if (inputValues.limit) query.append('limit', inputValues.limit);
        if (inputValues.offset) query.append('offset', inputValues.offset);
        const qStr = query.toString();
        if (qStr) url += `?${qStr}`;
      }

      let res: Response;

      if (selectedEndpoint.method === 'GET') {
        res = await apiFetch(url);
      } else if (selectedEndpoint.method === 'DELETE') {
        res = await apiFetch(url, { method: 'DELETE' });
      } else if (selectedEndpoint.id === 'upload-url') {
        // POST /uploads/url test with JSON payload
        res = await apiFetch('/uploads/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: inputValues.image_url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
            shop_id: inputValues.shop_id || 'SHOP-Gulshan-102',
            merchandiser_id: inputValues.merchandiser_id || 'MER-Rahim-45'
          })
        });
      } else if (selectedEndpoint.method === 'POST') {
        // POST /uploads test with sample data payload
        res = await apiFetch('/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sample_image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
            shop_id: inputValues.shop_id || 'SHOP-Gulshan-102',
            merchandiser_id: inputValues.merchandiser_id || 'MER-Rahim-45'
          })
        });
      } else {
        res = await apiFetch(url);
      }

      const duration = Date.now() - startTime;
      setResponseDuration(duration);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResponseDuration(Date.now() - startTime);
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err.message || 'Network request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveCode = () => {
    if (activeCodeLang === 'curl') return selectedEndpoint.sampleCurl;
    if (activeCodeLang === 'python') return selectedEndpoint.samplePython;
    return selectedEndpoint.sampleJs;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(responseBody);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono border border-blue-200 font-medium">
              OpenAPI 3.1 & Interactive Runner
            </span>
            <span className="text-xs text-slate-500 font-mono">
              FastAPI Spec: /docs & /redoc
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            MerchVision API Documentation & Live Playground
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Test backend REST endpoints with live payload parameters, examine JSON responses, and copy production client code.
          </p>
        </div>
      </div>

      {/* Main Grid: Endpoints Navigation + Live Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Endpoint Directory */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">
            API Endpoints Reference
          </div>
          {ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setResponseStatus(null);
                  setResponseBody(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getMethodBadgeColor(ep.method)}`}>
                    {ep.method}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{ep.statusSuccess}</span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                  {ep.path}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {ep.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Selected Endpoint Runner & Code Generator */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Header & Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${getMethodBadgeColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900">
                  {selectedEndpoint.path}
                </span>
              </div>
              <button
                id="execute-api-endpoint-btn"
                onClick={handleExecute}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {/* Request Parameters Form */}
            {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Request Parameters & Inputs</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedEndpoint.params.map((param) => (
                    <div key={param.name} className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-600 flex items-center justify-between font-semibold">
                        <span>{param.name} {param.required && <span className="text-red-500">*</span>}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({param.location})</span>
                      </label>
                      <input
                        type="text"
                        value={inputValues[param.name] ?? param.defaultVal ?? ''}
                        onChange={(e) => handleInputChange(param.name, e.target.value)}
                        placeholder={`Enter ${param.name}`}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        {param.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Server Response</span>
                </span>
                {responseStatus && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
                {responseDuration !== null && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {responseDuration}ms
                  </span>
                )}
              </div>

              {responseBody && (
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs shadow-xs transition"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72">
              {responseBody ? (
                <pre className="whitespace-pre-wrap">{responseBody}</pre>
              ) : (
                <div className="text-slate-400 italic text-center py-8">
                  Click "Send Request" to execute this endpoint against the server.
                </div>
              )}
            </div>
          </div>

          {/* Client SDK & Code Generator */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Client Integration Code</span>
              </div>

              <div className="flex items-center gap-2">
                {(['curl', 'python', 'js'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition ${
                      activeCodeLang === lang
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-300'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python (requests)' : 'JavaScript (fetch)'}
                  </button>
                ))}
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs shadow-xs transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900 font-mono text-xs text-slate-100 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{getActiveCode()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
