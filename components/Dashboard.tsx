
import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Cpu, Network as NetworkIcon, Terminal as TerminalIcon } from 'lucide-react';
import GeoMap from './GeoMap';
import TerminalWindow from './Terminal';
import NetworkPanel from './Network';
import { ThemeColor } from '../types';

// System Vital Gauge Component
const VitalRadial: React.FC<{ label: string; value: number; color: string; icon: any }> = ({ label, value, color, icon: Icon }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2 bg-black/40 border border-gray-800 rounded relative overflow-hidden group min-h-[100px]">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
            <div className="relative z-10 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-gray-800 mb-2">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                        className={`${color === 'red' ? 'text-red-600' : color === 'yellow' ? 'text-yellow-500' : 'text-cyan-500'} transition-all duration-500`}
                        strokeDasharray={`${value}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                </svg>
                <Icon size={20} className={`${color === 'red' ? 'text-red-500' : color === 'yellow' ? 'text-yellow-400' : 'text-cyan-400'} animate-pulse`} />
            </div>
            <div className="text-lg md:text-xl font-bold font-mono text-white relative z-10">{value}%</div>
            <div className="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-widest uppercase relative z-10 text-center">{label}</div>
        </div>
    );
}

// Live Feed Component
const ThreatFeed: React.FC = () => {
    const [events, setEvents] = useState<{time: string, msg: string, type: 'info'|'warn'|'crit'}[]>([]);

    useEffect(() => {
        const msgs = [
            { m: "Port 22 SSH handshake initiated", t: 'info' },
            { m: "Inbound packet blocked [IP: 89.22.1.4]", t: 'warn' },
            { m: "Database query latency > 500ms", t: 'warn' },
            { m: "Root access attempt detected", t: 'crit' },
            { m: "Encrypted payload received", t: 'info' },
            { m: "Firewall rule updated: ID_402", t: 'info' },
        ];

        const interval = setInterval(() => {
            const item = msgs[Math.floor(Math.random() * msgs.length)];
            setEvents(prev => [
                { 
                    time: new Date().toLocaleTimeString([], { hour12: false }), 
                    msg: item.m, 
                    type: item.t as any 
                }, 
                ...prev.slice(0, 8)
            ]);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-black border border-gray-800 p-2 font-mono text-xs overflow-hidden flex flex-col min-h-[150px]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1 mb-2">
                <span className="text-gray-500 font-bold flex items-center"><Activity size={12} className="mr-1"/> LIVE_THREAT_FEED</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="flex-1 overflow-hidden relative">
                 <div className="space-y-1">
                     {events.map((e, i) => (
                         <div key={i} className={`flex space-x-2 animate-in slide-in-from-left duration-300 ${i === 0 ? 'opacity-100' : 'opacity-70'}`}>
                             <span className="text-gray-600">[{e.time}]</span>
                             <span className={`${e.type === 'crit' ? 'text-red-500 font-bold' : e.type === 'warn' ? 'text-yellow-500' : 'text-cyan-400'} truncate`}>
                                 {e.type === 'crit' ? '!' : '>'} {e.msg}
                             </span>
                         </div>
                     ))}
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
            </div>
        </div>
    )
}

const Dashboard: React.FC = () => {
    // Vitals simulation
    const [cpu, setCpu] = useState(45);
    const [ram, setRam] = useState(62);
    const [net, setNet] = useState(24);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(Math.floor(Math.random() * 30 + 30));
            setRam(Math.floor(Math.random() * 20 + 50));
            setNet(Math.floor(Math.random() * 50 + 20));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full p-2 flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-12 gap-2 bg-black/20 overflow-y-auto lg:overflow-hidden">
            
            {/* Header / Vitals Strip (Row 1-2) */}
            <div className="lg:col-span-12 lg:row-span-2 grid grid-cols-2 md:grid-cols-4 gap-2 flex-none">
                <div className="col-span-1 bg-cyan-900/10 border border-cyan-800 p-3 flex items-center justify-between box-glow min-h-[80px]">
                    <div>
                        <div className="text-cyan-500 font-bold text-lg tracking-widest">DEFCON 4</div>
                        <div className="text-[10px] text-cyan-700">READINESS LEVEL: NORMAL</div>
                    </div>
                    <ShieldCheck size={32} className="text-cyan-500" />
                </div>
                <VitalRadial label="CPU LOAD" value={cpu} color="cyan" icon={Cpu} />
                <VitalRadial label="RAM USAGE" value={ram} color="yellow" icon={Activity} />
                <VitalRadial label="NET TRAFFIC" value={net} color="red" icon={NetworkIcon} />
            </div>

            {/* Main Globe (Row 3-12, Col 1-8) */}
            <div className="lg:col-span-8 lg:row-span-7 relative min-h-[300px] lg:min-h-0 flex-none">
                <GeoMap />
                {/* Overlay details */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/80 border-t border-cyan-900 flex items-center px-4 justify-between text-[10px] font-mono text-cyan-600">
                    <span>COORDS: 34.0522° N, 118.2437° W</span>
                    <span className="hidden md:inline">ZOOM: 450%</span>
                    <span>GRID: ENABLED</span>
                </div>
            </div>

            {/* Right Side Panel (Row 3-12, Col 9-12) */}
            <div className="lg:col-span-4 lg:row-span-10 flex flex-col lg:grid lg:grid-rows-3 gap-2 flex-none lg:h-auto">
                
                {/* Live Feed */}
                <div className="lg:row-span-1 min-h-[200px] lg:min-h-0">
                    <ThreatFeed />
                </div>

                {/* Network Status */}
                <div className="lg:row-span-1 bg-black border border-gray-800 relative overflow-hidden min-h-[200px] lg:min-h-0">
                     <div className="absolute inset-0 opacity-50">
                         <NetworkPanel theme="cyan" />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>
                     <div className="absolute bottom-2 right-2 text-xs font-bold text-cyan-500 bg-black/80 px-2 border border-cyan-900">
                         NETWORK TOPOLOGY
                     </div>
                </div>

                {/* Mini Terminal */}
                <div className="lg:row-span-1 border border-green-900 relative min-h-[200px] lg:min-h-0">
                     <div className="absolute top-0 left-0 bg-green-900/20 text-green-500 text-[10px] px-2 py-1 font-bold flex items-center z-10">
                         <TerminalIcon size={10} className="mr-1"/> QUICK_ACCESS_SHELL
                     </div>
                     <div className="h-full pt-6">
                        <TerminalWindow theme="green" />
                     </div>
                </div>
            </div>

            {/* Bottom Wide Terminal (Row 10-12, Col 1-8) */}
            <div className="lg:col-span-8 lg:row-span-3 border border-gray-800 bg-black relative p-1 min-h-[200px] lg:min-h-0 flex-none">
                 <div className="h-full w-full opacity-80">
                      <TerminalWindow theme="gray" />
                 </div>
                 {/* Decorative Corner */}
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-500"></div>
            </div>

        </div>
    );
};

export default Dashboard;
