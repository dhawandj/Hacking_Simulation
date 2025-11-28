
import React, { useState, useEffect } from 'react';
import { ModuleType, AppSettings, ThemeColor } from './types';
import { MODULES } from './constants';
import TerminalWindow from './components/Terminal';
import GeoMap from './components/GeoMap';
import Surveillance from './components/Surveillance';
import NetworkPanel from './components/Network';
import DroneControl from './components/DroneControl';
import SettingsPanel from './components/SettingsPanel';
import MobilePanel from './components/MobilePanel';
import VoiceChanger from './components/VoiceChanger'; // New Import
import Dashboard from './components/Dashboard'; // New Dashboard Import
import { SoundManager } from './utils/SoundManager';
import { Activity, Battery, Cpu, Lock, Unlock, Radio, MapPin, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [systemLocked, setSystemLocked] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Global Settings State
  const [settings, setSettings] = useState<AppSettings>({
      soundEnabled: true,
      scanlines: false,
      crtFlicker: false,
      textGlow: false,
      fontSize: 'base',
      theme: 'green'
  });

  // Load settings from storage
  useEffect(() => {
      const saved = localStorage.getItem('cinehack_settings');
      if (saved) {
          try {
              setSettings(JSON.parse(saved));
          } catch(e) {}
      }
  }, []);

  // Save settings on change
  const updateSetting = (key: keyof AppSettings, value: any) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('cinehack_settings', JSON.stringify(newSettings));

      if (key === 'soundEnabled') {
          if (!value && !SoundManager.isMuted()) SoundManager.toggleMute();
          if (value && SoundManager.isMuted()) SoundManager.toggleMute();
      }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global sound interaction listener
  useEffect(() => {
    const handleInteraction = (e: MouseEvent) => {
      if (settings.soundEnabled) {
          SoundManager.init();
          SoundManager.play('click');
      }
    };

    const handleHover = (e: MouseEvent) => {
        if (!settings.soundEnabled) return;
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A') {
            SoundManager.play('hover');
        }
    }

    window.addEventListener('click', handleInteraction);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('mouseover', handleHover);
    };
  }, [settings.soundEnabled]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSetting('soundEnabled', !settings.soundEnabled);
  };

  const theme = settings.theme;

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.DASHBOARD:
        return <Dashboard />;
      case ModuleType.TERMINAL:
        return <TerminalWindow theme={theme} />;
      case ModuleType.CCTV:
        // Pass theme to Surveillance
        return <Surveillance theme={theme} onThemeChange={(t) => updateSetting('theme', t)} />;
      case ModuleType.NETWORK:
      case ModuleType.SERVERS:
        return <NetworkPanel theme={theme} />;
      case ModuleType.DRONE:
        return <DroneControl />;
      case ModuleType.MOBILE:
        return <MobilePanel theme={theme} />;
      case ModuleType.VOICE:
        return <VoiceChanger theme={theme} />;
      case ModuleType.SETTINGS:
        return <SettingsPanel settings={settings} onUpdate={updateSetting} />;
      default:
        return (
          <div className={`flex items-center justify-center h-full border border-${theme}-800`}>
            <div className="text-center">
              <h1 className={`text-4xl font-bold text-${theme}-700 mb-4`}>MODULE_OFFLINE</h1>
              <p className="text-gray-500 font-mono">Connecting to remote host...</p>
              <div className="w-64 h-2 bg-gray-900 mt-4 mx-auto rounded overflow-hidden">
                <div className={`h-full bg-${theme}-500 w-1/3 animate-pulse`}></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen w-screen bg-black text-${theme}-500 overflow-hidden select-none 
        ${settings.textGlow ? (theme === 'rose' ? 'text-glow-red' : (theme === 'cyan' ? 'text-glow-cyan' : 'text-glow')) : ''}
        ${settings.fontSize === 'sm' ? 'text-xs' : (settings.fontSize === 'lg' ? 'text-base' : 'text-sm')}
    `}>
      
      {/* Global Overlays */}
      {settings.scanlines && <div className="scanlines"></div>}
      {settings.crtFlicker && <div className="crt-flicker"></div>}

      {/* Side Navigation */}
      <nav className={`w-16 md:w-24 border-r border-${theme}-900 bg-black/90 flex flex-col items-center py-6 z-40 relative flex-none`}>
        <div className={`mb-8 text-xl md:text-2xl font-bold text-${theme}-400 tracking-tighter border-b-2 border-${theme}-500 pb-2`}>KALI<span className="text-white"></span></div>
        <div className="flex-1 w-full space-y-4 px-1 md:px-2 overflow-y-auto scrollbar-hide">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full flex flex-col items-center p-2 md:p-3 rounded transition-all duration-200 group relative
                  ${activeModule === mod.id 
                    ? `bg-${theme}-900/30 text-${theme}-400 shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-${theme}-500/50` 
                    : `text-gray-500 hover:text-${theme}-300 hover:bg-${theme}-900/10`}`}
              >
                <Icon size={20} className="mb-1 md:w-6 md:h-6" />
                <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-center">{mod.label.split(' ')[0]}</span>
                {activeModule === mod.id && (
                    <div className={`absolute right-0 top-0 bottom-0 w-1 bg-${theme}-500 shadow-[0_0_10px_currentColor]`}></div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Lock System Button */}
        <div className="mt-auto pt-4 border-t border-gray-800 w-full px-1 md:px-2">
            <button 
                onClick={() => setSystemLocked(!systemLocked)}
                className="w-full p-2 bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/40 rounded flex flex-col items-center"
            >
                {systemLocked ? <Lock size={16} className="md:w-5 md:h-5" /> : <Unlock size={16} className="md:w-5 md:h-5" />}
                <span className="text-[9px] md:text-[10px] mt-1">LOCK</span>
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-30 min-w-0">
        
        {/* Top Status Bar */}
        <header className={`h-12 border-b border-${theme}-900 bg-black/80 flex items-center justify-between px-2 md:px-6 font-mono text-xs md:text-sm flex-none`}>
            <div className={`flex items-center space-x-2 md:space-x-6 text-${theme}-600`}>
                <div className="flex items-center space-x-2">
                    <Radio className="animate-pulse w-3 h-3 md:w-4 md:h-4 text-red-500" />
                    <span className="hidden md:inline">LIVE_CONNECTION: 492.168.0.1</span>
                    <span className="md:hidden">LIVE</span>
                </div>
                <div className="hidden lg:flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>PROXY: 84.22.11.0 (TOKYO)</span>
                </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-6">
                <button 
                  onClick={toggleMute}
                  className={`text-${theme}-500 hover:text-${theme}-400 p-1 border border-transparent hover:border-${theme}-800 rounded`}
                  title={!settings.soundEnabled ? "Unmute Sound" : "Mute Sound"}
                >
                  {!settings.soundEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="flex items-center space-x-2 text-cyan-500">
                    <Cpu className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">CPU: {Math.floor(Math.random() * 30 + 40)}%</span>
                    <span className="md:hidden">55%</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-yellow-500">
                    <Activity className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">RAM: 12GB</span>
                    <span className="md:hidden">12G</span>
                </div>
                 <div className={`hidden sm:flex items-center space-x-2 text-${theme}-500`}>
                    <Battery className="w-3 h-3 md:w-4 md:h-4" />
                    <span>98%</span>
                </div>
                <div className="text-white font-bold bg-gray-900 px-2 md:px-3 py-1 rounded border border-gray-700 text-[10px] md:text-xs">
                    {time.toLocaleTimeString()}
                </div>
            </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-2 md:p-4 overflow-hidden relative">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: `radial-gradient(circle, ${settings.theme === 'gray' ? '#ffffff' : settings.theme === 'rose' ? '#f43f5e' : settings.theme === 'violet' ? '#8b5cf6' : settings.theme === 'amber' ? '#f59e0b' : settings.theme === 'cyan' ? '#06b6d4' : '#22c55e'} 1px, transparent 1px)`, backgroundSize: '30px 30px'}}>
            </div>
            
            <div className="relative z-10 h-full">
                {renderModule()}
            </div>
        </div>

        {/* Footer Ticker */}
        <footer className={`h-8 bg-black border-t border-${theme}-900 flex items-center px-4 overflow-hidden whitespace-nowrap flex-none`}>
            <div className="animate-[scroll_20s_linear_infinite] flex items-center space-x-8 text-xs font-mono text-gray-400">
                <span className="text-red-500">WARNING: UNATHORIZED ACCESS DETECTED IN SECTOR 7</span>
                <span>// ENCRYPTION KEYS ROTATING...</span>
                <span>// DOWNLOAD COMPLETE: PROJECT_ZEUS.ISO</span>
                <span>// UPLINK STABLE (50ms)</span>
                <span className="text-yellow-500">ALERT: FIREWALL BREACH ATTEMPT (IP: 99.1.23.4)</span>
                <span>// SYSTEM KERNEL PATCHED SUCCESSFULLY</span>
            </div>
        </footer>

      </main>

      {/* System Lockdown Overlay */}
      {systemLocked && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm p-4">
            <div className="border-4 border-red-600 p-8 md:p-12 rounded bg-black box-glow text-center animate-pulse max-w-lg w-full">
                <Lock size={64} className="text-red-600 mx-auto mb-4 w-12 h-12 md:w-16 md:h-16" />
                <h1 className="text-3xl md:text-5xl font-bold text-red-600 mb-2 tracking-widest text-glow-red">SYSTEM LOCKED</h1>
                <p className="text-red-800 font-mono text-sm md:text-xl">BIOMETRIC AUTHENTICATION REQUIRED</p>
                <div className="mt-8 flex justify-center space-x-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-red-900 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>
                    ))}
                </div>
                <button 
                    onClick={() => setSystemLocked(false)}
                    className="mt-8 px-6 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase tracking-widest text-xs md:text-sm"
                >
                    Emergency Override
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
