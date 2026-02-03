'use client'

import Terminal from '@/components/Terminal'

export default function Home() {
  return (
    <div className="min-h-screen  p-0 md:p-0">
      {/* Simuler un écran CRT */}
      <div className="relative w-full h-screen overflow-hidden bg-black/95">
        {/* Effet scanlines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent opacity-30 pointer-events-none"
             style={{
               backgroundSize: '100% 2px',
               backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 0, 0.1) 1px, rgba(0, 255, 0, 0.1) 2px)'
             }}></div>
        
        {/* Légère courbure CRT */}
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 128, 0.2) 70%, rgba(0, 0, 128, 0.4) 100%)'
             }}></div>
        
        {/* Terminal principal */}
        <div className="relative z-10 w-full h-full ">
          <Terminal />
        </div>
      </div>
    </div>
  )
}