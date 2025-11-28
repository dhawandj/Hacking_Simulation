
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Activity, Radio, Lock, Unlock, Sliders, Volume2, AudioWaveform, UserX, Shield } from 'lucide-react';
import { ThemeColor } from '../types';
import { SoundManager } from '../utils/SoundManager';

interface VoiceChangerProps {
    theme?: ThemeColor;
}

const VoiceChanger: React.FC<VoiceChangerProps> = ({ theme = 'green' }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [pitch, setPitch] = useState(50);
    const [distortion, setDistortion] = useState(20);
    const [modulation, setModulation] = useState(35);
    const [encryptionLevel, setEncryptionLevel] = useState(100);
    const [voiceMatch, setVoiceMatch] = useState(0);
    const [preset, setPreset] = useState<'DEEP' | 'ROBOT' | 'ALIEN' | 'GHOST'>('DEEP');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Initialize Audio Visualization
    useEffect(() => {
        const initAudio = async () => {
            try {
                // Request microphone access
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(audioStream);

                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioCtx();
                audioContextRef.current = ctx;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = 2048;
                analyserRef.current = analyser;

                const source = ctx.createMediaStreamSource(audioStream);
                source.connect(analyser);
                sourceRef.current = source;

                drawVisualizer();
            } catch (err) {
                console.warn("Microphone access denied, using simulation mode.");
                drawSimulation();
            }
        };

        if (isRecording) {
            initAudio();
        } else {
            stopAudio();
            drawIdle(); // Draw flatline or idle noise
        }

        return () => {
            stopAudio();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isRecording]);

    const stopAudio = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const drawVisualizer = () => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fade effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            // Dynamic color based on theme
            ctx.strokeStyle = theme === 'green' ? '#22c55e' : theme === 'rose' ? '#ef4444' : '#22d3ee';
            ctx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Update fake identity match
            setVoiceMatch(prev => {
                const target = Math.random() * 10;
                return Math.max(0, Math.min(100, prev + (target - 5)));
            });
        };

        draw();
    };

    const drawSimulation = () => {
         const canvas = canvasRef.current;
         if (!canvas) return;
         const ctx = canvas.getContext('2d');
         if (!ctx) return;

         let t = 0;
         const draw = () => {
             animationRef.current = requestAnimationFrame(draw);
             t += 0.1;

             ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
             ctx.fillRect(0, 0, canvas.width, canvas.height);

             ctx.lineWidth = 2;
             ctx.strokeStyle = theme === 'green' ? '#22c55e' : '#22d3ee';
             ctx.beginPath();

             for (let x = 0; x < canvas.width; x++) {
                 // Simulated waveform
                 const y = (canvas.height / 2) + Math.sin(x * 0.05 + t) * 50 * Math.sin(t * 0.5) + (Math.random() * 5);
                 if (x === 0) ctx.moveTo(x, y);
                 else ctx.lineTo(x, y);
             }
             ctx.stroke();
         }
         draw();
    };

    const drawIdle = () => {
         const canvas = canvasRef.current;
         if (!canvas) return;
         const ctx = canvas.getContext('2d');
         if (!ctx) return;

         // Clear
         ctx.fillStyle = 'rgb(0, 0, 0)';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         
         // Center Line
         ctx.beginPath();
         ctx.strokeStyle = '#334155';
         ctx.lineWidth = 1;
         ctx.moveTo(0, canvas.height / 2);
         ctx.lineTo(canvas.width, canvas.height / 2);
         ctx.stroke();
    };

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            SoundManager.play('click');
        } else {
            setIsRecording(false);
            SoundManager.play('lock'); // "End" sound
        }
    };

    const handlePreset = (p: typeof preset) => {
        setPreset(p);
        SoundManager.play('click');
        // Simulate changing knobs
        switch(p) {
            case 'DEEP': setPitch(20); setModulation(40); break;
            case 'ROBOT': setPitch(50); setModulation(90); break;
            case 'ALIEN': setPitch(85); setModulation(60); break;
            case 'GHOST': setPitch(30); setModulation(10); break;
        }
    };

    return (
        <div className={`h-full w-full bg-black p-4 md:p-8 font-mono text-${theme}-500 flex flex-col lg:flex-row gap-6 overflow-y-auto lg:overflow-hidden`}>
            
            {/* LEFT: VISUALIZER & STATUS */}
            <div className={`w-full lg:w-2/3 flex flex-col gap-6 flex-none`}>
                
                {/* Main Oscilloscope */}
                <div className={`relative border border-${theme}-800 bg-black box-glow flex-1 min-h-[300px] flex flex-col`}>
                    <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                        <Activity className={`w-5 h-5 ${isRecording ? 'animate-pulse text-red-500' : `text-${theme}-600`}`} />
                        <span className="font-bold tracking-widest text-sm">AUDIO_INPUT_STREAM // {isRecording ? 'LIVE' : 'STANDBY'}</span>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                         <div className={`px-2 py-1 text-xs border ${isRecording ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-gray-800 text-gray-600'}`}>
                             {isRecording ? 'REC [00:04:12]' : 'MIC OFF'}
                         </div>
                    </div>
                    
                    {/* Canvas */}
                    <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={400} 
                        className="w-full h-full object-cover opacity-80"
                    />

                    {/* Frequency Overlay (Simulated) */}
                    <div className="absolute bottom-0 left-0 w-full h-12 flex items-end px-4 gap-1 opacity-50 pointer-events-none">
                         {Array.from({length: 40}).map((_, i) => (
                             <div 
                                key={i} 
                                className={`flex-1 bg-${theme}-600 transition-all duration-100 ease-in-out`}
                                style={{ height: `${isRecording ? Math.random() * 100 : 5}%` }}
                             ></div>
                         ))}
                    </div>
                </div>

                {/* Identity Masking Status */}
                <div className={`border border-${theme}-800 bg-${theme}-900/5 p-4 grid grid-cols-2 gap-4`}>
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 border border-${theme}-700 bg-black`}>
                            <UserX size={32} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">VOICEPRINT MATCH</div>
                            <div className="text-2xl font-bold text-red-500 font-mono">
                                {isRecording ? (Math.random() * 5).toFixed(2) : '0.00'}%
                            </div>
                            <div className="text-[10px] text-green-500">IDENTITY MASKED</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 justify-end">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">ENCRYPTION LAYER</div>
                            <div className="text-2xl font-bold text-white font-mono">AES-256</div>
                            <div className="text-[10px] text-gray-400">HOP: 12 NODES</div>
                        </div>
                         <div className={`p-3 border border-${theme}-700 bg-black`}>
                            <Shield size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: CONTROLS */}
            <div className={`w-full lg:w-1/3 flex flex-col gap-4 flex-none`}>
                
                {/* Control Rack */}
                <div className={`border border-${theme}-800 bg-black p-6 box-glow flex-1 flex flex-col space-y-8 min-h-[400px]`}>
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h2 className="font-bold flex items-center"><Sliders className="mr-2" /> MODULATION</h2>
                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}></div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span>PITCH SHIFT</span>
                                <span>{pitch}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={pitch} 
                                onChange={(e) => { setPitch(Number(e.target.value)); SoundManager.play('tone'); }}
                                className="w-full h-1 bg-gray-800 appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span>DISTORTION</span>
                                <span>{distortion}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={distortion} 
                                onChange={(e) => { setDistortion(Number(e.target.value)); SoundManager.play('tone'); }}
                                className="w-full h-1 bg-gray-800 appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span>BANDWIDTH</span>
                                <span>{modulation}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={modulation} 
                                onChange={(e) => { setModulation(Number(e.target.value)); SoundManager.play('tone'); }}
                                className="w-full h-1 bg-gray-800 appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2"
                            />
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="mt-8">
                        <label className="text-xs text-gray-500 block mb-2 font-bold">QUICK PRESETS</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['DEEP', 'ROBOT', 'ALIEN', 'GHOST'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePreset(p as any)}
                                    className={`py-2 text-xs font-bold border transition-all
                                        ${preset === p 
                                            ? `border-${theme}-500 bg-${theme}-900/30 text-${theme}-400` 
                                            : `border-gray-800 text-gray-500 hover:border-${theme}-700`}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Primary Action */}
                <button
                    onClick={toggleRecording}
                    className={`p-6 border-2 font-bold tracking-widest text-lg transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center space-x-3
                        ${isRecording 
                            ? 'border-red-500 bg-red-900/20 text-red-500 animate-pulse' 
                            : `border-${theme}-500 bg-${theme}-900/20 text-${theme}-400 hover:bg-${theme}-900/40`}`}
                >
                    {isRecording ? <Unlock size={24} /> : <Mic size={24} />}
                    <span>{isRecording ? 'STOP TRANSMISSION' : 'ACTIVATE VOICE MASK'}</span>
                </button>

            </div>
        </div>
    );
};

export default VoiceChanger;
