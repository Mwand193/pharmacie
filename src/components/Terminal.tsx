
// 'use client'

// import { useState, useEffect, useRef, useCallback } from 'react'
// import { executeCommand } from '@/utils/commands'
// import { fileSystem } from '@/utils/fileSystem'

// export default function Terminal() {
//   const [output, setOutput] = useState<string[]>([
//     'Microsoft(R) MS-DOS(R) Version 6.22',
//     '(C)Copyright Microsoft Corp 1981-1993.',
//     'C:\\>'
//   ])
//   const [inputValue, setInputValue] = useState('')
//   const [commandHistory, setCommandHistory] = useState<string[]>([])
//   const [historyIndex, setHistoryIndex] = useState(-1)
//   const terminalRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)

//   // Focus automatique
//   useEffect(() => {
//     inputRef.current?.focus()
    
//     const handleClick = () => {
//       inputRef.current?.focus()
//     }

//     window.addEventListener('click', handleClick)
//     return () => window.removeEventListener('click', handleClick)
//   }, [])

//   // Scroll vers le bas
//   useEffect(() => {
//     if (terminalRef.current) {
//       terminalRef.current.scrollTop = terminalRef.current.scrollHeight
//     }
//   }, [output])

//   // Navigation historique
//   const handleKeyDown = useCallback((e: KeyboardEvent) => {
//     if (e.key === 'ArrowUp' && commandHistory.length > 0) {
//       e.preventDefault()
//       const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0
//       setHistoryIndex(newIndex)
//       setInputValue(commandHistory[commandHistory.length - 1 - newIndex])
//     } else if (e.key === 'ArrowDown' && commandHistory.length > 0) {
//       e.preventDefault()
//       const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
//       setHistoryIndex(newIndex)
//       const value = newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : ''
//       setInputValue(value)
//     } else if (e.key === 'Tab' && inputValue) {
//       e.preventDefault()
//       const commands = ['cd', 'dir', 'mkdir', 'md', 'touch', 'type', 'del', 'erase', 'ren', 'rename', 'move', 'copy', 'cls', 'help', 'ver']
//       const current = inputValue.split(' ')[0]
//       const match = commands.find(cmd => cmd.startsWith(current.toLowerCase()))
//       if (match) {
//         setInputValue(match + (inputValue.includes(' ') ? inputValue.slice(current.length) : ' '))
//       }
//     }
//   }, [commandHistory, historyIndex, inputValue])

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown)
//     return () => window.removeEventListener('keydown', handleKeyDown)
//   }, [handleKeyDown])

//   const handleSubmit = useCallback((e: React.FormEvent) => {
//     e.preventDefault()
    
//     const command = inputValue.trim()
//     if (!command) {
//       // Si commande vide, afficher juste le prompt
//       setOutput(prev => [...prev, `${fileSystem.getCurrentPath()}>`])
//       setInputValue('')
//       return
//     }

//     // Ajouter à l'historique
//     setCommandHistory(prev => [...prev, command])
//     setHistoryIndex(-1)

//     // Afficher la commande
//     const newOutput = [...output, `${fileSystem.getCurrentPath()}> ${command}`]

//     // Exécuter la commande
//     const result = executeCommand(command)

//     // Si c'est la commande cd, ne pas afficher le chemin deux fois
//     const isCdCommand = command.toLowerCase().startsWith('cd')
    
//     // Traiter cls spécial
//     if (result[0] === '_CLEAR_') {
//       setOutput([`${fileSystem.getCurrentPath()}>`])
//     } else if (isCdCommand) {
//       // Pour cd: afficher la commande avec sa sortie (s'il y en a), puis juste une ligne vide
//       // comme dans l'image fournie
//       const allOutput = [...newOutput, ...result.filter(line => line !== '')]
//       setOutput(allOutput)
//     } else {
//       // Pour les autres commandes: afficher normalement
//       setOutput([...newOutput, ...result])
//     }

//     setInputValue('')
    
//     // Re-focus immédiat
//     setTimeout(() => {
//       inputRef.current?.focus()
//     }, 0)
//   }, [inputValue, output])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value)
//   }

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.ctrlKey && e.key === 'l') {
//       e.preventDefault()
//       setOutput([`${fileSystem.getCurrentPath()}>`])
//       setInputValue('')
//     }
//   }

//   return (
//     <div className="w-full h-full flex flex-col bg-black text-[#c0c0c0] font-mono text-lg">
//       {/* Barre de titre */}
//       <div className="flex-none bg-[#0000aa] text-white px-4 py-2 flex justify-between items-center border-b-2 border-[#c0c0c0]">
//         <div className="flex items-center space-x-3">
//           <div className="w-4 h-4 bg-[#ff5555]"></div>
//           <div className="w-4 h-4 bg-[#ffff55]"></div>
//           <div className="w-4 h-4 bg-[#55ff55]"></div>
//         </div>
//         <div className="text-base tracking-wider">MS-DOS Prompt</div>
//         <div className="text-sm opacity-75">C:\\</div>
//       </div>

//       {/* Zone de terminal avec scanlines */}
//       <div className="flex-1 overflow-y-auto bg-black relative scanlines">
//         <div 
//           ref={terminalRef}
//           className="p-4 h-full overflow-y-auto"
//         >
//           {output.map((line, index) => (
//             <div key={index} className="leading-tight mb-0 whitespace-pre-wrap">
//               {line.startsWith('C:\\') && line.includes('>') ? (
//                 <span className="text-[#00ff00] font-bold">{line}</span>
//               ) : line.includes('not found') || line.includes('Error') || line.includes('invalid') || line.includes('Invalid') || line.includes('syntax') || line.includes('cannot') ? (
//                 <span className="text-[#ff5555]">{line}</span>
//               ) : line.includes('Directory of') ? (
//                 <span className="text-[#aaaaaa]">{line}</span>
//               ) : line.includes('File(s)') || line.includes('Dir(s)') ? (
//                 <span className="text-[#ffff55]">{line}</span>
//               ) : line === '' ? (
//                 // Ligne vide pour l'espacement (comme dans l'image)
//                 <br />
//               ) : (
//                 <span className="text-[#c0c0c0]">{line}</span>
//               )}
//             </div>
//           ))}
          
//           {/* Ligne d'input sur la même ligne */}
//           <div className="flex items-center">
//             <span className="text-[#00ff00] font-bold mr-2">{fileSystem.getCurrentPath()}&gt;</span>
//             <form onSubmit={handleSubmit} className="flex-1 flex items-center">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={inputValue}
//                 onChange={handleInputChange}
//                 onKeyDown={handleInputKeyDown}
//                 className="flex-1 bg-transparent text-[#c0c0c0] outline-none border-none font-mono text-lg w-full caret-[#00ff00]"
//                 autoComplete="off"
//                 autoCapitalize="off"
//                 autoCorrect="off"
//                 spellCheck="false"
//                 autoFocus
//               />
//               <div className="dos-cursor"></div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Barre de statut */}
//       <div className="flex-none bg-[#0000aa] text-white px-3 py-1.5 flex justify-between items-center border-t-2 border-[#c0c0c0] text-xs">
//         <div className="flex items-center space-x-1">
//           <span className="w-2 h-2 bg-[#55ff55] mr-1"></span>
//           <span>READY</span>
//         </div>
//         <div className="flex space-x-4">
//           <span>↑↓ History</span>
//           <span>Tab Complete</span>
//           <span>Ctrl+L Clear</span>
//         </div>
//         <div>NUM</div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { executeCommand } from '@/utils/commands'
import { fileSystem } from '@/utils/fileSystem'

export default function Terminal() {
  const [output, setOutput] = useState<string[]>([
    'Microsoft(R) MS-DOS(R) Version 6.22',
    '(C)Copyright Microsoft Corp 1981-1993.',
    'Tapez "aide" pour la liste des commandes.',
    'C:\\>'
  ])
  const [inputValue, setInputValue] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus automatique
  useEffect(() => {
    inputRef.current?.focus()
    
    const handleClick = () => {
      inputRef.current?.focus()
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // Scroll vers le bas
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  // Navigation historique
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault()
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : 0
      setHistoryIndex(newIndex)
      setInputValue(commandHistory[commandHistory.length - 1 - newIndex])
    } else if (e.key === 'ArrowDown' && commandHistory.length > 0) {
      e.preventDefault()
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1
      setHistoryIndex(newIndex)
      const value = newIndex >= 0 ? commandHistory[commandHistory.length - 1 - newIndex] : ''
      setInputValue(value)
    } else if (e.key === 'Tab' && inputValue) {
      e.preventDefault()
      const commands = ['cd', 'dir', 'mkdir', 'md', 'touch', 'type', 'del', 'effacer', 'ren', 'renommer', 'move', 'deplacer', 'copy', 'copier', 'cls', 'nettoyer', 'aide', 'help', 'ver', 'version']
      const current = inputValue.split(' ')[0]
      const match = commands.find(cmd => cmd.startsWith(current.toLowerCase()))
      if (match) {
        setInputValue(match + (inputValue.includes(' ') ? inputValue.slice(current.length) : ' '))
      }
    }
  }, [commandHistory, historyIndex, inputValue])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const command = inputValue.trim()
    if (!command) {
      setOutput(prev => [...prev, `${fileSystem.getCurrentPath()}>`])
      setInputValue('')
      return
    }

    // Ajouter à l'historique
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    // Afficher la commande
    const newOutput = [...output, `${fileSystem.getCurrentPath()}> ${command}`]

    // Exécuter la commande
    const result = executeCommand(command)

    // Traiter cls spécial
    if (result[0] === '_CLEAR_') {
      setOutput([`${fileSystem.getCurrentPath()}>`])
    } else {
      // Afficher normalement
      setOutput([...newOutput, ...result])
    }

    setInputValue('')
    
    // Re-focus immédiat
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [inputValue, output])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setOutput([`${fileSystem.getCurrentPath()}>`])
      setInputValue('')
    }
  }

  return (
    <div className="w-full h-full flex flex-col  bg-black text-white font-mono text-base overflow-hidden">
      {/* Barre de titre avec effet verre */}
      <div className="flex-none bg-gradient-to-r   from-[#1a1a1a] to-[#2a2a2a] text-white px-4 py-3 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/10"></div>
        </div>
        <div className="text- font-semibold tracking-wider cypher">DOS</div>
        <div className="text-xs opacity-60 cypher">Powered By unde-v0</div>
      </div>

      {/* Zone de terminal avec dégradé */}
      <div className="flex-1 overflow-hidden  bg-black relative">
        {/* Effet de luminosité subtile */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
        
        <div 
          ref={terminalRef}
          className="p-2 h-full pb-40 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20"
        >
          {output.map((line, index) => (
            <div key={index} className="leading-1  whitespace-pr-wrap">
              {line.startsWith('C:\\') && line.includes('>') ? (
                <span className="text-white  tracking-wide">{line}</span>
              ) : line.includes('non trouvé') || line.includes('Erreur') || line.includes('invalide') || line.includes('syntaxe') || line.includes('impossible') ? (
                <span className="text-red-400 font-mediu">{line}</span>
              ) : line.includes('Répertoire de') ? (
                <span className="text-gray-300 font-mediu">{line}</span>
              ) : line.includes('fichier(s)') || line.includes('répertoire(s)') ? (
                <span className="text-yellow-300/90">{line}</span>
              ) : line.includes('<DIR>') ? (
                <span className="text-gray-100">{line}</span>
              ) : line.includes('.') && line.includes(' ') ? (
                <span className="text-green-300/90">{line}</span>
              ) : line === '' ? (
                <br />
              ) : (
                <span className="text-gray-200">{line}</span>
              )}
            </div>
          ))}
          
          {/* Ligne d'input avec effet moderne */}
          <div className="flex items-center mt-2">
            <span className="text-gray-200 mr-1 tracking-wider">{fileSystem.getCurrentPath()}&gt;</span>
            <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-transparent text-white outline-none border-none font-mono text-base w-full caret-white placeholder-gray-500"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                placeholder=""
                autoFocus
              />
              {/* Curseur animé */}
              <div className="absolute right-0 w-2 h-5 bg-white animate-pulse"></div>
            </form>
          </div>
        </div>
      </div>

      {/* Barre de statut moderne */}
      <div className="flex-none bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white/80 px-4 py-2.5 flex justify-between items-center border-t border-white/10 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium">PRÊT</span>
          </div>
          <span className="text-white/60 ml-2">|</span>
          <span className="text-white/60">Commande: {commandHistory.length}</span>
        </div>
        
        <div className="flex space-x-6">
          <div className="flex items-center space-x-1">
            <span className="text-white/60">↑↓</span>
            <span>Historique</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/60">Tab</span>
            <span>Auto-complétion</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-white/60">Ctrl+L</span>
            <span>Effacer</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded bg-white/30"></div>
          <span>FR</span>
        </div>
      </div>

      {/* Styles pour la scrollbar */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}