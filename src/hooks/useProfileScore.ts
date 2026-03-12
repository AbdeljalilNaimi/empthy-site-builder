import { useMemo } from 'react';
import { EmergencyHealthCard } from '@/services/emergencyCardService';

export interface ProfileScoreCategory {
  name: string;
  label: string;
  score: number;
  maxScore: number;
  missing: { field: string; label: string; points: number }[];
}

export interface ProfileScoreResult {
  totalScore: number;
  categories: ProfileScoreCategory[];
  nextAction: { label: string; tab: string; points: number } | null;
}

export function useProfileScore(
  profile: Record<string, any> | null,
  emergencyCard: EmergencyHealthCard | null
): ProfileScoreResult {
  return useMemo(() => {
    if (!profile) {
      return { totalScore: 0, categories: [], nextAction: null };
    }

    // --- Basic Identity (25%) ---
    const identityMissing: ProfileScoreCategory['missing'] = [];
    let identityScore = 0;
    if (profile.full_name) identityScore += 12.5; else identityMissing.push({ field: 'full_name', label: 'Nom complet', points: 12.5 });
    if (profile.date_of_birth) identityScore += 12.5; else identityMissing.push({ field: 'date_of_birth', label: 'Date de naissance', points: 12.5 });

    // --- Contact Info (25%) ---
    const contactMissing: ProfileScoreCategory['missing'] = [];
    let contactScore = 0;
    if (profile.phone) contactScore += 12.5; else contactMissing.push({ field: 'phone', label: 'Téléphone', points: 12.5 });
    if (profile.address) contactScore += 12.5; else contactMissing.push({ field: 'address', label: 'Adresse', points: 12.5 });

    // --- Emergency Health Card (30%) ---
    const emergencyMissing: ProfileScoreCategory['missing'] = [];
    let emergencyScore = 0;
    if (emergencyCard?.emergency_contact_name) emergencyScore += 10; else emergencyMissing.push({ field: 'emergency_contact_name', label: 'Contact d\'urgence', points: 10 });
    if (emergencyCard?.emergency_contact_phone) emergencyScore += 10; else emergencyMissing.push({ field: 'emergency_contact_phone', label: 'Tél. urgence', points: 10 });
    if (emergencyCard?.allergies && emergencyCard.allergies.length > 0) emergencyScore += 5; else emergencyMissing.push({ field: 'allergies', label: 'Allergies', points: 5 });
    if (emergencyCard?.chronic_conditions && emergencyCard.chronic_conditions.length > 0) emergencyScore += 5; else emergencyMissing.push({ field: 'chronic_conditions', label: 'Conditions chroniques', points: 5 });

    // --- Blood Network (20%) ---
    const bloodMissing: ProfileScoreCategory['missing'] = [];
    let bloodScore = 0;
    const bloodGroup = emergencyCard?.blood_group || profile.blood_group;
    if (bloodGroup) bloodScore += 10; else bloodMissing.push({ field: 'blood_group', label: 'Groupe sanguin', points: 10 });
    if (profile.emergency_opt_in) bloodScore += 10; else bloodMissing.push({ field: 'emergency_opt_in', label: 'Alertes d\'urgence', points: 10 });

    const categories: ProfileScoreCategory[] = [
      { name: 'identity', label: 'Identité', score: identityScore, maxScore: 25, missing: identityMissing },
      { name: 'contact', label: 'Contact', score: contactScore, maxScore: 25, missing: contactMissing },
      { name: 'emergency', label: 'Carte d\'Urgence', score: emergencyScore, maxScore: 30, missing: emergencyMissing },
      { name: 'blood', label: 'Réseau Sanguin', score: bloodScore, maxScore: 20, missing: bloodMissing },
    ];

    const totalScore = Math.round(identityScore + contactScore + emergencyScore + bloodScore);

    // Find next action: category with largest missing points
    const tabMap: Record<string, string> = {
      identity: 'profile',
      contact: 'profile',
      emergency: 'emergency-card',
      blood: 'profile',
    };

    let nextAction: ProfileScoreResult['nextAction'] = null;
    let maxMissing = 0;
    for (const cat of categories) {
      const missingPoints = cat.maxScore - cat.score;
      if (missingPoints > maxMissing) {
        maxMissing = missingPoints;
        nextAction = {
          label: `Compléter ${cat.label} (+${Math.round(missingPoints)}%)`,
          tab: tabMap[cat.name],
          points: missingPoints,
        };
      }
    }

    return { totalScore, categories, nextAction };
  }, [profile, emergencyCard]);
}
