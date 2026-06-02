/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Globe, Play, Youtube, MapPin, Calendar, Camera, Settings,
  Battery, Wifi, Signal, ChevronLeft, ChevronRight, ArrowLeft,
  Smartphone, Plus, Power, HelpCircle, ChevronDown, RefreshCw, AlertCircle
} from 'lucide-react';
import { DockSide, SidebarSize, VerticalPosition, AppConfig, AndroidApp, PREINSTALLED_APPS } from '../types';

// Icon Renderer Helper
const AppIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    Mail, Globe, Play, Youtube, MapPin, Calendar, Camera, Settings
  };
  const IconComponent = map[name] || HelpCircle;
  return <IconComponent className={className} />;
};

interface PhoneViewProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedSlot: 1 | 2 | 3 | null;
  setSelectedSlot: (slot: 1 | 2 | 3 | null) => void;
  preferencesLog: { timestamp: string; action: string; details: string }[];
  addLog: (action: string, details: string) => void;
  currentInteractiveStep: number;
  setCurrentInteractiveStep: (step: number) => void;
  toast: { show: boolean; message: string };
  triggerToast: (msg: string) => void;
}

export const PhoneView: React.FC<PhoneViewProps> = ({
  config,
  setConfig,
  activeScreen,
  setActiveScreen,
  selectedSlot,
  setSelectedSlot,
  preferencesLog,
  addLog,
  currentInteractiveStep,
  setCurrentInteractiveStep,
  toast,
  triggerToast
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('12:30');
  const [lastLaunchedApp, setLastLaunchedApp] = useState<string | null>(null);

  // Keep simulated time updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Find installed apps using saved packages in slots
  const app1 = PREINSTALLED_APPS.find(a => a.packageName === config.app1_package);
  const app2 = PREINSTALLED_APPS.find(a => a.packageName === config.app2_package);
  const app3 = PREINSTALLED_APPS.find(a => a.packageName === config.app3_package);

  const getSlotApp = (slotId: 1 | 2 | 3) => {
    if (slotId === 1) return app1;
    if (slotId === 2) return app2;
    return app3;
  };

  // Launch simulated application
  const handleLaunchApp = (packageName: string, appName: string) => {
    setSidebarOpen(false);
    setActiveScreen(`app-${packageName}`);
    setLastLaunchedApp(appName);
    addLog(
      'Overlay Launcher: launch intent triggered',
      `packageManager.getLaunchIntentForPackage("${packageName}")`
    );
    triggerToast(`Launching ${appName}...`);

    // Advance step 5 in user flow if active
    if (currentInteractiveStep === 4) {
      setCurrentInteractiveStep(5);
    }
  };

  // Size specifications for sidebar
  const getSidebarWidth = (size: SidebarSize) => {
    switch (size) {
      case 'small': return 'w-12';
      case 'large': return 'w-20';
      case 'medium':
      default:
        return 'w-16';
    }
  };

  const getSidebarVerticalClass = (pos: VerticalPosition) => {
    switch (pos) {
      case 'top': return 'top-14 transform-none';
      case 'bottom': return 'bottom-14 transform-none';
      case 'center':
      default:
        return 'top-1/2 -translate-y-1/2';
    }
  };

  // Handle slot tap in settings screen
  const handleTapSlot = (slotNum: 1 | 2 | 3) => {
    setSelectedSlot(slotNum);
    setActiveScreen('picker');
    addLog(
      `SettingsActivity: Clicked Slot ${slotNum}`,
      `Opening AppPickerScreen for app${slotNum}_package`
    );

    // Flow Step progression
    if (currentInteractiveStep === 0) {
      setCurrentInteractiveStep(1);
    }
  };

  // Handle app selection in picker screen
  const handleSelectAppInPicker = (app: AndroidApp) => {
    if (!selectedSlot) return;

    const key = `app${selectedSlot}_package` as keyof AppConfig;
    setConfig(prev => ({
      ...prev,
      [key]: app.packageName
    }));

    addLog(
      `SharedPreferences: Slot ${selectedSlot} Updated`,
      `com.google.android.youtube / "${app.packageName}" written to SharedPreferences`
    );

    triggerToast(`Mapped Slot ${selectedSlot} to ${app.appName}`);
    setActiveScreen('settings');
    setSelectedSlot(null);

    // Flow Step progression to Step 3 & 4
    if (currentInteractiveStep === 1) {
      setCurrentInteractiveStep(2);
      // Wait shortly to transition status guide
      setTimeout(() => {
        setCurrentInteractiveStep(3);
      }, 1500);
    }
  };

  // Helper to get active app name from screen name
  const getSimulatedActiveAppName = () => {
    if (activeScreen === 'home') return 'Pixel Laucher (Home)';
    if (activeScreen === 'settings') return 'Launcher SettingsActivity';
    if (activeScreen === 'picker') return 'PackageManager AppPickerScreen';
    if (activeScreen.startsWith('app-')) {
      const pkg = activeScreen.replace('app-', '');
      const app = PREINSTALLED_APPS.find(a => a.packageName === pkg);
      return app ? app.appName : 'Simulated App';
    }
    return 'Android Launcher';
  };

  return (
    <div className="relative flex flex-col items-center select-none" id="phone-view-container">
      {/* Decorative Phone Mockup Frame */}
      <div className="relative w-80 h-[640px] bg-[#1a1a1a] rounded-[42px] p-3 shadow-2xl border-4 border-slate-700/80 transition-all duration-300">
        
        {/* Device Ear Speaker & Camera Punch-hole Notch */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-around px-4">
          <div className="w-12 h-1 bg-neutral-800 rounded"></div>
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800"></div>
        </div>

        {/* Device screen area */}
        <div className="relative w-full h-full bg-[#fafafa] rounded-[32px] overflow-hidden flex flex-col border border-black/40 shadow-inner">
          
          {/* 1. Android Status Bar */}
          <div className="h-9 bg-neutral-950 text-white flex items-center justify-between px-6 z-40 text-[11px] font-medium tracking-tight">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
              <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
              <Battery className="w-4 h-4 rotate-90" strokeWidth={2.5} />
            </div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 w-full relative overflow-hidden bg-neutral-50 flex flex-col">
            
            {/* Active application mockup */}
            <div className="flex-1 overflow-y-auto">
              {activeScreen === 'home' && (
                /* SIMULATED HOME SCREEN WITH WALLPAPER BACKGROUND */
                <div className="relative w-full h-full bg-gradient-to-tr from-indigo-900 via-sky-800 to-emerald-950 p-5 flex flex-col justify-between text-white overflow-hidden">
                  {/* Subtle dynamic grid graphic */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
                  
                  {/* Digital Clock widget */}
                  <div className="text-center mt-10 z-10">
                    <h1 className="text-4xl font-extralight tracking-wide drop-shadow-md">
                      {currentTime.split(' ')[0]}
                    </h1>
                    <p className="text-xs font-light text-slate-300 tracking-wider mt-1 drop-shadow-sm">
                      Tuesday, June 2
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] text-slate-200">
                      <span>⚡ Overlay Service Active</span>
                    </div>
                  </div>

                  {/* Android Core Icons Grid */}
                  <div className="grid grid-cols-4 gap-4 px-2 mb-8 z-10">
                    {/* Shortcut 1: Launcher Settings */}
                    <button
                      onClick={() => {
                        setActiveScreen('settings');
                        addLog('Launcher Home: Tap Settings shortcut', 'Navigating to SettingsActivity');
                      }}
                      className="flex flex-col items-center gap-1.5 focus:outline-none focus:scale-95 transition-transform"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-neutral-900/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-neutral-900/80">
                        <Settings className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-[10px] text-slate-200 text-center font-medium truncate w-full">Launcher Settings</span>
                    </button>

                    {/* Pre-installed Gmail */}
                    <button
                      onClick={() => handleLaunchApp('com.google.android.gm', 'Gmail')}
                      className="flex flex-col items-center gap-1.5 focus:outline-none focus:scale-95 transition-transform"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#ea4335]/20 backdrop-blur-md flex items-center justify-center border border-[#ea4335]/30">
                        <Mail className="w-5 h-5 text-[#ea4335]" />
                      </div>
                      <span className="text-[10px] text-slate-200 text-center font-medium truncate w-full">Gmail</span>
                    </button>

                    {/* Pre-installed Chrome */}
                    <button
                      onClick={() => handleLaunchApp('com.android.chrome', 'Chrome')}
                      className="flex flex-col items-center gap-1.5 focus:outline-none focus:scale-95 transition-transform"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#34a853]/20 backdrop-blur-md flex items-center justify-center border border-[#34a853]/30">
                        <Globe className="w-5 h-5 text-[#34a853]" />
                      </div>
                      <span className="text-[10px] text-slate-200 text-center font-medium truncate w-full">Chrome</span>
                    </button>

                    {/* Launcher Guide Helper info */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex flex-col items-center justify-center text-slate-200 border border-white/10">
                        <span className="text-[10px] font-mono leading-none">3-APP</span>
                        <span className="text-[8px] opacity-60 leading-none mt-0.5">SLOTS</span>
                      </div>
                      <span className="text-[10px] text-slate-350 text-center font-medium truncate w-full">Edge Limit</span>
                    </div>
                  </div>
                </div>
              )}

              {activeScreen === 'settings' && (
                /* SETTINGS ACTIVITY VIEW */
                <div className="w-full h-full bg-slate-50 text-slate-900 flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center gap-2.5 shadow-sm">
                    <button
                      onClick={() => {
                        setActiveScreen('home');
                        addLog('SettingsActivity: Exit Settings', 'Returned to Home launcher');
                      }}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded-full"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Edge Setup</h2>
                      <h1 className="text-sm font-bold text-slate-800 leading-tight">SettingsActivity</h1>
                    </div>
                  </div>

                  {/* Settings Scrollable Content */}
                  <div className="flex-1 p-3.5 space-y-4 text-xs">
                    
                    {/* App Slots Section */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                          <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs"></span>
                          Configured App Slots (Max 3)
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">SharedPreferences</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal leading-relaxed">
                        Tap an App Slot to reprogram its Package Name in persistent memory storage.
                      </p>

                      <div className="space-y-2 mt-2">
                        {/* Slot 1 */}
                        <div
                          onClick={() => handleTapSlot(1)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 active:scale-98 transition-all ${
                            currentInteractiveStep === 0 ? 'border-amber-400 bg-amber-50/10 ring-2 ring-amber-400/20' : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center">1</span>
                            {app1 ? (
                              <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded-lg ${app1.color}`}>
                                  <AppIcon name={app1.iconName} className="w-3.5 h-3.5" />
                                </span>
                                <div>
                                  <div className="font-semibold text-slate-800">{app1.appName}</div>
                                  <div className="text-[9px] text-slate-400 font-mono scale-95 origin-left">{app1.packageName}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unconfigured</span>
                            )}
                          </div>
                          <span className="text-[9px] text-indigo-600 font-medium">Reassign &rarr;</span>
                        </div>

                        {/* Slot 2 */}
                        <div
                          onClick={() => handleTapSlot(2)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 active:scale-98 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center">2</span>
                            {app2 ? (
                              <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded-lg ${app2.color}`}>
                                  <AppIcon name={app2.iconName} className="w-3.5 h-3.5" />
                                </span>
                                <div>
                                  <div className="font-semibold text-slate-800">{app2.appName}</div>
                                  <div className="text-[9px] text-slate-400 font-mono scale-95 origin-left">{app2.packageName}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unconfigured</span>
                            )}
                          </div>
                          <span className="text-[9px] text-indigo-600 font-medium">Reassign &rarr;</span>
                        </div>

                        {/* Slot 3 */}
                        <div
                          onClick={() => handleTapSlot(3)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 active:scale-98 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center">3</span>
                            {app3 ? (
                              <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded-lg ${app3.color}`}>
                                  <AppIcon name={app3.iconName} className="w-3.5 h-3.5" />
                                </span>
                                <div>
                                  <div className="font-semibold text-slate-800">{app3.appName}</div>
                                  <div className="text-[9px] text-slate-400 font-mono scale-95 origin-left">{app3.packageName}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unconfigured</span>
                            )}
                          </div>
                          <span className="text-[9px] text-indigo-600 font-medium">Reassign &rarr;</span>
                        </div>
                      </div>
                    </div>

                    {/* Window Manager Service Controls */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                      <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <span className="w-1.5 h-3.5 bg-indigo-600 rounded-xs"></span>
                        OverlayService Customization
                      </h3>

                      {/* Dock Side */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                          <span>Dock Side</span>
                          <span className="font-bold text-indigo-600 font-mono">{config.dock_side.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setConfig(prev => ({ ...prev, dock_side: 'left' }));
                              addLog('OverlayService: Update Anchor', 'dock_side written as "left"');
                            }}
                            className={`py-1.5 rounded-lg border font-medium text-[10px] flex items-center justify-center gap-1 transition-all ${
                              config.dock_side === 'left'
                                ? 'bg-indigo-650 text-white border-indigo-650 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Left Edge
                          </button>
                          <button
                            onClick={() => {
                              setConfig(prev => ({ ...prev, dock_side: 'right' }));
                              addLog('OverlayService: Update Anchor', 'dock_side written as "right"');
                            }}
                            className={`py-1.5 rounded-lg border font-medium text-[10px] flex items-center justify-center gap-1 transition-all ${
                              config.dock_side === 'right'
                                ? 'bg-indigo-650 text-white border-indigo-650 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Right Edge
                          </button>
                        </div>
                      </div>

                      {/* Vertical Alignment */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                          <span>Vertical Position</span>
                          <span className="font-bold text-indigo-600 font-mono">{config.vertical_position.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['top', 'center', 'bottom'] as VerticalPosition[]).map(pos => (
                            <button
                              key={pos}
                              onClick={() => {
                                setConfig(prev => ({ ...prev, vertical_position: pos }));
                                addLog('OverlayService: Update Vertical Align', `vertical_position written as "${pos}"`);
                              }}
                              className={`py-1 rounded-lg border text-[10px] font-medium text-center transition-all ${
                                config.vertical_position === pos
                                  ? 'bg-indigo-650 text-white border-indigo-650 shadow-xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size Selector */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                          <span>Trigger Strips Range (Size)</span>
                          <span className="font-bold text-indigo-600 font-mono">{config.size.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['small', 'medium', 'large'] as SidebarSize[]).map(sz => (
                            <button
                              key={sz}
                              onClick={() => {
                                setConfig(prev => ({ ...prev, size: sz }));
                                addLog('OverlayService: Update Size', `size written as "${sz}"`);
                              }}
                              className={`py-1 rounded-lg border text-[10px] font-medium text-center transition-all ${
                                config.size === sz
                                  ? 'bg-indigo-650 text-white border-indigo-650 shadow-xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {sz.charAt(0).toUpperCase() + sz.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                          <span>Trigger Strip Transparency</span>
                          <span className="font-bold text-indigo-600 font-mono">{Math.round(config.opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={config.opacity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setConfig(prev => ({ ...prev, opacity: val }));
                            // Throttle logs slightly in standard systems, but let's log on change
                          }}
                          className="w-full accent-indigo-650 h-1 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeScreen === 'picker' && (
                /* APP PICKER SCREEN */
                <div className="w-full h-full bg-slate-50 text-slate-900 flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setActiveScreen('settings');
                          setSelectedSlot(null);
                          addLog('AppPickerScreen: Cancel', 'Returned to SettingsActivity without changes');
                        }}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded-full"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">PackageManager</h2>
                        <h1 className="text-sm font-bold text-slate-800 leading-tight">App Picker Screen</h1>
                      </div>
                    </div>
                    <span className="text-[10px] py-0.5 px-2 bg-indigo-50 text-indigo-700 font-extrabold rounded-md font-mono">
                      SLOT {selectedSlot}
                    </span>
                  </div>

                  {/* List of Pre-installed apps */}
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                    <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                      The PackageManager queries and returns all launcher-enabled package intents installed on the device.
                    </p>

                    <div className="space-y-1.5 mt-1">
                      {PREINSTALLED_APPS.map(app => {
                        const isYouTubeFlowStep = app.appName === 'YouTube' && currentInteractiveStep === 1;
                        return (
                          <div
                            key={app.packageName}
                            onClick={() => handleSelectAppInPicker(app)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border bg-white cursor-pointer transition-all duration-250 active:scale-98 ${
                              isYouTubeFlowStep 
                                ? 'border-amber-400 bg-amber-50/15 ring-2 ring-amber-400/30' 
                                : 'border-slate-200/80 hover:border-slate-350 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`p-2 rounded-xl text-xs flex items-center justify-center ${app.color}`}>
                                <AppIcon name={app.iconName} className="w-4 h-4" />
                              </span>
                              <div>
                                <h3 className="font-bold text-slate-800 text-xs">{app.appName}</h3>
                                <div className="text-[9px] text-slate-400 font-mono tracking-tight mt-0.5">{app.packageName}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {isYouTubeFlowStep && (
                                <motion.span 
                                  animate={{ scale: [1, 1.08, 1] }} 
                                  transition={{ repeat: Infinity, duration: 1.2 }}
                                  className="text-[9px] bg-amber-400 text-neutral-900 font-bold px-1.5 py-0.5 rounded-sm mr-1.5"
                                >
                                  Recommended Step
                                </motion.span>
                              )}
                              <span className="text-[10px] font-semibold text-slate-400">&rarr;</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeScreen.startsWith('app-') && (
                /* IMMERSIVE APPLICATION MOCKS */
                <div className="w-full h-full bg-white flex flex-col">
                  {/* Simulated App Header */}
                  {(() => {
                    const pkgName = activeScreen.replace('app-', '');
                    const app = PREINSTALLED_APPS.find(a => a.packageName === pkgName);
                    if (!app) return null;

                    return (
                      <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-900">
                        {/* Custom Titlebar based on active app */}
                        <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => {
                                setActiveScreen('home');
                                addLog(`Exit ${app.appName}`, `Stopped task of ${app.appName}`);
                              }}
                              className="p-1 text-slate-600 hover:bg-slate-100 rounded-full"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2">
                              <span className={`p-1 rounded-md ${app.color}`}>
                                <AppIcon name={app.iconName} className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-bold text-slate-800">{app.appName}</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono truncate max-w-24 bg-slate-100 px-1.5 py-0.5 rounded">
                            {app.packageName}
                          </span>
                        </div>

                        {/* App custom screen design simulator */}
                        <div className="flex-1 p-4 bg-white flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/60">
                              <h4 className="text-[10px] uppercase font-bold text-indigo-750 tracking-wider">Aistudio Sandbox Mode</h4>
                              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                                You fully triggered a real launch intent successfully! On Android, this replaces the screen contents task buffer.
                              </p>
                            </div>

                            {/* App-specific contents */}
                            {app.packageName === 'com.google.android.gm' && (
                              <div className="space-y-2 text-[10px] text-slate-700">
                                <div className="border-b border-slate-100 pb-2">
                                  <div className="flex justify-between font-bold text-slate-805">
                                    <span>Google AI Studio Build</span>
                                    <span className="text-indigo-600 font-mono">11:15 AM</span>
                                  </div>
                                  <span className="text-[10px] text-indigo-650 font-semibold">Ready to deploy edge_launcher.apk?</span>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">Your layout configurations have compiled properly in React...</p>
                                </div>
                                <div className="border-b border-slate-100 pb-2">
                                  <div className="flex justify-between font-bold text-slate-805">
                                    <span>SharedPreferences Daemon</span>
                                    <span className="text-slate-400 font-mono">Yesterday</span>
                                  </div>
                                  <span className="text-slate-700 font-semibold">XML Sync Successful</span>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">SharedPreferences sync daemon written: config applied instantly.</p>
                                </div>
                              </div>
                            )}

                            {app.packageName === 'com.android.chrome' && (
                              <div className="space-y-2">
                                <div className="p-1 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  https://ai.studio/build
                                </div>
                                <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-1.5">
                                  <h5 className="font-extrabold text-[12px] text-indigo-400 tracking-tight">Vite Development Server</h5>
                                  <p className="text-[9px] text-neutral-400 leading-normal">
                                    Perfect browser window emulation. Everything behaves securely and runs purely client-side!
                                  </p>
                                </div>
                              </div>
                            )}

                            {app.packageName === 'com.android.vending' && (
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="p-2 border border-slate-150 rounded-xl bg-slate-50/50 flex flex-col items-center text-center">
                                  <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold mb-1">E</div>
                                  <span className="font-bold text-slate-800">Edge Utils</span>
                                  <span className="text-[8px] text-slate-400">Utilities</span>
                                </div>
                                <div className="p-2 border border-slate-150 rounded-xl bg-slate-50/50 flex flex-col items-center text-center">
                                  <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold mb-1">G</div>
                                  <span className="font-bold text-slate-800">Gesture Pro</span>
                                  <span className="text-[8px] text-slate-400">Productivity</span>
                                </div>
                              </div>
                            )}

                            {app.packageName === 'com.google.android.youtube' && (
                              <div className="space-y-2">
                                <div className="aspect-video bg-neutral-900 rounded-xl flex flex-col items-center justify-center text-white p-2 text-center relative overflow-hidden">
                                  <Youtube className="w-10 h-10 text-red-500 mb-1" />
                                  <span className="font-bold text-[11px]">How To Build a Globals Overlay Window</span>
                                  <span className="text-[8px] text-neutral-400 mt-0.5">Android Dev Tutorials &bull; 45K views</span>
                                </div>
                                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center gap-2">
                                  <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 font-extrabold text-[11px]">YT</div>
                                  <div>
                                    <span className="text-[10px] font-bold text-neutral-80s block leading-tight">YouTube Premium Sync</span>
                                    <span className="text-[8px] text-neutral-400">Package active in user slots</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {app.packageName !== 'com.google.android.gm' && 
                             app.packageName !== 'com.android.chrome' && 
                             app.packageName !== 'com.android.vending' && 
                             app.packageName !== 'com.google.android.youtube' && (
                              <div className="p-4 bg-slate-50 rounded-xl text-center flex flex-col items-center">
                                <AppIcon name={app.iconName} className="w-8 h-8 text-indigo-600 mb-1.5" />
                                <span className="font-bold text-xs text-slate-800">{app.appName} Sandbox</span>
                                <span className="text-[9px] text-slate-450 mt-1 leading-normal">
                                  This system acts as a digital simulation. All package components behave strictly under Android sandboxing guidelines.
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick return button */}
                          <button
                            onClick={() => {
                              setActiveScreen('home');
                              addLog('Emulator Home Button', 'Returned to desktop screen');
                            }}
                            className="py-1.5 w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-650 tracking-wide mt-auto cursor-pointer"
                          >
                            Home Screen Menu
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 2. Interactive "Edge Gesture trigger strip" (Overlay Service window) */}
            {/* The strip is visible depending on configuration */}
            <div
              className={`absolute z-50 transition-all ${
                config.dock_side === 'left' ? 'left-0' : 'right-0'
              } ${getSidebarVerticalClass(config.vertical_position)}`}
              style={{
                opacity: sidebarOpen ? 1.0 : config.opacity
              }}
            >
              {/* Trigger handle bar */}
              <div className="flex items-center">
                {/* Visual arrow gesture guidance cue if not open */}
                {!sidebarOpen && config.dock_side === 'right' && (
                  <motion.div
                    animate={{ x: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mr-0.5 text-indigo-500 drop-shadow-md z-45"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  </motion.div>
                )}

                {/* The clickable/gesture-trigger handle itself */}
                <button
                  onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                    addLog(
                      'Gesture EventTrigger',
                      `User swiped/clicked edge trigger on the ${config.dock_side} boundary`
                    );
                    
                    // User Flow Step progression
                    if (currentInteractiveStep === 3) {
                      setCurrentInteractiveStep(4);
                    }
                  }}
                  className={`cursor-pointer border flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${
                    config.dock_side === 'left' 
                      ? 'rounded-r-xl border-l-0 border-indigo-200/40' 
                      : 'rounded-l-xl border-r-0 border-indigo-200/40'
                  } ${
                    sidebarOpen 
                      ? 'bg-indigo-600 border-indigo-500 w-4 h-24' 
                      : currentInteractiveStep === 3 
                        ? 'bg-amber-400 border-amber-300 w-3.5 h-20 ring-4 ring-amber-400/35 scale-102' 
                        : 'bg-indigo-500/95 border-indigo-400 w-2.5 h-16 hover:w-3.5'
                  }`}
                  title={`${config.size} trigger handle`}
                  id="edge-gesture-trigger-bar"
                >
                  <div className="w-0.5 h-6 bg-white/65 rounded-full"></div>
                </button>

                {!sidebarOpen && config.dock_side === 'left' && (
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-0.5 text-indigo-500 drop-shadow-md z-45"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* 3. Edge Sidebar Overlay Sidebar View */}
            {/* The floating list overlay itself */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: config.dock_side === 'left' ? -100 : 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: config.dock_side === 'left' ? -100 : 100 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 180 }}
                  className={`absolute z-49 bg-neutral-950/92 backdrop-blur-xl border border-neutral-800 py-3 px-2 rounded-2xl flex flex-col justify-center items-center shadow-2xl gap-3.5 ${
                    getSidebarWidth(config.size)
                  } ${
                    config.dock_side === 'left' ? 'left-2.5' : 'right-2.5'
                  } ${getSidebarVerticalClass(config.vertical_position)}`}
                >
                  {/* Slots Mapping visual representation (Gmail, Chrome, YouTube or config) */}
                  {[1, 2, 3].map(slotId => {
                    const app = getSlotApp(slotId as 1 | 2 | 3);
                    const isStep4Guide = slotId === 3 && currentInteractiveStep === 3;

                    return (
                      <div key={slotId} className="relative group">
                        {app ? (
                          <button
                            onClick={() => handleLaunchApp(app.packageName, app.appName)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 border cursor-pointer ${
                              isStep4Guide 
                                ? 'bg-amber-400 border-amber-300 text-neutral-950 ring-4 ring-amber-400/40 relative' 
                                : 'bg-neutral-800/80 hover:bg-neutral-700/90 hover:border-neutral-500 border-neutral-700 text-white'
                            }`}
                            title={`Launch ${app.appName}`}
                          >
                            <AppIcon name={app.iconName} className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800/60 flex items-center justify-center text-neutral-600">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                        {/* Tooltip on App Launcher sidebar */}
                        <div className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:block px-2 py-0.5 whitespace-nowrap text-[9px] font-bold tracking-tight bg-slate-900 text-white border border-slate-800 rounded shadow-lg z-[60] ${
                          config.dock_side === 'left' ? 'left-12' : 'right-12'
                        }`}>
                          {app ? app.appName : `Unconfigured Slot ${slotId}`}
                        </div>
                      </div>
                    );
                  })}

                  {/* Settings direct shortcut inside edge bar */}
                  <div className="border-t border-neutral-800/65 w-8 pt-2.5 mt-0.5 flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        setActiveScreen('settings');
                        addLog('Overlay Launcher Settings Shortcut', 'SettingsActivity shortcut triggered from overlay');
                      }}
                      className="w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="Launcher Configuration"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        addLog('Overlay Close Button', 'User dismissed gesture sidebar menu manually');
                      }}
                      className="w-10 h-5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-white flex items-center justify-center cursor-pointer text-[9px]"
                      title="Hide"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${config.dock_side === 'right' ? 'rotate-90' : '-rotate-90'}`} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick action virtual navigation buttons at very bottom */}
            <div className="h-11 bg-neutral-950 border-t border-neutral-900 flex items-center justify-around px-8 z-40">
              <button
                onClick={() => {
                  if (activeScreen === 'picker') {
                    setActiveScreen('settings');
                  } else if (activeScreen !== 'home') {
                    setActiveScreen('home');
                  }
                  addLog('Emulator Back Button', 'Triggered system back pressed event');
                }}
                className="p-1 px-3 text-neutral-400 hover:text-white transition-colors"
                title="Back Button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setActiveScreen('home');
                  addLog('Emulator Home Button', 'Returned to Home launcher desktop');
                }}
                className="w-4 h-4 rounded-full border-2 border-neutral-400 hover:border-white transition-colors"
                title="Home Button"
              />
              <button
                onClick={() => {
                  // toggle settings directly
                  setActiveScreen(activeScreen === 'settings' ? 'home' : 'settings');
                  addLog('Emulator Recents Menu', 'Toggled launcher configure layout');
                }}
                className="w-3.5 h-3.5 border-2 border-neutral-400 rounded-xs hover:border-white transition-colors"
                title="Recents Context"
              />
            </div>
          </div>
        </div>

        {/* Floating Android System Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-[#ffffff] text-[10px] font-medium py-1.5 px-3 rounded-full border border-slate-705 shadow-xl flex items-center gap-1.5 z-55 pointer-events-none max-w-[85%] text-center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frame details status indicator */}
      <div className="mt-3 flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono text-slate-500">
        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
        <span>SIMULATING: <strong className="text-slate-850 dark:text-slate-300 font-bold">{getSimulatedActiveAppName()}</strong></span>
      </div>
    </div>
  );
};
