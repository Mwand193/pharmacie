
// app/context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type UserRole = 'admin' | 'pharmacie' | 'fabricant' | 'distributeur'

type User = {
  id: string
  matricule: string
  username: string
  role: UserRole
    nom_entite: string 
  first_login: boolean
  genre?: 'M' | 'F'
  password?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (matricule: string, password: string) => Promise<{ 
    success: boolean
    error?: string
    requiresPasswordChange?: boolean 
  }>
  logout: () => void
  updateUser: (user: User) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const USER_STORAGE_KEY = 'medtrack-user'
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const setSessionTimeout = () => {
    cleanup()
    timeoutRef.current = setTimeout(() => {
      console.log('Session expirée, déconnexion...')
      logout()
      router.push('/login')
    }, SESSION_DURATION)
  }

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    cleanup()
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
    setSessionTimeout()
  }

  const login = async (matricule: string, password: string) => {
    try {
      // 1. Chercher l'utilisateur par matricule
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('matricule', matricule.toUpperCase().trim())
        .single()

      if (userError || !userData) {
        console.error('User not found:', userError)
        return { 
          success: false, 
          error: 'Matricule ou mot de passe incorrect' 
        }
      }

      // 2. Vérifier le mot de passe
      if (userData.password !== password) {
        console.error('Password mismatch')
        return { 
          success: false, 
          error: 'Matricule ou mot de passe incorrect' 
        }
      }

      // 3. Vérifier le rôle valide
      const validRoles: UserRole[] = ['admin', 'pharmacie', 'fabricant', 'distributeur']
      if (!validRoles.includes(userData.role as UserRole)) {
        console.error('Invalid role:', userData.role)
        return { 
          success: false, 
          error: 'Rôle utilisateur invalide' 
        }
      }

      // 4. Vérifier si première connexion
      if (userData.first_login === true) {
        // On stocke temporairement pour le changement de mot de passe
        const tempUser = { ...userData } as User
        setUser(tempUser)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tempUser))
        
        console.log('First login detected for:', userData.matricule)
        return { 
          success: true, 
          requiresPasswordChange: true 
        }
      }

      // 5. Connexion normale réussie
      const loggedUser = { ...userData } as User
      setUser(loggedUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser))
      setSessionTimeout()

      console.log('Login successful:', {
        matricule: loggedUser.matricule,
        role: loggedUser.role,
        username: loggedUser.username
      })

      return { 
        success: true, 
        requiresPasswordChange: false 
      }

    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur' 
      }
    }
  }

  // Fonction pour rediriger selon le rôle
  const redirectBasedOnRole = (userRole: UserRole) => {
    const roleRoutes: Record<UserRole, string> = {
      'admin': '/dashboard/admin',
      'pharmacie': '/dashboard/pharmacie',
      'fabricant': '/dashboard/fabricant',
      'distributeur': '/dashboard/distributeur'
    }
    
    const route = roleRoutes[userRole]
    if (route) {
      router.push(route)
    } else {
      console.error('No route found for role:', userRole)
      logout()
      router.push('/login')
    }
  }

  // Vérifier la session au chargement
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User
          
          // Vérifier que le rôle est valide
          const validRoles: UserRole[] = ['admin', 'pharmacie', 'fabricant', 'distributeur']
          if (!validRoles.includes(userData.role)) {
            console.error('Invalid role in stored user:', userData.role)
            logout()
            setLoading(false)
            return
          }
          
          setUser(userData)
          setSessionTimeout()
          console.log('Session restored for:', userData.matricule, 'Role:', userData.role)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          logout()
        }
      }
      
      setLoading(false)
    }

    checkAuth()

    // Écouter les changements d'authentification Supabase (optionnel)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event)
      // Tu peux ajouter une logique supplémentaire ici si nécessaire
    })

    return () => {
      cleanup()
      subscription?.unsubscribe()
    }
  }, [])

  // Rafraîchir le timeout sur activité utilisateur
  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      cleanup()
      timeoutRef.current = setTimeout(() => {
        console.log('Session timeout - logging out')
        logout()
        router.push('/login')
      }, SESSION_DURATION)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    events.forEach(event => window.addEventListener(event, resetTimer))

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [user, router])

  // Fonction utilitaire pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  // Fonction pour rafraîchir les données utilisateur depuis Supabase
  const refreshUserData = async () => {
    if (!user?.id) return

    try {
      const { data: freshUserData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error refreshing user data:', error)
        return
      }

      if (freshUserData) {
        updateUser(freshUserData as User)
        console.log('User data refreshed')
      }
    } catch (error) {
      console.error('Error in refreshUserData:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      updateUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook personnalisé pour vérifier les rôles
export function useRole() {
  const { user } = useAuth()
  
  return {
    isAdmin: user?.role === 'admin',
    isPharmacie: user?.role === 'pharmacie',
    isFabricant: user?.role === 'fabricant',
    isDistributeur: user?.role === 'distributeur',
    role: user?.role,
    hasRole: (roles: UserRole | UserRole[]) => {
      if (!user) return false
      if (Array.isArray(roles)) {
        return roles.includes(user.role)
      }
      return user.role === roles
    }
  }
}