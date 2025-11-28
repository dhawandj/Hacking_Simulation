
import React, { useState, useEffect, useRef } from 'react';
import { GlobeLock, Bitcoin, ShoppingCart, MessageCircle, User, ShieldAlert, Key, Lock } from 'lucide-react';
import { ThemeColor } from '../types';
import { DARK_WEB_ITEMS, DARK_CHAT_LOGS } from '../constants';
import { SoundManager } from '../utils/SoundManager';

interface DarkWebProps {
    theme?: ThemeColor;
}

const DarkWeb: React.FC<DarkWebProps> = ({ theme = 'green' }) => {
    const [btcPrice, setBtcPrice] = useState(42069.00);
    const [balance, setBalance] = useState(4.250);
    const [chatLogs, setChatLogs] = useState(DARK_CHAT_LOGS);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [purchasing, setPurchasing] = useState<number | null>(null);

    // BTC Ticker
    useEffect(() => {
        const i = setInterval(() => {
            setBtcPrice(prev => prev + (Math.random() - 0.5) * 50);
        }, 2000);
        return () => clearInterval(i);
    }, []);

    // Fake incoming chat
    useEffect(() => {
        const i = setInterval(() => {
            if (Math.random() > 0.85) {
                const users = ["Vendor_X", "CryptoGod", "Newbie101", "Escrow_Bot"];
                const msgs = ["Stock refreshed?", "DM for bulk orders.", "Escrow only.", "Who has the new exploit?", "Stay safe out there."];
                const newMsg = {
                    user: users[Math.floor(Math.random() * users.length)],
                    text: msgs[Math.floor(Math.random() * msgs.length)]
                };
                setChatLogs(prev => [...prev, newMsg]);
                SoundManager.play('type');
            }
        }, 4000);
        return () => clearInterval(i);
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatLogs]);

    const handleBuy = (id: number, price: number) => {
        if (balance < price) {
            SoundManager.play('error');
            return;
        }
        setPurchasing(id);
        SoundManager.play('click');
        
        setTimeout(() => {
            setPurchasing(null);
            setBalance(prev => prev - price);
            SoundManager.play('success');
            setChatLogs(prev => [...prev, { user: "System", text: `Transaction 0x${Math.floor(Math.random()*100000).toString(16)} confirmed.` }]);
        }, 2000);
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setChatLogs(prev => [...prev, { user: "Me", text: chatInput }]);
        setChatInput('');
        SoundManager.play('type');
    };

    // Use a fixed darker theme for this component specifically, or tint it with the global theme
    // We will tint it slightly but keep it "Dark Web" aesthetic (often contrasting or purple/red)
    
    return (
        <div className={`h-full w-full bg-[#0a0a0a] text-gray-300 font-mono p-2 flex flex-col overflow-hidden relative`}>
             {/* Background Matrix Rain Effect (Static Image or CSS for now) */}
            <div className={`absolute inset-0 opacity-5 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Matrix_code.gif')] bg-cover`}></div>

            {/* BROWSER BAR */}
            <div className="flex items-center space-x-2 bg-[#1a1a1a] p-2 border-b border-gray-800 rounded-t-lg flex-none">
                <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-xs text-green-700 flex items-center font-mono overflow-hidden">
                    <Lock size={10} className="mr-2 flex-none" />
                    <span className="truncate">onion://silkroad72439857943573.onion/market</span>
                </div>
                <GlobeLock size={16} className="text-gray-500 flex-none" />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden border border-gray-800 border-t-0 bg-[#050505] relative z-10">
                
                {/* LEFT: MARKETPLACE */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-gray-800 pb-2">
                        <div className="mb-2 md:mb-0">
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-widest flex items-center">
                                <ShieldAlert className="mr-2 text-red-500" /> SILK ROAD v9.0
                            </h1>
                            <p className="text-xs text-gray-500">ANONYMOUS MARKETPLACE // ESCROW ENABLED</p>
                        </div>
                        <div className="text-right w-full md:w-auto">
                             <div className="text-xs text-gray-400">BTC/USD</div>
                             <div className="text-xl font-bold text-yellow-500">${btcPrice.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DARK_WEB_ITEMS.map((item) => (
                            <div key={item.id} className="border border-gray-800 bg-[#111] p-4 hover:border-gray-600 transition-colors group relative overflow-hidden">
                                {purchasing === item.id && (
                                    <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <span className="text-green-500 text-xs animate-pulse">VERIFYING BLOCKCHAIN...</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h3>
                                    <span className="text-yellow-500 font-mono text-sm flex items-center">
                                        <Bitcoin size={12} className="mr-1" /> {item.price.toFixed(4)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 h-8">{item.desc}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center text-gray-600">
                                        <User size={12} className="mr-1" /> {item.seller}
                                    </div>
                                    <button 
                                        onClick={() => handleBuy(item.id, item.price)}
                                        className="bg-gray-800 hover:bg-red-900/50 text-gray-300 hover:text-white px-3 py-1 border border-gray-700 hover:border-red-500 transition-all flex items-center"
                                    >
                                        <ShoppingCart size={12} className="mr-2" /> BUY NOW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: WALLET & CHAT */}
                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col bg-[#0a0a0a] h-64 lg:h-auto flex-none">
                    
                    {/* WALLET */}
                    <div className="p-4 border-b border-gray-800 bg-[#111]">
                        <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center">
                            <Key size={12} className="mr-1" /> ANONYMOUS WALLET
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-mono text-white">{balance.toFixed(4)} <span className="text-sm text-gray-600">BTC</span></span>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-600 font-mono break-all">
                            ADDR: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                        </div>
                    </div>

                    {/* CHAT */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-2 border-b border-gray-800 bg-[#111] text-xs font-bold flex items-center">
                            <MessageCircle size={12} className="mr-2 text-green-500" /> ENCRYPTED ROOM #442
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-xs">
                            {chatLogs.map((msg, idx) => (
                                <div key={idx} className="break-words">
                                    <span className={`font-bold ${msg.user === 'System' ? 'text-green-500' : (msg.user === 'Admin' ? 'text-red-500' : 'text-blue-400')}`}>
                                        [{msg.user}]:
                                    </span>
                                    <span className="text-gray-400 ml-1">{msg.text}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef}></div>
                        </div>
                        <form onSubmit={handleChatSubmit} className="p-2 border-t border-gray-800 bg-[#111]">
                            <input 
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type encrypted message..."
                                className="w-full bg-black border border-gray-700 p-2 text-xs text-white focus:border-green-500 outline-none"
                            />
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DarkWeb;
