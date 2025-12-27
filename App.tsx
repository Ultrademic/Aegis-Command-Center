
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ChatMessage, ShipResources, UITheme, ShipFile, SystemService, ViewMode, FleetMessage } from './types';
import { INITIAL_RESOURCES, INITIAL_MISSION, ICONS, THEMES, LOG_SAMPLES, MOCK_FILES, MOCK_SERVICES, FLEET_SAMPLES, SECTORS } from './constants';
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
      `[${new Date().toLocaleTimeString()}] AEGIS_OS v4.2 Deep Space Protocol...`,
      `[${new Date().toLocaleTimeString()}] Neural Comms Link: 99.8% Efficiency`,
    ],
    services: MOCK_SERVICES,
    files: MOCK_FILES,
    activeModule: 'NAV',
    viewMode: 'SYSTEM',
    fleetMessages: [
      { id: 'f1', sender: 'SS RELIANT', content: 'Entering nebulous sector 4. All quiet.', timestamp: Date.now() - 50000, priority: 'LOW' }
    ],
    messages: [
      {
        role: 'assistant',
        content: "Aegis Command initialized. Comms tether verified. Commander Zeta reporting. I have established a secure uplink to the Galactic Fleet Network. Standing by for command inputs.",
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
  const [isJumping, setIsJumping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ShipFile | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const themeStyles = THEMES[gameState.theme];

  // Simulation: Fleet Transmissions
  useEffect(() => {
    const interval = setInterval(() => {
      const sample = FLEET_SAMPLES[Math.floor(Math.random() * FLEET_SAMPLES.length)];
      const newMsg: FleetMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: sample.sender,
        content: sample.content,
        timestamp: Date.now(),
        priority: sample.priority as any
      };
      setGameState(prev => ({
        ...prev,
        fleetMessages: [newMsg, ...prev.fleetMessages].slice(0, 5)
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Simulation: Dynamic Logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] ${LOG_SAMPLES[Math.floor(Math.random() * LOG_SAMPLES.length)]}`;
      setGameState(prev => ({
        ...prev,
        systemLogs: [newLog, ...prev.systemLogs].slice(0, 50)
      }));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleJump = async () => {
    if (gameState.resources.fuel < 20) {
      handleSendMessage("Commander, fuel reserves insufficient for Interstellar Jump.");
      return;
    }
    
    setIsJumping(true);
    const targetSector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    
    // Sequence: 3 seconds warp
    setTimeout(async () => {
      setGameState(prev => ({
        ...prev,
        currentSector: targetSector,
        resources: { ...prev.resources, fuel: prev.resources.fuel - 20 }
      }));
      setIsJumping(false);
      handleSendMessage(`Initiate Interstellar Jump to ${targetSector}. Provide a sector analysis upon arrival.`);
    }, 3000);
  };

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
    setGameState(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setIsLoading(true);

    try {
      const responseText = await generateResponse(content, gameState);
      const aiMsg: ChatMessage = { role: 'assistant', content: responseText, timestamp: Date.now() };
      setGameState(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
      playResponseAudio(responseText);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'system', content: '!! COMMS_FAILURE: SIGNAL LOST !!', timestamp: Date.now() };
      setGameState(prev => ({ ...prev, messages: [...prev.messages, errorMsg] }));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = (theme: UITheme) => {
    setGameState(prev => ({ ...prev, theme }));
    setIsRedAlert(theme === 'red');
  };

  return (
    <div className={`h-screen w-screen flex flex-col p-4 md:p-6 gap-6 overflow-hidden transition-all duration-700 ${isRedAlert ? 'bg-red-950/20 shadow-[inset_0_0_100px_rgba(255,0,0,0.1)]' : 'bg-black'}`}>
      
      {/* Warp Visual Effect */}
      {isJumping && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
           <div className="w-full h-full flex items-center justify-center">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-white/50 w-1 h-[200vh] animate-[warp_0.5s_linear_infinite]" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    animationDelay: `${Math.random() * 0.5}s`,
                    opacity: Math.random()
                  }} 
                />
              ))}
              <div className="font-orbitron text-4xl font-black text-cyan-400 animate-pulse tracking-[1em] relative z-20">WARP_ACTIVE</div>
           </div>
        </div>
      )}

      {isTrainingActive && (
        <TrainingGame onClose={() => setIsTrainingActive(false)} theme={gameState.theme} />
      )}

      {/* Header HUD */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 flex items-center justify-center border-2 ${themeStyles.border} rounded-lg bg-slate-900 shadow-xl group cursor-pointer relative`}>
            <span className={`font-orbitron font-black text-2xl ${themeStyles.primary}`}>Z</span>
          </div>
          <div>
            <h1 className={`font-orbitron text-xl font-bold tracking-tighter ${themeStyles.primary}`}>AEGIS_OS_V4.2</h1>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">{gameState.shipName} | CORE_ZETA_ENABLED</p>
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
            <span className="text-[9px] text-slate-500 uppercase font-orbitron">Fuel</span>
            <span className={`text-lg font-orbitron font-bold tabular-nums ${gameState.resources.fuel < 25 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
              {Math.floor(gameState.resources.fuel)}%
            </span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-slate-500 uppercase font-orbitron">Credits</span>
             <span className="text-lg text-emerald-400 font-orbitron font-bold">C {gameState.credits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 z-10">
        
        {/* Left Panel: Fleet Comms & System Stats */}
        <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0 overflow-hidden">
          <div className={`p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg space-y-4 shadow-xl`}>
            <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2"><ICONS.Radio /> FLEET_TRANSMISSIONS</div>
            </h2>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
               {gameState.fleetMessages.map(msg => (
                 <div key={msg.id} className="p-2 bg-slate-950/40 border border-white/5 rounded animate-[fadeIn_0.5s_ease-out]">
                    <div className="flex justify-between items-center mb-1">
                       <span className={`text-[8px] font-bold ${msg.priority === 'HIGH' ? 'text-red-400' : 'text-slate-400'}`}>{msg.sender}</span>
                       <span className="text-[7px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 line-clamp-2 italic">"{msg.content}"</p>
                 </div>
               ))}
            </div>
          </div>

          <div className={`flex-1 p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg flex flex-col min-h-0 shadow-xl overflow-hidden`}>
            <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center gap-2 mb-3`}>
              <ICONS.Activity /> SHIP_VITALITY
            </h2>
            <div className="space-y-4">
               <StatusBar label="Hull Integrity" value={gameState.resources.hull} color="text-red-400" icon={<ICONS.Zap />} />
               <StatusBar label="Shield Output" value={gameState.resources.shields} color={themeStyles.primary} icon={<ICONS.Shield />} />
               <StatusBar label="Power Core" value={gameState.resources.energy} color="text-emerald-400" icon={<ICONS.Battery />} />
            </div>
          </div>
        </div>

        {/* Center: Module Display */}
        <div className="flex-1 flex flex-col min-h-0 relative bg-slate-950/40 rounded-lg border border-white/5 shadow-2xl overflow-hidden">
           {gameState.activeModule === 'NAV' && (
             <ChatConsole messages={gameState.messages} onSendMessage={handleSendMessage} isLoading={isLoading} theme={gameState.theme} />
           )}

           {gameState.activeModule === 'KERN' && (
             <div className="flex-1 p-6 font-mono text-xs overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                   <h3 className={`${themeStyles.primary} font-orbitron uppercase`}>Kernel_Log_Stream</h3>
                   <span className="text-slate-600">UPTIME_742H</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                   {gameState.systemLogs.map((log, i) => (
                     <div key={i} className={`${log.includes('Fault') ? 'text-red-400' : 'text-emerald-500/80'}`}>{log}</div>
                   ))}
                </div>
             </div>
           )}

           {gameState.activeModule === 'FILE' && (
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="w-full lg:w-1/3 border-r border-white/5 p-4 overflow-y-auto custom-scrollbar">
                   <h3 className={`text-[10px] ${themeStyles.primary} font-orbitron mb-4 uppercase`}>Storage_Array</h3>
                   <div className="space-y-2">
                      {gameState.files.map(file => (
                        <div key={file.name} onClick={() => setSelectedFile(file)} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedFile?.name === file.name ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                           <span className={themeStyles.primary}><ICONS.FileText /></span>
                           <span className="text-[10px] text-slate-300 truncate">{file.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto bg-black/40">
                   {selectedFile ? (
                     <div className="animate-[fadeIn_0.3s_ease-out]">
                        <h4 className="text-xs font-bold text-slate-200 uppercase mb-4 border-b border-white/10 pb-2">{selectedFile.name}</h4>
                        <pre className="text-[10px] text-slate-400 leading-relaxed font-mono">{selectedFile.content}</pre>
                     </div>
                   ) : <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-orbitron">NO_FILE_MOUNTED</div>}
                </div>
             </div>
           )}

           {gameState.activeModule === 'SEC' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')]">
                <div className="p-12 border-2 border-dashed border-white/10 rounded-full animate-[spin_60s_linear_infinite]">
                   <div className={`p-12 border-4 ${themeStyles.border} rounded-full`}>
                      <span className={`${themeStyles.primary} scale-[3] block`}><ICONS.Shield /></span>
                   </div>
                </div>
                <div className="mt-8 text-center">
                   <h2 className={`font-orbitron text-xl ${themeStyles.primary} animate-pulse`}>ENCRYPTION_ACTIVE</h2>
                   <p className="text-[10px] text-slate-600 mt-2">LEVEL_9_QUANTUM_BARRIER_ENGAGED</p>
                </div>
             </div>
           )}
        </div>

        {/* Right Panel: Advanced Sensors & Jump Drive */}
        <div className="hidden xl:flex w-72 flex-col gap-4 shrink-0 overflow-hidden">
          <div className={`p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg flex flex-col shadow-xl`}>
             <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} flex items-center gap-2`}>
                   <ICONS.Compass /> VISUAL_FEED
                </h2>
                <div className="flex gap-1">
                   {(['SYSTEM', 'SHIP'] as ViewMode[]).map(v => (
                     <button key={v} onClick={() => setGameState(prev => ({ ...prev, viewMode: v }))} className={`px-2 py-0.5 text-[8px] border ${gameState.viewMode === v ? themeStyles.border + ' ' + themeStyles.primary : 'border-slate-800 text-slate-600'}`}>
                        {v}
                     </button>
                   ))}
                </div>
             </div>
            
            <Hologram themeColor={themeStyles.accent} viewMode={gameState.viewMode} hullIntegrity={gameState.resources.hull} />
            
            <div className="mt-4 p-3 bg-slate-950/60 rounded border border-white/5 space-y-2">
               <div className="flex justify-between text-[9px] font-orbitron">
                  <span className="text-slate-600">SECTOR:</span>
                  <span className={themeStyles.primary}>{gameState.currentSector.toUpperCase()}</span>
               </div>
               <button 
                  onClick={handleJump}
                  className={`w-full py-3 mt-2 border ${themeStyles.border} bg-cyan-900/10 ${themeStyles.primary} font-orbitron text-[10px] uppercase hover:bg-white/5 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]`}
               >
                  INITIATE_WARP_JUMP
               </button>
            </div>
          </div>

          <div className={`flex-1 p-4 border ${themeStyles.border} bg-slate-900/60 backdrop-blur rounded-lg flex flex-col min-h-0 shadow-xl overflow-hidden`}>
            <h2 className={`font-orbitron text-[10px] ${themeStyles.primary} border-b border-white/10 pb-2 flex items-center gap-2 mb-3 uppercase`}>
              Training_Log
            </h2>
            <div className="space-y-4 flex-1">
               <div className="p-3 bg-slate-950 border border-white/5 rounded">
                  <div className="text-[9px] font-bold text-amber-500 mb-2">LAST_SIMULATION</div>
                  <div className="text-[14px] text-cyan-400 font-orbitron">SCORE: 1,420</div>
                  <div className="text-[8px] text-slate-600 mt-1 italic">Simulation Rank: Senior Pilot</div>
               </div>
               <button onClick={() => setIsTrainingActive(true)} className={`w-full py-2 border border-slate-700 bg-slate-900 text-[9px] font-orbitron text-slate-400 uppercase hover:text-white transition-all`}>
                  RE-ENTER_COCKPIT
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between text-[9px] border-t border-white/10 pt-4 font-orbitron gap-4 z-10">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${themeStyles.primary.replace('text-', 'bg-')} animate-pulse`} />
            <span className="text-slate-500">QUANTUM_LINK: SECURE</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-2 text-slate-600">COORD_X: <span className="text-slate-400">{Math.random().toFixed(4)}</span></div>
          <div className="flex items-center gap-2 text-slate-600">COORD_Y: <span className="text-slate-400">{Math.random().toFixed(4)}</span></div>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-slate-700 bg-slate-900/50 px-2 py-0.5 rounded border border-white/5 uppercase">
             Fleet_ID: DELTA-9
           </div>
        </div>
      </div>

      <style>{`
        @keyframes warp {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
