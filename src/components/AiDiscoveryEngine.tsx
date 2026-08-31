import React, { useState, useEffect } from 'react';
import { ThinkingOrb, OrbState } from 'thinking-orbs';
import {
  Scan,
  Clock,
  Layers,
  CheckCircle2,
  Store,
  User,
  Zap,
  Cpu
} from 'lucide-react';

interface AiDiscoveryEngineProps {
  previewUrl?: string | null;
  status: 'IDLE' | 'UPLOADING' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadId?: string | null;
  shopId?: string;
  merchandiserId?: string;
}

interface StepItem {
  id: string;
  state: OrbState;
  label: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
}

const PIPELINE_STEPS: StepItem[] = [
  {
    id: 'ingest',
    state: 'connecting',
    label: 'Ingest',
    title: 'Ingesting Product Imagery',
    detail: 'Checking optical focus and establishing data stream.',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'grid',
    state: 'searching',
    label: 'Geometry',
    title: 'Detecting Display Planes',
    detail: 'Normalizing perspective skew and mapping horizontal rack tiers.',
    icon: <Scan className="w-4 h-4" />,
  },
  {
    id: 'features',
    state: 'weaving',
    label: 'Matching',
    title: 'Extracting SKU Neural Tokens',
    detail: 'Correlating packaging textures against the master product catalog.',
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    id: 'audit',
    state: 'solving',
    label: 'Audit',
    title: 'Synthesizing Facing Counts',
    detail: 'Calculating bounding coordinates and visible inventory quantities.',
    icon: <Zap className="w-4 h-4" />,
  },
];

export const AiDiscoveryEngine: React.FC<AiDiscoveryEngineProps> = ({
  previewUrl,
  shopId,
  merchandiserId,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => +(p + 0.1).toFixed(1)), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((p) => (p < PIPELINE_STEPS.length - 1 ? p + 1 : p));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const activeStep = PIPELINE_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-fadeInScale">

      {/* Top status bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
            <Scan className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Vision Analysis Running</p>
            <p className="text-xs text-blue-200">Neural SKU recognition & facing audit in progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 border border-white/20 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-blue-200" />
          <span className="text-sm font-bold text-white font-mono">{elapsed.toFixed(1)}s</span>
        </div>
      </div>

      {/* Main body — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* Left: Image viewport */}
        <div className="lg:col-span-3 p-6 space-y-4">
          <div
            className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner"
            style={{ aspectRatio: '4/3' }}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Scanning Display"
                  className="w-full h-full object-cover brightness-90"
                />
                {/* Scanning laser */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-scanline pointer-events-none" />

                {/* Corner brackets */}
                {(['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2',
                  'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'] as const).map((pos, i) => (
                  <div key={i} className={`absolute w-5 h-5 ${pos} border-cyan-400/80 pointer-events-none`} />
                ))}

                {/* Overlay pills */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm text-xs font-bold text-cyan-400 rounded-xl border border-cyan-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    SCANNING ACTIVE
                  </span>
                  <span className="px-2.5 py-1.5 bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white/70 rounded-xl border border-white/10">
                    HD • LIVE
                  </span>
                </div>

                {/* Context metadata bottom */}
                {(shopId || merchandiserId) && (
                  <div className="absolute bottom-3 inset-x-3">
                    <div className="flex items-center gap-3 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10">
                      {shopId && (
                        <span className="flex items-center gap-1.5 text-[11px] text-white/80 font-mono">
                          <Store className="w-3 h-3 text-blue-400" /> {shopId}
                        </span>
                      )}
                      {merchandiserId && (
                        <span className="flex items-center gap-1.5 text-[11px] text-white/60 font-mono">
                          <User className="w-3 h-3 text-slate-400" /> {merchandiserId}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                <Layers className="w-10 h-10 animate-pulse opacity-40" />
                <p className="text-sm font-semibold">Processing ingested data stream...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Thinking orb + pipeline */}
        <div className="lg:col-span-2 p-6 flex flex-col gap-6">

          {/* Orb area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50 via-indigo-50/60 to-slate-50 border border-blue-100/80 shadow-inner">
              <ThinkingOrb
                state={activeStep.state}
                size={64}
                speed={2.0}
                theme="light"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest font-mono">
                Step {currentStepIndex + 1} of {PIPELINE_STEPS.length}
              </p>
              <h3 className="text-base font-bold text-slate-900">{activeStep.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">{activeStep.detail}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pipeline steps */}
          <div className="space-y-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.id}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
                    isCurrent ? 'bg-blue-50 border-blue-200 shadow-xs'
                      : isDone ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-50'
                  }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : isDone ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-800' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    <p className={`text-[11px] truncate mt-0.5 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isCurrent ? 'In progress...' : isDone ? 'Complete' : 'Waiting'}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
