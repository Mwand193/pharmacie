// app/distributeur/lots/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import type { DistributeurLot } from '@/types';

export async function getDistributeurLots(userId?: string) {
  const supabase = await createClient();
  
  if (!userId) {
    throw new Error('ID utilisateur requis');
  }

  console.log('Récupération des lots pour le distributeur:', userId);

  // 1. Récupérer les réceptions (lots déjà réceptionnés)
  const { data: receptions, error: receptionsError } = await supabase
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
      ),
      destination:destination_id (
        id,
        matricule,
        nom_entite,
        username,
        role
      )
    `)
    .eq('type_mouvement', 'reception')
    .eq('source_id', userId)
    .not('commentaire', 'ilike', '%REJETÉ%')
    .order('created_at', { ascending: false });

  if (receptionsError) {
    console.error('Erreur chargement réceptions:', receptionsError);
    throw receptionsError;
  }

  // 2. Récupérer les transferts en attente de réception
  const { data: transfertsEnAttente, error: transfertsError } = await supabase
    .from('mouvements')
    .select(`
      id,
      lot_id,
      quantite,
      type_unite,
      created_at,
      commentaire,
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
    .eq('type_mouvement', 'transfert')
    .eq('destination_id', userId)
    .order('created_at', { ascending: false });

  if (transfertsError) {
    console.error('Erreur chargement transferts:', transfertsError);
    throw transfertsError;
  }

  // 3. Pour chaque transfert en attente, vérifier s'il n'a pas déjà été réceptionné
  const transfertsFiltres = await Promise.all(
    (transfertsEnAttente || []).map(async (transfert: any) => {
      // La source est un tableau, prendre le premier élément
      const source = Array.isArray(transfert.source) ? transfert.source[0] : transfert.source;
      
      // Vérifier si une réception existe déjà
      const { data: receptionExistante } = await supabase
        .from('mouvements')
        .select('id')
        .eq('type_mouvement', 'reception')
        .eq('lot_id', transfert.lot_id)
        .eq('source_id', userId)
        .eq('destination_id', source?.id)
        .not('commentaire', 'ilike', '%REJETÉ%')
        .single();

      // Vérifier si un rejet existe
      const { data: rejetExistant } = await supabase
        .from('mouvements')
        .select('id')
        .eq('type_mouvement', 'reception')
        .eq('lot_id', transfert.lot_id)
        .eq('source_id', userId)
        .eq('destination_id', source?.id)
        .ilike('commentaire', '%REJETÉ%')
        .single();

      // Ne garder que les transferts sans réception ni rejet
      if (!receptionExistante && !rejetExistant) {
        return transfert;
      }
      return null;
    })
  );

  // Filtrer les nulls
  const transfertsNets = transfertsFiltres.filter(t => t !== null);

  console.log('Réceptions trouvées:', receptions?.length || 0);
  console.log('Transferts en attente:', transfertsNets.length);

  // 4. Traiter les lots réceptionnés avec statistiques
  const lotsReceptionnes = await Promise.all(
    (receptions || []).map(async (reception: any) => {
      // Le lot est un tableau, prendre le premier élément
      const lot = Array.isArray(reception.lot) ? reception.lot[0] : reception.lot;
      
      if (!lot) return null;

      // Le médicament dans le lot est aussi un tableau
      const medicament = Array.isArray(lot.medicament) ? lot.medicament[0] : lot.medicament;
      
      // La source et destination sont des tableaux
      const source = Array.isArray(reception.source) ? reception.source[0] : reception.source;
      const destination = Array.isArray(reception.destination) ? reception.destination[0] : reception.destination;

      // Récupérer les distributions faites par le distributeur
      const { data: distributions } = await supabase
        .from('mouvements')
        .select('quantite, created_at')
        .eq('lot_id', lot.id)
        .eq('source_id', userId)
        .eq('type_mouvement', 'distribution')
        .not('commentaire', 'ilike', '%REJETÉ%');

      // Récupérer les retraits
      const { data: retraits } = await supabase
        .from('mouvements')
        .select('quantite, created_at')
        .eq('lot_id', lot.id)
        .eq('source_id', userId)
        .eq('type_mouvement', 'retrait')
        .not('commentaire', 'ilike', '%REJETÉ%');

      // Récupérer les transferts sortants
      const { data: transferts } = await supabase
        .from('mouvements')
        .select('quantite, created_at')
        .eq('lot_id', lot.id)
        .eq('source_id', userId)
        .eq('type_mouvement', 'transfert')
        .not('commentaire', 'ilike', '%REJETÉ%');

      // Calculer les quantités
      const quantite_distribuee = distributions?.reduce((sum: number, d: any) => sum + (d.quantite || 0), 0) || 0;
      const quantite_retiree = retraits?.reduce((sum: number, r: any) => sum + (r.quantite || 0), 0) || 0;
      const quantite_transferee = transferts?.reduce((sum: number, t: any) => sum + (t.quantite || 0), 0) || 0;
      const quantite_restante = (reception.quantite || 0) - quantite_distribuee - quantite_retiree - quantite_transferee;

      // Déterminer le statut
      let statut: DistributeurLot['statut_distributeur'] = 'disponible';
      if (new Date(lot.date_expiration) < new Date()) {
        statut = 'expire';
      } else if (quantite_restante <= 0) {
        statut = 'epuise';
      } else if (quantite_distribuee > 0 || quantite_retiree > 0 || quantite_transferee > 0) {
        statut = 'partiel';
      }

      // Dernière activité
      const tousMouvements = [
        ...(distributions || []).map((d: any) => ({ type: 'distribution', date: d.created_at, quantite: d.quantite })),
        ...(retraits || []).map((r: any) => ({ type: 'retrait', date: r.created_at, quantite: r.quantite })),
        ...(transferts || []).map((t: any) => ({ type: 'transfert', date: t.created_at, quantite: t.quantite })),
        { type: 'reception', date: reception.created_at, quantite: reception.quantite }
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
        transaction_hash: reception.transaction_hash,
        medicament: medicament,
        date_reception: reception.created_at,
        quantite_recue: reception.quantite,
        type_unite_recue: reception.type_unite,
        fabriquant_nom: destination?.nom_entite || source?.nom_entite || 'Non spécifié',
        fabriquant_id: destination?.id || source?.id,
        quantite_distribuee,
        quantite_retiree,
        quantite_transferee,
        quantite_restante,
        statut_distributeur: statut,
        statut_reception: 'receptionne' as const,
        mouvementsDetail: {
          total: (distributions?.length || 0) + (retraits?.length || 0) + (transferts?.length || 0) + 1,
          distributions: distributions?.length || 0,
          retraits: retraits?.length || 0,
          transferts: transferts?.length || 0,
          receptions: 1
        },
        derniere_activite: tousMouvements[0] || null
      } as DistributeurLot;
    })
  );

  // 5. Traiter les transferts en attente
  const lotsEnAttente = (transfertsNets || []).map((transfert: any) => {
    const lot = Array.isArray(transfert.lot) ? transfert.lot[0] : transfert.lot;
    const medicament = Array.isArray(lot.medicament) ? lot.medicament[0] : lot.medicament;
    const source = Array.isArray(transfert.source) ? transfert.source[0] : transfert.source;

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
      medicament: medicament,
      date_reception: undefined,
      quantite_recue: transfert.quantite,
      type_unite_recue: transfert.type_unite,
      fabriquant_nom: source?.nom_entite || 'Non spécifié',
      fabriquant_id: source?.id,
      quantite_distribuee: 0,
      quantite_retiree: 0,
      quantite_transferee: 0,
      quantite_restante: transfert.quantite,
      statut_distributeur: 'en_attente' as const,
      statut_reception: 'en_attente' as const,
      mouvementsDetail: {
        total: 1,
        distributions: 0,
        retraits: 0,
        transferts: 1,
        receptions: 0
      },
      derniere_activite: {
        type: 'transfert',
        date: transfert.created_at,
        quantite: transfert.quantite
      }
    } as DistributeurLot;
  });

  // 6. Combiner et retourner tous les lots
  const tousLesLots = [
    ...lotsReceptionnes.filter(l => l !== null),
    ...lotsEnAttente
  ];

  // Trier par date (plus récent d'abord)
  tousLesLots.sort((a, b) => {
    const dateA = a.date_reception || a.derniere_activite?.date || a.created_at;
    const dateB = b.date_reception || b.derniere_activite?.date || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  console.log('Total lots retournés:', tousLesLots.length);
  console.log('- Réceptionnés:', lotsReceptionnes.filter(l => l !== null).length);
  console.log('- En attente:', lotsEnAttente.length);

  return tousLesLots;
}