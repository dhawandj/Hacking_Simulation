
import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Globe, ShieldAlert, Wifi, MapPin, Radio } from 'lucide-react';

const GeoMap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [threatCount, setThreatCount] = useState(0);
    const [activeRegion, setActiveRegion] = useState('NORAD_US_EAST');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize handling
        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // --- 3D MATH & SETUP ---
        const points: { x: number, y: number, z: number, active: number }[] = [];
        const numPoints = 400;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;
        
        // Generate Sphere Points (Fibonacci Sphere)
        const phi = Math.PI * (3 - Math.sqrt(5)); 
        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;
            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;
            points.push({ x: x * radius, y: y * radius, z: z * radius, active: 0 });
        }

        let angleX = 0;
        let angleY = 0;
        
        // Attacks array
        const attacks: { start: number, end: number, progress: number, color: string }[] = [];

        // --- RENDER LOOP ---
        const render = () => {
            if (!ctx || !canvas) return;
            
            // Clear
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Trails
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Rotate Sphere
            angleY += 0.005;
            angleX += 0.002;

            // Project Points
            const projected = points.map(p => {
                // Rotation Y
                let x = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
                let z = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);
                // Rotation X
                let y = p.y * Math.cos(angleX) - z * Math.sin(angleX);
                z = z * Math.cos(angleX) + p.y * Math.sin(angleX);

                const scale = 400 / (400 - z);
                return {
                    x: x * scale + cx,
                    y: y * scale + cy,
                    z: z,
                    scale: scale,
                    original: p
                };
            });

            // Draw Connections (Wireframe effect)
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < projected.length; i++) {
                const p1 = projected[i];
                if (p1.z > -100) { // Only draw front-ish points
                    // Connect to close neighbors (simple distance check optimization could be spatial hash, but N=400 is fine)
                     for (let j = i + 1; j < projected.length; j++) {
                        const p2 = projected[j];
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const dist = dx*dx + dy*dy;
                        if (dist < 1500) {
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                        }
                    }
                }
            }
            ctx.stroke();

            // Draw Points
            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                const alpha = (p.z + radius) / (2 * radius); // Depth cue
                
                if (p.original.active > 0) {
                    // Active Threat Node
                    ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
                    const size = 3 * p.scale + (Math.sin(Date.now() * 0.01) * 2);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                    p.original.active -= 0.02; // Decay
                } else {
                    // Passive Node
                    ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.5 * p.scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw Attacks (Curved Arcs)
            for (let i = attacks.length - 1; i >= 0; i--) {
                const atk = attacks[i];
                atk.progress += 0.02;
                
                const p1 = projected[atk.start];
                const p2 = projected[atk.end];

                if (atk.progress >= 1) {
                    attacks.splice(i, 1);
                    points[atk.end].active = 1.0; // Trigger impact
                    continue;
                }

                // Bezier Control Point (Center of earth but pushed out)
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                // Simple arc height
                const cpx = cx + (midX - cx) * 1.5;
                const cpy = cy + (midY - cy) * 1.5;

                ctx.strokeStyle = atk.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.quadraticCurveTo(cpx, cpy, 
                    p1.x + (p2.x - p1.x) * atk.progress + (cpx - midX) * Math.sin(atk.progress * Math.PI), 
                    p1.y + (p2.y - p1.y) * atk.progress + (cpy - midY) * Math.sin(atk.progress * Math.PI)
                );
                ctx.stroke();
                
                // Head of missile
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(
                     p1.x + (p2.x - p1.x) * atk.progress + (cpx - midX) * Math.sin(atk.progress * Math.PI), 
                     p1.y + (p2.y - p1.y) * atk.progress + (cpy - midY) * Math.sin(atk.progress * Math.PI),
                     2, 0, Math.PI*2
                );
                ctx.fill();
            }

            requestAnimationFrame(render);
        };
        const animId = requestAnimationFrame(render);

        // --- SIMULATION LOGIC ---
        const interval = setInterval(() => {
            // Trigger random attack
            if (Math.random() > 0.3) {
                const start = Math.floor(Math.random() * numPoints);
                const end = Math.floor(Math.random() * numPoints);
                if (start !== end) {
                    attacks.push({
                        start, 
                        end, 
                        progress: 0, 
                        color: Math.random() > 0.5 ? 'rgba(255, 50, 50, 0.8)' : 'rgba(255, 200, 0, 0.8)'
                    });
                    setThreatCount(prev => prev + 1);
                    if (Math.random() > 0.8) setActiveRegion(['APAC_MAIN', 'NORAD_US', 'EU_CENTRAL', 'RU_NET'][Math.floor(Math.random() * 4)]);
                }
            }
        }, 800);

        return () => {
            cancelAnimationFrame(animId);
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="h-full w-full bg-black relative overflow-hidden box-glow border border-cyan-900 group">
            {/* Background Grids */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,100,100,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,100,0.05)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>
            
            <canvas ref={canvasRef} className="block w-full h-full relative z-10" />

            {/* Overlays */}
            <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                    <Globe className="w-5 h-5 animate-pulse" />
                    <h2 className="text-lg font-bold tracking-[0.2em] text-glow-cyan">GLOBAL THREAT MAP</h2>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="flex items-center text-red-500">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        <span>ACTIVE THREATS: {threatCount}</span>
                    </div>
                    <div className="flex items-center text-cyan-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>REGION: {activeRegion}</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 z-20 text-right">
                <div className="flex items-center justify-end space-x-2 text-cyan-500 mb-1">
                    <Radio className="w-4 h-4 animate-spin-slow" />
                    <span className="font-bold tracking-widest text-xs">UPLINK ESTABLISHED</span>
                </div>
                <div className="text-[10px] text-cyan-700 font-mono">
                    LATENCY: {Math.floor(Math.random() * 20 + 10)}ms <br/>
                    SAT_ID: KH-11_BLOCK_IV
                </div>
            </div>

            {/* Radar Sweep Effect (CSS) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full opacity-10">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-cyan-500/20 rounded-full"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] border border-cyan-500/20 rounded-full"></div>
            </div>
            
            {/* Crosshairs */}
            <div className="absolute bottom-4 left-4 z-20 text-cyan-800">
                <Crosshair size={32} />
            </div>
        </div>
    );
};

export default GeoMap;
