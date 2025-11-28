
import React from 'react';
import { AppSettings, ThemeColor } from '../types';
import { Volume2, VolumeX, Monitor, Type, Palette, Cpu, Power, Activity } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (key: keyof AppSettings, value: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate }) => {
  const themeColors: { id: ThemeColor; label: string; hex: string }[] = [
    { id: 'green', label: 'MATRIX GREEN', hex: '#22c55e' },
    { id: 'cyan', label: 'CYBER BLUE', hex: '#06b6d4' },
    { id: 'amber', label: 'WARNING AMBER', hex: '#f59e0b' },
    { id: 'violet', label: 'SYNTH WAVE', hex: '#8b5cf6' },
    { id: 'rose', label: 'RED ALERT', hex: '#f43f5e' },
    { id: 'gray', label: 'MONOCHROME', hex: '#9ca3af' },
  ];

  const handleToggle = (key: keyof AppSettings) => {
    onUpdate(key, !settings[key]);
    SoundManager.play('click');
  };

  const handleSelect = (key: keyof AppSettings, value: any) => {
    onUpdate(key, value);
    SoundManager.play('success');
  };

  const currentHex = themeColors.find(c => c.id === settings.theme)?.hex || '#22c55e';

  return (
    <div className={`h-full w-full bg-black p-4 md:p-8 font-mono text-${settings.theme}-500 overflow-y-auto`}>
      <div className={`max-w-4xl mx-auto border border-${settings.theme}-800 bg-black/50 box-glow min-h-[600px] flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-${settings.theme}-900 bg-${settings.theme}-900/10`}>
            <div className="flex items-center space-x-3">
                <Cpu className={`w-8 h-8 animate-pulse text-${settings.theme}-400`} />
                <div>
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-white">KALI LINUX CONFIG</h1>
                    <p className={`text-xs text-${settings.theme}-600`}>KERNEL VERSION 6.8.11 // ROOT ACCESS</p>
                </div>
            </div>
            <div className="text-right text-xs space-y-1 opacity-70">
                <div>MEM: 64GB OK</div>
                <div>CPU: 3.4GHz OK</div>
                <div>GPU: RTX-4090 OK</div>
            </div>
        </div>

        <div className="flex-1 p-8 space-y-8">
            
            {/* AUDIO SECTION */}
            <section className="space-y-4">
                <h2 className={`text-lg font-bold border-b border-${settings.theme}-800 pb-2 flex items-center`}>
                    <Volume2 className="mr-2 w-5 h-5" /> AUDIO SUBSYSTEM
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 border border-${settings.theme}-900 bg-${settings.theme}-900/5 flex items-center justify-between`}>
                        <div className="flex items-center">
                            {settings.soundEnabled ? <Volume2 className="mr-3"/> : <VolumeX className="mr-3 text-red-500"/>}
                            <div>
                                <div className="font-bold">MASTER AUDIO</div>
                                <div className="text-xs opacity-70">Enable/Disable all UI sounds</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleToggle('soundEnabled')}
                            className={`px-4 py-1 border ${settings.soundEnabled ? `border-${settings.theme}-500 bg-${settings.theme}-900/20` : 'border-gray-800 text-gray-500'} text-xs font-bold transition-all`}
                        >
                            {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
                        </button>
                    </div>
                </div>
            </section>

            {/* VISUALS SECTION */}
            <section className="space-y-4">
                <h2 className={`text-lg font-bold border-b border-${settings.theme}-800 pb-2 flex items-center`}>
                    <Monitor className="mr-2 w-5 h-5" /> DISPLAY & GRAPHICS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Scanlines */}
                    <button 
                        onClick={() => handleToggle('scanlines')}
                        className={`p-4 border text-left transition-all hover:bg-${settings.theme}-900/10
                            ${settings.scanlines ? `border-${settings.theme}-500 text-${settings.theme}-400` : `border-${settings.theme}-900 text-gray-600`}`}
                    >
                        <div className="font-bold mb-1">SCANLINES</div>
                        <div className="text-[10px] opacity-70 mb-2">CRT interlacing overlay</div>
                        <div className={`w-full h-1 bg-gray-900 rounded overflow-hidden`}>
                             <div className={`h-full ${settings.scanlines ? `bg-${settings.theme}-500` : 'bg-transparent'} w-full`}></div>
                        </div>
                    </button>

                    {/* CRT Flicker */}
                    <button 
                        onClick={() => handleToggle('crtFlicker')}
                        className={`p-4 border text-left transition-all hover:bg-${settings.theme}-900/10
                            ${settings.crtFlicker ? `border-${settings.theme}-500 text-${settings.theme}-400` : `border-${settings.theme}-900 text-gray-600`}`}
                    >
                        <div className="font-bold mb-1">CRT FLICKER</div>
                        <div className="text-[10px] opacity-70 mb-2">Simulated screen refresh rate</div>
                        <div className={`w-full h-1 bg-gray-900 rounded overflow-hidden`}>
                             <div className={`h-full ${settings.crtFlicker ? `bg-${settings.theme}-500` : 'bg-transparent'} w-full`}></div>
                        </div>
                    </button>

                     {/* Text Glow */}
                     <button 
                        onClick={() => handleToggle('textGlow')}
                        className={`p-4 border text-left transition-all hover:bg-${settings.theme}-900/10
                            ${settings.textGlow ? `border-${settings.theme}-500 text-${settings.theme}-400` : `border-${settings.theme}-900 text-gray-600`}`}
                    >
                        <div className="font-bold mb-1">PHOSPHOR GLOW</div>
                        <div className="text-[10px] opacity-70 mb-2">High contrast text bloom</div>
                        <div className={`w-full h-1 bg-gray-900 rounded overflow-hidden`}>
                             <div className={`h-full ${settings.textGlow ? `bg-${settings.theme}-500` : 'bg-transparent'} w-full`}></div>
                        </div>
                    </button>
                </div>
            </section>

            {/* THEME SECTION */}
            <section className="space-y-4">
                <h2 className={`text-lg font-bold border-b border-${settings.theme}-800 pb-2 flex items-center`}>
                    <Palette className="mr-2 w-5 h-5" /> INTERFACE THEME
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {themeColors.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => handleSelect('theme', theme.id)}
                            className={`p-2 border flex flex-col items-center space-y-2 transition-all group
                                ${settings.theme === theme.id 
                                    ? `border-${theme.id}-500 bg-${theme.id}-900/20 scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
                                    : `border-gray-800 hover:border-${theme.id}-700 opacity-60 hover:opacity-100`}`}
                        >
                            <div 
                                className="w-8 h-8 rounded-full border-2 border-white shadow-lg" 
                                style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}
                            ></div>
                            <span className={`text-[10px] font-bold ${settings.theme === theme.id ? 'text-white' : 'text-gray-500'} group-hover:text-white`}>
                                {theme.label}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

             {/* FONT SECTION */}
             <section className="space-y-4">
                <h2 className={`text-lg font-bold border-b border-${settings.theme}-800 pb-2 flex items-center`}>
                    <Type className="mr-2 w-5 h-5" /> TYPOGRAPHY SCALE
                </h2>
                <div className="flex space-x-4">
                    {['sm', 'base', 'lg'].map((size) => (
                        <button
                             key={size}
                             onClick={() => handleSelect('fontSize', size)}
                             className={`flex-1 py-3 border font-mono transition-all uppercase
                                ${settings.fontSize === size 
                                    ? `border-${settings.theme}-500 bg-${settings.theme}-900/20 text-${settings.theme}-400 font-bold` 
                                    : `border-${settings.theme}-900/30 text-gray-500 hover:border-${settings.theme}-700`}`}
                        >
                            TEXT {size}
                        </button>
                    ))}
                </div>
            </section>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-${settings.theme}-900 flex justify-between items-center bg-${settings.theme}-900/5`}>
            <div className="flex items-center space-x-2 text-xs opacity-50">
                <Activity size={14} />
                <span>SYSTEM UPTIME: 42:15:09</span>
            </div>
            <button className={`px-4 py-2 bg-${settings.theme}-600 text-black font-bold text-xs hover:bg-${settings.theme}-500`}>
                EXPORT CONFIG
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;
