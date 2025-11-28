
import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Target, Wifi, Navigation, AlertTriangle, Wind, Lock, Unlock, Settings, Upload, Save, RefreshCw, Camera, Image as ImageIcon, Video } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

type SourceMode = 'simulation' | 'camera' | 'image' | 'video';

interface DroneConfig {
  mode: SourceMode;
  url: string;
}

const DroneControl: React.FC = () => {
  // Telemetry State
  const [altitude, setAltitude] = useState(1200);
  const [speed, setSpeed] = useState(45);
  const [heading, setHeading] = useState(0);
  const [battery, setBattery] = useState(87);
  const [locked, setLocked] = useState(false);
  const [scanAngle, setScanAngle] = useState(0);

  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<DroneConfig>({ mode: 'simulation', url: '' });
  const [tempUrl, setTempUrl] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load config from LocalStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('cinehack_drone_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // We only restore URL-based configs, not blobs
        if (parsed.mode !== 'camera' && !parsed.url.startsWith('blob:')) {
            setConfig(parsed);
            setTempUrl(parsed.url);
        } else {
            // Default back to sim if it was a blob or camera (permissions reset)
            setConfig({ mode: 'simulation', url: '' });
        }
      } catch (e) {
        console.error("Failed to load drone config", e);
      }
    }
  }, []);

  // Simulate flight dynamics
  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude(prev => Math.max(0, prev + (Math.random() - 0.5) * 10));
      setSpeed(prev => Math.max(0, Math.min(120, prev + (Math.random() - 0.5) * 5)));
      setHeading(prev => (prev + (Math.random() - 0.5) * 2 + 360) % 360);
      setScanAngle(prev => (prev + 2) % 360);
      
      // Drain battery slowly
      if (Math.random() > 0.98) setBattery(prev => Math.max(0, prev - 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Camera Setup
  useEffect(() => {
    if (config.mode === 'camera' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera access denied:", err);
          setConfig({ mode: 'simulation', url: '' }); // Fallback
        });
    }
  }, [config.mode]);

  const handleSaveConfig = () => {
    const newConfig = { ...config, url: tempUrl };
    // Only save to localStorage if it's not a blob (blobs expire)
    if (!tempUrl.startsWith('blob:')) {
        localStorage.setItem('cinehack_drone_config', JSON.stringify(newConfig));
    }
    setConfig(newConfig);
    setShowConfig(false);
    SoundManager.play('success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const newMode = isVideo ? 'video' : 'image';
      
      setTempUrl(objectUrl);
      setConfig({ mode: newMode, url: objectUrl });
      SoundManager.play('static'); // Audio feedback for file load
    }
  };

  const toggleLock = () => {
      const newLocked = !locked;
      setLocked(newLocked);
      SoundManager.play(newLocked ? 'lock' : 'click');
  }

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-2 font-mono relative overflow-y-auto lg:overflow-hidden">
      
      {/* MAIN HUD DISPLAY */}
      <div className="lg:col-span-3 relative border border-green-800 bg-black overflow-hidden box-glow group aspect-video lg:aspect-auto min-h-[300px]">
        
        {/* MEDIA LAYER */}
        <div className="absolute inset-0 z-0">
           {config.mode === 'simulation' && (
             <img 
               src="https://picsum.photos/1200/800?grayscale&blur=2" 
               alt="Drone Feed" 
               className="w-full h-full object-cover filter contrast-125 brightness-75 sepia-[.5] hue-rotate-[50deg]"
             />
           )}
           
           {config.mode === 'image' && config.url && (
              <img 
                src={config.url}
                alt="Custom Feed"
                className="w-full h-full object-cover filter contrast-125 brightness-75 sepia-[.5] hue-rotate-[50deg]"
              />
           )}

           {(config.mode === 'video' || config.mode === 'camera') && (
              <video
                ref={videoRef}
                src={config.mode === 'video' ? config.url : undefined}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover filter contrast-125 brightness-75 sepia-[.5] hue-rotate-[50deg]"
              />
           )}
           
           {/* Static Grain Overlay */}
           <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_pattern_with_intensity_gradient.png')] opacity-10 mix-blend-overlay animate-[flicker_0.2s_infinite]"></div>
           {/* Scanlines */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(0,20,0,0.2)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
        </div>

        {/* HUD Overlay Layer */}
        <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between z-10 pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start text-green-400">
                <div className="flex flex-col space-y-1">
                    <span className="bg-green-900/40 px-2 py-0.5 border-l-2 border-green-500 font-bold text-xs md:text-sm">
                        CAM_01: {config.mode.toUpperCase()}
                    </span>
                    <span className="text-[10px] md:text-xs">REC [00:42:15]</span>
                </div>
                {/* Compass Strip Simulation - Hide on small screens if needed, or scale */}
                <div className="w-1/3 h-8 border-b border-green-500/50 relative overflow-hidden flex items-end justify-center hidden sm:flex">
                    <div className="absolute bottom-0 flex space-x-8 text-xs transition-transform duration-100" style={{ transform: `translateX(-${heading}px)` }}>
                        {Array.from({ length: 30 }).map((_, i) => (
                             <span key={i} className="w-8 text-center border-l border-green-800 h-2">{i * 15}</span>
                        ))}
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-green-500 absolute top-0"></div>
                </div>
                <div className="flex flex-col items-end space-y-1 text-xs md:text-sm">
                    <div className="flex items-center space-x-2">
                        <Wifi className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                        <span>LINK: 98%</span>
                    </div>
                    <span className="text-[10px] md:text-xs">LAT: 34.0522 N</span>
                    <span className="text-[10px] md:text-xs">LON: 118.2437 W</span>
                </div>
            </div>

            {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 border border-green-500/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute w-full h-[1px] bg-green-500/30"></div>
                <div className="absolute h-full w-[1px] bg-green-500/30"></div>
                {/* Artificial Horizon Lines */}
                <div className="absolute w-32 md:w-40 h-px bg-green-500/50 -translate-y-12"></div>
                <div className="absolute w-24 md:w-32 h-px bg-green-500/50 -translate-y-24"></div>
                <div className="absolute w-32 md:w-40 h-px bg-green-500/50 translate-y-12"></div>
                <div className="absolute w-24 md:w-32 h-px bg-green-500/50 translate-y-24"></div>
                
                {locked && (
                    <div className="absolute inset-0 border-2 border-red-500 animate-ping rounded-full opacity-50"></div>
                )}
                {locked && (
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-500 px-2 text-xs font-bold border border-red-500">
                        TARGET LOCKED
                     </div>
                )}
            </div>

            {/* Side Ladders */}
            <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-48 md:h-64 flex items-center">
                 <div className="flex flex-col justify-between h-full text-right pr-2 border-r border-green-500/30 text-green-300 text-xs font-mono">
                     <span>200</span>
                     <span>100</span>
                     <span className="text-white font-bold text-lg bg-green-900/50 px-1">{Math.floor(speed)}</span>
                     <span>50</span>
                     <span>0</span>
                 </div>
                 <span className="ml-2 text-green-600 text-[10px] -rotate-90">SPEED (KTS)</span>
            </div>

            {/* Altitude Ladder */}
            <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-48 md:h-64 flex items-center">
                 <span className="mr-2 text-green-600 text-[10px] rotate-90">ALT (M)</span>
                 <div className="flex flex-col justify-between h-full pl-2 border-l border-green-500/30 text-green-300 text-xs font-mono">
                     <span>1500</span>
                     <span>1400</span>
                     <span className="text-white font-bold text-lg bg-green-900/50 px-1">{Math.floor(altitude)}</span>
                     <span>1200</span>
                     <span>1000</span>
                 </div>
            </div>

            {/* Bottom Info */}
            <div className="flex justify-between items-end text-green-600 font-mono text-xs">
                 <div className="flex space-x-2 md:space-x-4">
                     <div>
                        <span className="block text-[10px] opacity-50">WIND</span>
                        <div className="flex items-center text-green-400"><Wind className="w-3 h-3 mr-1"/> 12 KTS NW</div>
                     </div>
                     <div>
                        <span className="block text-[10px] opacity-50">TEMP</span>
                        <div className="text-green-400">24°C</div>
                     </div>
                 </div>
                 
                 <div className="flex items-center space-x-2 bg-black/60 px-2 py-1 border border-green-900 rounded">
                     <AlertTriangle className="w-4 h-4 text-yellow-500" />
                     <span className="text-yellow-500 hidden sm:inline">TERRAIN AVOIDANCE: ON</span>
                     <span className="text-yellow-500 sm:hidden">TERR: ON</span>
                 </div>
            </div>
        </div>
      </div>

      {/* SIDE CONTROL PANEL */}
      <div className="flex flex-col gap-4 relative">
          
          {/* Header */}
          <div className="flex justify-between items-center bg-black border border-green-800 p-2">
              <span className="text-green-500 font-bold text-sm">CTRL_PANEL</span>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1 rounded hover:bg-green-900/50 ${showConfig ? 'text-green-400 bg-green-900/30' : 'text-gray-500'}`}
              >
                  <Settings size={16} />
              </button>
          </div>

          {showConfig ? (
             /* CONFIGURATION MODE */
             <div className="bg-black border border-green-800 p-4 box-glow flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-green-400 font-bold border-b border-green-900 pb-2">SOURCE_CONFIG</h3>
                
                {/* Mode Selectors */}
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setConfig({ ...config, mode: 'simulation' })}
                        className={`p-2 border text-xs flex flex-col items-center ${config.mode === 'simulation' ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                    >
                        <RefreshCw size={20} className="mb-1" /> SIMULATION
                    </button>
                    <button 
                         onClick={() => setConfig({ ...config, mode: 'camera' })}
                         className={`p-2 border text-xs flex flex-col items-center ${config.mode === 'camera' ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                    >
                        <Camera size={20} className="mb-1" /> WEBCAM
                    </button>
                    <button 
                         onClick={() => {
                            setConfig({ ...config, mode: 'image' });
                            setTempUrl('');
                         }}
                         className={`p-2 border text-xs flex flex-col items-center ${config.mode === 'image' ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                    >
                        <ImageIcon size={20} className="mb-1" /> IMAGE URL
                    </button>
                    <button 
                         onClick={() => {
                            setConfig({ ...config, mode: 'video' });
                            setTempUrl('');
                         }}
                         className={`p-2 border text-xs flex flex-col items-center ${config.mode === 'video' ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                    >
                        <Video size={20} className="mb-1" /> VIDEO URL
                    </button>
                </div>

                {/* URL Input */}
                {(config.mode === 'image' || config.mode === 'video') && (
                    <div className="space-y-2">
                        <label className="text-xs text-green-600">ASSET URL</label>
                        <input 
                            type="text" 
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="https://example.com/source.mp4"
                            className="w-full bg-black border border-green-800 p-2 text-xs text-green-400 focus:border-green-500 outline-none"
                        />
                        <div className="flex items-center my-2">
                            <div className="h-px bg-green-900 flex-1"></div>
                            <span className="px-2 text-[10px] text-gray-500">OR UPLOAD LOCAL</span>
                            <div className="h-px bg-green-900 flex-1"></div>
                        </div>
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept={config.mode === 'image' ? "image/*" : "video/*"}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2 border border-dashed border-green-700 text-green-600 hover:bg-green-900/20 text-xs flex items-center justify-center"
                        >
                            <Upload size={14} className="mr-2" /> SELECT LOCAL FILE
                        </button>
                        <p className="text-[10px] text-gray-600 mt-1 italic">* Local files reset on page reload.</p>
                    </div>
                )}

                <div className="mt-auto">
                    <button 
                        onClick={handleSaveConfig}
                        className="w-full bg-green-900/40 hover:bg-green-900/60 text-green-400 border border-green-600 py-2 text-xs font-bold flex items-center justify-center"
                    >
                        <Save size={14} className="mr-2" /> SAVE CONFIGURATION
                    </button>
                </div>
             </div>
          ) : (
            /* OPERATION MODE */
            <>
                {/* Radar Module */}
                <div className="bg-black border border-green-800 p-2 relative box-glow aspect-square">
                    <div className="absolute top-2 left-2 text-green-500 text-xs font-bold">RADAR_SWEEP</div>
                    <div className="w-full h-full rounded-full border border-green-900/50 relative overflow-hidden bg-green-900/5">
                        {/* Grid Circles */}
                        <div className="absolute inset-0 rounded-full border border-green-800/30 scale-75"></div>
                        <div className="absolute inset-0 rounded-full border border-green-800/30 scale-50"></div>
                        <div className="absolute inset-0 rounded-full border border-green-800/30 scale-25"></div>
                        {/* Crosshairs */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-800/30"></div>
                        <div className="absolute left-0 right-0 top-1/2 h-px bg-green-800/30"></div>
                        
                        {/* Sweep Line */}
                        <div 
                            className="absolute inset-0 origin-center bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,0,0.1)_60deg,rgba(0,255,0,0.4)_90deg,transparent_90.1deg)]"
                            style={{ transform: `rotate(${scanAngle}deg)` }}
                        ></div>
                        
                        {/* Blips */}
                        <div className="absolute top-1/3 left-2/3 w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-black border border-green-800 p-4 box-glow flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-green-400 font-bold mb-4 border-b border-green-900 pb-2">SYSTEM STATUS</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">MAIN BATTERY</span>
                                <span className={`${battery < 20 ? 'text-red-500' : 'text-green-400'}`}>{battery}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${battery < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${battery}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-gray-400">SIGNAL STR</span>
                                <span className="text-green-400">-42 dBm</span>
                            </div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button 
                            onClick={toggleLock}
                            className={`p-2 border ${locked ? 'border-red-500 bg-red-900/20 text-red-500' : 'border-green-800 hover:bg-green-900/30 text-green-500'} text-xs font-bold transition-colors flex items-center justify-center`}
                        >
                            {locked ? <Unlock size={14} className="mr-1"/> : <Target size={14} className="mr-1"/>}
                            {locked ? 'UNLOCK' : 'LOCK'}
                        </button>
                        <button className="p-2 border border-green-800 hover:bg-green-900/30 text-green-500 text-xs font-bold transition-colors flex items-center justify-center">
                            <Navigation size={14} className="mr-1"/> RTH
                        </button>
                        <button className="p-2 border border-green-800 hover:bg-green-900/30 text-green-500 text-xs font-bold transition-colors col-span-2">
                            INITIATE SCAN
                        </button>
                    </div>
                </div>
            </>
          )}
      </div>
    </div>
  );
};

export default DroneControl;
