'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import CreateMedicamentModal from '@/components/Modals/CreateMedicamentModal';
import type { Medicament } from '@/types';
import { getMedicaments, deleteMedicament } from './action';

export default function MedicamentsPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedicaments();
  }, []);

  const loadMedicaments = async () => {
    try {
      setError('');
      const data = await getMedicaments();
      setMedicaments(data);
    } catch (err) {
      setError('Erreur lors du chargement des médicaments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) return;
    try {
      await deleteMedicament(id);
      await loadMedicaments();
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Médicaments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Liste des médicaments enregistrés dans le système
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Nouveau médicament
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tableau */}
      <div className="mt-6 overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Code CIS
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dosage
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Forme
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type unité
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"></div>
                  </div>
                </td>
              </tr>
            ) : medicaments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucun médicament enregistré
                </td>
              </tr>
            ) : (
              medicaments.map((med) => (
                <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {med.image_base64 ? (
                      <img
                        src={med.image_base64}
                        alt={med.nom}
                        className="h-10 w-10 object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm cypher text-gray-500">
                    {med.code_cis || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm cypher font-medium text-gray-900">
                    {med.nom}
                  </td>
                  <td className="px-4 py-3 text-sm cypher text-gray-500">
                    {med.dosage || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm cypher text-gray-500">
                    {med.forme || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm cypher">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      {med.type_unite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          // Édition future
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Modifier"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <CreateMedicamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          loadMedicaments();
        }}
      />
    </div>
  );
}