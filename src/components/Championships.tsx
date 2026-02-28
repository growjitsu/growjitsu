import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, MapPin, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../services/supabase';
import { Championship } from '../types';

export default function ChampionshipModule() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChampionships = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campeonatos')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setChampionships(data || []);
    } catch (err) {
      console.error('Erro ao buscar campeonatos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampionships();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bjj-blue" />
      </div>
    );
  }

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
        {championships.length > 0 ? (
          championships.map((event, idx) => (
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
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> Inscrições {event.status === 'open' ? 'Abertas' : 'Encerradas'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    event.status === 'open' ? 'bg-emerald-500/20 text-emerald-500' : 
                    event.status === 'closed' ? 'bg-amber-500/20 text-amber-500' : 'bg-[var(--border-ui)] text-[var(--text-muted)]'
                  }`}>
                    {event.status === 'open' ? 'Inscrições Abertas' : event.status === 'closed' ? 'Inscrições Encerradas' : 'Finalizado'}
                  </span>
                  <ChevronRight className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="card-surface p-12 text-center text-[var(--text-muted)]">
            Nenhum campeonato encontrado no banco de dados.
          </div>
        )}
      </div>

      {/* Bracket Preview Placeholder */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold font-display mb-6 text-[var(--text-main)]">Visualização de Chaves</h2>
        <div className="card-surface p-8 overflow-x-auto">
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
            <Trophy size={48} className="mb-4 opacity-20" />
            <p className="font-bold">As chaves serão geradas automaticamente após o fechamento das inscrições.</p>
            <p className="text-sm">Selecione um campeonato para ver as chaves em tempo real.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
