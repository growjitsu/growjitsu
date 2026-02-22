import { BookOpen, PlayCircle, Shield, Award, ChevronRight, Search } from 'lucide-react';
import { motion } from 'motion/react';

const TECHNIQUES = [
  { id: 1, title: "Armlock da Guarda Fechada", belt: "Branca", category: "Finalizações", duration: "4:20" },
  { id: 2, title: "Raspagem de Gancho", belt: "Branca", category: "Raspagens", duration: "3:45" },
  { id: 3, title: "Passagem de Guarda Toureando", belt: "Azul", category: "Passagens", duration: "5:12" },
  { id: 4, title: "Triângulo Invertido", belt: "Roxa", category: "Finalizações", duration: "6:05" },
  { id: 5, title: "Defesa de Queda (Sprawl)", belt: "Branca", category: "Defesas", duration: "2:50" },
];

const BELTS = [
  { name: "Branca", color: "bg-white text-black" },
  { name: "Azul", color: "bg-blue-600 text-white" },
  { name: "Roxa", color: "bg-purple-600 text-white" },
  { name: "Marrom", color: "bg-amber-900 text-white" },
  { name: "Preta", color: "bg-zinc-900 text-white border border-zinc-700" },
];

export default function TechniqueLibrary() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black font-display tracking-tight text-[var(--text-main)]">Biblioteca Técnica</h1>
        <p className="text-[var(--text-muted)] mt-1">Aprenda com os melhores professores e organize seu estudo.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
          <input 
            placeholder="Buscar técnica, posição ou professor..." 
            className="w-full bg-[var(--bg-card)] border border-[var(--border-ui)] text-[var(--text-main)] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-bjj-blue/50 transition-all"
          />
        </div>
      </div>

      {/* Belts Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {BELTS.map(belt => (
          <button 
            key={belt.name}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-transform active:scale-95 ${belt.color} shadow-md`}
          >
            Faixa {belt.name}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {['Finalizações', 'Raspagens', 'Passagens', 'Quedas'].map(cat => (
          <div key={cat} className="card-surface p-4 flex flex-col items-center justify-center gap-2 hover:bg-bjj-blue/5 cursor-pointer transition-colors group">
            <div className="w-10 h-10 rounded-full bg-[var(--border-ui)] flex items-center justify-center group-hover:bg-bjj-blue/20 transition-colors">
              <Award size={20} className="text-bjj-blue" />
            </div>
            <span className="font-bold text-sm text-[var(--text-main)]">{cat}</span>
          </div>
        ))}
      </div>

      {/* Techniques List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display mb-4 text-[var(--text-main)]">Técnicas Recomendadas</h2>
        {TECHNIQUES.map((tech, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={tech.id}
            className="card-surface p-4 flex items-center justify-between hover:bg-[var(--border-ui)]/50 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-16 rounded-lg bg-[var(--border-ui)] overflow-hidden flex items-center justify-center">
                <PlayCircle className="text-[var(--text-muted)] group-hover:text-bjj-blue transition-colors z-10" size={32} />
                <img 
                  src={`https://picsum.photos/seed/${tech.id}/200/120`} 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-main)]">{tech.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="text-[var(--text-muted)]">{tech.category}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--border-ui)]" />
                  <span className="text-[var(--text-muted)]">{tech.duration}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    tech.belt === 'Branca' ? 'bg-white text-black border border-zinc-200' : 
                    tech.belt === 'Azul' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {tech.belt}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
