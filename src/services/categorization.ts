import { AthleteProfile, Gender, Belt } from '../types';

export const calculateCompetitiveAge = (birthDate: string): number => {
  const birthYear = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
};

export const getAgeCategory = (age: number): string => {
  if (age <= 5) return 'PRÉ MIRIM';
  if (age <= 7) return 'MIRIM';
  if (age <= 9) return 'INFANTIL A';
  if (age <= 11) return 'INFANTIL B';
  if (age <= 13) return 'INFANTO A';
  if (age <= 15) return 'INFANTO B';
  if (age <= 17) return 'JUVENIL';
  if (age <= 29) return 'ADULTO';
  if (age <= 35) return 'MASTER 1';
  if (age <= 40) return 'MASTER 2';
  if (age <= 45) return 'MASTER 3';
  if (age <= 50) return 'MASTER 4';
  if (age <= 55) return 'MASTER 5';
  return 'MASTER 6';
};

// Simplified IBJJF-like weight classes for Adult/Master (Gi)
// In a real app, this would be a complex table lookup
export const getWeightCategory = (gender: Gender, weight: number, ageCategory: string): string => {
  const isAdultOrMaster = ageCategory.includes('ADULTO') || ageCategory.includes('MASTER');
  
  if (gender === 'Masculino') {
    if (isAdultOrMaster) {
      if (weight <= 57.5) return 'Galo';
      if (weight <= 64.0) return 'Pluma';
      if (weight <= 70.0) return 'Pena';
      if (weight <= 76.0) return 'Leve';
      if (weight <= 82.3) return 'Médio';
      if (weight <= 88.3) return 'Meio-Pesado';
      if (weight <= 94.3) return 'Pesado';
      if (weight <= 100.5) return 'Super-Pesado';
      return 'Pesadíssimo';
    }
    // Juvenile/Kids simplified
    if (weight <= 50) return 'Pena';
    if (weight <= 60) return 'Leve';
    return 'Pesado';
  } else {
    // Feminino
    if (isAdultOrMaster) {
      if (weight <= 48.5) return 'Galo';
      if (weight <= 53.5) return 'Pluma';
      if (weight <= 58.5) return 'Pena';
      if (weight <= 64.0) return 'Leve';
      if (weight <= 69.0) return 'Médio';
      if (weight <= 74.0) return 'Meio-Pesado';
      if (weight <= 79.3) return 'Pesado';
      return 'Super-Pesado';
    }
    if (weight <= 45) return 'Pena';
    if (weight <= 55) return 'Leve';
    return 'Pesado';
  }
};

export const getAutomaticCategorization = (birthDate: string, gender: Gender, weight: number) => {
  const age = calculateCompetitiveAge(birthDate);
  const ageCat = getAgeCategory(age);
  const weightCat = getWeightCategory(gender, weight, ageCat);
  
  return {
    competitiveAge: age,
    ageCategory: ageCat,
    weightCategory: weightCat,
    fullCategory: `${ageCat} / ${weightCat}`
  };
};
