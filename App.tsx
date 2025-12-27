
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ChatMessage, ShipResources, UITheme, ShipFile, SystemService } from './types';
import { INITIAL_RESOURCES, INITIAL_MISSION, ICONS, THEMES, LOG_SAMPLES, MOCK_FILES, MOCK_SERVICES } from './constants';
import { StatusBar } from './components/StatusBar';
import { ChatConsole } from './components/ChatConsole';
import { Hologram } from './components/Hologram';
import { TrainingGame } from './components/TrainingGame';
import { generateResponse, generateTTS, decodeAudioData, decodeBase64 } from './services/gemini';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    captainName: 'Nova',
    shipName: 'AEGIS-7',
    resources: INITIAL_RESOURCES,
    missions: INITIAL_MISSION,
    theme: 'cyan',
    systemLogs: [
      `[${new Date().toLocaleTimeString()}] AEGIS_OS v4.1 Initializing...`,
      `[${new Date().toLocaleTimeString()}] Kernel Loaded: AEGIS-K-400`,
    ],
    services: MOCK_SERVICES,
    files: MOCK_FILES,
    activeModule: 'NAV',
    messages: [
      {
        role: 'assistant',
        content: "Core initialized. Quantum link secure. Commander Zeta reporting for duty. All ship systems are currently at stable levels. What are your orders, Captain?",
        timestamp: Date.now(),
      }
    ],
    currentSector: 'Sol - Terra Orbit',
    credits: 15000,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRedAlert, setIsRedAlert] = useState(false);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ShipFile | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const themeStyles = THEMES[gameState.theme];

  // Simulation: Dynamic Logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${LOG_SAMPLES[Math.floor(Math.random() * LOG_SAMPLES.length)]}`;
      setGameState(prev => ({
        ...prev,
        systemLogs: [newLog, ...prev.systemLogs].slice(0, 50)
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulation: Background Resource Drain
  useEffect(() => {
    const interval = setInterval(() => {
      const activeDrain = gameState.services.filter(s => s.active).reduce((sum, s) => sum + s.powerDrain, 0) / 100;
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          energy: Math.max(0, prev.resources.energy - activeDrain),
          oxygen: Math.max(0, prev.resources.oxygen - 0.01),
        }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [gameState.services]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const playResponseAudio = async (text: string) => {
    initAudio();
    if (!audioContextRef.current) return;

    try {
      const base64Audio = await generateTTS(text);
      if (!base64Audio) return;

      if (activeAudioSourceRef.current) {
        activeAudioSourceRef.current.stop();
      }

      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsAudioPlaying(false);
      
      activeAudioSourceRef.current = source;
      setIsAudioPlaying(true);
      source.start();
    } catch (err) {
      console.error("Audio playback error", err);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: ChatMessage = { role: 'user', content, timestamp: Date.now() };
    
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg]
    }));

    setIsLoading(true);

    try {
      const responseText = await generateResponse(content, gameState);
      const aiMsg: ChatMessage = { role: 'assistant', content: responseText, timestamp: Date.now() };
      
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMsg],
      }));

      playResponseAudio(responseText);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'system', content: '!! LINK_INTERRUPTED: Re-establishing neural path !!', timestamp: Date.now() };
      setGameState(prev => ({ ...prev, messages: [...prev.messages, errorMsg] }));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = (theme: UITheme) => {
    setGameState(prev => ({ ...prev, theme }));
    setIsRedAlert(theme === 'red');
  };

  const toggleService = (id: string) => {
    setGameState(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, active: !s.active } : s)
    }));
  };

  return (
    <div className={`h-screen w-screen flex flex-col p-4 md:p-6 gap-6 overflow-hidden transition-all duration-700 ${isRedAlert ? 'bg-red-950/20 shadow-[inset_0_0_100px_rgba(255,0,0,0.1)]' : 'bg-black'}`}>
      
      {/* Training Simulation Overlay */}
      {isTrainingActive && (
        <TrainingGame onClose={() => setIsTrainingActive(false)} theme={gameState.theme} />
      )}

      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 flex items-center justify-center border-2 ${themeStyles.border} rounded-lg bg-slate-900 shadow-xl group cursor-pointer relative`}>
            <span className={`font-orbitron font-black text-2xl ${themeStyles.primary}`}>Z</span>
          </div>
          <div>
            <h1 className={`font-orbitron text-xl font-bold tracking-tighter ${themeStyles.primary}`}>AEGIS_OS_V4</h1>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">Captain {gameState.captainName} | {gameState.shipName}</p>
              <div className="flex gap-1">
                {(['cyan', 'red', 'emerald'] as UITheme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => toggleTheme(t)}
                    className={`w-2.5 h-2.5 rounded-full ${t === 'cyan' ? 'bg-cyan-500' : t === 'red' ? 'bg-red-500' : 'bg-emerald-500'} ${gameState.theme === t ? 'ring-2 ring-white scale-125' : 'opacity-40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex gap-1 bg-slate-900/60 p-1 rounded border border-white/5">
           {(['NAV', 'FILE', 'SEC', 'KERN'] as const).map(mod => (
             <button 
              key={mod}
              onClick={() => setGameState(prev => ({ ...prev, activeModule: mod }))}
              className={`px-4 py-2 text-[10px] font-orbitron rounded transition-all ${gameState.activeModule === mod ? `${themeStyles.bg} ${themeStyles.primary} border ${themeStyles.border}` : 'text-slate-600 hover:text-slate-400'}`}
             >
               {mod}
             </button>
           ))}
        </div>

        <div className="hidden lg:flex items-center gap-6 bg-slate-900/40 p-3 rounded-lg border border-white/5">
          <div className="flex flex-col items-end px-4 border-r border-white/5">
            <span className="text-[9px] text-slate-500 uppercase font-orbitron">Credits</span>
            <span className="text-lg text-amber-400 font-orbitron font-bold tabular-nums">C {gameState.credits.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-slate-500 uppercase font-orbitron">Stability</span>
             <span className={`text-lg ${gameState.resources.energy > 20 ? 'text-emerald-400' : 'text-red-400'} font-orbitron font-bold`}>
               {gameState.resources.energy > 50 ? 'STABLE' : gameState.resources.energy > 20 ? 'DEGRADED' : 'CRITICAL'}
             </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10">
        
        {/* Left Panel: Resources & Services */}
        <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0 overflow-hidden">
          <div className={`p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg space-y-4 shadow-xl`}>
            <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2"><ICONS.Activity /> VITAL_STATS</div>
            </h2>
            <StatusBar label="Shield Output" value={gameState.resources.shields} color={themeStyles.primary} icon={<ICONS.Shield />} />
            <StatusBar label="Power Core" value={gameState.resources.energy} color="text-emerald-400" icon={<ICONS.Battery />} />
            <StatusBar label="Fuel Level" value={gameState.resources.fuel} color="text-amber-400" icon={<ICONS.Compass />} />
          </div>

          <div className={`flex-1 p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg flex flex-col min-h-0 shadow-xl overflow-hidden`}>
            <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center gap-2 mb-3`}>
              <ICONS.Settings /> DEVICE_DRIVERS
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
               {gameState.services.map(service => (
                 <div key={service.id} className="flex items-center justify-between p-2 bg-slate-950/40 border border-white/5 rounded">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-slate-300 font-bold uppercase">{service.name}</span>
                     <span className="text-[8px] text-slate-600">Drain: {service.powerDrain}kW/s</span>
                   </div>
                   <button 
                    onClick={() => toggleService(service.id)}
                    className={`px-2 py-1 text-[8px] font-orbitron rounded border transition-all ${service.active ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-600'}`}
                   >
                     {service.active ? 'ENABLED' : 'DISABLED'}
                   </button>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Center: Dynamic Module Display */}
        <div className="flex-1 flex flex-col min-h-0 relative bg-slate-950/40 rounded-lg border border-white/5 shadow-2xl overflow-hidden">
           {gameState.activeModule === 'NAV' && (
             <ChatConsole 
                messages={gameState.messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                theme={gameState.theme}
              />
           )}

           {gameState.activeModule === 'KERN' && (
             <div className="flex-1 p-6 font-mono text-xs overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                   <h3 className={`${themeStyles.primary} font-orbitron uppercase`}>Kernel_Log_Viewer</h3>
                   <span className="text-slate-600">AEGIS_K-400 r84</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                   {gameState.systemLogs.map((log, i) => (
                     <div key={i} className={`${log.includes('Fault') ? 'text-red-400' : log.includes('WARN') ? 'text-amber-400' : 'text-emerald-500/80'}`}>
                        {log}
                     </div>
                   ))}
                </div>
             </div>
           )}

           {gameState.activeModule === 'FILE' && (
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="w-full lg:w-1/3 border-r border-white/5 p-4 overflow-y-auto custom-scrollbar">
                   <h3 className={`text-[10px] ${themeStyles.primary} font-orbitron mb-4 uppercase`}>File_System</h3>
                   <div className="space-y-2">
                      {gameState.files.map(file => (
                        <div 
                          key={file.name}
                          onClick={() => setSelectedFile(file)}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedFile?.name === file.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                           <span className={themeStyles.primary}><ICONS.FileText /></span>
                           <span className="text-[10px] text-slate-300 truncate">{file.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/40">
                   {selectedFile ? (
                     <div className="animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                           <h4 className="text-xs font-bold text-slate-200 uppercase">{selectedFile.name}</h4>
                           <span className="text-[9px] text-slate-600">{selectedFile.type.toUpperCase()}</span>
                        </div>
                        <pre className="text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono">
                           {selectedFile.content}
                        </pre>
                     </div>
                   ) : (
                     <div className="h-full flex items-center justify-center text-slate-700 text-[10px] uppercase font-orbitron">
                        Select a file to read
                     </div>
                   )}
                </div>
             </div>
           )}

           {gameState.activeModule === 'SEC' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-xs p-6 border border-white/10 rounded-lg bg-slate-900/50 text-center space-y-6">
                   <div className={`p-4 rounded-full border-2 ${themeStyles.border} inline-block shadow-lg`}>
                      <span className={`${themeStyles.primary} scale-150 block`}><ICONS.Shield /></span>
                   </div>
                   <div className="space-y-2">
                      <h3 className={`font-orbitron text-sm ${themeStyles.primary}`}>SECURITY_MODULE_L4</h3>
                      <p className="text-[9px] text-slate-500">BIOMETRIC_LOCK: ENGAGED</p>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <button key={i} className="aspect-square border border-white/10 rounded bg-slate-950 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold">
                          {i + 1}
                        </button>
                      ))}
                   </div>
                   <button className="w-full py-2 bg-red-900/20 border border-red-500/50 text-red-500 text-[10px] font-orbitron rounded uppercase hover:bg-red-900/40 transition-all">
                      FORCE OVERRIDE
                   </button>
                </div>
             </div>
           )}

           {/* Audio Visualization Overlay */}
           {isAudioPlaying && (
             <div className="absolute top-4 right-4 flex items-end gap-[2px] h-6 pointer-events-none z-20">
                {[...Array(8)].map((_, i) => (
                  <div 
                   key={i} 
                   className={`w-[3px] rounded-t-sm transition-all duration-100 ${themeStyles.primary.replace('text-', 'bg-')}`} 
                   style={{ 
                     height: `${20 + Math.random() * 80}%`,
                     opacity: 0.8
                   }} 
                  />
                ))}
             </div>
           )}
        </div>

        {/* Right Panel: Sensors & Visuals */}
        <div className="hidden xl:flex w-72 flex-col gap-4 shrink-0 overflow-hidden">
          <div className={`p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg flex flex-col shadow-xl`}>
             <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center gap-2 mb-2`}>
              <ICONS.Compass /> SENSOR_GRID
            </h2>
            <Hologram themeColor={themeStyles.accent} />
            <div className="grid grid-cols-2 gap-2 text-[9px] mt-2">
               <div className="p-2 bg-slate-950 rounded border border-white/5">
                 <div className="text-slate-600 mb-1">LATENCY</div>
                 <div className={themeStyles.primary}>2.4ms</div>
               </div>
               <div className="p-2 bg-slate-950 rounded border border-white/5">
                 <div className="text-slate-600 mb-1">SCAN_RES</div>
                 <div className={themeStyles.primary}>4096p</div>
               </div>
            </div>
          </div>

          <div className={`flex-1 p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg flex flex-col min-h-0 shadow-xl overflow-hidden`}>
            <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center gap-2 mb-3 uppercase`}>
              Mission_Progress
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
               {gameState.missions.map(m => (
                 <div key={m.id} className="p-3 bg-slate-950 border border-white/5 rounded">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold text-amber-500">{m.title}</span>
                       <span className="text-[7px] text-emerald-400">85%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500/50" style={{ width: '85%' }} />
                    </div>
                 </div>
               ))}
            </div>
            
            {/* New Training Mission Button */}
            <button 
              onClick={() => setIsTrainingActive(true)}
              className={`mt-4 w-full py-3 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 ${themeStyles.primary} font-orbitron text-[10px] uppercase tracking-widest rounded transition-all animate-pulse`}
            >
              INIT_TRAINING_SIM
            </button>
          </div>
        </div>
      </div>

      {/* Footer System Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between text-[9px] border-t border-white/10 pt-4 font-orbitron gap-4 z-10">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${themeStyles.primary.replace('text-', 'bg-')} animate-pulse`} />
            <span className="text-slate-500 uppercase">SYSTEM_LOAD: 24%</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">CAPTAIN:</span>
            <span className={`${themeStyles.primary} font-bold`}>{gameState.captainName.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-2 py-0.5 rounded border ${isRedAlert ? 'border-red-500 text-red-500 animate-pulse' : 'border-slate-800 text-slate-700'}`}>
             FAULT_TOLERANCE_MODE: ACTIVE
           </div>
           <div className="text-slate-700 bg-slate-900/50 px-2 py-0.5 rounded border border-white/5 uppercase">
             Net_ID: {gameState.currentSector.split(' ')[0]}
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;
