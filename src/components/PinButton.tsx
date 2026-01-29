// components/PinButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { FaThumbtack} from 'react-icons/fa'
import { addToFavorites, removeFromFavorites, isTfcFavorite } from '@/lib/favorites'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { BookmarkCheck, ThumbsDown, ThumbsDownIcon } from 'lucide-react'

interface PinButtonProps {
  tfcId: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function PinButton({ 
  tfcId, 
  size = 'md', 
  showLabel = false,
  className = '' 
}: PinButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Vérifier l'état du pin au chargement
  useEffect(() => {
    const checkPinStatus = async () => {
      if (!user) {
        setChecking(false)
        return
      }

      try {
        const pinned = await isTfcFavorite(user.id, tfcId)
        setIsPinned(pinned)
      } catch (error) {
        console.error('Erreur vérification pin:', error)
      } finally {
        setChecking(false)
      }
    }

    checkPinStatus()
  }, [user, tfcId])

  const handleTogglePin = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      if (isPinned) {
        const result = await removeFromFavorites(user.id, tfcId)
        if (result.success) {
          setIsPinned(false)
        }
      } else {
        const result = await addToFavorites(user.id, tfcId)
        if (result.success) {
          setIsPinned(true)
        }
      }
    } catch (error) {
      console.error('Erreur toggle pin:', error)
    } finally {
      setLoading(false)
    }
  }

  // Tailles et styles
  

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  }

  if (checking) {
    return (
      <button
        className={`flex items-center space-x-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400  ${className}`}
        disabled
      >
        <FaThumbtack size={iconSizes[size]} />
        {showLabel && <span>Chargement...</span>}
      </button>
    )
  }

  return (
    <button
      onClick={handleTogglePin}
      disabled={loading}
      className={`flex p-2  text-sm items-center space-x- rounded-xl border transition-all duration-200 ${
        isPinned
          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
      }  ${className} disabled:opacity-50`}
      title={isPinned ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isPinned ? (
        <BookmarkCheck  className="size-5" />
      ) : (
        <FaThumbtack className='' />
      )}
      {showLabel && (
        <span>
          {isPinned ? 'Favori' : 'Ajouter aux favoris'}
        </span>
      )}
    </button>
  )
}