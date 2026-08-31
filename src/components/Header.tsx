import React, { useEffect, useState, useRef } from 'react';
import { 
  Scan, 
  Layers, 
  BarChart3, 
  Code2, 
  PackageCheck, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Menu, 
  X, 
  Settings2, 
  Server, 
  Save, 
  RotateCcw,
  RefreshCw,
  Clock,
  Sparkles,
  Radio
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../services/apiClient';

interface HeaderProps {
  activeTab: 'scanner' | 'history' | 'analytics' | 'api' | 'catalog';
  onTabChange: (tab: 'scanner' | 'history' | 'analytics' | 'api' | 'catalog') => void;
  serverHealth: 'ok' | 'checking' | 'error';
  onHealthCheckTrigger?: () => void;
}

interface NavItem {
  id: 'scanner' | 'history' | 'analytics' | 'api' | 'catalog';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onTabChange, 
  serverHealth, 
  onHealthCheckTrigger 
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [apiUrlInput, setApiUrlInput] = useState<string>(getApiBaseUrl() || '');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on ESC key or window resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setIsConfigOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrlInput.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsConfigOpen(false);
      if (onHealthCheckTrigger) onHealthCheckTrigger();
    }, 700);
  };

  const handleResetToOrigin = () => {
    setApiBaseUrl('');
    setApiUrlInput('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsConfigOpen(false);
      if (onHealthCheckTrigger) onHealthCheckTrigger();
    }, 700);
  };

  const navItems: NavItem[] = [
    { id: 'scanner', label: 'Scanner', icon: Scan, badge: 'Live AI', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'history', label: 'Scan History', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'api', label: 'API Docs', icon: Code2, badge: 'REST', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'catalog', label: 'Products', icon: PackageCheck }
  ];

  const handleSelectTab = (tab: 'scanner' | 'history' | 'analytics' | 'api' | 'catalog') => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const handleOpenConfig = () => {
    setApiUrlInput(getApiBaseUrl() || '');
    setIsConfigOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-slate-200 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => handleSelectTab('scanner')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
              title="MerchVision - Product Vision System"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/20 text-white font-bold text-lg tracking-tight shrink-0 transition-transform group-hover:scale-105">
                <span>M</span>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    MerchVision
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30">
                    Product
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                  Retail Vision Engine
                </span>
              </div>
            </button>
          </div>

          {/* Desktop & Tablet Navigation Bar (visible md and up) */}
          <nav 
            className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/90 shadow-inner"
            role="navigation"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono hidden lg:inline-block border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Controls & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* System Health Status Indicator */}
            <button
              onClick={onHealthCheckTrigger}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                serverHealth === 'ok'
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                  : serverHealth === 'checking'
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
                  : 'bg-red-950/50 text-red-300 border-red-800/60 hover:bg-red-900/50'
              }`}
              title="Click to re-check API Backend Health"
            >
              {serverHealth === 'ok' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[11px] hidden sm:inline">Online</span>
                </>
              ) : serverHealth === 'checking' ? (
                <>
                  <Activity className="w-3 h-3 animate-spin text-amber-400 shrink-0" />
                  <span className="font-mono text-[11px] hidden sm:inline">Checking</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0"></span>
                  <span className="font-mono text-[11px] hidden sm:inline">Offline</span>
                </>
              )}
            </button>

            {/* Backend URL Settings Button */}
            <button
              id="api-settings-btn"
              onClick={handleOpenConfig}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition shadow-sm"
              title="Configure FastAPI Backend URL"
            >
              <Server className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="font-medium text-[11px] hidden lg:inline">Backend API</span>
              <Settings2 className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />
            </button>

            {/* Current Live Time (xl screens) */}
            <div className="hidden xl:flex flex-col text-right pl-1 border-l border-slate-800">
              <div className="text-[11px] font-mono text-slate-300 font-medium leading-tight">{currentTime}</div>
              <div className="text-[9px] text-slate-500 font-mono">LIVE CLOCK</div>
            </div>

            {/* Mobile Hamburger Toggle Button (mobile only < md) */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition focus:outline-hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-200" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Menu Dropdown (md:hidden) */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div 
            ref={mobileMenuRef}
            className="relative z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1.5 shadow-2xl animate-fadeIn"
          >
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-1 pb-1 font-mono">
              Navigation Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-drawer-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-200 hover:bg-slate-800/80 bg-slate-950/40 border border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Footer Status & Quick Actions Card */}
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${serverHealth === 'ok' ? 'text-emerald-400' : serverHealth === 'checking' ? 'text-amber-400' : 'text-red-400'}`} />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">
                      {serverHealth === 'ok' ? 'API Server Connected' : serverHealth === 'checking' ? 'Connecting to Backend...' : 'Backend Server Offline'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                      {getApiBaseUrl() || 'Same-Origin (Default)'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onHealthCheckTrigger}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Refresh Health"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serverHealth === 'checking' ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenConfig}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Configure API Server</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backend API Configuration Modal */}
      {isConfigOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConfigOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4 animate-modalFadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">FastAPI Backend Connection</h3>
                  <p className="text-[11px] text-slate-400">Configure target API server base URL</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                aria-label="Close configuration modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Target API Base URL:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiUrlInput}
                    onChange={(e) => setApiUrlInput(e.target.value)}
                    placeholder="e.g. http://localhost:8000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-xs"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => setApiUrlInput('http://localhost:8000')}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                >
                  http://localhost:8000
                </button>
                <button
                  type="button"
                  onClick={() => setApiUrlInput('http://127.0.0.1:8000')}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                >
                  http://127.0.0.1:8000
                </button>
                <button
                  type="button"
                  onClick={() => setApiUrlInput('')}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 transition"
                >
                  Same-Origin (Default)
                </button>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Connection Guidelines:</span>
                </p>
                <p className="text-slate-400">• Leave empty to use relative routes (<code className="font-mono text-blue-300">/uploads</code>, <code className="font-mono text-blue-300">/health</code>) proxied by the current server.</p>
                <p className="text-slate-400">• Set to <code className="font-mono text-emerald-300">http://localhost:8000</code> to send API requests directly to your standalone FastAPI instance.</p>
                <p className="text-slate-400">• Ensure your FastAPI backend has CORS enabled (<code className="font-mono text-amber-300">CORSMiddleware</code> with <code className="font-mono text-amber-300">allow_origins=["*"]</code>).</p>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>API Base URL saved successfully! Updating server health...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetToOrigin}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
