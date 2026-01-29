'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function UserTest() {
  const { user, loading, refreshUser } = useAuth()
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    setCookies(document.cookie)
  }, [])

  if (loading) {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-400 rounded-lg">
        <h2 className="text-lg font-bold mb-2">🔍 Test Utilisateur - Chargement...</h2>
      </div>
    )
  }

  return (
    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      <h2 className="text-lg font-bold text-blue-800">🔍 Test de Détection Utilisateur</h2>
      
      {/* Section Utilisateur */}
      <div className="p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">👤 Informations Utilisateur:</h3>
        {user ? (
          <div className="space-y-2">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Nom:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Rôle:</strong> <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{user.role}</span></div>
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Actif:</strong> <span className={user.active ? 'text-green-600' : 'text-red-600'}>{user.active ? '✅ Oui' : '❌ Non'}</span></div>
            {user.profil_url && (
              <div>
                <strong>Photo:</strong> 
                <img src={user.profil_url} alt="Profil" className="w-10 h-10 rounded-full mt-1" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-600 font-medium">❌ Aucun utilisateur connecté détecté</div>
        )}
      </div>

      {/* Section Cookies */}
      <div className="p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">🍪 Cookies du navigateur:</h3>
        {cookies ? (
          <div className="space-y-1">
            {cookies.split('; ').map((cookie, index) => (
              <div key={index} className="text-sm font-mono bg-gray-100 p-1 rounded">
                {cookie}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-yellow-600">⚠️ Aucun cookie trouvé</div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex space-x-2">
        <button
          onClick={refreshUser}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Rafraîchir depuis l'API
        </button>
        
        {user && (
          <button
            onClick={() => {
              document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
              window.location.reload()
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🚪 Déconnexion
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800">📋 Pour résoudre le problème:</h4>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 mt-1">
          <li>Vérifiez que le cookie "user" existe dans l'onglet Application des DevTools</li>
          <li>Si le cookie existe mais l'user est null, cliquez sur "Rafraîchir depuis l'API"</li>
          <li>Vérifiez que vous êtes bien connecté sur une autre page</li>
          <li>Testez la navigation entre les pages pour voir si la session persiste</li>
        </ul>
      </div>
    </div>
  )
}