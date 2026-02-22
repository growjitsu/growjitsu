import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Trophy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Score {
  points: number;
  advantages: number;
  penalties: number;
}

export default function Scoreboard() {
  const [time, setTime] = useState(300); // 5 minutes default
  const [isActive, setIsActive] = useState(false);
  const [athleteA, setAthleteA] = useState<Score>({ points: 0, advantages: 0, penalties: 0 });
  const [athleteB, setAthleteB] = useState<Score>({ points: 0, advantages: 0, penalties: 0 });
  const [nameA, setNameA] = useState("Atleta 1");
  const [nameB, setNameB] = useState("Atleta 2");

  useEffect(() => {
    let interval: any = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateScore = (athlete: 'A' | 'B', field: keyof Score, delta: number) => {
    const setter = athlete === 'A' ? setAthleteA : setAthleteB;
    setter(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  };

  const resetMatch = () => {
    setIsActive(false);
    setTime(300);
    setAthleteA({ points: 0, advantages: 0, penalties: 0 });
    setAthleteB({ points: 0, advantages: 0, penalties: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-main)] p-4 md:p-8 font-display">
      {/* Header / Timer */}
      <div className="flex flex-col items-center justify-center mb-8">
        <motion.div 
          key={time}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-8xl md:text-[12rem] font-black tracking-tighter tabular-nums ${time < 30 ? 'text-red-500' : 'text-[var(--text-main)]'}`}
        >
          {formatTime(time)}
        </motion.div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`p-4 rounded-full ${isActive ? 'bg-[var(--border-ui)]' : 'bg-bjj-blue'} text-white transition-colors shadow-lg`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button 
            onClick={resetMatch}
            className="p-4 rounded-full bg-[var(--border-ui)] hover:bg-[var(--text-muted)]/20 transition-colors text-[var(--text-main)]"
          >
            <RotateCcw size={32} />
          </button>
        </div>
      </div>

      {/* Scoreboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Athlete A */}
        <ScoreCard 
          name={nameA} 
          setName={setNameA}
          score={athleteA} 
          updateScore={(f, d) => updateScore('A', f, d)}
          color="bg-bjj-blue text-white"
        />

        {/* Athlete B */}
        <ScoreCard 
          name={nameB} 
          setName={setNameB}
          score={athleteB} 
          updateScore={(f, d) => updateScore('B', f, d)}
          color="bg-white text-black border-2 border-zinc-200"
        />
      </div>
    </div>
  );
}

function ScoreCard({ name, setName, score, updateScore, color }: { 
  name: string, 
  setName: (n: string) => void,
  score: Score, 
  updateScore: (f: keyof Score, d: number) => void,
  color: string 
}) {
  return (
    <div className={`rounded-3xl p-6 flex flex-col justify-between ${color} shadow-2xl`}>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-3xl font-bold bg-transparent border-none outline-none mb-4 w-full"
      />
      
      <div className="flex flex-col gap-6">
        {/* Main Points */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold opacity-80 uppercase tracking-widest">Pontos</span>
          <div className="flex items-center gap-6">
            <button onClick={() => updateScore('points', -1)} className="p-2 rounded-lg bg-black/20 hover:bg-black/40"><Minus size={24}/></button>
            <span className="text-7xl font-black tabular-nums">{score.points}</span>
            <button onClick={() => updateScore('points', 1)} className="p-2 rounded-lg bg-black/20 hover:bg-black/40"><Plus size={24}/></button>
          </div>
        </div>

        {/* Advantages & Penalties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/10 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-bold uppercase mb-2 opacity-70">Vantagens</span>
            <div className="flex items-center gap-4">
              <button onClick={() => updateScore('advantages', -1)} className="p-1"><Minus size={18}/></button>
              <span className="text-3xl font-bold">{score.advantages}</span>
              <button onClick={() => updateScore('advantages', 1)} className="p-1"><Plus size={18}/></button>
            </div>
          </div>
          <div className="bg-red-500/20 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-bold uppercase mb-2 opacity-70">Punições</span>
            <div className="flex items-center gap-4">
              <button onClick={() => updateScore('penalties', -1)} className="p-1"><Minus size={18}/></button>
              <span className="text-3xl font-bold text-red-500">{score.penalties}</span>
              <button onClick={() => updateScore('penalties', 1)} className="p-1"><Plus size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
