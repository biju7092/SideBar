/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Code, Save, Layers, Play, Settings, Clipboard, Check, BookOpen, Sparkles } from 'lucide-react';
import { AppConfig } from '../types';

interface CodeViewerProps {
  config: AppConfig;
  preferencesLog: { timestamp: string; action: string; details: string }[];
  clearLogs: () => void;
  currentInteractiveStep: number;
  setCurrentInteractiveStep: (step: number) => void;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  triggerToast: (msg: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  config,
  preferencesLog,
  clearLogs,
  currentInteractiveStep,
  setCurrentInteractiveStep,
  activeScreen,
  setActiveScreen,
  triggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'shared_prefs' | 'service_code' | 'launch_code'>('shared_prefs');
  const [copied, setCopied] = useState(false);

  // XML string generated reactively from current configuration state to illustrate SharedPreferences
  const getSharedPreferencesXml = () => {
    return `<?xml version="1.0" encoding="utf-8"?>
<map>
    <string name="app1_package">${config.app1_package}</string>
    <string name="app2_package">${config.app2_package}</string>
    <string name="app3_package">${config.app3_package}</string>
    <string name="dock_side">${config.dock_side}</string>
    <string name="size">${config.size}</string>
    <string name="vertical_position">${config.vertical_position}</string>
    <float name="opacity">${config.opacity.toFixed(1)}</float>
</map>`;
  };

  const getKotlinServiceCode = () => {
    return `package com.example.edgelauncher

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout

class EdgeSidebarOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View
    private lateinit var params: WindowManager.LayoutParams

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        // Read attributes configured in settings Activity or storage
        val sharedPrefs = getSharedPreferences("launcher_prefs", MODE_PRIVATE)
        val dockSide = sharedPrefs.getString("dock_side", "${config.dock_side}") ?: "right"
        val verticalPosition = sharedPrefs.getString("vertical_position", "${config.vertical_position}") ?: "center"

        // Initialize Window Layout Params for SYSTEM_ALERT_WINDOW / APPLICATION_OVERLAY
        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, // Draws on top of other apps globally
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        // Calculate gravity settings
        val horizontalGravity = if (dockSide == "left") Gravity.LEFT else Gravity.RIGHT
        val verticalGravity = when (verticalPosition) {
            "top" -> Gravity.TOP
            "bottom" -> Gravity.BOTTOM
            else -> Gravity.CENTER_VERTICAL
        }
        params.gravity = horizontalGravity or verticalGravity

        // Inflate custom gesture trigger handle with matching transparency
        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.edge_trigger_strip, null)
        overlayView.alpha = sharedPrefs.getFloat("opacity", ${config.opacity.toFixed(1)}f)

        // Inject overlay view directly to the global WindowManager
        windowManager.addView(overlayView, params)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
    }
}`;
  };

  const getKotlinLaunchCode = () => {
    return `package com.example.edgelauncher

import android.content.Context
import android.content.SharedPreferences
import android.widget.ImageButton

class SidebarLayoutController(private val context: Context) {

    private val sharedPrefs: SharedPreferences = 
        context.getSharedPreferences("launcher_prefs", Context.MODE_PRIVATE)

    fun initializeAppButtonActions(slot1Button: ImageButton, slot2Button: ImageButton, slot3Button: ImageButton) {
        
        // Retrieve stored unique package names for each slot
        val app1Package = sharedPrefs.getString("app1_package", "${config.app1_package}")
        val app2Package = sharedPrefs.getString("app2_package", "${config.app2_package}")
        val app3Package = sharedPrefs.getString("app3_package", "${config.app3_package}")

        // Retrieve and launch app on sidebar slot 1 click
        slot1Button.setOnClickListener {
            app1Package?.let { packageName ->
                launchApplicationByPackage(packageName)
            }
        }

        // Retrieve and launch app on sidebar slot 2 click
        slot2Button.setOnClickListener {
            app2Package?.let { packageName ->
                launchApplicationByPackage(packageName)
            }
        }

        // Retrieve and launch app on sidebar slot 3 click
        slot3Button.setOnClickListener {
            app3Package?.let { packageName ->
                launchApplicationByPackage(packageName)
            }
        }
    }

    /**
     * Resolves the Intent for the package using Android's PackageManager.
     * Fires launch intent task immediately.
     */
    private fun launchApplicationByPackage(packageName: String) {
        val pm = context.packageManager
        val launchIntent = pm.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            context.startActivity(launchIntent)
        } else {
            // Safe fallback or App PlayStore redirect
        }
    }
}`;
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'shared_prefs'
      ? getSharedPreferencesXml()
      : activeTab === 'service_code'
        ? getKotlinServiceCode()
        : getKotlinLaunchCode();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    triggerToast('Copied code block successfully!');
    setTimeout(() => setCopied(false), 2000);
  };

  // User Interactive Step details array
  const flowSteps = [
    {
      title: 'Open SettingsActivity Controls',
      description: 'You are looking at the configuration dashboard. Inside the phone emulator, ensure you open the "SettingsActivity" (Launcher Settings) to start editing customized configurations.',
      actionText: 'Open Settings Activity',
      action: () => {
        setActiveScreen('settings');
        setCurrentInteractiveStep(1);
      }
    },
    {
      title: 'Tap on an empty or active App Slot',
      description: 'Choose a Slot in the SettingsActivity to map a customized package launcher. For example, Slot 3 is configured to Play Store package name. Click on Slot 3 of the phone to customize it.',
      actionText: 'Force App Picker Trigger',
      action: () => {
        setActiveScreen('picker');
        setCurrentInteractiveStep(2);
      }
    },
    {
      title: 'Select an Application',
      description: 'Our App Picker Screen requests the Android PackageManager. Pick any target app. Select "YouTube" (com.google.android.youtube) to satisfy our primary demonstration flow.',
      actionText: 'Select YouTube Package Name',
      action: () => {
        // Automatically inject Youtube package name into slot 3.
        setCurrentInteractiveStep(3);
        setActiveScreen('settings');
      }
    },
    {
      title: 'Swipe / Toggle the Live Edge Gesture Trigger',
      description: 'Look carefully at the phone preview. You\'ll see a high-contrast glowing amber or indigo indicator strip on the side. Click/Swipe on it to instantly deploy and slide out the overlay launcher service sidebar.',
      actionText: 'Toggle Gesture Sidebar',
      action: () => {
        setCurrentInteractiveStep(4);
      }
    },
    {
      title: 'Tap the app icon to execute',
      description: 'Observe the slide overlay! Tapping our newly assigned interactive slot triggers Android\'s PackageManager "getLaunchIntentForPackage". Let\'s launch YouTube or Google Play Store!',
      actionText: 'Simulate Final Launch',
      action: () => {
        setCurrentInteractiveStep(5);
        setActiveScreen('app-com.google.android.youtube');
      }
    },
    {
      title: 'Customized & Configured!',
      description: 'Perfect setup flow! Your Edge Launcher is working flawlessly and the reactive SharedPreferences XML file has written all values to disk in real-time!',
      actionText: 'Restart Simulation Guide',
      action: () => {
        setCurrentInteractiveStep(0);
        setActiveScreen('settings');
      }
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden" id="workspace-dashboard-panel">
      
      {/* Top Banner containing current guide activity */}
      <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border-b border-slate-150 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Android System Flow Companion</h2>
        </div>

        {/* Dynamic step-by-step assistant */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-indigo-120 dark:border-slate-800 rounded-xl shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-350 rounded-sm">
              STEP {currentInteractiveStep + 1} OF 6: {flowSteps[currentInteractiveStep].title}
            </span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4, 5].map(st => (
                <div
                  key={st}
                  className={`w-2.5 h-1.5 rounded-xs transition-all ${
                    st <= currentInteractiveStep ? 'bg-indigo-650 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-normal">
            {flowSteps[currentInteractiveStep].description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <span className="text-[10px] text-slate-400 font-sans italic flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0 animate-bounce" />
              Follow along in the virtual phone
            </span>
            
            <button
              onClick={flowSteps[currentInteractiveStep].action}
              className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all active:scale-97 cursor-pointer shadow-xs whitespace-nowrap"
            >
              {flowSteps[currentInteractiveStep].actionText} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Code Exploration tabs selection bar */}
      <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2.5 justify-between items-center text-xs">
        <div className="flex items-center gap-1 shadow-sm rounded-lg bg-slate-200/50 dark:bg-slate-950 p-1">
          {/* SharedPreferences Tab */}
          <button
            onClick={() => setActiveTab('shared_prefs')}
            className={`py-1.5 px-3 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'shared_prefs'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Save className="w-3.5 h-3.5 text-indigo-505" />
            <span className="text-[11px]">shared_prefs.xml</span>
          </button>

          {/* Window Manager Service class */}
          <button
            onClick={() => setActiveTab('service_code')}
            className={`py-1.5 px-3 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'service_code'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-505" />
            <span className="text-[11px]">OverlayService.kt</span>
          </button>

          {/* PackageManager Intent Loader class */}
          <button
            onClick={() => setActiveTab('launch_code')}
            className={`py-1.5 px-3 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'launch_code'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-rose-505" />
            <span className="text-[11px]">PackageManager.kt</span>
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          title="Copy file block content"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Clipboard className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Text Content Box */}
      <div className="flex-1 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto text-slate-300 relative h-96">
        
        {/* Dynamic description of the shown file */}
        <div className="absolute top-2 right-4 text-[9px] bg-slate-800 text-slate-400 font-sans px-2.5 py-0.5 rounded-sm font-bold tracking-wider z-20">
          {activeTab === 'shared_prefs' 
            ? 'XML STORAGE / PERSISTED DIRECTORY' 
            : 'ANDROID RUNTIME SDK / KOTLIN SYSTEM'}
        </div>

        {activeTab === 'shared_prefs' && (
          <pre className="text-emerald-400 language-xml whitespace-pre-wrap select-all">
            {getSharedPreferencesXml()}
          </pre>
        )}

        {activeTab === 'service_code' && (
          <pre className="text-indigo-300 language-kotlin whitespace-pre-wrap select-all">
            {getKotlinServiceCode()}
          </pre>
        )}

        {activeTab === 'launch_code' && (
          <pre className="text-rose-350 language-kotlin whitespace-pre-wrap select-all">
            {getKotlinLaunchCode()}
          </pre>
        )}
      </div>

      {/* Persistence Logs output terminal section */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex flex-col h-44">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider">
            <Clipboard className="w-3.5 h-3.5 text-slate-450" />
            <span>Intent & Task Execution Logs</span>
          </div>
          <button
            onClick={clearLogs}
            className="text-[9px] text-slate-400 dark:text-slate-500 hover:text-indigo-650 bg-slate-200/50 dark:bg-slate-900 border border-slate-300/40 px-2 py-0.5 rounded cursor-pointer"
          >
            Reset Console
          </button>
        </div>

        {/* Scrollable console terminal view */}
        <div className="flex-1 overflow-y-auto bg-slate-900 dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-900 p-2 font-mono text-[9px] text-slate-300 space-y-1">
          {preferencesLog.length === 0 ? (
            <div className="text-slate-500 italic text-center pt-8">No launcher operations triggered yet. Modify preferences to view system binding logs.</div>
          ) : (
            preferencesLog.map((log, idx) => (
              <div key={idx} className="border-b border-white/5 pb-1">
                <span className="text-slate-500 mr-1">[{log.timestamp}]</span>
                <span className="text-indigo-300 font-bold mr-1">{log.action}:</span>
                <span className="text-slate-200">{log.details}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
