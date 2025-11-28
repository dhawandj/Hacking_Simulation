
import React, { useState, useEffect, useRef } from 'react';
import { TERMINAL_COMMANDS } from '../constants';
import { LogEntry, ThemeColor } from '../types';
import { SoundManager } from '../utils/SoundManager';
import { 
    Shield, Wifi, Cpu, Lock, Terminal as TerminalIcon, 
    AlertTriangle, Download, CheckCircle, Smartphone, Eye, Radio, XCircle, Unlock
} from 'lucide-react';

const ASCII_ART = `
  ██╗  ██╗ █████╗ ██╗     ██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
  ██║ ██╔╝██╔══██╗██║     ██║    ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝
  █████╔╝ ███████║██║     ██║    ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝ 
  ██╔═██╗ ██╔══██║██║     ██║    ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗ 
  ██║  ██╗██║  ██║███████╗██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝
     KALI LINUX // KERNEL v6.8.0 // PENETRATION SUITE
`;

// --- Matrix Rain Component ---
const MatrixRain: React.FC<{ onExit: () => void; theme: ThemeColor }> = ({ onExit, theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops: number[] = Array(Math.floor(columns)).fill(1);

        const getColor = () => {
             switch(theme) {
                 case 'rose': return '#ef4444';
                 case 'cyan': return '#06b6d4';
                 case 'amber': return '#f59e0b';
                 case 'violet': return '#8b5cf6';
                 case 'gray': return '#ffffff';
                 default: return '#22c55e';
             }
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = getColor();
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleInteraction = () => {
            SoundManager.play('click');
            onExit();
        };
        
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('click', handleInteraction);

        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };
    }, [theme, onExit]);

    return (
        <div className="fixed inset-0 z-[100] bg-black cursor-pointer">
            <canvas ref={canvasRef} className="block" />
            <div className="absolute bottom-10 right-10 text-white/50 font-mono text-sm animate-pulse bg-black/50 px-2 rounded">
                PRESS ANY KEY TO EXIT
            </div>
        </div>
    );
};

interface TerminalWindowProps {
  theme?: ThemeColor;
}

// --- Types for Processes ---
type ProcessType = 'BRUTE_FORCE' | 'DOWNLOAD' | 'UPLOAD' | 'SIGNAL_OVERRIDE' | 'SIM_CLONE' | 'RTSP_INJECT';
type ProcessStatus = 'RUNNING' | 'FAILED' | 'OVERRIDE' | 'SUCCESS';

interface ActiveProcess {
    type: ProcessType;
    target: string;
    progress: number;
    details: string[];
    status: ProcessStatus;
    timer: number; // Used for dwell time in FAILED state
    failTriggered: boolean; // Ensures we only fail once per session
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error';
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ theme = 'green' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeProcess, setActiveProcess] = useState<ActiveProcess | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showMatrix, setShowMatrix] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Helper: Add Notification ---
  const notify = (title: string, message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, title, message, type }]);
      SoundManager.play(type === 'error' ? 'error' : 'scan');
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
  };

  // --- Helper: Add Log ---
  const addLog = (message: string, type: LogEntry['type'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  // --- Boot Sequence ---
  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    setLogs([]);

    const bootSequence = [
      { msg: ASCII_ART, type: 'SUCCESS', delay: 100 },
      { msg: "Initializing KALI LINUX environment...", type: 'INFO', delay: 800 },
      { msg: "Loading kernel modules... OK", type: 'INFO', delay: 1200 },
      { msg: "Mounting file systems... OK", type: 'INFO', delay: 1400 },
      { msg: "Bypassing biometric security... SUCCESS", type: 'WARN', delay: 2000 },
      { msg: "Establishing secure uplink to satellite... CONNECTED", type: 'SUCCESS', delay: 2800 },
      { msg: "Type 'help' for available commands.", type: 'INFO', delay: 3200 },
    ];

    bootSequence.forEach(({ msg, type, delay }) => {
      const t = setTimeout(() => {
        if (msg.includes('██')) {
             addLog(msg, type as any);
        } else {
             addLog(msg, type as any);
             SoundManager.play('type');
        }
      }, delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // --- Auto-scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeProcess]); 

  // --- Process Logic Engine ---
  useEffect(() => {
      if (!activeProcess || activeProcess.status === 'SUCCESS') return;

      const interval = setInterval(() => {
          setActiveProcess(prev => {
              if (!prev || prev.status === 'SUCCESS') {
                  clearInterval(interval);
                  return prev;
              }

              let next = { ...prev };

              // --- LOGIC FLOW ---

              // 1. Handle FAILED State Dwell Time
              if (prev.status === 'FAILED') {
                  if (prev.timer > 0) {
                      return { ...prev, timer: prev.timer - 1 };
                  } else {
                      // Timer expired, switch to OVERRIDE
                      SoundManager.play('type');
                      return { 
                          ...prev, 
                          status: 'OVERRIDE', 
                          details: [...prev.details, "INITIATING OVERRIDE PROTOCOL...", "BYPASSING FIREWALL RULES..."] 
                      };
                  }
              }

              // 2. Handle Progress Increment
              let speed = Math.random() * 2;
              if (prev.status === 'OVERRIDE') speed = Math.random() * 5; // Faster during override
              
              next.progress += speed;

              // 3. Trigger FAILURE Scenario (For RTSP_INJECT "Hack Camera")
              // Trigger around 60% if not yet triggered
              if (prev.type === 'RTSP_INJECT' && !prev.failTriggered && next.progress > 50 && next.progress < 70) {
                  // 70% chance to fail for drama
                  if (Math.random() > 0.3) {
                      SoundManager.play('error');
                      return {
                          ...prev,
                          status: 'FAILED',
                          timer: 20, // 2 seconds dwell (100ms interval)
                          failTriggered: true,
                          details: [...prev.details, "ERR_CONNECTION_REFUSED", "FIREWALL DETECTED: PORT 554 BLOCKED"]
                      };
                  } else {
                      // Mark as triggered so we don't check again
                      next.failTriggered = true; 
                  }
              }

              // 4. Update Logs based on Type
              if (Math.random() > 0.85) {
                  switch (prev.type) {
                      case 'BRUTE_FORCE':
                          next.details.push(`Trying: ${Math.random().toString(36).substring(7)}... FAIL`);
                          break;
                      case 'DOWNLOAD':
                          next.details.push(`Packet ${Math.floor(Math.random()*9999)} received...`);
                          break;
                      case 'RTSP_INJECT':
                          if (prev.status === 'OVERRIDE') {
                              next.details.push(`Injecting payload: 0x${Math.floor(Math.random()*999).toString(16)}... OK`);
                          } else {
                              next.details.push("Handshake acknowledged.");
                          }
                          break;
                       case 'SIGNAL_OVERRIDE':
                          next.details.push(`Frequency hopping: ${Math.floor(Math.random() * 500 + 2000)}MHz`);
                          break;
                       case 'SIM_CLONE':
                          next.details.push(`ICCID Sector ${Math.floor(Math.random() * 10)} decrypted.`);
                          break;
                  }
              }
              
              // 5. Completion Check
              if (next.progress >= 100) {
                  next.progress = 100;
                  next.status = 'SUCCESS';
                  clearInterval(interval);
                  SoundManager.play('success');
                  
                  // Post-completion actions
                  setTimeout(() => {
                      addLog(`PROCESS COMPLETE: ${prev.type}`, 'SUCCESS');
                      if (prev.type === 'BRUTE_FORCE') addLog(`PASSWORD FOUND: 'Tr0jan_H0rs3'`, 'SUCCESS');
                      if (prev.type === 'DOWNLOAD') addLog(`FILE SAVED: /root/downloads/${prev.target}`, 'SUCCESS');
                      if (prev.type === 'RTSP_INJECT') addLog(`ACCESS GRANTED: ${prev.target} [ADMIN]`, 'SUCCESS');
                      setActiveProcess(null);
                      notify('TASK COMPLETED', `${prev.type} finished successfully.`, 'success');
                  }, 4000); // 4 Seconds to show the SUCCESS Modal
              } else {
                  // Play typing sound occasionally
                  if (Math.floor(next.progress) % 10 === 0 && Math.floor(next.progress) !== Math.floor(prev.progress)) {
                      SoundManager.play('type');
                  }
              }

              return { ...next, details: next.details.slice(-4) };
          });
      }, 100);

      return () => clearInterval(interval);
  }, [activeProcess?.type, activeProcess?.status]); 

  // --- Command Processor ---
  const processCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    const args = command.split(' ').slice(1);
    const baseCmd = command.split(' ')[0];

    // Prevent starting new if one exists (except matrix)
    if (activeProcess && activeProcess.status !== 'SUCCESS' && baseCmd !== 'matrix') {
        addLog("ERROR: Background process active. Wait for completion.", 'ERROR');
        SoundManager.play('error');
        return;
    }

    switch (baseCmd) {
        case 'help':
            addLog("AVAILABLE COMMANDS:", 'INFO');
            addLog("  scan           - Network vulnerability scanner", 'INFO');
            addLog("  crack [ip]     - Brute force password attack", 'INFO');
            addLog("  hack camera    - Inject RTSP stream (CCTV)", 'INFO');
            addLog("  override drone - Jam control signal (UAV)", 'INFO');
            addLog("  clone sim      - Intercept mobile identity", 'INFO');
            addLog("  download [file]- Retrieve remote data", 'INFO');
            addLog("  matrix         - Initialize neural interface", 'INFO');
            addLog("  clear          - Clear terminal", 'INFO');
            break;

        case 'clear':
            setLogs([]);
            break;
            
        case 'matrix':
            setShowMatrix(true);
            SoundManager.play('scan');
            addLog("Initializing neural interface...", 'SUCCESS');
            break;

        case 'scan':
            addLog("Initiating port scan...", 'INFO');
            setTimeout(() => {
                addLog("Found 3 devices on local subnet.", 'SUCCESS');
                addLog("192.168.1.45 (Smart Lock) - VULNERABLE", 'WARN');
                addLog("192.168.1.12 (Camera Server) - OPEN", 'WARN');
            }, 500);
            break;

        case 'crack':
        case 'brute':
            setActiveProcess({
                type: 'BRUTE_FORCE',
                target: args[0] || '192.168.1.1',
                progress: 0,
                details: ['Loading dictionary: rockyou.txt'],
                status: 'RUNNING',
                timer: 0,
                failTriggered: false
            });
            break;

        case 'hack':
            if (args[0] === 'camera' || args[0] === 'cctv') {
                setActiveProcess({
                    type: 'RTSP_INJECT',
                    target: args[1] || 'CAM_SERVER_MAIN',
                    progress: 0,
                    details: ['Connecting to RTSP stream...'],
                    status: 'RUNNING',
                    timer: 0,
                    failTriggered: false
                });
            } else if (args[0] === 'drone') {
                 setActiveProcess({
                    type: 'SIGNAL_OVERRIDE',
                    target: 'UAV_CONTROL_LINK',
                    progress: 0,
                    details: ['Scanning frequencies...'],
                    status: 'RUNNING',
                    timer: 0,
                    failTriggered: false
                });
            } else {
                addLog("Usage: hack [camera | drone]", 'WARN');
            }
            break;

        case 'override':
             setActiveProcess({
                type: 'SIGNAL_OVERRIDE',
                target: args[0] || 'Unknown Signal',
                progress: 0,
                details: ['Jamming signal...'],
                status: 'RUNNING',
                timer: 0,
                failTriggered: false
            });
            break;

        case 'clone':
             setActiveProcess({
                type: 'SIM_CLONE',
                target: 'TARGET_DEVICE',
                progress: 0,
                details: ['Waiting for handshake...'],
                status: 'RUNNING',
                timer: 0,
                failTriggered: false
            });
            break;

        case 'download':
             setActiveProcess({
                type: 'DOWNLOAD',
                target: args[0] || 'classified_data.zip',
                progress: 0,
                details: ['Requesting file header...'],
                status: 'RUNNING',
                timer: 0,
                failTriggered: false
            });
            break;

        default:
            setTimeout(() => {
                addLog(`bash: ${baseCmd}: command not found`, 'ERROR');
                SoundManager.play('error');
            }, 200);
            break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInputValue(history[history.length - 1 - newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInputValue(history[history.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setInputValue('');
        }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!inputValue) return;
      const match = TERMINAL_COMMANDS.find(cmd => cmd.toLowerCase().startsWith(inputValue.toLowerCase()));
      if (match) setInputValue(match.split(' ')[0]);
    } else if (e.key === 'Enter') {
      if (!inputValue.trim()) return;
      SoundManager.play('click');
      addLog(`root@kali:~$ ${inputValue}`, 'INFO');
      setHistory(prev => [...prev, inputValue]);
      setHistoryIndex(-1);
      processCommand(inputValue);
      setInputValue('');
    } else {
        SoundManager.play('type');
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // --- RENDER MODALS ---
  const renderProcessModal = () => {
      if (!activeProcess) return null;
      
      let statusColor = theme;
      let statusText = activeProcess.type.replace('_', ' ');
      let borderColor = `border-${theme}-500`;
      
      // Dynamic Styling based on Status
      if (activeProcess.status === 'SUCCESS') {
          statusColor = 'green';
          borderColor = 'border-green-500';
      } else if (activeProcess.status === 'FAILED') {
          statusColor = 'rose';
          borderColor = 'border-red-600';
          statusText = 'ACCESS DENIED';
      } else if (activeProcess.status === 'OVERRIDE') {
          statusColor = 'amber'; // Using amber for override
          borderColor = 'border-amber-500';
          statusText = 'OVERRIDE SEQUENCE';
      } else if (activeProcess.type === 'SIGNAL_OVERRIDE') {
          statusColor = 'rose';
      }

      // HIGH-IMPACT SUCCESS MODAL
      if (activeProcess.status === 'SUCCESS') {
          return (
             <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300 z-50">
                 <div className={`border-4 border-${theme}-500 p-8 rounded-none bg-black/80 box-glow flex flex-col items-center shadow-[0_0_100px_rgba(0,255,0,0.2)]`}>
                    <CheckCircle size={80} className={`text-${theme}-500 mb-6 animate-bounce`} />
                    <h2 className={`text-4xl md:text-5xl font-bold text-${theme}-500 tracking-[0.2em] mb-4 text-center text-glow`}>ACCESS GRANTED</h2>
                    
                    <div className="w-full flex items-center justify-center space-x-2 mb-6">
                        <div className={`h-1 w-12 bg-${theme}-500`}></div>
                        <Lock size={16} className={`text-${theme}-500`} />
                         <div className={`h-1 w-12 bg-${theme}-500`}></div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-white font-mono text-lg tracking-widest animate-pulse">SYSTEM ROOT PRIVILEGES: ACTIVE</p>
                        <p className={`text-${theme}-600 font-mono text-sm`}>SESSION ID: 0x{Math.floor(Math.random()*999999).toString(16)}</p>
                    </div>

                    <div className={`mt-8 px-4 py-2 bg-${theme}-900/20 border border-${theme}-500/50 text-${theme}-400 text-xs font-mono tracking-widest`}>
                        PLEASE STAND BY...
                    </div>
                </div>
             </div>
          )
      }

      return (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-md bg-black border-2 ${borderColor} p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in duration-300`}>
              
              {/* Failure Overlay Effect */}
              {activeProcess.status === 'FAILED' && (
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse z-0 pointer-events-none"></div>
              )}

              {/* Header */}
              <div className={`flex items-center justify-between mb-4 border-b ${activeProcess.status === 'FAILED' ? 'border-red-800' : `border-${statusColor}-800`} pb-2 relative z-10`}>
                  <div className={`flex items-center text-${statusColor}-400 ${activeProcess.status === 'RUNNING' ? 'animate-pulse' : ''}`}>
                      {activeProcess.status === 'FAILED' ? <XCircle className="mr-2 text-red-500" /> : 
                       activeProcess.status === 'OVERRIDE' ? <Unlock className="mr-2 text-amber-500" /> :
                       activeProcess.type === 'BRUTE_FORCE' && <Lock className="mr-2" />}
                      {activeProcess.type === 'DOWNLOAD' && <Download className="mr-2" />}
                      {activeProcess.type === 'RTSP_INJECT' && activeProcess.status !== 'FAILED' && <Eye className="mr-2" />}
                      {activeProcess.type === 'SIGNAL_OVERRIDE' && <Radio className="mr-2" />}
                      
                      <span className={`font-bold tracking-widest ${activeProcess.status === 'FAILED' ? 'text-red-500 animate-pulse' : ''}`}>
                          {statusText}
                      </span>
                  </div>
                  <span className={`text-${statusColor}-600 text-xs font-mono`}>{activeProcess.target}</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 relative z-10">
                   <div className="flex justify-between text-xs mb-1 font-mono text-gray-400">
                       <span>{activeProcess.status === 'FAILED' ? 'CONNECTION LOST' : 'COMPLETION'}</span>
                       <span className={activeProcess.status === 'FAILED' ? 'text-red-500' : ''}>{Math.floor(activeProcess.progress)}%</span>
                   </div>
                   <div className="w-full h-4 bg-gray-900 border border-gray-700 p-0.5">
                       <div 
                           className={`h-full transition-all duration-100 relative overflow-hidden
                               ${activeProcess.status === 'FAILED' ? 'bg-red-600 w-full animate-pulse' : `bg-${statusColor}-500`}
                               ${activeProcess.status === 'OVERRIDE' ? 'bg-amber-500' : ''}
                           `} 
                           style={{ width: activeProcess.status === 'FAILED' ? '100%' : `${activeProcess.progress}%` }}
                       >
                           {activeProcess.status !== 'FAILED' && (
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                           )}
                           {activeProcess.status === 'FAILED' && (
                               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black tracking-widest">
                                   CRITICAL ERROR
                               </div>
                           )}
                       </div>
                   </div>
              </div>

              {/* Detail Log Window */}
              <div className="bg-black/50 border border-gray-800 p-2 h-24 font-mono text-xs overflow-hidden flex flex-col justify-end relative z-10">
                   {activeProcess.details.map((d, i) => (
                       <div key={i} className={`truncate ${
                           d.includes('ERR') || d.includes('FAIL') || d.includes('BLOCK') ? 'text-red-500 font-bold' :
                           d.includes('OVERRIDE') ? 'text-amber-500 font-bold' :
                           i === activeProcess.details.length - 1 ? `text-${statusColor}-400` : 'text-gray-500'
                       }`}>
                           &gt; {d}
                       </div>
                   ))}
                   {activeProcess.status === 'RUNNING' && <div className={`text-${statusColor}-500 animate-pulse`}>_</div>}
              </div>
          </div>
      );
  };

  return (
    <div 
        className={`h-full w-full bg-black border border-${theme}-800 font-mono text-xs md:text-sm relative overflow-hidden box-glow flex flex-col p-2 select-text`}
        onClick={focusInput}
    >
      {/* Background Matrix Rain (Static Image for Perf) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Matrix_code.gif')] bg-cover mix-blend-screen"></div>

      {/* Status Bar */}
      <div className={`flex justify-between items-center border-b border-${theme}-900 pb-2 mb-2 bg-${theme}-900/10 p-2 relative z-10`}>
         <div className="flex items-center space-x-2">
            <TerminalIcon size={14} className={`text-${theme}-500`} />
            <span className={`font-bold text-${theme}-400`}>ROOT@KALI:~</span>
         </div>
         <div className="flex space-x-4 text-[10px] text-gray-500 font-mono">
            <div className="flex items-center"><Wifi size={10} className="mr-1"/> ETH0: UP</div>
            <div className="flex items-center"><Cpu size={10} className="mr-1"/> MEM: 24%</div>
            <div className="flex items-center text-red-500 animate-pulse"><Shield size={10} className="mr-1"/> ROOT</div>
         </div>
      </div>
      
      {/* Main Terminal Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide pb-2 font-fira relative z-10">
        {logs.map((log) => (
          <div key={log.id} className="flex">
            <span className="text-gray-600 mr-3 shrink-0 select-none font-mono text-[10px] pt-0.5">[{log.timestamp}]</span>
            <span className={`
              whitespace-pre-wrap break-all
              ${log.message.includes('██') ? 'whitespace-pre overflow-x-hidden font-bold leading-none tracking-tighter' : ''} 
              ${log.type === 'ERROR' ? 'text-red-500 font-bold' : ''}
              ${log.type === 'WARN' ? 'text-yellow-500' : ''}
              ${log.type === 'SUCCESS' ? `text-${theme}-400 font-bold` : ''}
              ${log.type === 'INFO' ? (log.message.includes('root@') ? 'text-white' : `text-${theme}-600`) : ''}
            `}>
              {log.message}
            </span>
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center group mt-2">
             <span className={`text-${theme}-500 mr-2 font-bold select-none`}>root@kali:~$</span>
             <div className="relative flex-1">
                 <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={activeProcess !== null && activeProcess.status !== 'SUCCESS'} 
                    className={`bg-transparent border-none outline-none text-white w-full font-mono p-0 m-0 ${activeProcess && activeProcess.status !== 'SUCCESS' ? 'opacity-50' : ''}`}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                 />
                 {(!activeProcess || activeProcess.status === 'SUCCESS') && (
                     <div 
                        className={`absolute top-0 h-full w-2 bg-${theme}-500 opacity-50 animate-pulse pointer-events-none`}
                        style={{ left: `${inputValue.length * 8}px` }} 
                     ></div>
                 )}
             </div>
        </div>
      </div>

      {/* OVERLAYS */}
      {activeProcess && activeProcess.status !== 'SUCCESS' && (
          <div className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm">
             {renderProcessModal()}
          </div>
      )}

      {/* Dedicated Success Overlay via activeProcess logic */}
      {activeProcess && activeProcess.status === 'SUCCESS' && (
          renderProcessModal()
      )}
      
      {/* MATRIX RAIN OVERLAY */}
      {showMatrix && <MatrixRain theme={theme} onExit={() => setShowMatrix(false)} />}

      {/* Notifications */}
      <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map(n => (
              <div key={n.id} className={`bg-black border-l-4 p-3 shadow-lg animate-in slide-in-from-right duration-300 w-64
                  ${n.type === 'success' ? `border-${theme}-500 text-${theme}-500` : n.type === 'error' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}`}>
                  <h4 className="font-bold text-xs flex items-center">
                      {n.type === 'error' ? <AlertTriangle size={12} className="mr-2"/> : <CheckCircle size={12} className="mr-2"/>}
                      {n.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1">{n.message}</p>
              </div>
          ))}
      </div>

    </div>
  );
};

export default TerminalWindow;
