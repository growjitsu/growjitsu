import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Shield, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { Team } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    location: '',
    description: '',
    logo_url: ''
  });
  const pageSize = 10;

  useEffect(() => {
    fetchTeams();
  }, [page]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('teams')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error } = await query
        .order('name', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setTeams(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTeams();
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta equipe?')) return;
    
    try {
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;
      setTeams(prev => prev.filter(t => t.id !== teamId));
      alert('Equipe excluída com sucesso.');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Erro ao excluir equipe.');
    }
  };

  const handleSaveTeam = async () => {
    try {
      if (selectedTeam) {
        const { error } = await supabase
          .from('teams')
          .update(formData)
          .eq('id', selectedTeam.id);
        if (error) throw error;
        setTeams(prev => prev.map(t => t.id === selectedTeam.id ? { ...t, ...formData } : t));
      } else {
        const { error } = await supabase
          .from('teams')
          .insert([formData]);
        if (error) throw error;
        fetchTeams();
      }
      setIsModalOpen(false);
      alert(`Equipe ${selectedTeam ? 'atualizada' : 'criada'} com sucesso.`);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Erro ao salvar equipe.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar equipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 transition-all"
          />
        </form>
        <button
          onClick={() => {
            setSelectedTeam(null);
            setFormData({ name: '', location: '', description: '', logo_url: '' });
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Nova Equipe</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-full" />
              </div>
            </div>
          ))
        ) : teams.length > 0 ? (
          teams.map((team) => (
            <motion.div
              layout
              key={team.id}
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden p-2">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-full h-full text-gray-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">{team.name}</h3>
                    <div className="flex items-center space-x-1 text-gray-500 mt-1">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{team.location || 'Sem Localização'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => {
                      setSelectedTeam(team);
                      setFormData({ ...team });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTeam(team.id)}
                    className="p-2 text-gray-500 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-[10px] font-medium text-gray-400 line-clamp-2 mb-4 h-8">
                {team.description || 'Nenhuma descrição fornecida.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center space-x-2">
                  <Users size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">128 Atletas</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline">
                  Ver Detalhes
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500 font-bold italic bg-[#0f0f0f] border border-white/10 rounded-3xl">
            Nenhuma equipe encontrada
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-3 rounded-2xl bg-[#0f0f0f] border border-white/10 text-gray-400 disabled:opacity-30 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black uppercase tracking-widest">Página {page}</span>
          <button
            disabled={page * pageSize >= totalCount}
            onClick={() => setPage(page + 1)}
            className="p-3 rounded-2xl bg-[#0f0f0f] border border-white/10 text-gray-400 disabled:opacity-30 hover:text-white transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Team Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic tracking-tight">
                  {selectedTeam ? 'Editar Equipe' : 'Nova Equipe'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nome da Equipe</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-blue-500"
                    placeholder="Ex: Alliance Jiu-Jitsu"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Localização</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-blue-500"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">URL do Logo</label>
                  <input
                    type="text"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-blue-500 h-32 resize-none"
                    placeholder="Conte um pouco sobre a equipe..."
                  />
                </div>
              </div>

              <div className="p-8 border-t border-white/10 bg-white/5 flex items-center justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTeam}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                >
                  {selectedTeam ? 'Salvar Alterações' : 'Criar Equipe'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
