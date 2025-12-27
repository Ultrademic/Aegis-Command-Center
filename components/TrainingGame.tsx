
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ICONS, THEMES } from '../constants';
import { UITheme } from '../types';

interface TrainingGameProps {
  onClose: () => void;
  theme: UITheme;
}

export const TrainingGame: React.FC<TrainingGameProps> = ({ onClose, theme }) => {
  const themeStyles = THEMES[theme];
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(50); // percentage 0-100
  const [obstacles, setObstacles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const obstacleIdRef = useRef(0);

  const spawnObstacle = useCallback(() => {
    const newObstacle = {
      id: obstacleIdRef.current++,
      x: 110,
      y: Math.random() * 90 + 5,
      size: Math.random() * 20 + 10,
    };
    setObstacles(prev => [...prev, newObstacle]);
  }, []);

  const update = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;

      setObstacles(prev => {
        const nextObstacles = prev
          .map(obs => ({ ...obs, x: obs.x - 0.1 * deltaTime })) // Move speed
          .filter(obs => obs.x > -20); // Remove off-screen

        // Collision Check
        const collision = nextObstacles.find(obs => {
          const dx = Math.abs(obs.x - 10); // Player is at x: 10
          const dy = Math.abs(obs.y - playerY);
          return dx < 5 && dy < (obs.size / 2 + 5);
        });

        if (collision) {
          setGameOver(true);
          setGameStarted(false);
        }

        return nextObstacles;
      });

      setScore(s => s + 1);
    }
    lastTimeRef.current = time;
    if (!gameOver && gameStarted) {
      requestRef.current = requestAnimationFrame(update);
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(update);
      const spawnInterval = setInterval(spawnObstacle, 1500);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(spawnInterval);
      };
    }
  }, [gameStarted, gameOver, playerY, spawnObstacle]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') setPlayerY(y => Math.max(5, y - 8));
    if (e.key === 'ArrowDown') setPlayerY(y => Math.min(95, y + 8));
    if (e.key === ' ' && !gameStarted) startGame();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setPlayerY(50);
    lastTimeRef.current = performance.now();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className={`relative w-full max-w-2xl aspect-video border-2 ${themeStyles.border} bg-slate-950 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg`}>
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
        
        {/* Game Area */}
        <div ref={gameRef} className="relative w-full h-full p-4">
          <div className="flex justify-between items-start mb-4 z-20 relative">
            <div className="font-orbitron text-xs text-slate-500 uppercase tracking-widest">
              Training_Sim: <span className={themeStyles.primary}>Sector_Zero</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-orbitron text-sm font-bold text-amber-400">SCORE: {Math.floor(score / 10)}</div>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                [X] EXIT
              </button>
            </div>
          </div>

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-8">
              <h2 className={`font-orbitron text-2xl font-black mb-4 ${themeStyles.primary} tracking-tighter`}>EVASION_TRAINING_INIT</h2>
              <p className="text-xs text-slate-400 mb-8 max-w-md">Pilot the scout craft through the asteroid field. Use [UP/DOWN] arrows to navigate. Avoid collision at all costs.</p>
              <button 
                onClick={startGame}
                className={`px-8 py-3 border-2 ${themeStyles.border} ${themeStyles.bg} ${themeStyles.primary} font-orbitron text-sm uppercase tracking-widest hover:brightness-125 transition-all`}
              >
                ENGAGE_THRUSTERS
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center bg-red-950/20">
              <h2 className="font-orbitron text-3xl font-black mb-2 text-red-500 tracking-tighter">SIMULATION_FAILED</h2>
              <div className="text-xl font-orbitron text-amber-400 mb-8">FINAL_SCORE: {Math.floor(score / 10)}</div>
              <div className="flex gap-4">
                <button 
                  onClick={startGame}
                  className="px-6 py-2 border border-red-500 text-red-500 font-orbitron text-xs uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  REBOOT_SIM
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-700 text-slate-400 font-orbitron text-xs uppercase hover:bg-slate-700 hover:text-white transition-all"
                >
                  ABORT
                </button>
              </div>
            </div>
          )}

          {gameStarted && (
            <div className="absolute inset-0">
              {/* Stars Background Animation */}
              <div className="absolute inset-0 animate-[slide_20s_linear_infinite] opacity-30">
                {[...Array(50)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-white rounded-full" 
                    style={{ 
                      width: Math.random() * 2, 
                      height: Math.random() * 2,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`
                    }} 
                  />
                ))}
              </div>

              {/* Player Ship */}
              <div 
                className={`absolute left-[10%] w-10 h-6 -translate-y-1/2 transition-all duration-75 flex items-center justify-center`}
                style={{ top: `${playerY}%` }}
              >
                <div className={`relative w-full h-full border border-${themeStyles.accent}-400/50 bg-${themeStyles.accent}-950/50 rounded-sm overflow-hidden`}>
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1 bg-${themeStyles.accent}-400 animate-pulse`} />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-cyan-400/20" />
                </div>
                {/* Engine Flame */}
                <div className="absolute -left-4 w-4 h-2 bg-gradient-to-r from-orange-500/0 to-orange-500 animate-pulse blur-sm" />
              </div>

              {/* Obstacles */}
              {obstacles.map(obs => (
                <div 
                  key={obs.id}
                  className="absolute border border-slate-700 bg-slate-900 rounded-sm flex items-center justify-center overflow-hidden"
                  style={{ 
                    left: `${obs.x}%`, 
                    top: `${obs.y}%`, 
                    width: obs.size, 
                    height: obs.size,
                    transform: 'translate(-50%, -50%) rotate(45deg)' 
                  }}
                >
                  <div className="absolute inset-0 bg-slate-800 opacity-50" />
                  <div className="text-[8px] text-slate-600 font-bold uppercase -rotate-45">DEB</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
