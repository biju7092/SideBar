/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DockSide = 'left' | 'right';
export type SidebarSize = 'small' | 'medium' | 'large';
export type VerticalPosition = 'top' | 'center' | 'bottom';

export interface AppConfig {
  app1_package: string;
  app2_package: string;
  app3_package: string;
  dock_side: DockSide;
  opacity: number;
  size: SidebarSize;
  vertical_position: VerticalPosition;
}

export interface AndroidApp {
  packageName: string;
  appName: string;
  iconName: string; // reference to lucide-react icons
  color: string; // custom color themes for simulated screens
}

export const PREINSTALLED_APPS: AndroidApp[] = [
  {
    packageName: 'com.google.android.gm',
    appName: 'Gmail',
    iconName: 'Mail',
    color: 'bg-red-500/10 text-red-500 border-red-500/20'
  },
  {
    packageName: 'com.android.chrome',
    appName: 'Chrome',
    iconName: 'Globe',
    color: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  {
    packageName: 'com.android.vending',
    appName: 'Play Store',
    iconName: 'Play',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
  },
  {
    packageName: 'com.google.android.youtube',
    appName: 'YouTube',
    iconName: 'Youtube',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  },
  {
    packageName: 'com.google.android.apps.maps',
    appName: 'Maps',
    iconName: 'MapPin',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  },
  {
    packageName: 'com.google.android.calendar',
    appName: 'Calendar',
    iconName: 'Calendar',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  {
    packageName: 'com.android.camera',
    appName: 'Camera',
    iconName: 'Camera',
    color: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
  },
  {
    packageName: 'com.android.settings',
    appName: 'Settings',
    iconName: 'Settings',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
];
