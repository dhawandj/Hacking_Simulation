
export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  TERMINAL = 'TERMINAL',
  CCTV = 'CCTV',
  NETWORK = 'NETWORK',
  SERVERS = 'SERVERS',
  DRONE = 'DRONE',
  MOBILE = 'MOBILE',
  VOICE = 'VOICE',
  SETTINGS = 'SETTINGS',
}

export type ThemeColor = 'green' | 'cyan' | 'amber' | 'violet' | 'rose' | 'gray';

export interface AppSettings {
  soundEnabled: boolean;
  scanlines: boolean;
  crtFlicker: boolean;
  textGlow: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  theme: ThemeColor;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

export interface Node {
  id: string;
  x: number;
  y: number;
  status: 'active' | 'compromised' | 'offline';
  label: string;
}

export interface ServerRack {
  id: string;
  load: number;
  status: 'optimal' | 'high_load' | 'critical';
  diskUsage: number;
}