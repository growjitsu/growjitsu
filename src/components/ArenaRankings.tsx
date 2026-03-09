import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Target, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../services/supabase';
import { ArenaProfile } from '../types';
import { modalities } from '../utils/data';

export const ArenaRankings: React.FC = () => {
  const [rankings, setRankings] = useState<ArenaProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    scope: 'Mundial',
    modality: 'Todas',
    city: 'Todas',
    country: 'Brasil'
  });

  useEffect(() => {
    fetchRankings();
  }, [filter]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('arena_score', { ascending: false })
        .limit(50);

      if (filter.modality !== 'Todas') {
        // Normalize the filter modality to handle common variations (hyphens vs spaces)
        // and use ilike with wildcards for maximum flexibility
        const searchPattern = filter.modality.replace(/[-\s]/g, '%');
        query = query.ilike('modality', `%${searchPattern}%`);
      }
      
      if (filter.scope === 'Cidade' && filter.city !== 'Todas') {
        query = query.ilike('city', filter.city);
      } else if (filter.scope === 'Nacional' && filter.country !== 'Todas') {
        query = query.eq('country', filter.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--text-main)] italic">
          Arena <span className="text-[var(--primary)]">Rankings</span>
        </h1>
        <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.3em] font-bold">O topo do esporte nacional</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="relative group">
          <select 
            value={filter.scope}
            onChange={(e) => setFilter({...filter, scope: e.target.value})}
            className="appearance-none bg-[var(--surface)] border border-[var(--border-ui)] rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-main)] focus:border-[var(--primary)] outline-none cursor-pointer pr-10 transition-colors duration-300"
          >
            <option>Mundial</option>
            <option>Nacional</option>
            <option>Cidade</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        <div className="relative group">
          <select 
            value={filter.modality}
            onChange={(e) => setFilter({...filter, modality: e.target.value})}
            className="appearance-none bg-[var(--surface)] border border-[var(--border-ui)] rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-main)] focus:border-[var(--primary)] outline-none cursor-pointer pr-10 transition-colors duration-300"
          >
            <option>Todas</option>
            {modalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {filter.scope === 'Nacional' && (
          <div className="relative group">
            <select 
              value={filter.country}
              onChange={(e) => setFilter({...filter, country: e.target.value})}
              className="appearance-none bg-[var(--surface)] border border-[var(--border-ui)] rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-main)] focus:border-[var(--primary)] outline-none cursor-pointer pr-10 transition-colors duration-300"
            >
              <option>Brasil</option>
              <option>EUA</option>
              <option>Japão</option>
              <option>Tailândia</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        )}

        {filter.scope === 'Cidade' && (
          <input 
            type="text"
            placeholder="Digite a cidade..."
            value={filter.city === 'Todas' ? '' : filter.city}
            onChange={(e) => setFilter({...filter, city: e.target.value || 'Todas'})}
            className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-main)] focus:border-[var(--primary)] outline-none transition-all w-48"
          />
        )}
      </div>

      {/* Ranking Table */}
      <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-3xl overflow-hidden transition-colors duration-300">
        <div className="grid grid-cols-12 p-4 border-b border-[var(--border-ui)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-7">Atleta</div>
          <div className="col-span-3 md:col-span-2 text-center">Arena Score</div>
          <div className="col-span-2 text-center hidden md:block">Vitórias</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-ui)]">
            {rankings.map((athlete, index) => (
                <Link 
                  to={`/user/@${athlete.username}`}
                  key={athlete.id}
                  className="grid grid-cols-12 p-4 items-center hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                >
                  <div className="col-span-1 text-center">
                    {index < 3 ? (
                      <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-black ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-zinc-300 text-black' :
                        'bg-amber-700 text-white'
                      }`}>
                        {index + 1}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-[var(--text-muted)]">{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-7 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg)] overflow-hidden flex-shrink-0">
                      {(athlete.profile_photo || athlete.avatar_url) && (
                        <img src={athlete.profile_photo || athlete.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-main)]">{athlete.full_name}</h3>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{athlete.modality} • {athlete.state}</p>
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-center">
                    <span className="text-[var(--primary)] font-black text-sm">{Math.round(athlete.arena_score)}</span>
                  </div>
                  <div className="col-span-2 text-center hidden md:block">
                    <span className="text-[var(--text-muted)] font-bold text-sm">{athlete.wins}</span>
                  </div>
                </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
