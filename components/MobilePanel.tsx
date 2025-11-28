
import React, { useState, useEffect } from 'react';
import { Smartphone, MapPin, MessageSquare, Phone, Lock, Unlock, Wifi, Battery, RefreshCw, Radio, HardDrive } from 'lucide-react';
import { ThemeColor } from '../types';
import { FAKE_SMS } from '../constants';
import { SoundManager } from '../utils/SoundManager';

interface MobilePanelProps {
    theme?: ThemeColor;
}

const MobilePanel: React.FC<MobilePanelProps> = ({ theme = 'green' }) => {
    const [activeTab, setActiveTab] = useState<'SMS' | 'GPS' | 'INFO'>('SMS');
    const [cloningProgress, setCloningProgress] = useState(0);
    const [isCloning, setIsCloning] = useState(false);
    const [messages, setMessages] = useState(FAKE_SMS);
    const [selectedMsg, setSelectedMsg] = useState<number | null>(null);
    const [signalStr, setSignalStr] = useState(90);

    // Simulate Signal Fluctuation
    useEffect(() => {
        const i = setInterval(() => {
            setSignalStr(prev => Math.min(100, Math.max(20, prev + (Math.random() - 0.5) * 20)));
        }, 1000);
        return () => clearInterval(i);
    }, []);

    // Cloning Simulation
    useEffect(() => {
        if (isCloning) {
            const i = setInterval(() => {
                setCloningProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(i);
                        setIsCloning(false);
                        SoundManager.play('success');
                        return 100;
                    }
                    if (Math.random() > 0.7) SoundManager.play('type');
                    return prev + 1;
                });
            }, 50);
            return () => clearInterval(i);
        }
    }, [isCloning]);

    // Incoming SMS Simulation
    useEffect(() => {
        const i = setInterval(() => {
            if (Math.random() > 0.8) {
                const newMsg = {
                    id: Date.now(),
                    from: "UNKNOWN_SENDER",
                    text: `Encrypted data packet received. Size: ${Math.floor(Math.random() * 500)}kb`,
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                };
                setMessages(prev => [newMsg, ...prev]);
                SoundManager.play('click');
            }
        }, 5000);
        return () => clearInterval(i);
    }, []);

    const startCloning = () => {
        if (isCloning) return;
        setCloningProgress(0);
        setIsCloning(true);
        SoundManager.play('lock');
    };

    return (
        <div className={`h-full w-full bg-black/80 flex flex-col lg:flex-row gap-4 p-2 md:p-4 font-mono text-${theme}-500 overflow-y-auto lg:overflow-hidden`}>
            
            {/* LEFT: DEVICE LIST & TARGET INFO */}
            <div className={`w-full lg:w-1/3 flex flex-col gap-4 flex-none`}>
                <div className={`border border-${theme}-800 p-4 box-glow bg-black relative overflow-hidden`}>
                     <h3 className="font-bold border-b border-gray-800 pb-2 mb-4 flex items-center">
                        <Smartphone className="mr-2 animate-pulse" /> TARGET DEVICE
                     </h3>
                     
                     <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">MODEL:</span>
                            <span className="font-bold text-white">iPhone 14 Pro Max</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">IMEI:</span>
                            <span className="font-mono">99-000214-44211</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">CARRIER:</span>
                            <span>VERIZON_SECURE</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">STATUS:</span>
                            <span className={`bg-${theme}-900/30 px-2 py-0.5 text-${theme}-400 border border-${theme}-600 rounded animate-pulse`}>
                                INTERCEPTED
                            </span>
                        </div>
                     </div>

                     <div className="mt-6 space-y-2">
                         <div className="flex justify-between text-xs mb-1">
                             <span>SIGNAL STRENGTH</span>
                             <span>{Math.floor(signalStr)} dBm</span>
                         </div>
                         <div className="w-full h-1 bg-gray-900 rounded overflow-hidden">
                             <div className={`h-full bg-${theme}-500 transition-all duration-500`} style={{width: `${signalStr}%`}}></div>
                         </div>
                     </div>

                     <div className="absolute top-0 right-0 p-2 opacity-30">
                        <Wifi size={64} />
                     </div>
                </div>

                <div className={`border border-${theme}-800 p-4 box-glow bg-black flex flex-col min-h-[250px]`}>
                    <h3 className="font-bold border-b border-gray-800 pb-2 mb-4">TOOLS</h3>
                    
                    <button 
                        onClick={startCloning}
                        disabled={isCloning}
                        className={`p-4 border border-${theme}-600 bg-${theme}-900/10 hover:bg-${theme}-900/30 transition-all mb-4 flex flex-col items-center justify-center space-y-2 group
                        ${isCloning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw className={`w-6 h-6 ${isCloning ? 'animate-spin' : ''}`} />
                        <span className="font-bold text-sm tracking-widest">{isCloning ? 'CLONING SIM...' : 'CLONE SIM CARD'}</span>
                    </button>

                    {isCloning && (
                        <div className="mb-4 space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span>PROGRESS</span>
                                <span>{cloningProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-900 border border-gray-700">
                                <div className={`h-full bg-${theme}-500`} style={{width: `${cloningProgress}%`}}></div>
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                                {cloningProgress < 30 ? "Brute forcing PIN..." : cloningProgress < 70 ? "Copying contacts..." : "Finalizing handshake..."}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button className={`p-2 border border-${theme}-900 hover:bg-${theme}-900/20 text-xs flex items-center justify-center`}>
                            <Lock size={14} className="mr-2" /> LOCK
                        </button>
                        <button className={`p-2 border border-${theme}-900 hover:bg-${theme}-900/20 text-xs flex items-center justify-center`}>
                            <Unlock size={14} className="mr-2" /> UNLOCK
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: INTERFACE MIRROR */}
            <div className={`w-full lg:w-2/3 border border-${theme}-800 bg-black box-glow flex flex-col h-[600px] lg:h-full`}>
                {/* Tabs */}
                <div className="flex border-b border-gray-800 flex-none">
                    <button 
                        onClick={() => { setActiveTab('SMS'); SoundManager.play('click'); }}
                        className={`flex-1 p-3 text-xs font-bold flex items-center justify-center space-x-2 border-r border-gray-800 hover:bg-${theme}-900/10
                        ${activeTab === 'SMS' ? `bg-${theme}-900/20 text-${theme}-400` : 'text-gray-600'}`}
                    >
                        <MessageSquare size={16} /> <span>SMS LOGS</span>
                    </button>
                    <button 
                        onClick={() => { setActiveTab('GPS'); SoundManager.play('click'); }}
                        className={`flex-1 p-3 text-xs font-bold flex items-center justify-center space-x-2 border-r border-gray-800 hover:bg-${theme}-900/10
                        ${activeTab === 'GPS' ? `bg-${theme}-900/20 text-${theme}-400` : 'text-gray-600'}`}
                    >
                        <MapPin size={16} /> <span>GPS TRACKER</span>
                    </button>
                    <button 
                        onClick={() => { setActiveTab('INFO'); SoundManager.play('click'); }}
                        className={`flex-1 p-3 text-xs font-bold flex items-center justify-center space-x-2 hover:bg-${theme}-900/10
                        ${activeTab === 'INFO' ? `bg-${theme}-900/20 text-${theme}-400` : 'text-gray-600'}`}
                    >
                        <HardDrive size={16} /> <span>FILESYSTEM</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-hidden relative">
                    {/* Background Grid */}
                    <div className={`absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px]`}></div>

                    {activeTab === 'SMS' && (
                        <div className="h-full overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                            {messages.map((msg, idx) => (
                                <div 
                                    key={msg.id}
                                    onClick={() => { setSelectedMsg(msg.id); SoundManager.play('click'); }}
                                    className={`p-3 border text-xs cursor-pointer transition-all animate-in fade-in slide-in-from-right-4 duration-300
                                        ${selectedMsg === msg.id 
                                            ? `border-${theme}-500 bg-${theme}-900/20` 
                                            : `border-gray-800 bg-gray-900/20 hover:border-${theme}-800`}`}
                                    style={{animationDelay: `${idx * 50}ms`}}
                                >
                                    <div className="flex justify-between mb-1 opacity-70">
                                        <span className="font-bold">{msg.from}</span>
                                        <span>{msg.time}</span>
                                    </div>
                                    <div className={`font-mono ${selectedMsg === msg.id ? 'text-white' : ''}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'GPS' && (
                        <div className="h-full w-full relative border border-gray-800 bg-gray-900/50 overflow-hidden group">
                            {/* Fake Map Grid */}
                            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                                {Array.from({length: 24}).map((_,i) => (
                                    <div key={i} className={`border border-${theme}-900/20`}></div>
                                ))}
                            </div>
                            
                            {/* Target Dot */}
                            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                                <div className={`w-full h-full bg-${theme}-500 rounded-full animate-ping absolute`}></div>
                                <div className={`w-full h-full bg-${theme}-500 rounded-full absolute`}></div>
                                {/* Radar Sweep */}
                                <div className={`absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 border border-${theme}-500/30 rounded-full animate-[spin_4s_linear_infinite]`}>
                                    <div className={`w-1/2 h-full bg-gradient-to-l from-${theme}-500/20 to-transparent absolute top-0 right-0 origin-left`}></div>
                                </div>
                            </div>
                            
                            {/* Floating Map UI */}
                            <div className="absolute top-4 left-4 bg-black/80 border border-gray-700 p-2 text-[10px] font-mono">
                                <div>LAT: 34.0522</div>
                                <div>LON: -118.2437</div>
                                <div>ACCURACY: 5m</div>
                                <div className={`text-${theme}-500 animate-pulse font-bold mt-1`}>TRACKING ACTIVE</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'INFO' && (
                        <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto content-start">
                            {Array.from({length: 12}).map((_, i) => (
                                <div key={i} className={`aspect-square border border-gray-800 bg-gray-900/20 flex flex-col items-center justify-center p-2 hover:bg-${theme}-900/20 hover:border-${theme}-500 cursor-pointer transition-colors group`}>
                                    <HardDrive size={24} className={`mb-2 text-gray-600 group-hover:text-${theme}-500`} />
                                    <span className="text-[10px] text-center opacity-70">DCIM_00{i+1}.jpg</span>
                                    <span className="text-[9px] text-gray-600">2.4 MB</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MobilePanel;
