import { Trophy, Users, Calendar, MapPin, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_CHAMPIONSHIPS = [
  { id: 1, name: "Copa ArenaComp Primavera", date: "25 Out 2025", location: "São Paulo, SP", athletes: 124, status: "Inscrições Abertas" },
  { id: 2, name: "Open Jiu-Jitsu Pro", date: "12 Nov 2025", location: "Rio de Janeiro, RJ", athletes: 86, status: "Em Breve" },
  { id: 3, name: "Torneio Interno Gracie Barra", date: "05 Dez 2025", location: "Curitiba, PR", athletes: 45, status: "Finalizado" },
];

export default function ChampionshipModule() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black font-display tracking-tight text-[var(--text-main)]">Campeonatos</h1>
          <p className="text-[var(--text-muted)] mt-1">Gerencie seus eventos e chaves de luta.</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Criar Evento
        </button>
      </div>

      <div className="grid gap-4">
        {MOCK_CHAMPIONSHIPS.map((event, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={event.id}
            className="card-surface p-6 hover:bg-[var(--border-ui)]/50 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-bjj-blue/10 flex items-center justify-center text-bjj-blue">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-[var(--text-main)]">{event.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {event.athletes} Atletas</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.status === 'Inscrições Abertas' ? 'bg-emerald-500/20 text-emerald-500' : 
                  event.status === 'Em Breve' ? 'bg-bjj-blue/20 text-bjj-blue' : 'bg-[var(--border-ui)] text-[var(--text-muted)]'
                }`}>
                  {event.status}
                </span>
                <ChevronRight className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bracket Preview Placeholder */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold font-display mb-6 text-[var(--text-main)]">Visualização de Chaves (Demo)</h2>
        <div className="card-surface p-8 overflow-x-auto">
          <div className="flex gap-12 min-w-[800px]">
            {/* Round 1 */}
            <div className="flex flex-col justify-around gap-8">
              <BracketMatch athlete1="João Silva" athlete2="Pedro Santos" winner={1} />
              <BracketMatch athlete1="Lucas Lima" athlete2="Marcos Oliveira" winner={2} />
              <BracketMatch athlete1="Rafael Costa" athlete2="Bruno Souza" winner={1} />
              <BracketMatch athlete1="Gabriel Rocha" athlete2="Felipe Melo" winner={2} />
            </div>
            {/* Round 2 */}
            <div className="flex flex-col justify-around gap-16">
              <BracketMatch athlete1="João Silva" athlete2="Marcos Oliveira" winner={null} />
              <BracketMatch athlete1="Rafael Costa" athlete2="Felipe Melo" winner={null} />
            </div>
            {/* Final */}
            <div className="flex flex-col justify-center">
              <div className="w-48 h-24 border-2 border-bjj-blue/50 rounded-xl flex items-center justify-center bg-bjj-blue/10">
                <Trophy className="text-bjj-blue mr-2" />
                <span className="font-bold text-bjj-blue">FINAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketMatch({ athlete1, athlete2, winner }: { athlete1: string, athlete2: string, winner: number | null }) {
  return (
    <div className="w-48 flex flex-col gap-1">
      <div className={`p-2 rounded-t-lg border-l-4 ${winner === 1 ? 'border-bjj-blue bg-bjj-blue/10 text-bjj-blue' : 'border-[var(--border-ui)] bg-[var(--bg-app)] text-[var(--text-muted)]'} text-sm font-medium`}>
        {athlete1}
      </div>
      <div className={`p-2 rounded-b-lg border-l-4 ${winner === 2 ? 'border-bjj-blue bg-bjj-blue/10 text-bjj-blue' : 'border-[var(--border-ui)] bg-[var(--bg-app)] text-[var(--text-muted)]'} text-sm font-medium`}>
        {athlete2}
      </div>
    </div>
  );
}
