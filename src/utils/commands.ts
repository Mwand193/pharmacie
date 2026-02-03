
// import { fileSystem } from './fileSystem';

// export const executeCommand = (command: string): string[] => {
//   if (!command.trim()) return [];
  
//   const parts = command.trim().split(' ');
//   const cmd = parts[0].toLowerCase();
//   const args = parts.slice(1);
  
//   try {
//     switch (cmd) {
//       case 'cd': {
//         if (args.length > 1) return ['Too many parameters'];
//         const path = args[0] || '\\';
//         const result = fileSystem.cd(path);
        
//         // Pour cd, on ne retourne rien (pas de message) si le changement a réussi
//         // On retourne uniquement les messages d'erreur
//         if (result && result !== '' && !result.toLowerCase().includes('changed to')) {
//           return [result]; // Message d'erreur
//         }
//         return []; // Changement réussi - pas de sortie
//       }
      
//       case 'dir': {
//         const pattern = args[0];
//         const items = fileSystem.dir(pattern);
//         const totalFiles = items.filter(i => !i.isDir && i.name !== '.' && i.name !== '..').length;
//         const totalDirs = items.filter(i => i.isDir && i.name !== '.' && i.name !== '..').length;
//         const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        
//         const output = [
//           ` Directory of ${fileSystem.getCurrentPath()}`
//         ];
        
//         if (pattern) {
//           output[0] += ` (filter: ${pattern})`;
//         }
        
//         output.push('');
        
//         if (items.length <= 2) { // Seulement . et ..
//           output.push('File not found');
//         } else {
//           items.forEach(item => {
//             if (item.isDir) {
//               output.push(`${item.date}   <DIR>          ${item.name}`);
//             } else {
//               output.push(`${item.date}         ${item.name.padEnd(12)} ${item.size.toString().padStart(9)}`);
//             }
//           });
//         }
        
//         output.push(
//           '',
//           `       ${totalFiles} File(s)      ${totalSize} bytes`,
//           `       ${totalDirs} Dir(s)`
//         );
        
//         return output;
//       }
      
//       case 'mkdir':
//       case 'md': {
//         if (args.length === 0) return ['The syntax of the command is incorrect.'];
//         const results = fileSystem.mkdir(args);
//         return results;
//       }
      
//       case 'rmdir':
//       case 'rd': {
//         if (args.length === 0) return ['Required parameter missing'];
//         const { removed, errors } = fileSystem.rmdir(args);
//         const output: string[] = [];
        
//         if (removed.length > 0) {
//           removed.forEach(dir => output.push(`Directory removed: ${dir}`));
//         }
        
//         if (errors.length > 0) {
//           errors.forEach(error => output.push(`Error: ${error}`));
//         }
        
//         return output;
//       }
      
//       case 'touch': {
//         if (args.length === 0) return ['The syntax of the command is incorrect.'];
//         const results = fileSystem.touch(args);
//         return results;
//       }
      
//       case 'type': {
//         if (args.length !== 1) return ['The syntax of the command is incorrect.'];
//         try {
//           const content = fileSystem.type(args[0]);
//           return content ? content.split('\n') : ['(empty file)'];
//         } catch (error: any) {
//           return [error.message];
//         }
//       }
      
//       case 'del':
//       case 'erase': {
//         if (args.length === 0) return ['Required parameter missing'];
        
//         // Analyser les options
//         const files: string[] = [];
//         let prompt = false;
//         let quiet = false;
        
//         for (const arg of args) {
//           if (arg.startsWith('/')) {
//             switch (arg.toLowerCase()) {
//               case '/p':
//                 prompt = true;
//                 break;
//               case '/q':
//                 quiet = true;
//                 break;
//               default:
//                 return [`Invalid switch - ${arg}`];
//             }
//           } else {
//             files.push(arg);
//           }
//         }
        
//         if (files.length === 0) {
//           return ['Required parameter missing'];
//         }
        
//         const { deleted, errors } = fileSystem.del(files);
//         const output: string[] = [];
        
//         if (prompt && deleted.length > 0) {
//           output.push(`Delete ${deleted.join(', ')}? (Y/N)`);
//           // Dans un vrai terminal, on attendrait la confirmation
//           // Ici on simule la confirmation automatique
//           output.push('(Assuming Y for simulation)');
//         }
        
//         if (deleted.length > 0 && !quiet) {
//           deleted.forEach(file => output.push(`Deleted: ${file}`));
//         }
        
//         if (errors.length > 0) {
//           errors.forEach(error => output.push(error));
//         }
        
//         if (deleted.length === 0 && errors.length === 0 && !quiet) {
//           output.push('No files deleted');
//         }
        
//         return output;
//       }
      
//       case 'ren':
//       case 'rename': {
//         if (args.length !== 2) return ['The syntax of the command is incorrect.'];
//         try {
//           const result = fileSystem.rename(args[0], args[1]);
//           return [result];
//         } catch (error: any) {
//           return [error.message];
//         }
//       }
      
//       case 'move': {
//         if (args.length !== 2) return ['The syntax of the command is incorrect.'];
//         try {
//           const result = fileSystem.move(args[0], args[1]);
//           return [result];
//         } catch (error: any) {
//           return [error.message];
//         }
//       }
      
//       case 'copy': {
//         if (args.length !== 2) return ['The syntax of the command is incorrect.'];
//         try {
//           const result = fileSystem.copy(args[0], args[1]);
//           return [result];
//         } catch (error: any) {
//           return [error.message];
//         }
//       }
      
//       case 'cls':
//       case 'clear': {
//         return ['_CLEAR_'];
//       }
      
//       case 'help': {
//         return [
//           'DOS Commands:',
//           '════════════════════════════════════════════════════',
//           'CD      [directory]  - Change directory',
//           'DIR     [pattern]    - List files (supports wildcards)',
//           'MD/MKDIR [path...]   - Create directories',
//           'RD/RMDIR [dir...]    - Remove empty directories',
//           'TOUCH   [file...]    - Create/update files',
//           'TYPE    [file]       - View file content',
//           'DEL/ERASE [file...]  - Delete files',
//           '          /P         - Prompt before deleting',
//           '          /Q         - Quiet mode',
//           'REN/RENAME [old] [new] - Rename file',
//           'MOVE    [src] [dest] - Move file',
//           'COPY    [src] [dest] - Copy file',
//           'CLS                  - Clear screen',
//           'HELP                 - This help',
//           '',
//           'Wildcards:',
//           '  *       - Matches any sequence of characters',
//           '  ?       - Matches any single character',
//           '',
//           'Examples:',
//           '  md USERS\\PETER\\DOCS         (creates nested directories)',
//           '  rd USERS\\PETER               (removes empty directory)',
//           '  del *.tmp                    (deletes all .tmp files)',
//           '  erase /p *.bak               (prompts before deleting .bak files)',
//           '  del /q temp.*                (quiet delete of temp.* files)',
//           '  dir *.txt                    (list only .txt files)',
//           '  dir C*.*                     (list files starting with C)',
//           '  touch readme.txt notes.doc',
//           '  type autoexec.bat',
//           '  cd USERS\\PETER',
//           '  copy file.txt backup.txt',
//           '  move old.txt ..\\temp\\',
//           '',
//           'Note: MD=MKDIR, RD=RMDIR, DEL=ERASE, REN=RENAME'
//         ];
//       }
      
//       case 'ver':
//       case 'version': {
//         return [
//           'MS-DOS Version 6.22',
//           'Copyright Microsoft Corp 1981-1993'
//         ];
//       }
      
//       default: {
//         return [`'${cmd}' is not recognized as an internal or external command,`,
//                 'operable program or batch file.'];
//       }
//     }
//   } catch (error: any) {
//     return [error.message || 'Unknown error occurred'];
//   }
// };
import { fileSystem } from './fileSystem';

export const executeCommand = (command: string): string[] => {
  if (!command.trim()) return [];
  
  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  try {
    switch (cmd) {
      case 'cd': {
        if (args.length > 1) return ['Trop de paramètres'];
        const path = args[0] || '\\';
        const result = fileSystem.cd(path);
        
        // Pour cd, on ne retourne rien (pas de message) si le changement a réussi
        // On retourne uniquement les messages d'erreur
        if (result && result !== '' && !result.toLowerCase().includes('changed to')) {
          return [result]; // Message d'erreur
        }
        return []; // Changement réussi - pas de sortie
      }
      
      case 'dir': {
        const pattern = args[0];
        const items = fileSystem.dir(pattern);
        const totalFiles = items.filter(i => !i.isDir && i.name !== '.' && i.name !== '..').length;
        const totalDirs = items.filter(i => i.isDir && i.name !== '.' && i.name !== '..').length;
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        
        const output = [
          ` Répertoire de ${fileSystem.getCurrentPath()}`
        ];
        
        if (pattern) {
          output[0] += ` (filtre: ${pattern})`;
        }
        
        output.push('');
        
        if (items.length <= 2) { // Seulement . et ..
          output.push('Aucun fichier trouvé');
        } else {
          items.forEach(item => {
            if (item.isDir) {
              output.push(`${item.date}   <DIR>          ${item.name}`);
            } else {
              output.push(`${item.date}         ${item.name.padEnd(12)} ${item.size.toString().padStart(9)}`);
            }
          });
        }
        
        output.push(
          '',
          `       ${totalFiles} Fichier(s)      ${totalSize} octets`,
          `       ${totalDirs} Répertoire(s)`
        );
        
        return output;
      }
      
      case 'mkdir':
      case 'md': {
        if (args.length === 0) return ['La syntaxe de la commande est incorrecte.'];
        const results = fileSystem.mkdir(args);
        return results;
      }
      
      case 'rmdir':
      case 'rd': {
        if (args.length === 0) return ['Paramètre requis manquant'];
        const { removed, errors } = fileSystem.rmdir(args);
        const output: string[] = [];
        
        if (removed.length > 0) {
          removed.forEach(dir => output.push(`Répertoire supprimé: ${dir}`));
        }
        
        if (errors.length > 0) {
          errors.forEach(error => output.push(`Erreur: ${error}`));
        }
        
        return output;
      }
      
      case 'touch': {
        if (args.length === 0) return ['La syntaxe de la commande est incorrecte.'];
        const results = fileSystem.touch(args);
        return results;
      }
      
      case 'type': {
        if (args.length !== 1) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const content = fileSystem.type(args[0]);
          return content ? content.split('\n') : ['(fichier vide)'];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'del':
      case 'effacer':
      case 'erase': {
        if (args.length === 0) return ['Paramètre requis manquant'];
        
        // Analyser les options
        const files: string[] = [];
        let prompt = false;
        let quiet = false;
        
        for (const arg of args) {
          if (arg.startsWith('/')) {
            switch (arg.toLowerCase()) {
              case '/p':
                prompt = true;
                break;
              case '/q':
                quiet = true;
                break;
              default:
                return [`Commutation invalide - ${arg}`];
            }
          } else {
            files.push(arg);
          }
        }
        
        if (files.length === 0) {
          return ['Paramètre requis manquant'];
        }
        
        const { deleted, errors } = fileSystem.del(files);
        const output: string[] = [];
        
        if (prompt && deleted.length > 0) {
          output.push(`Supprimer ${deleted.join(', ')} ? (O/N)`);
          // Dans un vrai terminal, on attendrait la confirmation
          // Ici on simule la confirmation automatique
          output.push('(Réponse Oui pour la simulation)');
        }
        
        if (deleted.length > 0 && !quiet) {
          deleted.forEach(file => output.push(`Supprimé: ${file}`));
        }
        
        if (errors.length > 0) {
          errors.forEach(error => output.push(error));
        }
        
        if (deleted.length === 0 && errors.length === 0 && !quiet) {
          output.push('Aucun fichier supprimé');
        }
        
        return output;
      }
      
      case 'ren':
      case 'rename':
      case 'renommer': {
        if (args.length !== 2) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const result = fileSystem.rename(args[0], args[1]);
          return [result];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'move':
      case 'deplacer': {
        if (args.length !== 2) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const result = fileSystem.move(args[0], args[1]);
          return [result];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'copy':
      case 'copier': {
        if (args.length !== 2) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const result = fileSystem.copy(args[0], args[1]);
          return [result];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'cls':
      case 'clear':
      case 'nettoyer': {
        return ['_CLEAR_'];
      }
      
      case 'help':
      case 'aide': {
        return [
          'Commandes DOS:',
          '════════════════════════════════════════════════════',
          'CD      [répertoire]  - Changer de répertoire',
          'DIR     [pattern]     - Lister les fichiers (jokers supportés)',
          'MD/MKDIR [chemins...] - Créer des répertoires',
          'RD/RMDIR [rép...]     - Supprimer des répertoires vides',
          'TOUCH   [fichiers...] - Créer/mettre à jour des fichiers',
          'TYPE    [fichier]     - Voir le contenu d\'un fichier',
          'DEL/EFFACER [fichiers...] - Supprimer des fichiers',
          '          /P           - Demander confirmation',
          '          /Q           - Mode silencieux',
          'REN/RENAME [ancien] [nouveau] - Renommer un fichier',
          'MOVE    [source] [dest] - Déplacer un fichier',
          'COPY    [source] [dest] - Copier un fichier',
          'CLS                    - Effacer l\'écran',
          'HELP                   - Afficher cette aide',
          '',
          'Jokers (wildcards):',
          '  *       - Correspond à n\'importe quelle séquence de caractères',
          '  ?       - Correspond à un seul caractère',
          '',
          'Exemples:',
          '  md UTILISATEURS\\PIERRE\\DOCS    (crée des répertoires imbriqués)',
          '  rd UTILISATEURS\\PIERRE          (supprime un répertoire vide)',
          '  del *.tmp                       (supprime tous les fichiers .tmp)',
          '  effacer /p *.bak                (demande confirmation pour .bak)',
          '  del /q temp.*                   (suppression silencieuse de temp.*)',
          '  dir *.txt                       (liste uniquement les .txt)',
          '  dir C*.*                        (liste les fichiers commençant par C)',
          '  touch liremoi.txt notes.doc',
          '  type autoexec.bat',
          '  cd UTILISATEURS\\PIERRE',
          '  copy fichier.txt sauvegarde.txt',
          '  move ancien.txt ..\\temp\\',
          '',
          'Note: MD=MKDIR, RD=RMDIR, DEL=EFFACER, REN=RENAME, MOVE=DEPLACER, COPY=COPIER'
        ];
      }
      
      case 'ver':
      case 'version': {
        return [
          'MS-DOS Version 6.22',
          'Copyright Microsoft Corp 1981-1993'
        ];
      }
      
      default: {
        return [`'${cmd}' n\'est pas reconnu en tant que commande interne ou externe,`,
                'programme exécutable ou fichier de commandes.'];
      }
    }
  } catch (error: any) {
    return [error.message || 'Une erreur inconnue s\'est produite'];
  }
};