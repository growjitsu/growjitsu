export type UserType = 'atleta' | 'coordenador';

export type Belt = 'Branca' | 'Cinza' | 'Amarela' | 'Laranja' | 'Verde' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta';

export type Gender = 'Masculino' | 'Feminino';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: UserType;
  perfil_ativo: UserType;
  foto_url?: string;
  created_at: string;
}

export interface AthleteProfile {
  id: string;
  nome_completo: string;
  genero: Gender;
  graduacao: string;
  data_nascimento: string;
  peso: number;
  equipe: string;
  perfil_completo: boolean;
  atualizado_em: string;
}

export interface Championship {
  id: string;
  name: string;
  date: string;
  location: string;
  created_by: string;
  status: 'open' | 'closed' | 'finished';
}

export interface Registration {
  id: string;
  athlete_id: string;
  championship_id: string;
  final_category: string;
  status: 'pending' | 'confirmed' | 'disqualified';
}
