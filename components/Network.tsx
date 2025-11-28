
import React, { useState, useEffect } from 'react';
import { Wifi, Shield, Smartphone, Laptop, Tv, Server } from 'lucide-react';
import { ThemeColor } from '../types';

const DeviceNode: React.FC<{ icon: any; name: string; ip: string; status: 'safe' | 'vuln' | 'hacked' }> = ({ icon: Icon, name, ip, status }) => {
  const statusColors = {
    safe: 'text-green-500 border-green-900 bg-green-900/10',
    vuln: 'text-yellow-500 border-yellow-900 bg-yellow-900/10 animate-pulse',
    hacked: 'text-red-500 border-red-900 bg-red-900/10',
  };

  return (
    <div className={`flex items-center p-3 border rounded ${statusColors[status]} mb-2`}>
      <Icon className="w-6 h-6 mr-3" />
      <div className="flex-1">
        <div className="text-sm font-bold">{name}</div>
        <div className="text-xs opacity-70 font-mono">{ip}</div>
      </div>
      <div className="text-xs font-bold uppercase tracking-wider">{status}</div>
    </div>
  );
};

const ServerRackUI: React.FC<{ theme: ThemeColor }> = ({ theme }) => {
    const [load, setLoad] = useState([20, 40, 60, 10, 80]);

    useEffect(() => {
        const i = setInterval(() => {
            setLoad(prev => prev.map(v => Math.min(100, Math.max(0, v + (Math.random() - 0.5) * 20))));
        }, 800);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="grid grid-cols-5 gap-1 h-32 items-end">
            {load.map((val, idx) => (
                <div key={idx} className={`relative w-full bg-gray-900 border border-gray-800 h-full flex flex-col justify-end`}>
                    <div 
                        className={`w-full transition-all duration-300 ${val > 80 ? 'bg-red-600' : `bg-${theme}-600`}`}
                        style={{ height: `${val}%` }}
                    />
                    <div className="absolute bottom-0 w-full text-center text-[10px] text-white bg-black/50">SRV-0{idx+1}</div>
                </div>
            ))}
        </div>
    )
}

const NetworkPanel: React.FC<{ theme?: ThemeColor }> = ({ theme = 'green' }) => {
  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-2">
      <div className={`border border-${theme}-800 p-4 box-glow bg-black/50`}>
        <h3 className={`text-${theme}-400 font-bold mb-4 flex items-center`}>
            <Wifi className="mr-2" /> HOME_NETWORK_TOPOLOGY
        </h3>
        <DeviceNode icon={Laptop} name="ADMIN_MACBOOK" ip="192.168.1.10" status="safe" />
        <DeviceNode icon={Smartphone} name="IPHONE_13_PRO" ip="192.168.1.14" status="safe" />
        <DeviceNode icon={Tv} name="SAMSUNG_SMART_TV" ip="192.168.1.22" status="vuln" />
        <DeviceNode icon={Shield} name="SMART_LOCK_FRONT" ip="192.168.1.45" status="hacked" />
      </div>

      <div className="border border-cyan-800 p-4 box-glow bg-black/50">
        <h3 className="text-cyan-400 font-bold mb-4 flex items-center">
            <Server className="mr-2" /> CORP_DATACENTER_LOAD
        </h3>
        <ServerRackUI theme={theme} />
        <div className="mt-4 text-xs font-mono text-cyan-600">
            <p>Traffic In: 450 TB/s</p>
            <p>Traffic Out: 1.2 PB/s</p>
            <p>Encryption: AES-256 (BROKEN)</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkPanel;
