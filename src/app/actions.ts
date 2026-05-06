'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { 
  generateNumeroLot,
  generateCodeUnique,
  generateLotHash,
  generateQRContent,
  generateMouvementHash
} from '@/lib/utils'

// ============ MÉDICAMENTS ============
export async function addMedicament(formData: FormData) {
  const nom = formData.get('nom') as string
  const description = formData.get('description') as string
  const image = formData.get('image') as File
  
  let imageBase64 = null
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    imageBase64 = `data:${image.type};base64,${buffer.toString('base64')}`
  }

  const { error } = await supabase
    .from('medicaments')
    .insert({ nom, description, image_base64: imageBase64 })

  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function getMedicaments() {
  const { data } = await supabase
    .from('medicaments')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

// ============ DISTRIBUTEURS ============
export async function addDistributeur(formData: FormData) {
  const type_acteur = formData.get('type_acteur') as string
  const nom = formData.get('nom') as string
  const adresse = formData.get('adresse') as string

  const { error } = await supabase
    .from('distributeurs')
    .insert({ type_acteur, nom, adresse })

  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function getDistributeurs() {
  const { data } = await supabase
    .from('distributeurs')
    .select('*')
    .order('nom', { ascending: true })
  return data || []
}

// ============ LOTS ============
export async function createLot(formData: FormData) {
  const medicament_id = formData.get('medicament_id') as string
  const distributeur_id = formData.get('distributeur_id') as string
  const date_fabrication = formData.get('date_fabrication') as string
  const date_expiration = formData.get('date_expiration') as string
  const quantite = parseInt(formData.get('quantite') as string)
  const statut = formData.get('statut') as string || 'no-mouvement'
  const created_by = formData.get('created_by') as string || 'système'

  const { data: medicament } = await supabase
    .from('medicaments')
    .select('nom')
    .eq('id', medicament_id)
    .single()

  if (!medicament) return { error: 'Médicament non trouvé' }

  // Générer numéro de lot (style LOT-250421-A7F)
  const numero_lot = generateNumeroLot(medicament.nom)
  
  // Générer code unique
  const code_unique = generateCodeUnique(medicament_id)
  
  // Générer hash
  const timestamp = Date.now()
  const hash_lot = generateLotHash({
    code_unique,
    numero_lot,
    medicament_id,
    date_fabrication,
    timestamp
  })
  
  // Générer QR content
  const qr_content = generateQRContent({
    code_unique,
    numero_lot,
    hash: hash_lot,
    medicament_id,
    date_fabrication
  })

  // Créer le lot
  const { data: lot, error } = await supabase
    .from('lots')
    .insert({
      medicament_id: parseInt(medicament_id),
      distributeur_id: distributeur_id ? parseInt(distributeur_id) : null,
      numero_lot,
      code_unique,
      hash_lot,
      qr_content,
      date_fabrication,
      date_expiration,
      quantite_totale: quantite,
      statut
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Créer stock initial
  if (distributeur_id) {
    await supabase
      .from('stocks')
      .insert({
        lot_id: lot.id,
        distributeur_id: parseInt(distributeur_id),
        quantite,
        type_unite: 'boite',
        statut: 'disponible'
      })
  }

  // Enregistrer mouvement
  const hash_mouvement = generateMouvementHash({ lot_id: lot.id, type: 'creation_lot' })
  
  await supabase
    .from('mouvements')
    .insert({
      lot_id: lot.id,
      type_mouvement: 'creation_lot',
      destination_id: distributeur_id ? parseInt(distributeur_id) : null,
      quantite,
      type_unite: 'boite',
      statut_apres: statut,
      commentaire: `Création du lot ${numero_lot} - ${medicament.nom}`,
      hash_mouvement,
      created_by
    })

  revalidatePath('/')
  return { 
    success: true, 
    lot: { 
      id: lot.id, 
      numero_lot, 
      code_unique,
      hash: hash_lot,
      message: '✅ Lot créé avec succès'
    } 
  }
}

export async function getLots() {
  const { data } = await supabase
    .from('lots')
    .select(`
      *,
      medicaments(nom),
      distributeurs(nom)
    `)
    .order('created_at', { ascending: false })
  return data || []
}



// ============ STOCKS ============
export async function getStocks() {
  const { data } = await supabase
    .from('stocks')
    .select(`
      *,
      lot:lot_id(*, medicaments(nom)),
      distributeur:distributeur_id(*)
    `)
    .order('updated_at', { ascending: false })
  return data || []
}

export async function transfererStock(formData: FormData) {
  const lot_id = formData.get('lot_id') as string
  const source_id = formData.get('source_id') as string
  const destination_id = formData.get('destination_id') as string
  const quantite = parseInt(formData.get('quantite') as string)
  const commentaire = formData.get('commentaire') as string
  const created_by = formData.get('created_by') as string || 'système'

  // Vérifier stock source
  const { data: stockSource } = await supabase
    .from('stocks')
    .select('*')
    .eq('lot_id', lot_id)
    .eq('distributeur_id', source_id)
    .single()

  if (!stockSource || stockSource.quantite < quantite) {
    return { error: 'Stock insuffisant' }
  }

  // Décrémenter source
  await supabase
    .from('stocks')
    .update({ quantite: stockSource.quantite - quantite })
    .eq('id', stockSource.id)

  // Incrémenter/Créer destination
  const { data: stockDest } = await supabase
    .from('stocks')
    .select('*')
    .eq('lot_id', lot_id)
    .eq('distributeur_id', destination_id)
    .single()

  if (stockDest) {
    await supabase
      .from('stocks')
      .update({ quantite: stockDest.quantite + quantite })
      .eq('id', stockDest.id)
  } else {
    await supabase
      .from('stocks')
      .insert({
        lot_id: parseInt(lot_id),
        distributeur_id: parseInt(destination_id),
        quantite,
        type_unite: 'boite',
        statut: 'disponible'
      })
  }

  // Récupérer infos pour le mouvement
  const { data: lot } = await supabase
    .from('lots')
    .select('numero_lot, medicaments(nom)')
    .eq('id', lot_id)
    .single()

  const { data: source } = await supabase
    .from('distributeurs')
    .select('nom')
    .eq('id', source_id)
    .single()

  const { data: dest } = await supabase
    .from('distributeurs')
    .select('nom')
    .eq('id', destination_id)
    .single()

  // Enregistrer mouvement
  const hash_mouvement = generateMouvementHash({ lot_id, source_id, destination_id, quantite })
  
  await supabase
    .from('mouvements')
    .insert({
      lot_id: parseInt(lot_id),
      type_mouvement: 'transfert',
      source_id: parseInt(source_id),
      destination_id: parseInt(destination_id),
      quantite,
      type_unite: 'boite',
      source: source?.nom,
      destination: dest?.nom,
      commentaire: commentaire || `Transfert de ${quantite} unités - Lot ${lot?.numero_lot}`,
      hash_mouvement,
      created_by
    })

  // Mettre à jour statut du lot si nécessaire
  await supabase
    .from('lots')
    .update({ statut: 'transferer' })
    .eq('id', lot_id)

  revalidatePath('/stocks')
  revalidatePath('/lots/' + lot_id)
  return { success: true }
}

// ============ MOUVEMENTS ============
export async function getMouvements() {
  const { data } = await supabase
    .from('mouvements')
    .select(`
      *,
      lot:lot_id(*, medicaments(nom)),
      source:source_id(*),
      destination:destination_id(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  return data || []
}

export async function getHistoriqueLot(lot_id: number) {
  const { data } = await supabase
    .from('mouvements')
    .select(`
      *,
      source:source_id(*),
      destination:destination_id(*)
    `)
    .eq('lot_id', lot_id)
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateLotStatus(formData: FormData) {
  const lot_id = formData.get('lot_id') as string
  const nouveau_statut = formData.get('statut') as string
  const commentaire = formData.get('commentaire') as string
  const created_by = formData.get('created_by') as string || 'système'

  const { data: oldLot } = await supabase
    .from('lots')
    .select('statut')
    .eq('id', parseInt(lot_id))
    .single()

  await supabase
    .from('lots')
    .update({ statut: nouveau_statut })
    .eq('id', parseInt(lot_id))

  let type_mouvement = 'modification'
  if (nouveau_statut === 'detruit') type_mouvement = 'destruction'
  if (nouveau_statut === 'vendu') type_mouvement = 'vente'

  const hash_mouvement = generateMouvementHash({ lot_id, nouveau_statut })
  
  await supabase
    .from('mouvements')
    .insert({
      lot_id: parseInt(lot_id),
      type_mouvement,
      statut_avant: oldLot?.statut,
      statut_apres: nouveau_statut,
      commentaire: commentaire || `Changement statut: ${oldLot?.statut} → ${nouveau_statut}`,
      hash_mouvement,
      created_by
    })

  revalidatePath('/lots/' + lot_id)
  return { success: true }
}



export async function getLotById(id: number) {
  const { data: lot, error } = await supabase
    .from('lots')
    .select(`
      *,
      medicaments(*),
      distributeurs(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération du lot:', error)
    return null
  }

  return lot
}

// Version avec gestion d'erreur plus détaillée
export async function getLotByIdWithError(id: number) {
  try {
    const { data: lot, error } = await supabase
      .from('lots')
      .select(`
        *,
        medicaments(*),
        distributeurs(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Lot non trouvé' }
      }
      return { data: null, error: error.message }
    }

    return { data: lot, error: null }
  } catch (err) {
    return { data: null, error: 'Erreur inattendue lors de la recherche du lot' }
  }
}