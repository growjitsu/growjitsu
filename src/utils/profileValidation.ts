/**
 * Valida se o perfil do atleta está completo com base nas regras de negócio da ArenaComp.
 * 
 * Regras:
 * - Pelo menos 1 modalidade (no array ou no campo legado)
 * - Graduação/Faixa
 * - Equipe
 * - Gênero
 * - Data de Nascimento
 * - Categoria
 * - Peso
 * - Altura
 * - Academia
 */
export function isProfileComplete(profile: any) {
  if (!profile) return false;
  
  // 1. Modalidades (Pelo menos 1 válida)
  // Aceitamos tanto o array 'modalidades' quanto o campo legado 'modality'.
  const modalidades = profile.modalidades || [];
  const hasValidModalityInList = modalidades.some((m: any) => !!m.modality && String(m.modality).trim() !== '');
  const hasLegacyModality = !!profile.modality && String(profile.modality).trim() !== '';
  const hasModalities = hasValidModalityInList || hasLegacyModality;
  
  // 2. Graduação (Pode estar no perfil ou em qualquer uma das modalidades da lista)
  const hasGraduationInModalities = modalidades.some((m: any) => !!m.belt && String(m.belt).trim() !== '');
  const hasLegacyGraduation = !!(profile.graduation || profile.graduacao);
  const hasGraduation = hasGraduationInModalities || hasLegacyGraduation;
  
  // 3. Equipe
  const hasTeam = !!(profile.team || profile.team_id || profile.equipe);
  
  // 4. Gênero
  const hasGender = !!(profile.genero);
  
  // 5. Data de Nascimento
  const hasBirthDate = !!(profile.birth_date || profile.dataNascimento || profile.nascimento);
  
  // 6. Categoria
  const hasCategory = !!(profile.category || profile.categoria);
  
  // 7. Peso (Pode ser 0, então verificamos se não é nulo/vazio)
  const hasWeight = profile.weight !== undefined && profile.weight !== null && String(profile.weight).trim() !== '';
  
  // 8. Altura (Pode ser 0, então verificamos se não é nulo/vazio)
  const hasHeight = profile.height !== undefined && profile.height !== null && String(profile.height).trim() !== '';
  
  // 9. Academia
  const hasGym = !!(profile.gym_name || profile.academia);

  // O perfil é considerado completo se todos os critérios obrigatórios forem atendidos
  return !!(
    hasModalities &&
    hasGraduation &&
    hasTeam &&
    hasGender &&
    hasBirthDate &&
    hasCategory &&
    hasWeight &&
    hasHeight &&
    hasGym
  );
}
