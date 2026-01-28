import React, { useState, useEffect } from 'react';
import { Lightbulb, Power, Wifi, Activity, Zap } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react"

const DB_URL = import.meta.env.VITE_DB_URL;
const DB_SECRET = import.meta.env.VITE_DB_SECRET;
const LIGHT_STATUS_PATH = '/home/light/status';

export default function App() {
    const [isOn, setIsOn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. Sync Data from Firebase (Polling / REST API)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using Firebase REST API with Auth Secret
                const response = await fetch(`${DB_URL}${LIGHT_STATUS_PATH}.json?auth=${DB_SECRET}`);

                if (response.ok) {
                    const data = await response.json();
                    setIsConnected(true);
                    setLoading(false);
                    if (data !== null) {
                        setIsOn(data);
                    }
                } else {
                    console.error("Firebase Response Error:", response.statusText);
                    setIsConnected(false);
                }
            } catch (error) {
                console.error("Network Error:", error);
                setIsConnected(false);
            }
        };

        // Initial fetch
        fetchData();

        // Polling every 2 seconds to simulate realtime updates
        // (Simpler than EventSource for this auth method)
        const intervalId = setInterval(fetchData, 2000);

        return () => clearInterval(intervalId);
    }, []);

    // 2. Toggle Light Function
    const toggleLight = async () => {
        const newState = !isOn;
        // Optimistic UI update
        setIsOn(newState);

        try {
            const response = await fetch(`${DB_URL}${LIGHT_STATUS_PATH}.json?auth=${DB_SECRET}`, {
                method: 'PUT', // PUT replaces the value at this path
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newState),
            });

            if (!response.ok) {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error("Write Error:", error);
            setIsOn(!newState); // Revert UI if failed
            alert("Failed to send command to device.");
        }
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${isOn ? 'bg-slate-900' : 'bg-slate-950'}`}>
            <SpeedInsights />

            {/* Main Dashboard Card */}
            <div className="w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 relative">

                {/* Decorative Glow Background */}
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full filter blur-3xl opacity-20 transition-all duration-700 ${isOn ? 'bg-yellow-400' : 'bg-blue-900'}`}></div>

                {/* Header */}
                <div className="relative z-10 p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Zap className={`w-6 h-6 ${isOn ? 'text-yellow-400' : 'text-slate-400'}`} />
                        <h1 className="text-xl font-bold text-white tracking-wide">Smart Room</h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className={`flex h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className="text-slate-400">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                </div>

                {/* Main Control Area */}
                <div className="relative z-10 p-10 flex flex-col items-center justify-center gap-8">

                    {/* Bulb Indicator */}
                    <div className={`relative transition-all duration-500 ${isOn ? 'scale-110' : 'scale-100'}`}>
                        <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${isOn ? 'bg-yellow-500/40 opacity-100' : 'opacity-0'}`}></div>
                        <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 shadow-inner transition-all duration-500 ${isOn ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-slate-900 border-slate-700 text-slate-600'}`}>
                            <Lightbulb size={80} strokeWidth={1.5} className={isOn ? 'fill-yellow-400/20' : 'fill-none'} />
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-1 transition-all">
                            {loading ? "Loading..." : (isOn ? "LIGHT ON" : "LIGHT OFF")}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {loading ? "Connecting to system..." : (isOn ? "System Active" : "Standby Mode")}
                        </p>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={toggleLight}
                        disabled={!isConnected || loading}
                        className={`
              group relative w-full py-4 rounded-xl font-bold text-lg tracking-wider shadow-lg transform transition-all duration-200 active:scale-95
              ${!isConnected ? 'bg-slate-700 text-slate-500 cursor-not-allowed' :
                                (isOn
                                    ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white shadow-orange-900/50'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-emerald-900/50')
                            }
            `}
                    >
                        <span className="flex items-center justify-center gap-3">
                            <Power className="w-5 h-5" />
                            {isOn ? 'TURN OFF' : 'TURN ON'}
                        </span>
                    </button>

                </div>

                {/* Footer Info */}
                <div className="bg-slate-900 p-4 flex justify-between items-center text-slate-500 text-xs border-t border-slate-800">
                    <div className="flex items-center gap-1">
                        <Activity size={14} />
                        <span>Mode: REST API</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Wifi size={14} />
                        <span>IoT Dashboard v1.0</span>
                    </div>
                </div>

            </div>
        </div>
    );
}