/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PhoneView } from './components/PhoneView';
import { CodeViewer } from './components/CodeViewer';
import { AppConfig, PREINSTALLED_APPS } from './types';
import { 
  Sliders, 
  LayoutGrid, 
  Layers, 
  Smartphone, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function App() {
  // 1. App Configuration matching default state requirements
  const [config, setConfig] = useState<AppConfig>({
    app1_package: 'com.google.android.gm',
    app2_package: 'com.android.chrome',
    app3_package: 'com.android.vending',
    dock_side: 'right',
    opacity: 1.0,
    size: 'medium',
    vertical_position: 'center'
  });

  // 2. Active Screen State management inside simulated Android context
  const [activeScreen, setActiveScreen] = useState<string>('settings');
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3 | null>(null);

  // 3. User Flow Step State (0 to 5)
  const [currentInteractiveStep, setCurrentInteractiveStep] = useState<number>(0);

  // 4. SharedPreferences Operation Log array for the telemetry console
  const [preferencesLog, setPreferencesLog] = useState<{ timestamp: string; action: string; details: string }[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      action: 'System Boot',
      details: 'Launcher SharedPreferences initialized with default mapping.'
    }
  ]);

  // 5. Intersecting alerts / toasts helper
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2800);
  };

  const addLog = (action: string, details: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPreferencesLog(prev => [{ timestamp, action, details }, ...prev]);
  };

  const clearLogs = () => {
    setPreferencesLog([]);
    triggerToast('Console telemetry cleared');
  };

  // 6. Reset values helper
  const handleResetDefaults = () => {
    setConfig({
      app1_package: 'com.google.android.gm',
      app2_package: 'com.android.chrome',
      app3_package: 'com.android.vending',
      dock_side: 'right',
      opacity: 1.0,
      size: 'medium',
      vertical_position: 'center'
    });
    setActiveScreen('settings');
    setSelectedSlot(null);
    setCurrentInteractiveStep(0);
    addLog('System Reset', 'Restored developer SharedPreferences configs');
    triggerToast('Launcher settings reset to default');
  };

  // Quick preset mappings helper
  const applyPresetConfig = (presetName: string, partial: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
    addLog('Preset Loaded', `Applied preset layout: "${presetName}"`);
    triggerToast(`Preset "${presetName}" configured!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Dynamic Navigation Topbar Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40" id="header-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-605/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Minimalist Edge Launcher</h1>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-sm uppercase">STABLE</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Edge Gesture-Based Overlay Sidebar Simulation Tool</p>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block font-sans">ACTIVE DOCK:</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{config.dock_side} EDGE</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block font-sans">XM_DENSITY:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold uppercase">{config.size} STRIP</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block font-sans">PERSISTENCE:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">SharedPreferences</strong>
            </div>
          </div>

          {/* Master Reset and Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="p-2 text-slate-500 hover:text-slate-850 dark:text-slate-450 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              title="Reset Simulated State"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Workspace</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Core Quick Introduction Banner & Guide Highlights */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4" id="project-intro-banner">
          <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-905 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Edge Gesture Sandbox Emulator
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed max-w-2xl">
                This full-stack simulated workspace demonstrates a lightweight gesture-based edge overlay sidebar for fast workspace-oriented Android multitaskers. You can customize the positioning limits, opacity gradients, and launch customized Applications instantly using Android-standard SharedPreferences keys.
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => applyPresetConfig('Right Comfort', { dock_side: 'right', vertical_position: 'center', opacity: 1.0, size: 'medium' })}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 hover:border-slate-350 dark:hover:border-slate-650 rounded-lg transition-all cursor-pointer text-slate-650 dark:text-slate-200"
              >
                Preset: Right Comfort
              </button>
              <button
                onClick={() => applyPresetConfig('Left Stealth', { dock_side: 'left', vertical_position: 'top', opacity: 0.3, size: 'small' })}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 hover:border-slate-350 dark:hover:border-slate-650 rounded-lg transition-all cursor-pointer text-slate-650 dark:text-slate-200"
              >
                Preset: Left Stealth
              </button>
            </div>
          </div>

          <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3.5 shadow-xs">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-sm shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Sandbox Limit</span>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">MAX 3 APPS</h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400">Strict single-panel layout, preserving custom ROM design limits.</p>
            </div>
          </div>
        </div>

        {/* Workspace Dual-Split Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="simulation-grid">
          
          {/* Main Emulator View Column (5/12 width) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm w-full">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex justify-between items-center text-xs">
                <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
                  <Smartphone className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
                  Virtual Device Screen
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Connected
                </span>
              </div>
              
              <PhoneView 
                config={config}
                setConfig={setConfig}
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                preferencesLog={preferencesLog}
                addLog={addLog}
                currentInteractiveStep={currentInteractiveStep}
                setCurrentInteractiveStep={setCurrentInteractiveStep}
                toast={toast}
                triggerToast={triggerToast}
              />
            </div>
          </div>

          {/* Dev Workspace Console / SharedPreferences XML View Column (7/12 width) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <CodeViewer 
              config={config}
              preferencesLog={preferencesLog}
              clearLogs={clearLogs}
              currentInteractiveStep={currentInteractiveStep}
              setCurrentInteractiveStep={setCurrentInteractiveStep}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              triggerToast={triggerToast}
            />
          </div>

        </div>

      </main>

      {/* Aesthetic pairing branding footnote */}
      <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-405 dark:text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p>Minimalist Edge Launcher Simulation Workspace &bull; Constructed with React & Tailwind CSS.</p>
          <p className="mt-1 text-[11px] text-slate-400">Mocking Android SharedPreferences & WindowManager API specifications.</p>
        </div>
      </footer>

    </div>
  );
}
