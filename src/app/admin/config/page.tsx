
'use client'
import { useState, useEffect } from 'react'
import { AnneeAcademique, Departement, Faculte, Filiere } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Loader2Icon, LoaderIcon } from 'lucide-react'

type AdminSection = 'facultes' | 'annees' | 'departements' | 'filieres'

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('facultes')

  const sections = [
    { id: 'facultes' as AdminSection, label: 'Facultés' },
    { id: 'annees' as AdminSection, label: 'Années académiques' },
    { id: 'departements' as AdminSection, label: 'Départements' },
    { id: 'filieres' as AdminSection, label: 'Filières' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-4 py-6">
        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200">
          {/* Desktop Navigation */}
          <div className="hidden sm:block border-b dark:border-gray-700">
            <nav className="flex px-4 sm:px-6">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeSection === section.id
                      ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden border-b dark:border-gray-700">
            <nav className="flex overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-shrink-0 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeSection === section.id
                      ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 transition-colors duration-200">
            {activeSection === 'facultes' && <FacultesSection />}
            {activeSection === 'annees' && <AnneesSection />}
            {activeSection === 'departements' && <DepartementsSection />}
            {activeSection === 'filieres' && <FilieresSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Facultés Section
function FacultesSection() {
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nom: '', code: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchFacultes()
  }, [])

  const fetchFacultes = async () => {
    try {
      const { data, error } = await supabase
        .from('facultes')
        .select('*')
        .order('nom')

      if (error) throw error
      setFacultes(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom || !formData.code) {
      alert('Veuillez remplir tous les champs')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('facultes')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('facultes')
          .insert([formData])

        if (error) throw error
      }

      setFormData({ nom: '', code: '' })
      setEditingId(null)
      fetchFacultes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (faculte: Faculte) => {
    setFormData({ nom: faculte.nom, code: faculte.code })
    setEditingId(faculte.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette faculté ?')) return

    try {
      const { error } = await supabase
        .from('facultes')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchFacultes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingId ? 'Modifier la faculté' : 'Ajouter une faculté'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ nom: '', code: '' })
                setEditingId(null)
              }}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Liste des facultés</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {facultes.map((faculte) => (
                <tr key={faculte.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{faculte.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{faculte.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(faculte)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(faculte.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Années Académiques Section
function AnneesSection() {
  const [annees, setAnnees] = useState<AnneeAcademique[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ annee: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchAnnees()
  }, [])

  const fetchAnnees = async () => {
    try {
      const { data, error } = await supabase
        .from('annees_academiques')
        .select('*')
        .order('annee', { ascending: false })

      if (error) throw error
      setAnnees(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.annee) {
      alert('Veuillez remplir le champ année')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('annees_academiques')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('annees_academiques')
          .insert([formData])

        if (error) throw error
      }

      setFormData({ annee: '' })
      setEditingId(null)
      fetchAnnees()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (annee: AnneeAcademique) => {
    setFormData({ annee: annee.annee })
    setEditingId(annee.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette année ?')) return

    try {
      const { error } = await supabase
        .from('annees_academiques')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAnnees()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingId ? 'Modifier l\'année' : 'Ajouter une année académique'}
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Année académique</label>
          <input
            type="text"
            placeholder="2023-2024"
            value={formData.annee}
            onChange={(e) => setFormData({ annee: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            required
          />
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ annee: '' })
                setEditingId(null)
              }}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Liste des années académiques</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Année</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {annees.map((annee) => (
                <tr key={annee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{annee.annee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(annee)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(annee.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Départements Section
function DepartementsSection() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nom: '', code: '', faculte_id: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: depData, error: depError } = await supabase
        .from('departements')
        .select('*, faculte:facultes(id, nom, code)')
        .order('nom')

      if (depError) throw depError

      const { data: facData, error: facError } = await supabase
        .from('facultes')
        .select('*')
        .order('nom')

      if (facError) throw facError

      setDepartements(depData || [])
      setFacultes(facData || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom || !formData.code || !formData.faculte_id) {
      alert('Veuillez remplir tous les champs')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('departements')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('departements')
          .insert([formData])

        if (error) throw error
      }

      setFormData({ nom: '', code: '', faculte_id: 0 })
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (dep: Departement) => {
    setFormData({ nom: dep.nom, code: dep.code, faculte_id: dep.faculte_id })
    setEditingId(dep.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return

    try {
      const { error } = await supabase
        .from('departements')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingId ? 'Modifier le département' : 'Ajouter un département'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Faculté</label>
            <select
              value={formData.faculte_id}
              onChange={(e) => setFormData(prev => ({ ...prev, faculte_id: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            >
              <option value={0}>-- Choisir une faculté --</option>
              {facultes.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ nom: '', code: '', faculte_id: 0 })
                setEditingId(null)
              }}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Liste des départements</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faculté</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {departements.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{dep.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{dep.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{dep.faculte?.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(dep)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(dep.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Filières Section
function FilieresSection() {
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    faculte_id: 0,
    departement_id: 0
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: filData, error: filError } = await supabase
        .from('filieres')
        .select(`*, departement:departements(id, nom, faculte_id, faculte:facultes(id, nom))`)
        .order('nom')

      if (filError) throw filError

      const { data: facData, error: facError } = await supabase
        .from('facultes')
        .select('*')
        .order('nom')

      if (facError) throw facError

      setFilieres(filData || [])
      setFacultes(facData || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartementsByFaculte = async (faculteId: number) => {
    try {
      const { data, error } = await supabase
        .from('departements')
        .select('*')
        .eq('faculte_id', faculteId)
        .order('nom')

      if (error) throw error
      setDepartements(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom || !formData.code || !formData.faculte_id || !formData.departement_id) {
      alert('Veuillez remplir tous les champs')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('filieres')
          .update({
            nom: formData.nom,
            code: formData.code,
            departement_id: formData.departement_id
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('filieres')
          .insert([{
            nom: formData.nom,
            code: formData.code,
            departement_id: formData.departement_id
          }])

        if (error) throw error
      }

      setFormData({ nom: '', code: '', faculte_id: 0, departement_id: 0 })
      setDepartements([])
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (fil: Filiere) => {
    setFormData({
      nom: fil.nom,
      code: fil.code,
      faculte_id: fil.departement?.faculte_id || 0,
      departement_id: fil.departement_id
    })

    if (fil.departement?.faculte_id) {
      fetchDepartementsByFaculte(fil.departement.faculte_id)
    }

    setEditingId(fil.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette filière ?')) return

    try {
      const { error } = await supabase
        .from('filieres')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingId ? 'Modifier la filière' : 'Ajouter une filière'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Faculté</label>
            <select
              value={formData.faculte_id}
              onChange={(e) => {
                const faculteId = Number(e.target.value)
                setFormData(prev => ({ ...prev, faculte_id: faculteId, departement_id: 0 }))
                if (faculteId) fetchDepartementsByFaculte(faculteId)
                else setDepartements([])
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
            >
              <option value={0}>-- Choisir une faculté --</option>
              {facultes.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Département</label>
            <select
              value={formData.departement_id}
              onChange={(e) => setFormData(prev => ({ ...prev, departement_id: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              required
              disabled={!formData.faculte_id}
            >
              <option value={0}>-- Choisir un département --</option>
              {departements.map(d => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ nom: '', code: '', faculte_id: 0, departement_id: 0 })
                setDepartements([])
                setEditingId(null)
              }}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Liste des filières</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Département</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faculté</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filieres.map((fil) => (
                <tr key={fil.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{fil.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{fil.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{fil.departement?.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{fil.departement?.faculte?.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(fil)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(fil.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Composant de chargement
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div >

      <LoaderIcon className='anima animate-spin dark:text-gray-300'/>
      </div>
    </div>
  )
}