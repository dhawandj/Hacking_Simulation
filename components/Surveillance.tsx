
import React, { useState, useEffect, useRef } from 'react';
import { 
    Disc, Settings, Save, Upload, RefreshCw, Camera, 
    Image as ImageIcon, Video, X, Lock, Unlock, 
    AlertTriangle, Terminal, Activity, Eye, EyeOff, Radio,
    Sliders, Cpu, Signal, Grid, LayoutGrid, Maximize, Palette, Zap, Waves,
    ArchiveRestore, Power, Play, HardDrive, FileVideo, FileImage, Command,
    CheckCircle, ShieldAlert, XCircle
} from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';
import { ThemeColor } from '../types';

// --- Types ---
type FeedType = 'simulation' | 'webcam' | 'image' | 'video';
type FeedFilter = 'grayscale' | 'color' | 'invert' | 'night_vision';
type AccessState = 'SETUP' | 'LOCKED' | 'HACKING' | 'GRANTED';
type ConfigTab = 'SOURCE' | 'OPTICS' | 'SYSTEM' | 'TERMINAL';
type GridSize = 1 | 2 | 3;

interface CameraConfig {
  id: string;
  label: string;
  type: FeedType;
  url: string;
  filter: FeedFilter;
  recording: boolean;
  glitchEnabled: boolean;
  scanlinesEnabled: boolean;
  crtRollEnabled: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'ERR';
}

// Mini-Terminal Process Types
type TermProcessStatus = 'RUNNING' | 'FAILED' | 'OVERRIDE' | 'SUCCESS';

interface TermProcess {
    target: string;
    progress: number;
    status: TermProcessStatus;
    logs: string[];
    timer: number;
    failTriggered: boolean;
}

// --- Constants ---
const DEFAULT_CAMS: CameraConfig[] = [
  { id: 'CAM_01', label: 'LOBBY_MAIN', type: 'simulation', url: '', filter: 'color', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: false, status: 'ONLINE' },
  { id: 'CAM_02', label: 'SERVER_RM', type: 'simulation', url: '', filter: 'night_vision', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: true, status: 'ONLINE' },
  { id: 'CAM_03', label: 'PARKING_B2', type: 'simulation', url: '', filter: 'grayscale', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: false, status: 'ONLINE' },
  { id: 'CAM_04', label: 'ELEVATOR', type: 'simulation', url: '', filter: 'grayscale', recording: false, glitchEnabled: false, scanlinesEnabled: true, crtRollEnabled: false, status: 'ONLINE' },
  { id: 'CAM_05', label: 'ROOF_OPS', type: 'simulation', url: '', filter: 'night_vision', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: false, status: 'ONLINE' },
  { id: 'CAM_06', label: 'VAULT', type: 'simulation', url: '', filter: 'invert', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: true, status: 'ONLINE' },
  { id: 'CAM_07', label: 'BACK_ALLEY', type: 'simulation', url: '', filter: 'night_vision', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: false, status: 'OFFLINE' },
  { id: 'CAM_08', label: 'RECEPTION', type: 'simulation', url: '', filter: 'color', recording: true, glitchEnabled: false, scanlinesEnabled: true, crtRollEnabled: false, status: 'ONLINE' },
  { id: 'CAM_09', label: 'DATA_HALL', type: 'simulation', url: '', filter: 'grayscale', recording: true, glitchEnabled: true, scanlinesEnabled: true, crtRollEnabled: false, status: 'ONLINE' },
];

const HACK_SEQUENCE_LOGS = [
    "Initializing handshake protocol...",
    "Targeting subnet 192.168.0.x...",
    "Scanning ports 1-65535...",
    "Port 554 (RTSP) OPEN",
    "Port 80 (HTTP) OPEN",
    "Attempting exploit CVE-2024-9211...",
    "Buffer overflow successful.",
    "Injecting rootkit...",
    "Escalating privileges to ADMIN...",
    "Bypassing firewall rules...",
    "Disabling logging daemon...",
    "Hooking into video feed subsystem...",
    "Decrypting video streams...",
    "ACCESS GRANTED."
];

// --- Helper Functions ---
const getFilterClass = (filter: FeedFilter) => {
    switch (filter) {
        case 'color': return 'contrast-125 brightness-90 saturate-75';
        case 'invert': return 'invert contrast-125 hue-rotate-180';
        case 'night_vision': return 'sepia-[.8] hue-rotate-[50deg] contrast-125 brightness-110'; 
        case 'grayscale': default: return 'grayscale contrast-125 brightness-75';
    }
};

// --- Sub-Component: Single Camera Feed ---
const CameraFeed: React.FC<{ 
    config: CameraConfig; 
    isSelected: boolean; 
    onClick: () => void;
    theme: ThemeColor;
}> = ({ config, isSelected, onClick, theme }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [glitch, setGlitch] = useState(false);
    const [time, setTime] = useState(new Date());

    // Time update
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Glitch Effect
    useEffect(() => {
        const loop = setInterval(() => {
            if (config.status === 'ONLINE' && config.glitchEnabled && Math.random() > 0.95) {
                setGlitch(true);
                SoundManager.play('static');
                setTimeout(() => setGlitch(false), 150);
            }
        }, 3000);
        return () => clearInterval(loop);
    }, [config.status, config.glitchEnabled]);

    // Webcam Init
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (config.type === 'webcam' && config.status === 'ONLINE' && videoRef.current) {
             navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
              stream = s;
              if (videoRef.current) videoRef.current.srcObject = s;
            })
            .catch(err => console.error("Webcam error", err));
        }
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        }
    }, [config.type, config.status]);

    return (
        <div 
            onClick={() => { onClick(); SoundManager.play('click'); }}
            className={`relative w-full h-full group bg-black overflow-hidden cursor-pointer transition-all duration-200 
            ${isSelected 
                ? `border-2 border-${theme}-400 shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10` 
                : `border border-${theme}-900 opacity-90 hover:opacity-100 hover:border-${theme}-600`
            }`}
        >
            {/* Visual Feed */}
            <div className={`w-full h-full relative ${config.status === 'ONLINE' ? getFilterClass(config.filter) : ''}`}>
                 {config.status === 'OFFLINE' ? (
                     <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center overflow-hidden relative">
                         {/* Static Noise CSS */}
                         <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_pattern_with_intensity_gradient.png')] opacity-20 animate-[flicker_0.05s_infinite]"></div>
                         <div className="z-10 flex flex-col items-center animate-pulse">
                             <AlertTriangle className="text-gray-500 w-12 h-12 mb-2" />
                             <span className="text-gray-500 font-bold tracking-[0.2em] text-xl">NO SIGNAL</span>
                             <span className="text-gray-700 text-xs mt-1">CONNECTION LOST</span>
                         </div>
                         {/* Moving Horizontal Lines */}
                         <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                     </div>
                 ) : (
                    <>
                        {config.type === 'simulation' && (
                            <img 
                                src={`https://picsum.photos/600/400?grayscale&random=${config.id}`} 
                                className="w-full h-full object-cover"
                                alt="sim"
                            />
                        )}
                        {config.type === 'image' && config.url && (
                            <img src={config.url} className="w-full h-full object-cover" alt="feed" />
                        )}
                        {(config.type === 'video' || config.type === 'webcam') && (
                            <video 
                                ref={videoRef}
                                src={config.type === 'video' ? config.url : undefined}
                                autoPlay loop muted playsInline
                                className="w-full h-full object-cover"
                            />
                        )}
                    </>
                 )}
            </div>

            {/* Overlays */}
            {config.recording && config.status === 'ONLINE' && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 z-20 pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ff0000]"></div>
                    <span className="text-red-500 text-lg font-black tracking-widest text-glow-red">REC</span>
                </div>
            )}
            
            <div className={`absolute top-4 right-4 bg-black/50 px-2 py-1 z-20 pointer-events-none border border-${theme}-900/50`}>
                 <span className={`text-${theme}-500 font-mono text-sm font-bold tracking-widest`}>
                    {time.toLocaleDateString().replace(/\//g, '.')} <span className="text-white">{time.toLocaleTimeString()}</span>
                 </span>
            </div>
            
            <div className={`absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-${theme}-900/50 p-2 flex justify-between items-center z-20`}>
                <div className="flex flex-col">
                    <span className={`text-${theme}-500 text-sm font-bold tracking-wider`}>{config.label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{config.id} // CAM_FEED_PROTOCOL_V2</span>
                </div>
                <div className="flex items-center space-x-2">
                     {config.status === 'ONLINE' ? (
                         <div className="flex items-center space-x-1">
                             <Signal size={12} className={`text-${theme}-500`} />
                             <span className={`text-xs text-${theme}-500 font-bold`}>LIVE</span>
                         </div>
                     ) : (
                         <span className="text-xs text-red-600 font-bold animate-pulse">OFFLINE</span>
                     )}
                </div>
            </div>

            {isSelected && (
                <>
                    <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-${theme}-500 pointer-events-none z-30`}></div>
                    <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-${theme}-500 pointer-events-none z-30`}></div>
                    <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-${theme}-500 pointer-events-none z-30`}></div>
                    <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-${theme}-500 pointer-events-none z-30`}></div>
                </>
            )}

            {config.scanlinesEnabled && (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
            )}
            
            {config.crtRollEnabled && config.status === 'ONLINE' && (
                <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden opacity-30">
                     <div className="w-full h-16 bg-white/20 blur-md absolute top-[-10%] animate-[scan_3s_linear_infinite]"></div>
                </div>
            )}

            {glitch && <div className={`absolute inset-0 bg-${theme}-500/10 mix-blend-color-dodge z-30`}></div>}
            {glitch && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-2 bg-white/50 z-40"></div>}
            
            <style>{`
                @keyframes scan {
                    0% { top: -10%; }
                    100% { top: 110%; }
                }
            `}</style>
        </div>
    );
}

// --- Main Component ---
interface SurveillanceProps {
    theme?: ThemeColor;
    onThemeChange?: (theme: ThemeColor) => void;
}

const Surveillance: React.FC<SurveillanceProps> = ({ theme = 'green', onThemeChange }) => {
    // State
    const [cams, setCams] = useState<CameraConfig[]>(DEFAULT_CAMS);
    const [selectedId, setSelectedId] = useState<string>('CAM_01');
    const [accessState, setAccessState] = useState<AccessState>('SETUP');
    const [hackProgress, setHackProgress] = useState(0);
    const [hackLogs, setHackLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<ConfigTab>('SOURCE');
    const [gridCols, setGridCols] = useState<GridSize>(3);
    
    const [confirmRestore, setConfirmRestore] = useState(false);
    
    // Mini-Terminal State
    const [terminalLogs, setTerminalLogs] = useState<string[]>(['> CINEHACK CCTV CONTROLLER V4.0', '> TYPE "HELP" FOR COMMANDS']);
    const [termInput, setTermInput] = useState('');
    const termEndRef = useRef<HTMLDivElement>(null);
    const [termProcess, setTermProcess] = useState<TermProcess | null>(null);
    const [accessDialog, setAccessDialog] = useState<{show: boolean, target: string}>({show: false, target: ''});

    // Config Panel State
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeCam = cams.find(c => c.id === selectedId) || cams[0];

    // --- Access Hacking Sequence (Initial Load) ---
    useEffect(() => {
        if (accessState === 'HACKING') {
            let step = 0;
            const interval = setInterval(() => {
                if (step >= HACK_SEQUENCE_LOGS.length) {
                    clearInterval(interval);
                    SoundManager.play('success');
                    setAccessState('GRANTED');
                } else {
                    setHackLogs(prev => [...prev, HACK_SEQUENCE_LOGS[step]]);
                    setHackProgress(((step + 1) / HACK_SEQUENCE_LOGS.length) * 100);
                    SoundManager.play('type');
                    step++;
                }
            }, 300); // Speed of hack logs
            return () => clearInterval(interval);
        }
    }, [accessState]);

    // --- Mini-Terminal Process Simulation ---
    useEffect(() => {
        if (!termProcess || termProcess.status === 'SUCCESS') return;

        const interval = setInterval(() => {
            setTermProcess(prev => {
                if (!prev) return null;
                let next = { ...prev };

                // 1. FAILED State Dwell Logic
                if (next.status === 'FAILED') {
                    if (next.timer > 0) {
                        next.timer--;
                        return next;
                    } else {
                        // Switch to Override
                        next.status = 'OVERRIDE';
                        next.logs.push('INITIATING OVERRIDE PROTOCOL...');
                        SoundManager.play('type');
                        return next;
                    }
                }

                // 2. Progress
                let speed = Math.random() * 2;
                if (next.status === 'OVERRIDE') speed = Math.random() * 5;
                next.progress += speed;

                // 3. Trigger Random Failure (Phase 2)
                if (!next.failTriggered && next.progress > 60 && next.progress < 70) {
                    if (Math.random() > 0.3) {
                        next.status = 'FAILED';
                        next.timer = 15; // 1.5s delay
                        next.failTriggered = true;
                        next.logs.push('! FIREWALL DETECTED: PORT 554 BLOCKED');
                        next.logs.push('! CONNECTION REFUSED');
                        SoundManager.play('error');
                        return next;
                    } else {
                        next.failTriggered = true;
                    }
                }

                // 4. Logs
                if (Math.random() > 0.8) {
                    if (next.status === 'RUNNING') next.logs.push(`Injecting packet 0x${Math.floor(Math.random()*999).toString(16)}...`);
                    if (next.status === 'OVERRIDE') next.logs.push(`Bypassing Sector ${Math.floor(Math.random()*9)}... OK`);
                }

                // 5. Completion
                if (next.progress >= 100) {
                    next.progress = 100;
                    next.status = 'SUCCESS';
                    next.logs.push('ACCESS GRANTED.');
                    SoundManager.play('success');
                    
                    // Trigger Overlay
                    setAccessDialog({ show: true, target: next.target });
                    
                    // Actual Logic: Enable Camera
                    setCams(current => current.map(c => c.id === next.target ? { ...c, status: 'ONLINE' } : c));
                    
                    // Clear after delay
                    setTimeout(() => {
                        setTermProcess(null);
                        setTerminalLogs(l => [...l, `> HACK ${next.target}: SUCCESS`]);
                    }, 2000);
                }

                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [termProcess]);

    // Terminal Auto-scroll
    useEffect(() => {
        if (activeTab === 'TERMINAL') {
             termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLogs, activeTab, termProcess]);

    // Load Persistence
    useEffect(() => {
        const saved = localStorage.getItem('cinehack_cctv_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const sanitized = parsed.map((cam: CameraConfig, index: number) => ({
                    ...DEFAULT_CAMS[index],
                    ...cam,
                    glitchEnabled: cam.glitchEnabled ?? true,
                    scanlinesEnabled: cam.scanlinesEnabled ?? true,
                    crtRollEnabled: cam.crtRollEnabled ?? false,
                    url: cam.url.startsWith('blob:') ? '' : cam.url, // Clear expired blobs
                    type: cam.url.startsWith('blob:') ? 'simulation' : cam.type
                }));
                setCams(sanitized);
            } catch(e) {}
        }
    }, []);

    // Save Persistence
    const updateCam = (updated: CameraConfig) => {
        const newCams = cams.map(c => c.id === updated.id ? updated : c);
        setCams(newCams);
        const toSave = newCams.map(c => ({
            ...c,
            url: c.url.startsWith('blob:') ? '' : c.url,
            type: c.url.startsWith('blob:') ? 'simulation' : c.type
        }));
        localStorage.setItem('cinehack_cctv_config', JSON.stringify(toSave));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';
            const current = cams.find(c => c.id === selectedId);
            if (current) {
                updateCam({ ...current, type, url });
                SoundManager.play('static');
            }
        }
    };

    const handleRestoreAll = () => {
        if (confirmRestore) {
            // Execute Restore
            setCams(prev => prev.map(c => ({
                ...c,
                status: 'ONLINE',
                type: 'simulation',
                // url: ''
            })));
            SoundManager.play('success');
            setConfirmRestore(false);
        } else {
            // Request Confirmation
            SoundManager.play('click');
            setConfirmRestore(true);
            setTimeout(() => setConfirmRestore(false), 3000); // Timeout confirmation
        }
    };

    const handleTerminalCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            SoundManager.play('type');
            const cmd = termInput.trim().toUpperCase();
            if (!cmd) return;

            const args = cmd.split(' ');
            const command = args[0];
            const logs = [`USER@CCTV:~$ ${cmd}`];

            switch(command) {
                case 'HELP':
                    logs.push(' AVAILABLE COMMANDS:');
                    logs.push('  HACK [ID]         - INITIATE OVERRIDE SEQUENCE');
                    logs.push('  SELECT [ID]       - SWITCH CAMERA');
                    logs.push('  STATUS [ON/OFF]   - SET STATUS OF SELECTED');
                    logs.push('  REC [ON/OFF]      - TOGGLE RECORDING SELECTED');
                    logs.push('  FILTER [TYPE]     - COLOR/GRAY/NV/INVERT');
                    logs.push('  LABEL [TEXT]      - RENAME SELECTED');
                    logs.push('  LIST              - SHOW ACTIVE NODES');
                    logs.push('  CLEAR             - CLEAR SCREEN');
                    break;
                case 'LIST':
                    cams.forEach(c => logs.push(`  ${c.id} [${c.status}] - ${c.label}`));
                    break;
                case 'HACK':
                    if (args[1]) {
                        const target = cams.find(c => c.id === args[1] || c.id === `CAM_${args[1]}`);
                        if (target) {
                            setTermProcess({
                                target: target.id,
                                progress: 0,
                                status: 'RUNNING',
                                logs: ['INITIATING HANDSHAKE...', `TARGETING ${target.id}...`],
                                timer: 0,
                                failTriggered: false
                            });
                            // Don't add text logs immediately, the UI switches
                        } else {
                            logs.push(`! ERROR: TARGET ${args[1]} NOT FOUND`);
                            SoundManager.play('error');
                        }
                    } else {
                        logs.push('! USAGE: HACK [ID]');
                    }
                    break;
                case 'SELECT':
                    if (args[1]) {
                        const target = cams.find(c => c.id === args[1] || c.id === `CAM_${args[1]}`);
                        if (target) {
                            setSelectedId(target.id);
                            logs.push(`> SWITCHING TO FEED ${target.id}... OK`);
                            SoundManager.play('click');
                        } else {
                            logs.push(`! ERROR: NODE ${args[1]} NOT FOUND`);
                            SoundManager.play('error');
                        }
                    }
                    break;
                case 'STATUS':
                    if (args[1] === 'ON') {
                        updateCam({...activeCam, status: 'ONLINE'});
                        logs.push(`> ${activeCam.id} STATUS SET TO ONLINE`);
                        SoundManager.play('success');
                    } else if (args[1] === 'OFF') {
                        updateCam({...activeCam, status: 'OFFLINE'});
                        logs.push(`> ${activeCam.id} STATUS SET TO OFFLINE`);
                        SoundManager.play('error');
                    } else {
                        logs.push('! USAGE: STATUS [ON/OFF]');
                    }
                    break;
                case 'REC':
                    if (args[1] === 'ON') {
                        updateCam({...activeCam, recording: true});
                        logs.push(`> ${activeCam.id} RECORDING STARTED`);
                    } else if (args[1] === 'OFF') {
                        updateCam({...activeCam, recording: false});
                        logs.push(`> ${activeCam.id} RECORDING STOPPED`);
                    }
                    break;
                case 'FILTER':
                    const filterMap: Record<string, FeedFilter> = {'GRAY': 'grayscale', 'NV': 'night_vision', 'COLOR': 'color', 'INVERT': 'invert'};
                    if (filterMap[args[1]]) {
                         updateCam({...activeCam, filter: filterMap[args[1]]});
                         logs.push(`> FILTER APPLIED: ${args[1]}`);
                         SoundManager.play('scan');
                    } else {
                        logs.push('! INVALID FILTER. USE: GRAY, NV, COLOR, INVERT');
                    }
                    break;
                case 'LABEL':
                    if (args[1]) {
                        const newLabel = args.slice(1).join('_').toUpperCase();
                        updateCam({...activeCam, label: newLabel});
                        logs.push(`> LABEL UPDATED TO ${newLabel}`);
                    }
                    break;
                case 'CLEAR':
                    setTerminalLogs([]);
                    setTermInput('');
                    return; // exit early to avoid adding logs to cleared screen
                default:
                    logs.push(`! UNKNOWN COMMAND: ${command}`);
                    SoundManager.play('error');
            }

            setTerminalLogs(prev => [...prev, ...logs]);
            setTermInput('');
        }
    };

    // --- Render: BIOS SETUP ---
    if (accessState === 'SETUP') {
        return (
            <div className={`h-full w-full bg-black font-mono p-4 md:p-8 overflow-y-auto text-${theme}-500`}>
                <div className={`max-w-6xl mx-auto border border-${theme}-900 p-4 md:p-8 box-glow min-h-full flex flex-col`}>
                    {/* Bios Header */}
                    <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-${theme}-800 pb-4 mb-8`}>
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-xl md:text-3xl font-bold tracking-widest text-white">CINEHACK BIOS UTILITY</h1>
                            <p className="text-xs opacity-70">VER 4.0.2 // BUILD 2024.11.02 // SYSTEM CONFIGURATION</p>
                        </div>
                        <div className="text-right w-full md:w-auto">
                             <div className="text-xs">MEMORY CHECK: OK</div>
                             <div className="text-xs">PERIPHERALS: 9 DETECTED</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <button 
                            onClick={() => setCams(prev => prev.map(c => ({...c, type: 'simulation'})))}
                            className={`border border-${theme}-800 p-3 hover:bg-${theme}-900/20 flex flex-col items-center justify-center text-xs text-center`}
                        >
                            <RefreshCw className="mb-2" /> SET ALL SIMULATION
                        </button>
                        <button 
                            onClick={() => setCams(prev => prev.map(c => ({...c, type: 'webcam'})))}
                            className={`border border-${theme}-800 p-3 hover:bg-${theme}-900/20 flex flex-col items-center justify-center text-xs text-center`}
                        >
                            <Camera className="mb-2" /> SET ALL WEBCAM
                        </button>
                        <button 
                             onClick={() => setCams(prev => prev.map(c => ({...c, status: 'ONLINE'})))}
                             className={`border border-${theme}-800 p-3 hover:bg-${theme}-900/20 flex flex-col items-center justify-center text-xs text-center`}
                        >
                            <Activity className="mb-2" /> FORCE ONLINE ALL
                        </button>
                        <button 
                            onClick={() => setCams(prev => prev.map(c => ({...c, recording: true})))}
                            className={`border border-${theme}-800 p-3 hover:bg-${theme}-900/20 flex flex-col items-center justify-center text-xs text-center`}
                        >
                             <Disc className="mb-2" /> ENABLE REC ALL
                        </button>
                    </div>

                    {/* Camera Table */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className={`border-b border-${theme}-800 text-xs`}>
                                    <th className="p-2">ID</th>
                                    <th className="p-2">LABEL</th>
                                    <th className="p-2">TYPE</th>
                                    <th className="p-2">STATUS</th>
                                    <th className="p-2">ASSET SOURCE</th>
                                    <th className="p-2">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {cams.map((cam) => (
                                    <tr key={cam.id} className={`border-b border-${theme}-900/50 hover:bg-${theme}-900/10`}>
                                        <td className="p-2 font-bold">{cam.id}</td>
                                        <td className="p-2">
                                            <input 
                                                value={cam.label}
                                                onChange={(e) => updateCam({...cam, label: e.target.value.toUpperCase()})}
                                                className={`bg-transparent border-b border-${theme}-900 outline-none w-24 md:w-32 focus:border-${theme}-500`}
                                            />
                                        </td>
                                        <td className="p-2 uppercase">{cam.type}</td>
                                        <td className={`p-2 font-bold ${cam.status === 'ONLINE' ? `text-${theme}-400` : 'text-red-500'}`}>{cam.status}</td>
                                        <td className="p-2 opacity-70 truncate max-w-[150px] md:max-w-[200px]">
                                            {cam.url ? (cam.url.startsWith('blob:') ? 'LOCAL_FILE_BOUND' : cam.url) : 'DEFAULT'}
                                        </td>
                                        <td className="p-2 flex space-x-2">
                                            <button 
                                                onClick={() => { setSelectedId(cam.id); fileInputRef.current?.click(); }}
                                                className={`p-1 border border-${theme}-800 hover:text-white`}
                                                title="Upload File"
                                            >
                                                <Upload size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => updateCam({...cam, type: cam.type === 'simulation' ? 'webcam' : 'simulation'})}
                                                className={`p-1 border border-${theme}-800 hover:text-white`}
                                                title="Toggle Type"
                                            >
                                                <RefreshCw size={14}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Hidden File Input for Table Actions */}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*,video/*"/>
                    </div>

                    {/* Footer Actions */}
                    <div className={`mt-8 border-t-2 border-${theme}-800 pt-4 flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4`}>
                        <button 
                            onClick={() => {
                                // Save current config as default?
                                localStorage.removeItem('cinehack_cctv_config');
                                setCams(DEFAULT_CAMS);
                                SoundManager.play('refresh');
                            }}
                             className={`px-6 py-3 border border-red-900 text-red-500 hover:bg-red-900/20 font-bold tracking-wider text-center`}
                        >
                            FACTORY RESET
                        </button>
                        <button 
                            onClick={() => {
                                SoundManager.play('success');
                                setAccessState('LOCKED');
                            }}
                            className={`px-8 py-3 bg-${theme}-600 text-black font-bold tracking-wider hover:bg-${theme}-500 shadow-[0_0_20px_rgba(0,255,0,0.3)] animate-pulse text-center`}
                        >
                            INITIALIZE SYSTEM &gt;&gt;
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- Render Hacking Screen (LOCKED / HACKING) ---
    if (accessState !== 'GRANTED') {
        return (
            <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 font-mono relative overflow-hidden">
                {/* Background Noise */}
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_pattern_with_intensity_gradient.png')] opacity-10 mix-blend-overlay animate-[flicker_0.1s_infinite]"></div>
                
                <div className="max-w-md w-full z-10">
                    <div className="flex items-center text-red-600 mb-6 animate-pulse justify-center md:justify-start">
                        <Lock className="w-12 h-12 mr-4" />
                        <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-glow-red">ACCESS DENIED</h1>
                    </div>
                    
                    <div className={`bg-black border border-${theme}-800 p-4 min-h-[300px] flex flex-col box-glow relative`}>
                        <div className={`absolute top-0 left-0 w-full h-1 bg-${theme}-500 animate-[loading_2s_ease-in-out_infinite]`}></div>
                        <div className={`flex-1 overflow-hidden text-xs text-${theme}-500 space-y-1 font-mono`}>
                            {accessState === 'LOCKED' && (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                     <div className="text-center text-red-500 font-bold">FIREWALL: ACTIVE<br/>PORT 443: CLOSED</div>
                                     <button 
                                        onClick={() => {
                                            SoundManager.play('lock');
                                            setAccessState('HACKING');
                                        }}
                                        className={`px-4 py-2 border border-${theme}-500 text-${theme}-400 hover:bg-${theme}-900/30 animate-pulse`}
                                     >
                                         INITIATE OVERRIDE SEQUENCE
                                     </button>
                                </div>
                            )}

                            {accessState === 'HACKING' && hackLogs.map((log, i) => (
                                <div key={i} className="flex">
                                    <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    <span className={`text-${theme}-400`}>&gt; {log}</span>
                                </div>
                            ))}
                            {accessState === 'HACKING' && <div className="animate-pulse">_</div>}
                        </div>
                    </div>

                    {accessState === 'HACKING' && (
                        <div className="mt-4">
                            <div className={`flex justify-between text-xs text-${theme}-600 mb-1`}>
                                <span>BRUTE FORCE PROGRESS</span>
                                <span>{Math.floor(hackProgress)}%</span>
                            </div>
                            <div className={`w-full h-2 bg-gray-900 rounded overflow-hidden border border-${theme}-900`}>
                                <div className={`h-full bg-${theme}-500 transition-all duration-300`} style={{ width: `${hackProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Render Main Interface ---
    return (
        <div className={`flex flex-col lg:flex-row h-full gap-0 lg:gap-px bg-${theme}-900/20 overflow-hidden relative`}>
            
            {/* --- ACCESS GRANTED OVERLAY --- */}
            {accessDialog.show && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`bg-black border-2 border-${theme}-500 p-8 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-sm w-full relative overflow-hidden mx-4`}>
                        <div className={`absolute top-0 w-full h-1 bg-${theme}-500 animate-[loading_1s_ease-in-out_infinite]`}></div>
                        <CheckCircle size={64} className={`text-${theme}-500 mb-4 animate-[bounce_0.5s_ease-out]`} />
                        <h2 className={`text-2xl md:text-3xl font-bold text-${theme}-500 tracking-widest mb-1 text-center`}>ACCESS GRANTED</h2>
                        <div className={`text-${theme}-700 font-mono text-sm mb-6`}>{accessDialog.target} UNLOCKED</div>
                        
                        <div className="w-full bg-gray-900 border border-gray-800 p-2 font-mono text-[10px] text-gray-400 mb-4">
                            <div>&gt; UPDATING PERMISSIONS... OK</div>
                            <div>&gt; DISABLING ALARM... OK</div>
                            <div>&gt; BYPASSING PROXY... OK</div>
                        </div>

                        <button 
                            onClick={() => setAccessDialog({show: false, target: ''})}
                            className={`px-6 py-2 bg-${theme}-600 hover:bg-${theme}-500 text-black font-bold uppercase tracking-wider w-full`}
                        >
                            PROCEED TO FEED
                        </button>
                    </div>
                </div>
            )}

            {/* LEFT: FEED GRID (Takes remaining space on mobile, scrolls) */}
            <div className={`flex-1 bg-black p-2 md:p-4 grid gap-2 md:gap-4 overflow-y-auto content-start min-h-[50%] lg:min-h-0
                ${gridCols === 1 ? 'grid-cols-1' : ''}
                ${gridCols === 2 ? 'grid-cols-2' : ''}
                ${gridCols === 3 ? 'grid-cols-2 lg:grid-cols-3' : ''}
            `}>
                {cams.map((cam) => (
                    <div key={cam.id} className="aspect-video relative shadow-lg">
                        <CameraFeed 
                            config={cam} 
                            isSelected={selectedId === cam.id}
                            onClick={() => setSelectedId(cam.id)}
                            theme={theme}
                        />
                    </div>
                ))}
            </div>

            {/* RIGHT: SIDEBAR (Stack on mobile, Fixed width on desktop) */}
            <div className={`w-full lg:w-96 bg-black border-l lg:border-l border-t lg:border-t-0 border-${theme}-800 flex flex-col font-mono relative z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.5)] h-[50vh] lg:h-full max-h-full`}>
                
                {/* 1. Header (Fixed) */}
                <div className={`p-3 border-b border-${theme}-800 bg-${theme}-900/10 flex items-center justify-between flex-none`}>
                    <div className={`flex items-center space-x-2 text-${theme}-400`}>
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="font-bold tracking-widest text-sm">C2_SERVER</span>
                    </div>
                    <div className="flex space-x-2">
                         {/* Grid Controls */}
                        <div className={`flex bg-black border border-${theme}-800 rounded`}>
                            <button onClick={() => setGridCols(1)} className={`p-1 ${gridCols === 1 ? `text-${theme}-400 bg-${theme}-900/40` : 'text-gray-600'}`}><Maximize size={12}/></button>
                            <button onClick={() => setGridCols(2)} className={`p-1 ${gridCols === 2 ? `text-${theme}-400 bg-${theme}-900/40` : 'text-gray-600'}`}><LayoutGrid size={12}/></button>
                            <button onClick={() => setGridCols(3)} className={`p-1 ${gridCols === 3 ? `text-${theme}-400 bg-${theme}-900/40` : 'text-gray-600'}`}><Grid size={12}/></button>
                        </div>
                    </div>
                </div>

                {/* 2. Camera List (Flex Grow - Takes available space) */}
                <div className={`flex-1 overflow-y-auto min-h-0 bg-black/50 scrollbar-thin scrollbar-thumb-${theme}-900 scrollbar-track-black p-2`}>
                    <div className={`text-[10px] text-gray-500 mb-2 font-bold px-2 sticky top-0 bg-black/90 z-10 py-1 border-b border-${theme}-900/30`}>ACTIVE NODES ({cams.length})</div>
                    <div className="space-y-1">
                        {cams.map(cam => (
                            <button
                                key={cam.id}
                                onClick={() => { setSelectedId(cam.id); SoundManager.play('click'); }}
                                className={`w-full flex items-center justify-between p-3 rounded text-xs border transition-all duration-200
                                    ${selectedId === cam.id 
                                        ? `bg-${theme}-900/30 border-${theme}-500 text-${theme}-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]` 
                                        : `border-${theme}-900/10 text-gray-500 hover:bg-${theme}-900/10 hover:text-${theme}-600`}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${cam.recording && cam.status === 'ONLINE' ? 'bg-red-500 animate-pulse' : (cam.status === 'ONLINE' ? `bg-${theme}-600` : 'bg-gray-600')}`}></div>
                                    <span className="font-bold">{cam.id}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="opacity-70 text-[10px]">{cam.label}</span>
                                    <span className={`text-[9px] font-bold ${cam.status === 'ONLINE' ? `text-${theme}-600` : 'text-red-500'}`}>{cam.status}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Configuration Panel (Fixed at Bottom, Max Height on Mobile) */}
                <div className={`flex-none bg-black border-t-2 border-${theme}-800 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] flex flex-col max-h-[40vh]`}>
                    {/* Panel Header */}
                    <div className={`flex items-center justify-between px-3 py-2 text-${theme}-500 border-b border-${theme}-800/50 bg-${theme}-900/5 flex-none`}>
                        <span className="font-bold text-xs tracking-wider flex items-center">
                            <Settings className="w-3 h-3 mr-1" /> CONFIG // {selectedId}
                        </span>
                        <span className={`text-[10px] bg-${theme}-900/20 px-1 border border-${theme}-900`}>{activeCam.type.toUpperCase()}</span>
                    </div>

                    {/* Tabs */}
                    <div className={`flex border-b border-${theme}-800 flex-none`}>
                        <button 
                            onClick={() => { setActiveTab('SOURCE'); SoundManager.play('click'); }}
                            className={`flex-1 py-2 text-[10px] font-bold border-r border-${theme}-900/50 hover:bg-${theme}-900/10 flex items-center justify-center space-x-1 transition-colors
                                ${activeTab === 'SOURCE' ? `bg-${theme}-900/30 text-${theme}-400 border-b-2 border-b-${theme}-500` : 'text-gray-600'}`}
                        >
                            <Signal size={12} /> <span className="hidden md:inline">SOURCE</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('OPTICS'); SoundManager.play('click'); }}
                            className={`flex-1 py-2 text-[10px] font-bold border-r border-${theme}-900/50 hover:bg-${theme}-900/10 flex items-center justify-center space-x-1 transition-colors
                                ${activeTab === 'OPTICS' ? `bg-${theme}-900/30 text-${theme}-400 border-b-2 border-b-${theme}-500` : 'text-gray-600'}`}
                        >
                            <Eye size={12} /> <span className="hidden md:inline">OPTICS</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('SYSTEM'); SoundManager.play('click'); }}
                            className={`flex-1 py-2 text-[10px] font-bold border-r border-${theme}-900/50 hover:bg-${theme}-900/10 flex items-center justify-center space-x-1 transition-colors
                                ${activeTab === 'SYSTEM' ? `bg-${theme}-900/30 text-${theme}-400 border-b-2 border-b-${theme}-500` : 'text-gray-600'}`}
                        >
                            <Cpu size={12} /> <span className="hidden md:inline">SYSTEM</span>
                        </button>
                         <button 
                            onClick={() => { setActiveTab('TERMINAL'); SoundManager.play('click'); }}
                            className={`flex-1 py-2 text-[10px] font-bold hover:bg-${theme}-900/10 flex items-center justify-center space-x-1 transition-colors
                                ${activeTab === 'TERMINAL' ? `bg-${theme}-900/30 text-${theme}-400 border-b-2 border-b-${theme}-500` : 'text-gray-600'}`}
                        >
                            <Command size={12} /> <span className="hidden md:inline">TERM</span>
                        </button>
                    </div>

                    {/* Tab Content - Fixed Height Area (Adjusted for mobile) */}
                    <div className="h-48 lg:h-48 overflow-y-auto p-4 space-y-4 bg-black relative flex-1">
                        
                        {/* SOURCE TAB */}
                        {activeTab === 'SOURCE' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'simulation', icon: RefreshCw, label: 'SIM' },
                                        { id: 'webcam', icon: Camera, label: 'CAM' },
                                        { id: 'image', icon: ImageIcon, label: 'IMG' },
                                        { id: 'video', icon: Video, label: 'VID' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => updateCam({ ...activeCam, type: opt.id as any })}
                                            className={`p-2 flex items-center space-x-2 justify-center border transition-all
                                                ${activeCam.type === opt.id 
                                                    ? `border-${theme}-500 bg-${theme}-900/30 text-${theme}-400 shadow-[0_0_10px_rgba(0,0,0,0.1)]` 
                                                    : `border-${theme}-900/30 text-gray-600 hover:border-${theme}-700 hover:text-${theme}-500`}`}
                                        >
                                            <opt.icon size={12} />
                                            <span className="text-[10px] font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {(activeCam.type === 'image' || activeCam.type === 'video') && (
                                    <div className="animate-in fade-in duration-300 space-y-2">
                                        <input 
                                            value={activeCam.url}
                                            onChange={(e) => updateCam({ ...activeCam, url: e.target.value })}
                                            placeholder="https://..."
                                            className={`w-full bg-black border border-${theme}-800 p-1.5 text-${theme}-400 text-xs outline-none focus:border-${theme}-500`}
                                        />
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*,video/*"/>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full border border-dashed border-${theme}-800 text-${theme}-600 text-[10px] py-1.5 hover:bg-${theme}-900/10 flex items-center justify-center space-x-2`}
                                        >
                                            <Upload size={12} /> <span>UPLOAD FILE</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OPTICS TAB */}
                        {activeTab === 'OPTICS' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    {['grayscale', 'night_vision', 'color', 'invert'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => updateCam({ ...activeCam, filter: f as any })}
                                            className={`text-[10px] border py-2 uppercase font-bold transition-all
                                                ${activeCam.filter === f 
                                                    ? `border-${theme}-500 bg-${theme}-900/20 text-${theme}-400` 
                                                    : `border-${theme}-900/30 text-gray-600 hover:border-${theme}-700`}`}
                                        >
                                            {f.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                {/* Glitch Toggle */}
                                <button 
                                    onClick={() => updateCam({ ...activeCam, glitchEnabled: !activeCam.glitchEnabled })}
                                    className={`w-full border py-2 text-xs flex items-center justify-center space-x-2 transition-all
                                        ${activeCam.glitchEnabled 
                                            ? `border-${theme}-500 text-${theme}-400 bg-${theme}-900/20` 
                                            : `border-${theme}-900/30 text-gray-600 hover:border-${theme}-700`}`}
                                >
                                    <Zap size={12} className={activeCam.glitchEnabled ? 'fill-current' : ''} />
                                    <span className="font-bold">{activeCam.glitchEnabled ? 'SIGNAL INTERFERENCE: ON' : 'SIGNAL INTERFERENCE: OFF'}</span>
                                </button>
                                
                                {/* Scanlines & CRT Roll Toggles */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => updateCam({ ...activeCam, scanlinesEnabled: !activeCam.scanlinesEnabled })}
                                        className={`border py-2 text-xs flex items-center justify-center space-x-2 transition-all
                                            ${activeCam.scanlinesEnabled 
                                                ? `border-${theme}-500 text-${theme}-400 bg-${theme}-900/20` 
                                                : `border-${theme}-900/30 text-gray-600 hover:border-${theme}-700`}`}
                                    >
                                        <Grid size={12} className={activeCam.scanlinesEnabled ? 'opacity-100' : 'opacity-50'} />
                                        <span className="font-bold">SCANLINES</span>
                                    </button>
                                    <button 
                                        onClick={() => updateCam({ ...activeCam, crtRollEnabled: !activeCam.crtRollEnabled })}
                                        className={`border py-2 text-xs flex items-center justify-center space-x-2 transition-all
                                            ${activeCam.crtRollEnabled 
                                                ? `border-${theme}-500 text-${theme}-400 bg-${theme}-900/20` 
                                                : `border-${theme}-900/30 text-gray-600 hover:border-${theme}-700`}`}
                                    >
                                        <Waves size={12} className={activeCam.crtRollEnabled ? 'opacity-100' : 'opacity-50'} />
                                        <span className="font-bold">CRT ROLL</span>
                                    </button>
                                </div>

                                <div className={`p-2 border border-${theme}-900/30 bg-${theme}-900/5`}>
                                    <div className={`flex items-center text-${theme}-600 mb-1`}>
                                        <Sliders size={12} className="mr-2" />
                                        <span className="text-[10px] font-bold">SIGNAL NOISE</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                                        <div className={`h-full bg-${theme}-500/50 w-[85%] animate-pulse`}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SYSTEM TAB */}
                        {activeTab === 'SYSTEM' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
                                <div>
                                    <label className={`text-[9px] text-${theme}-700 block mb-1 font-bold`}>LABEL ASSIGNMENT</label>
                                    <input 
                                        value={activeCam.label}
                                        onChange={(e) => updateCam({ ...activeCam, label: e.target.value.toUpperCase() })}
                                        className={`w-full bg-black border border-${theme}-800 p-1.5 text-${theme}-400 text-xs focus:border-${theme}-500 outline-none`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => updateCam({ ...activeCam, recording: !activeCam.recording })}
                                        className={`border py-2 text-xs flex items-center justify-center space-x-2 transition-all
                                            ${activeCam.recording 
                                                ? 'border-red-500 text-red-500 bg-red-900/10' 
                                                : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activeCam.recording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                        <span className="font-bold">{activeCam.recording ? 'REC ON' : 'REC OFF'}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => updateCam({ ...activeCam, status: activeCam.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' })}
                                        className={`border py-2 text-xs font-bold transition-all
                                            ${activeCam.status === 'ONLINE'
                                                ? `border-${theme}-800 text-${theme}-500 hover:bg-${theme}-900/20`
                                                : 'border-red-900 text-red-500 bg-red-900/10'}`}
                                    >
                                        {activeCam.status === 'ONLINE' ? 'KILL FEED' : 'RESTORE'}
                                    </button>
                                </div>

                                 <button 
                                    onClick={() => {
                                        SoundManager.play('click');
                                        setAccessState('SETUP');
                                    }}
                                    className={`w-full border py-2 text-xs font-bold transition-all border-${theme}-800 text-${theme}-500 hover:bg-${theme}-900/20 flex items-center justify-center`}
                                >
                                   <Power size={12} className="mr-2" /> REBOOT TO BIOS
                                </button>
                                
                                {/* Theme Selector */}
                                <div>
                                    <label className={`text-[9px] text-${theme}-700 block mb-1 font-bold flex items-center`}>
                                        <Palette size={10} className="mr-1"/> UI THEME COLOR
                                    </label>
                                    <div className="grid grid-cols-6 gap-1">
                                        {(['green', 'cyan', 'amber', 'violet', 'rose', 'gray'] as ThemeColor[]).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => { onThemeChange && onThemeChange(t); SoundManager.play('click'); }}
                                                className={`h-6 w-full border ${theme === t ? 'border-white scale-90' : 'border-transparent'} transition-all`}
                                                style={{ backgroundColor: t === 'green' ? '#22c55e' : t === 'cyan' ? '#06b6d4' : t === 'amber' ? '#f59e0b' : t === 'violet' ? '#8b5cf6' : t === 'rose' ? '#f43f5e' : '#9ca3af' }}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TERMINAL TAB */}
                        {activeTab === 'TERMINAL' && (
                             <div className="h-full flex flex-col font-mono text-xs bg-black p-1 animate-in fade-in slide-in-from-right-4 duration-200 relative">
                                {/* Hacking Process Overlay */}
                                {termProcess && termProcess.status !== 'SUCCESS' && (
                                    <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-4">
                                        <div className={`text-${termProcess.status === 'FAILED' ? 'red' : (termProcess.status === 'OVERRIDE' ? 'amber' : theme)}-500 font-bold mb-2 animate-pulse text-center`}>
                                            {termProcess.status === 'FAILED' ? 'ACCESS DENIED' : (termProcess.status === 'OVERRIDE' ? 'BRUTE FORCE OVERRIDE' : 'HACKING IN PROGRESS')}
                                        </div>
                                        
                                        {/* Status Icon */}
                                        <div className="mb-2">
                                            {termProcess.status === 'FAILED' ? <XCircle size={32} className="text-red-500 animate-pulse"/> : 
                                             termProcess.status === 'OVERRIDE' ? <ShieldAlert size={32} className="text-amber-500 animate-spin"/> :
                                             <div className={`w-8 h-8 rounded-full border-2 border-t-transparent border-${theme}-500 animate-spin`}></div>}
                                        </div>

                                        <div className="w-full h-2 bg-gray-900 border border-gray-700 mb-2">
                                            <div 
                                                className={`h-full transition-all duration-100 ${termProcess.status === 'FAILED' ? 'bg-red-500' : (termProcess.status === 'OVERRIDE' ? 'bg-amber-500' : `bg-${theme}-500`)}`}
                                                style={{ width: `${termProcess.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-[9px] text-gray-500 font-mono self-start h-12 overflow-hidden w-full">
                                            {termProcess.logs.slice(-3).map((l, i) => <div key={i} className="truncate">&gt; {l}</div>)}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto space-y-1 mb-2">
                                    {terminalLogs.map((log, i) => (
                                        <div key={i} className={`break-words ${log.startsWith('!') ? 'text-red-500' : (log.startsWith('>') ? `text-${theme}-500` : 'text-gray-500')}`}>
                                            {log}
                                        </div>
                                    ))}
                                    <div ref={termEndRef}></div>
                                </div>
                                <div className="flex items-center border-t border-gray-800 pt-1 flex-none">
                                    <span className={`text-${theme}-500 mr-2`}>#</span>
                                    <input 
                                        type="text"
                                        value={termInput}
                                        onChange={(e) => setTermInput(e.target.value)}
                                        onKeyDown={handleTerminalCommand}
                                        disabled={!!termProcess && termProcess.status !== 'SUCCESS'}
                                        placeholder="ENTER CMD..."
                                        className={`flex-1 bg-transparent outline-none text-${theme}-400 placeholder-gray-800 disabled:opacity-50`}
                                        autoFocus
                                    />
                                </div>
                             </div>
                        )}
                    </div>

                    {/* Global Actions Footer */}
                    <div className={`bg-black border-t border-${theme}-800 p-2 grid grid-cols-4 gap-1 flex-none`}>
                        <button 
                            onClick={() => {
                                setCams(prev => prev.map(c => ({...c, recording: true})));
                                SoundManager.play('success');
                            }}
                            className="flex items-center justify-center p-1.5 bg-red-900/10 border border-red-900/30 text-red-500 hover:bg-red-900/30 text-[9px] transition-colors"
                        >
                            <Radio size={12} className="mr-1 hidden sm:inline" /> REC ALL
                        </button>
                        <button 
                             onClick={() => {
                                setCams(prev => prev.map(c => ({...c, filter: 'grayscale'})));
                                SoundManager.play('scan');
                            }}
                            className={`flex items-center justify-center p-1.5 bg-${theme}-900/10 border border-${theme}-900/30 text-${theme}-500 hover:bg-${theme}-900/30 text-[9px] transition-colors`}
                        >
                            <Eye size={12} className="mr-1 hidden sm:inline" /> GRAY ALL
                        </button>
                         <button 
                            onClick={handleRestoreAll}
                            className={`flex items-center justify-center p-1.5 border text-[9px] transition-all duration-200 font-bold
                                ${confirmRestore 
                                    ? 'bg-amber-900/20 border-amber-500 text-amber-500 animate-pulse' 
                                    : `bg-${theme}-900/10 border-${theme}-900/30 text-${theme}-500 hover:bg-${theme}-900/30`
                                }`}
                        >
                            <ArchiveRestore size={12} className="mr-1 hidden sm:inline" /> {confirmRestore ? 'CONFIRM?' : 'RESTORE'}
                        </button>
                        <button 
                            onClick={() => {
                                setCams(prev => prev.map(c => ({...c, status: 'OFFLINE'})));
                                SoundManager.play('error');
                            }}
                            className="flex items-center justify-center p-1.5 bg-yellow-900/10 border border-yellow-900/30 text-yellow-500 hover:bg-yellow-900/30 text-[9px] transition-colors"
                        >
                            <AlertTriangle size={12} className="mr-1 hidden sm:inline" /> KILL ALL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Surveillance;
