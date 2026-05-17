// app/pharmacie/lots/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import type { DistributeurLot } from '@/types';

export async function getPharmacienLots(userId?: string) {
  const supabase = await createClient();
  
  if (!userId) {
    throw new Error('ID utilisateur requis');
  }

  console.log('Récupération des lots pour le pharmacien:', userId);

  // Récupérer toutes les distributions reçues par le pharmacien
  const { data: distributions, error: distributionsError } = await supabase
    .from('mouvements')
    .select(`
      id,
      lot_id,
      quantite,
      type_unite,
      created_at,
      commentaire,
      transaction_hash,
      lot:lot_id (
        id,
        medicament_id,
        numero_lot,
        code_unique,
        quantite_totale,
        date_fabrication,
        date_expiration,
        hash_lot,
        blockchain_lot_id,
        created_by,
        fabricant_id,
        medicament:medicament_id (
          id,
          nom,
          dosage,
          forme
        )
      ),
      source:source_id (
        id,
        matricule,
        nom_entite,
        username,
        role
      )
    `)
    .in('type_mouvement', ['distribution', 'vente_pharmacie'])
    .eq('destination_id', userId)
    .not('commentaire', 'ilike', '%REJETÉ%')
    .order('created_at', { ascending: false });

  if (distributionsError) {
    console.error('Erreur chargement distributions:', distributionsError);
    throw distributionsError;
  }

  console.log('Distributions trouvées:', distributions?.length || 0);

  // Regrouper les distributions par lot_id pour éviter les doublons
  const lotsMap = new Map<number, any[]>();
  
  (distributions || []).forEach((dist: any) => {
    const lot = Array.isArray(dist.lot) ? dist.lot[0] : dist.lot;
    if (!lot) return;
    
    const lotId = lot.id;
    if (!lotsMap.has(lotId)) {
      lotsMap.set(lotId, []);
    }
    lotsMap.get(lotId)!.push(dist);
  });

  console.log('Lots uniques:', lotsMap.size);

  // Traiter chaque lot unique
  const lotsTraites = await Promise.all(
    Array.from(lotsMap.entries()).map(async ([lotId, lotDistributions]) => {
      const premiereDistribution = lotDistributions[0]; // La plus récente
      const lot = Array.isArray(premiereDistribution.lot) 
        ? premiereDistribution.lot[0] 
        : premiereDistribution.lot;
      
      const medicament = Array.isArray(lot.medicament) 
        ? lot.medicament[0] 
        : lot.medicament;
      
      const source = Array.isArray(premiereDistribution.source) 
        ? premiereDistribution.source[0] 
        : premiereDistribution.source;

      // Calculer la quantité totale reçue (somme de toutes les distributions pour ce lot)
      const quantiteTotaleRecue = lotDistributions.reduce((sum: number, dist: any) => {
        return sum + (dist.quantite || 0);
      }, 0);

      // Date de la dernière distribution
      const derniereDistribution = lotDistributions[0]; // Déjà trié par ordre décroissant

      // Récupérer les ventes faites par le pharmacien pour ce lot
      const { data: ventes } = await supabase
        .from('mouvements')
        .select('quantite, created_at')
        .eq('lot_id', lotId)
        .eq('source_id', userId)
        .eq('type_mouvement', 'vente')
        .not('commentaire', 'ilike', '%REJETÉ%');

      // Récupérer les retraits
      const { data: retraits } = await supabase
        .from('mouvements')
        .select('quantite, created_at')
        .eq('lot_id', lotId)
        .eq('source_id', userId)
        .eq('type_mouvement', 'retrait')
        .not('commentaire', 'ilike', '%REJETÉ%');

      // Calculer les quantités
      const quantite_vendue = ventes?.reduce((sum: number, v: any) => sum + (v.quantite || 0), 0) || 0;
      const quantite_retiree = retraits?.reduce((sum: number, r: any) => sum + (r.quantite || 0), 0) || 0;
      const quantite_restante = quantiteTotaleRecue - quantite_vendue - quantite_retiree;

      // Déterminer le statut
      let statut: DistributeurLot['statut_distributeur'] = 'disponible';
      if (new Date(lot.date_expiration) < new Date()) {
        statut = 'expire';
      } else if (quantite_restante <= 0) {
        statut = 'epuise';
      } else if (quantite_vendue > 0 || quantite_retiree > 0) {
        statut = 'partiel';
      }

      // Dernière activité
      const tousMouvements = [
        ...(ventes || []).map((v: any) => ({ type: 'vente', date: v.created_at, quantite: v.quantite })),
        ...(retraits || []).map((r: any) => ({ type: 'retrait', date: r.created_at, quantite: r.quantite })),
        ...lotDistributions.map((d: any) => ({ 
          type: 'reception', 
          date: d.created_at, 
          quantite: d.quantite 
        }))
      ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        id: lot.id,
        medicament_id: lot.medicament_id,
        numero_lot: lot.numero_lot,
        code_unique: lot.code_unique,
        hash_lot: lot.hash_lot,
        qr_content: lot.qr_content || null,
        date_fabrication: lot.date_fabrication,
        date_expiration: lot.date_expiration,
        quantite_totale: lot.quantite_totale,
        created_at: lot.created_at,
        updated_at: lot.updated_at,
        created_by: lot.created_by,
        fabricant_id: lot.fabricant_id,
        blockchain_lot_id: lot.blockchain_lot_id,
        transaction_hash: derniereDistribution.transaction_hash,
        medicament: medicament,
        date_reception: derniereDistribution.created_at,
        quantite_recue: quantiteTotaleRecue, // Quantité totale reçue (toutes distributions confondues)
        type_unite_recue: derniereDistribution.type_unite,
        fabriquant_nom: source?.nom_entite || 'Distributeur',
        fabriquant_id: source?.id,
        quantite_distribuee: quantite_vendue,
        quantite_retiree: quantite_retiree,
        quantite_restante: quantite_restante,
        statut_distributeur: statut,
        statut_reception: 'receptionne' as const,
        mouvementsDetail: {
          total: (ventes?.length || 0) + (retraits?.length || 0) + lotDistributions.length,
          distributions: ventes?.length || 0,
          retraits: retraits?.length || 0,
          transferts: 0,
          receptions: lotDistributions.length
        },
        derniere_activite: tousMouvements[0] || null
      } as DistributeurLot;
    })
  );

  // Trier par date
  const tousLesLots = lotsTraites.sort((a, b) => {
    const dateA = a.date_reception || a.created_at;
    const dateB = b.date_reception || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  console.log('Total lots uniques:', tousLesLots.length);

  return tousLesLots;
}