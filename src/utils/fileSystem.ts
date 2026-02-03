
// interface FileSystemItem {
//   name: string;
//   type: 'file' | 'dir';
//   content?: string;
//   size: number;
//   created: string;
//   children?: Map<string, FileSystemItem>;
//   parent?: FileSystemItem;
// }

// export class VirtualFileSystem {
//   private currentDir: FileSystemItem;
//   private root: FileSystemItem;
  
//   constructor() {
//     const now = this.getDOSDate();
    
//     this.root = {
//       name: 'C:',
//       type: 'dir',
//       size: 0,
//       created: now,
//       children: new Map()
//     };
    
//     this.initializeFileSystem();
//     this.currentDir = this.root;
//   }
  
//   private initializeFileSystem(): void {
//     const now = this.getDOSDate();
    
//     const directories = ['WINDOWS', 'DOS', 'TEMP'];
    
//     directories.forEach(dirName => {
//       const dir: FileSystemItem = {
//         name: dirName,
//         type: 'dir',
//         size: 0,
//         created: now,
//         children: new Map(),
//         parent: this.root
//       };
//       this.root.children!.set(dirName, dir);
//     });
    
//     const systemFiles = [
//       { name: 'AUTOEXEC.BAT', content: '@echo off\r\nPATH=C:\\DOS;C:\\WINDOWS\r\nprompt $p$g\r\ncls\r\nver', size: 62 },
//       { name: 'CONFIG.SYS', content: 'DEVICE=C:\\DOS\\HIMEM.SYS\r\nDOS=HIGH,UMB\r\nFILES=40\r\nBUFFERS=20', size: 52 },
//       { name: 'COMMAND.COM', content: 'Interpréteur de commandes MS-DOS', size: 54613 },
//       { name: 'LISEZMOI.TXT', content: 'Bienvenue dans le terminal MS-DOS\r\n\r\nCeci est une simulation de MS-DOS 6.22\r\nTapez AIDE pour voir les commandes disponibles.', size: 130 },
//       { name: 'JOURNAL.TXT', content: 'Journal système\r\n-----------\r\nSystème démarré avec succès.\r\nTous les pilotes chargés.', size: 78 },
//       { name: 'TEMP.DAT', content: 'Fichier de données temporaire', size: 28 },
//       { name: 'SAUVEGARDE.BAK', content: 'Fichier de sauvegarde', size: 21 },
//       { name: 'CONFIG.BAK', content: 'Configuration de sauvegarde', size: 27 }
//     ];
    
//     systemFiles.forEach(file => {
//       this.root.children!.set(file.name, {
//         name: file.name,
//         type: 'file',
//         content: file.content,
//         size: file.size,
//         created: now,
//         parent: this.root
//       });
//     });
    
//     // Ajouter des fichiers dans TEMP
//     const tempDir = this.root.children!.get('TEMP')!;
//     tempDir.children!.set('TEMP1.TMP', {
//       name: 'TEMP1.TMP',
//       type: 'file',
//       content: 'Fichier temporaire 1',
//       size: 21,
//       created: now,
//       parent: tempDir
//     });
    
//     tempDir.children!.set('TEMP2.TMP', {
//       name: 'TEMP2.TMP',
//       type: 'file',
//       content: 'Fichier temporaire 2',
//       size: 21,
//       created: now,
//       parent: tempDir
//     });
//   }
  
//   private getDOSDate(): string {
//     const now = new Date();
//     const year = now.getFullYear().toString().slice(-2);
//     const month = (now.getMonth() + 1).toString().padStart(2, '0');
//     const day = now.getDate().toString().padStart(2, '0');
//     const hours = now.getHours().toString().padStart(2, '0');
//     const minutes = now.getMinutes().toString().padStart(2, '0');
    
//     return `${month}-${day}-${year} ${hours}:${minutes}`;
//   }
  
//   private validateName(name: string): boolean {
//     if (!name || name.length === 0) return false;
    
//     if (name === '.' || name === '..') return true;
    
//     // Vérifier les wildcards
//     if (name.includes('*') || name.includes('?')) {
//       return this.isValidWildcardPattern(name);
//     }
    
//     const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
//     if (invalidChars.test(name)) return false;
    
//     if (name.includes('.')) {
//       const parts = name.split('.');
//       if (parts.length > 2) return false;
//       if (parts[0].length > 8 || parts[0].length === 0) return false;
//       if (parts[1] && (parts[1].length > 3 || parts[1].length === 0)) return false;
//     } else {
//       if (name.length > 8) return false;
//     }
    
//     return true;
//   }
  
//   private isValidWildcardPattern(pattern: string): boolean {
//     // Valider le pattern de wildcard
//     const regex = /^[A-Za-z0-9_\-\.\$*?]*$/;
//     return regex.test(pattern);
//   }
  
//   private patternToRegex(pattern: string): RegExp {
//     // Convertir le pattern DOS (* et ?) en regex
//     const escaped = pattern
//       .replace(/\./g, '\\.')
//       .replace(/\*/g, '.*')
//       .replace(/\?/g, '.');
//     return new RegExp(`^${escaped}$`, 'i');
//   }
  
//   private resolvePath(path: string): FileSystemItem | null {
//     if (!path || path === '\\') return this.root;
//     if (path === '.') return this.currentDir;
//     if (path === '..') return this.currentDir.parent || this.root;
    
//     if (path.startsWith('C:\\') || path.startsWith('C:/')) {
//       const parts = path.substring(3).split(/[\\\/]/).filter(p => p);
//       let current = this.root;
      
//       for (const part of parts) {
//         if (part === '..') {
//           current = current.parent || this.root;
//         } else if (part !== '.') {
//           const next = current.children?.get(part.toUpperCase());
//           if (!next) return null;
//           current = next;
//         }
//       }
//       return current;
//     }
    
//     const parts = path.split(/[\\\/]/).filter(p => p);
//     let current = this.currentDir;
    
//     for (const part of parts) {
//       if (part === '..') {
//         current = current.parent || this.root;
//       } else if (part !== '.') {
//         const next = current.children?.get(part.toUpperCase());
//         if (!next) return null;
//         current = next;
//       }
//     }
//     return current;
//   }
  
//   private resolveParentPath(path: string): { parent: FileSystemItem; name: string } | null {
//     const parts = path.split(/[\\\/]/).filter(p => p);
//     const name = parts.pop()?.toUpperCase();
    
//     if (!name) return null;
    
//     let parent: FileSystemItem;
    
//     if (path.startsWith('C:\\') || path.startsWith('C:/')) {
//       const parentParts = path.substring(3).split(/[\\\/]/).filter(p => p);
//       parentParts.pop();
//       parent = this.root;
      
//       for (const part of parentParts) {
//         if (part === '..') {
//           parent = parent.parent || this.root;
//         } else if (part !== '.') {
//           const next = parent.children?.get(part.toUpperCase());
//           if (!next) return null;
//           parent = next;
//         }
//       }
//     } else {
//       const parentParts = parts.slice(0, -1);
//       parent = this.currentDir;
      
//       for (const part of parentParts) {
//         if (part === '..') {
//           parent = parent.parent || this.root;
//         } else if (part !== '.') {
//           const next = parent.children?.get(part.toUpperCase());
//           if (!next) return null;
//           parent = next;
//         }
//       }
//     }
    
//     return { parent, name };
//   }
  
//   getCurrentPath(): string {
//     const path: string[] = [];
//     let current: FileSystemItem | undefined = this.currentDir;
    
//     while (current && current !== this.root) {
//       path.unshift(current.name);
//       current = current.parent;
//     }
    
//     return path.length > 0 ? `C:\\${path.join('\\')}` : 'C:\\';
//   }
  
//   cd(path: string): string {
//     if (!path) {
//       this.currentDir = this.root;
//       return '';
//     }
    
//     const target = this.resolvePath(path);
//     if (!target) {
//       throw new Error(`Chemin non trouvé : ${path}`);
//     }
    
//     if (target.type !== 'dir') {
//       throw new Error(`N\'est pas un répertoire : ${path}`);
//     }
    
//     this.currentDir = target;
//     return '';
//   }
  
//   dir(pattern?: string): Array<{ name: string; size: number; date: string; isDir: boolean }> {
//     const items: Array<{ name: string; size: number; date: string; isDir: boolean }> = [];
    
//     items.push({
//       name: '.',
//       size: 0,
//       date: this.currentDir.created.split(' ')[0],
//       isDir: true
//     });
    
//     if (this.currentDir.parent) {
//       items.push({
//         name: '..',
//         size: 0,
//         date: this.currentDir.created.split(' ')[0],
//         isDir: true
//       });
//     }
    
//     if (this.currentDir.children) {
//       let entries = Array.from(this.currentDir.children.entries());
      
//       // Filtrer par pattern si fourni
//       if (pattern) {
//         const regex = this.patternToRegex(pattern);
//         entries = entries.filter(([name]) => regex.test(name));
//       }
      
//       // Trier
//       entries.sort(([aName, aItem], [bName, bItem]) => {
//         if (aItem.type === 'dir' && bItem.type !== 'dir') return -1;
//         if (aItem.type !== 'dir' && bItem.type === 'dir') return 1;
//         return aName.localeCompare(bName);
//       });
      
//       for (const [name, item] of entries) {
//         items.push({
//           name: item.name,
//           size: item.size,
//           date: item.created.split(' ')[0],
//           isDir: item.type === 'dir'
//         });
//       }
//     }
    
//     return items;
//   }
  
//   mkdir(paths: string[]): string[] {
//     const results: string[] = [];
    
//     for (const path of paths) {
//       if (!path) {
//         results.push('La syntaxe de la commande est incorrecte.');
//         continue;
//       }
      
//       const resolved = this.resolveParentPath(path);
//       if (!resolved) {
//         results.push(`Chemin invalide : ${path}`);
//         continue;
//       }
      
//       const { parent, name } = resolved;
      
//       if (!this.validateName(name)) {
//         results.push(`Nom de répertoire invalide : "${name}"`);
//         continue;
//       }
      
//       if (parent.children?.has(name)) {
//         results.push(`Le répertoire existe déjà : ${name}`);
//         continue;
//       }
      
//       const parts = path.split(/[\\\/]/).filter(p => p);
//       let currentParent = parent;
      
//       for (let i = 0; i < parts.length; i++) {
//         const part = parts[i].toUpperCase();
        
//         if (i === parts.length - 1) {
//           currentParent.children!.set(part, {
//             name: part,
//             type: 'dir',
//             size: 0,
//             created: this.getDOSDate(),
//             children: new Map(),
//             parent: currentParent
//           });
//           results.push(`Répertoire créé : ${part}`);
//         } else {
//           let nextDir = currentParent.children?.get(part);
//           if (!nextDir) {
//             nextDir = {
//               name: part,
//               type: 'dir',
//               size: 0,
//               created: this.getDOSDate(),
//               children: new Map(),
//               parent: currentParent
//             };
//             currentParent.children!.set(part, nextDir);
//           }
//           currentParent = nextDir;
//         }
//       }
//     }
    
//     return results;
//   }
  
//   touch(fileNames: string[]): string[] {
//     const results: string[] = [];
    
//     for (const fileName of fileNames) {
//       if (!fileName) {
//         results.push('La syntaxe de la commande est incorrecte.');
//         continue;
//       }
      
//       if (!this.validateName(fileName)) {
//         results.push(`Nom de fichier invalide : "${fileName}"`);
//         continue;
//       }
      
//       const upperName = fileName.toUpperCase();
      
//       if (this.currentDir.children?.has(upperName)) {
//         const existing = this.currentDir.children.get(upperName)!;
//         existing.created = this.getDOSDate();
//         results.push(`Horodatage mis à jour : ${fileName}`);
//       } else {
//         this.currentDir.children!.set(upperName, {
//           name: upperName,
//           type: 'file',
//           content: '',
//           size: 0,
//           created: this.getDOSDate(),
//           parent: this.currentDir
//         });
//         results.push(`Fichier créé : ${fileName}`);
//       }
//     }
    
//     return results;
//   }
  
//   type(fileName: string): string {
//     if (!fileName) {
//       throw new Error('Paramètre requis manquant');
//     }
    
//     const file = this.currentDir.children?.get(fileName.toUpperCase());
//     if (!file) {
//       throw new Error(`Fichier non trouvé : ${fileName}`);
//     }
    
//     if (file.type !== 'file') {
//       throw new Error(`Accès refusé : ${fileName} est un répertoire`);
//     }
    
//     return file.content || '';
//   }
  
//   del(fileNames: string[]): { deleted: string[]; errors: string[] } {
//     const deleted: string[] = [];
//     const errors: string[] = [];
    
//     for (const fileName of fileNames) {
//       if (!fileName) {
//         errors.push('Paramètre requis manquant');
//         continue;
//       }
      
//       if (!this.validateName(fileName)) {
//         errors.push(`Nom de fichier invalide : "${fileName}"`);
//         continue;
//       }
      
//       // Vérifier si c'est un pattern avec wildcards
//       if (fileName.includes('*') || fileName.includes('?')) {
//         const regex = this.patternToRegex(fileName);
//         const filesToDelete: string[] = [];
        
//         if (this.currentDir.children) {
//           for (const [name, item] of this.currentDir.children) {
//             if (regex.test(name) && item.type === 'file') {
//               filesToDelete.push(name);
//             }
//           }
//         }
        
//         if (filesToDelete.length === 0) {
//           errors.push(`Fichier non trouvé : ${fileName}`);
//         } else {
//           filesToDelete.forEach(file => {
//             this.currentDir.children!.delete(file);
//             deleted.push(file);
//           });
//         }
//       } else {
//         const file = this.currentDir.children?.get(fileName.toUpperCase());
//         if (!file) {
//           errors.push(`Fichier non trouvé : ${fileName}`);
//           continue;
//         }
        
//         if (file.type === 'dir') {
//           errors.push(`Accès refusé : "${fileName}" est un répertoire`);
//           continue;
//         }
        
//         this.currentDir.children!.delete(fileName.toUpperCase());
//         deleted.push(fileName);
//       }
//     }
    
//     return { deleted, errors };
//   }
  
//   rmdir(dirNames: string[]): { removed: string[]; errors: string[] } {
//     const removed: string[] = [];
//     const errors: string[] = [];
    
//     for (const dirName of dirNames) {
//       if (!dirName) {
//         errors.push('Paramètre requis manquant');
//         continue;
//       }
      
//       if (dirName === '.' || dirName === '..') {
//         errors.push(`Impossible de supprimer le répertoire "${dirName}"`);
//         continue;
//       }
      
//       const dir = this.currentDir.children?.get(dirName.toUpperCase());
//       if (!dir) {
//         errors.push(`Répertoire non trouvé : ${dirName}`);
//         continue;
//       }
      
//       if (dir.type !== 'dir') {
//         errors.push(`"${dirName}" n'est pas un répertoire`);
//         continue;
//       }
      
//       // Vérifier si le répertoire est vide
//       if (dir.children && dir.children.size > 0) {
//         errors.push(`Répertoire non vide : "${dirName}"`);
//         continue;
//       }
      
//       this.currentDir.children!.delete(dirName.toUpperCase());
//       removed.push(dirName);
//     }
    
//     return { removed, errors };
//   }
  
//   rename(oldName: string, newName: string): string {
//     if (!oldName || !newName) {
//       throw new Error('La syntaxe de la commande est incorrecte.');
//     }
    
//     if (!this.validateName(newName)) {
//       throw new Error(`Nom de fichier invalide : "${newName}"`);
//     }
    
//     const oldUpper = oldName.toUpperCase();
//     const newUpper = newName.toUpperCase();
    
//     if (!this.currentDir.children?.has(oldUpper)) {
//       throw new Error(`Fichier non trouvé : ${oldName}`);
//     }
    
//     if (this.currentDir.children.has(newUpper)) {
//       throw new Error(`Le fichier existe déjà : ${newName}`);
//     }
    
//     const item = this.currentDir.children.get(oldUpper)!;
//     item.name = newUpper;
//     this.currentDir.children.set(newUpper, item);
//     this.currentDir.children.delete(oldUpper);
    
//     return `${oldName} renommé en ${newName}`;
//   }
  
//   move(source: string, dest: string): string {
//     if (!source || !dest) {
//       throw new Error('La syntaxe de la commande est incorrecte.');
//     }
    
//     const sourceItem = this.resolvePath(source);
//     if (!sourceItem || sourceItem.type === 'dir') {
//       throw new Error(`Source non trouvée ou est un répertoire : ${source}`);
//     }
    
//     const destParentPath = this.resolveParentPath(dest);
//     if (!destParentPath) {
//       throw new Error(`Destination invalide : ${dest}`);
//     }
    
//     const { parent: destParent, name: destName } = destParentPath;
    
//     if (destParent.children?.has(destName)) {
//       throw new Error(`La destination existe déjà : ${dest}`);
//     }
    
//     destParent.children!.set(destName, {
//       ...sourceItem,
//       name: destName,
//       parent: destParent
//     });
    
//     const sourceParent = sourceItem.parent || this.currentDir;
//     const sourceKey = source.split(/[\\\/]/).pop()!.toUpperCase();
//     sourceParent.children!.delete(sourceKey);
    
//     return `Déplacé ${source} vers ${dest}`;
//   }
  
//   copy(source: string, dest: string): string {
//     if (!source || !dest) {
//       throw new Error('La syntaxe de la commande est incorrecte.');
//     }
    
//     const sourceItem = this.resolvePath(source);
//     if (!sourceItem || sourceItem.type === 'dir') {
//       throw new Error(`Source non trouvée ou est un répertoire : ${source}`);
//     }
    
//     const destParentPath = this.resolveParentPath(dest);
//     if (!destParentPath) {
//       throw new Error(`Destination invalide : ${dest}`);
//     }
    
//     const { parent: destParent, name: destName } = destParentPath;
    
//     if (destParent.children?.has(destName)) {
//       throw new Error(`La destination existe déjà : ${dest}`);
//     }
    
//     destParent.children!.set(destName, {
//       ...JSON.parse(JSON.stringify(sourceItem)),
//       name: destName,
//       parent: destParent,
//       created: this.getDOSDate()
//     });
    
//     return `Copié ${source} vers ${dest}`;
//   }
  
//   // Nouvelle méthode pour effacer avec options
//   erase(files: string[], options: { prompt?: boolean; all?: boolean; quiet?: boolean } = {}): { deleted: string[]; errors: string[] } {
//     const deleted: string[] = [];
//     const errors: string[] = [];
    
//     for (const filePattern of files) {
//       if (!filePattern) {
//         errors.push('Paramètre requis manquant');
//         continue;
//       }
      
//       // Support des wildcards
//       if (filePattern.includes('*') || filePattern.includes('?')) {
//         const regex = this.patternToRegex(filePattern);
//         const filesToDelete: string[] = [];
        
//         if (this.currentDir.children) {
//           for (const [name, item] of this.currentDir.children) {
//             if (regex.test(name) && item.type === 'file') {
//               filesToDelete.push(name);
//             }
//           }
//         }
        
//         if (filesToDelete.length === 0) {
//           if (!options.quiet) {
//             errors.push(`Fichier non trouvé : ${filePattern}`);
//           }
//         } else {
//           filesToDelete.forEach(file => {
//             this.currentDir.children!.delete(file);
//             deleted.push(file);
//           });
//         }
//       } else {
//         const file = this.currentDir.children?.get(filePattern.toUpperCase());
//         if (!file) {
//           if (!options.quiet) {
//             errors.push(`Fichier non trouvé : ${filePattern}`);
//           }
//           continue;
//         }
        
//         if (file.type === 'dir') {
//           errors.push(`Accès refusé : "${filePattern}" est un répertoire`);
//           continue;
//         }
        
//         this.currentDir.children!.delete(filePattern.toUpperCase());
//         deleted.push(filePattern);
//       }
//     }
    
//     return { deleted, errors };
//   }
// }

// export const fileSystem = new VirtualFileSystem();
interface FileSystemItem {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  size: number;
  created: string;
  children?: Map<string, FileSystemItem>;
  parent?: FileSystemItem;
}

export class VirtualFileSystem {
  private currentDir: FileSystemItem;
  private root: FileSystemItem;
  
  constructor() {
    const now = this.getDOSDate();
    
    this.root = {
      name: 'C:',
      type: 'dir',
      size: 0,
      created: now,
      children: new Map()
    };
    
    this.initializeFileSystem();
    this.currentDir = this.root;
  }
  
  private initializeFileSystem(): void {
    const now = this.getDOSDate();
    
    const directories = ['WINDOWS', 'DOS', 'TEMP'];
    
    directories.forEach(dirName => {
      const dir: FileSystemItem = {
        name: dirName,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: this.root
      };
      this.root.children!.set(dirName, dir);
    });
    
    const systemFiles = [
      { name: 'AUTOEXEC.BAT', content: '@echo off\r\nPATH=C:\\DOS;C:\\WINDOWS\r\nprompt $p$g\r\ncls\r\nver', size: 62 },
      { name: 'CONFIG.SYS', content: 'DEVICE=C:\\DOS\\HIMEM.SYS\r\nDOS=HIGH,UMB\r\nFILES=40\r\nBUFFERS=20', size: 52 },
      { name: 'COMMAND.COM', content: 'Interpréteur de commandes MS-DOS', size: 54613 },
      { name: 'LISEZMOI.TXT', content: 'Bienvenue dans le terminal MS-DOS\r\n\r\nCeci est une simulation de MS-DOS 6.22\r\nTapez AIDE pour voir les commandes disponibles.', size: 130 },
      { name: 'JOURNAL.TXT', content: 'Journal système\r\n-----------\r\nSystème démarré avec succès.\r\nTous les pilotes chargés.', size: 78 },
      { name: 'TEMP.DAT', content: 'Fichier de données temporaire', size: 28 },
      { name: 'SAUVEGARDE.BAK', content: 'Fichier de sauvegarde', size: 21 },
      { name: 'CONFIG.BAK', content: 'Configuration de sauvegarde', size: 27 }
    ];
    
    systemFiles.forEach(file => {
      this.root.children!.set(file.name, {
        name: file.name,
        type: 'file',
        content: file.content,
        size: file.size,
        created: now,
        parent: this.root
      });
    });
    
    // Ajouter des fichiers dans TEMP
    const tempDir = this.root.children!.get('TEMP')!;
    tempDir.children!.set('TEMP1.TMP', {
      name: 'TEMP1.TMP',
      type: 'file',
      content: 'Fichier temporaire 1',
      size: 21,
      created: now,
      parent: tempDir
    });
    
    tempDir.children!.set('TEMP2.TMP', {
      name: 'TEMP2.TMP',
      type: 'file',
      content: 'Fichier temporaire 2',
      size: 21,
      created: now,
      parent: tempDir
    });
  }
  
  private getDOSDate(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return `${month}-${day}-${year} ${hours}:${minutes}`;
  }
  
  private validateName(name: string): boolean {
    if (!name || name.length === 0) return false;
    
    if (name === '.' || name === '..') return true;
    
    // Vérifier les wildcards
    if (name.includes('*') || name.includes('?')) {
      return this.isValidWildcardPattern(name);
    }
    
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    if (invalidChars.test(name)) return false;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length > 2) return false;
      if (parts[0].length > 8 || parts[0].length === 0) return false;
      if (parts[1] && (parts[1].length > 3 || parts[1].length === 0)) return false;
    } else {
      if (name.length > 8) return false;
    }
    
    return true;
  }
  
  private isValidWildcardPattern(pattern: string): boolean {
    const regex = /^[A-Za-z0-9_\-\.\$*?]*$/;
    return regex.test(pattern);
  }
  
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`, 'i');
  }
  
  private resolvePath(path: string): FileSystemItem | null {
    if (!path || path === '\\') return this.root;
    if (path === '.') return this.currentDir;
    if (path === '..') return this.currentDir.parent || this.root;
    
    if (path.startsWith('C:\\') || path.startsWith('C:/')) {
      const parts = path.substring(3).split(/[\\\/]/).filter(p => p);
      let current = this.root;
      
      for (const part of parts) {
        if (part === '..') {
          current = current.parent || this.root;
        } else if (part !== '.') {
          // Rechercher en respectant la casse
          const children = Array.from(current.children?.entries() || []);
          const next = children.find(([key]) => key.toLowerCase() === part.toLowerCase())?.[1];
          if (!next) return null;
          current = next;
        }
      }
      return current;
    }
    
    const parts = path.split(/[\\\/]/).filter(p => p);
    let current = this.currentDir;
    
    for (const part of parts) {
      if (part === '..') {
        current = current.parent || this.root;
      } else if (part !== '.') {
        // Rechercher en respectant la casse
        const children = Array.from(current.children?.entries() || []);
        const next = children.find(([key]) => key.toLowerCase() === part.toLowerCase())?.[1];
        if (!next) return null;
        current = next;
      }
    }
    return current;
  }
  
  private resolveParentPath(path: string): { parent: FileSystemItem; name: string } | null {
    const parts = path.split(/[\\\/]/).filter(p => p);
    const name = parts.pop();
    
    if (!name) return null;
    
    let parent: FileSystemItem;
    
    if (path.startsWith('C:\\') || path.startsWith('C:/')) {
      const parentParts = path.substring(3).split(/[\\\/]/).filter(p => p);
      parentParts.pop();
      parent = this.root;
      
      for (const part of parentParts) {
        if (part === '..') {
          parent = parent.parent || this.root;
        } else if (part !== '.') {
          const children = Array.from(parent.children?.entries() || []);
          const next = children.find(([key]) => key.toLowerCase() === part.toLowerCase())?.[1];
          if (!next) return null;
          parent = next;
        }
      }
    } else {
      const parentParts = parts.slice(0, -1);
      parent = this.currentDir;
      
      for (const part of parentParts) {
        if (part === '..') {
          parent = parent.parent || this.root;
        } else if (part !== '.') {
          const children = Array.from(parent.children?.entries() || []);
          const next = children.find(([key]) => key.toLowerCase() === part.toLowerCase())?.[1];
          if (!next) return null;
          parent = next;
        }
      }
    }
    
    return { parent, name };
  }
  
  getCurrentPath(): string {
    const path: string[] = [];
    let current: FileSystemItem | undefined = this.currentDir;
    
    while (current && current !== this.root) {
      path.unshift(current.name);
      current = current.parent;
    }
    
    return path.length > 0 ? `C:\\${path.join('\\')}` : 'C:\\';
  }
  
  cd(path: string): string {
    if (!path) {
      this.currentDir = this.root;
      return '';
    }
    
    const target = this.resolvePath(path);
    if (!target) {
      throw new Error(`Chemin non trouvé : ${path}`);
    }
    
    if (target.type !== 'dir') {
      throw new Error(`N'est pas un répertoire : ${path}`);
    }
    
    this.currentDir = target;
    return '';
  }
  
  dir(pattern?: string): Array<{ name: string; size: number; date: string; isDir: boolean }> {
    const items: Array<{ name: string; size: number; date: string; isDir: boolean }> = [];
    
    items.push({
      name: '.',
      size: 0,
      date: this.currentDir.created.split(' ')[0],
      isDir: true
    });
    
    if (this.currentDir.parent) {
      items.push({
        name: '..',
        size: 0,
        date: this.currentDir.created.split(' ')[0],
        isDir: true
      });
    }
    
    if (this.currentDir.children) {
      let entries = Array.from(this.currentDir.children.entries());
      
      if (pattern) {
        const regex = this.patternToRegex(pattern);
        entries = entries.filter(([name]) => regex.test(name));
      }
      
      entries.sort(([aName, aItem], [bName, bItem]) => {
        if (aItem.type === 'dir' && bItem.type !== 'dir') return -1;
        if (aItem.type !== 'dir' && bItem.type === 'dir') return 1;
        return aName.localeCompare(bName);
      });
      
      for (const [name, item] of entries) {
        items.push({
          name: item.name,
          size: item.size,
          date: item.created.split(' ')[0],
          isDir: item.type === 'dir'
        });
      }
    }
    
    return items;
  }
  
  mkdir(paths: string[]): string[] {
    const results: string[] = [];
    
    for (const path of paths) {
      if (!path) {
        results.push('La syntaxe de la commande est incorrecte.');
        continue;
      }
      
      const resolved = this.resolveParentPath(path);
      if (!resolved) {
        results.push(`Chemin invalide : ${path}`);
        continue;
      }
      
      const { parent, name } = resolved;
      
      if (!this.validateName(name)) {
        results.push(`Nom de répertoire invalide : "${name}"`);
        continue;
      }
      
      // Vérifier si le répertoire existe déjà (insensible à la casse)
      const existing = Array.from(parent.children?.entries() || [])
        .find(([key]) => key.toLowerCase() === name.toLowerCase());
      
      if (existing) {
        results.push(`Le répertoire existe déjà : ${existing[0]}`);
        continue;
      }
      
      const parts = path.split(/[\\\/]/).filter(p => p);
      let currentParent = parent;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i === parts.length - 1) {
          currentParent.children!.set(part, {
            name: part,
            type: 'dir',
            size: 0,
            created: this.getDOSDate(),
            children: new Map(),
            parent: currentParent
          });
          results.push(`Répertoire créé : ${part}`);
        } else {
          const children = Array.from(currentParent.children?.entries() || []);
          let nextDir = children.find(([key]) => key.toLowerCase() === part.toLowerCase())?.[1];
          
          if (!nextDir) {
            nextDir = {
              name: part,
              type: 'dir',
              size: 0,
              created: this.getDOSDate(),
              children: new Map(),
              parent: currentParent
            };
            currentParent.children!.set(part, nextDir);
          }
          currentParent = nextDir;
        }
      }
    }
    
    return results;
  }
  
  touch(fileNames: string[]): string[] {
    const results: string[] = [];
    
    for (const fileName of fileNames) {
      if (!fileName) {
        results.push('La syntaxe de la commande est incorrecte.');
        continue;
      }
      
      if (!this.validateName(fileName)) {
        results.push(`Nom de fichier invalide : "${fileName}"`);
        continue;
      }
      
      // Vérifier si le fichier existe déjà (insensible à la casse)
      const existing = Array.from(this.currentDir.children?.entries() || [])
        .find(([key]) => key.toLowerCase() === fileName.toLowerCase());
      
      if (existing) {
        const item = existing[1];
        item.created = this.getDOSDate();
        results.push(`Horodatage mis à jour : ${existing[0]}`);
      } else {
        this.currentDir.children!.set(fileName, {
          name: fileName,
          type: 'file',
          content: '',
          size: 0,
          created: this.getDOSDate(),
          parent: this.currentDir
        });
        results.push(`Fichier créé : ${fileName}`);
      }
    }
    
    return results;
  }
  
  type(fileName: string): string {
    if (!fileName) {
      throw new Error('Paramètre requis manquant');
    }
    
    const existing = Array.from(this.currentDir.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === fileName.toLowerCase());
    
    if (!existing) {
      throw new Error(`Fichier non trouvé : ${fileName}`);
    }
    
    const file = existing[1];
    
    if (file.type !== 'file') {
      throw new Error(`Accès refusé : ${existing[0]} est un répertoire`);
    }
    
    return file.content || '';
  }
  
  del(fileNames: string[]): { deleted: string[]; errors: string[] } {
    const deleted: string[] = [];
    const errors: string[] = [];
    
    for (const fileName of fileNames) {
      if (!fileName) {
        errors.push('Paramètre requis manquant');
        continue;
      }
      
      if (!this.validateName(fileName)) {
        errors.push(`Nom de fichier invalide : "${fileName}"`);
        continue;
      }
      
      if (fileName.includes('*') || fileName.includes('?')) {
        const regex = this.patternToRegex(fileName);
        const filesToDelete: string[] = [];
        
        if (this.currentDir.children) {
          for (const [name, item] of this.currentDir.children) {
            if (regex.test(name) && item.type === 'file') {
              filesToDelete.push(name);
            }
          }
        }
        
        if (filesToDelete.length === 0) {
          errors.push(`Fichier non trouvé : ${fileName}`);
        } else {
          filesToDelete.forEach(file => {
            this.currentDir.children!.delete(file);
            deleted.push(file);
          });
        }
      } else {
        const existing = Array.from(this.currentDir.children?.entries() || [])
          .find(([key]) => key.toLowerCase() === fileName.toLowerCase());
        
        if (!existing) {
          errors.push(`Fichier non trouvé : ${fileName}`);
          continue;
        }
        
        if (existing[1].type === 'dir') {
          errors.push(`Accès refusé : "${existing[0]}" est un répertoire`);
          continue;
        }
        
        this.currentDir.children!.delete(existing[0]);
        deleted.push(existing[0]);
      }
    }
    
    return { deleted, errors };
  }
  
  rmdir(dirNames: string[]): { removed: string[]; errors: string[] } {
    const removed: string[] = [];
    const errors: string[] = [];
    
    for (const dirName of dirNames) {
      if (!dirName) {
        errors.push('Paramètre requis manquant');
        continue;
      }
      
      if (dirName === '.' || dirName === '..') {
        errors.push(`Impossible de supprimer le répertoire "${dirName}"`);
        continue;
      }
      
      const existing = Array.from(this.currentDir.children?.entries() || [])
        .find(([key]) => key.toLowerCase() === dirName.toLowerCase());
      
      if (!existing) {
        errors.push(`Répertoire non trouvé : ${dirName}`);
        continue;
      }
      
      if (existing[1].type !== 'dir') {
        errors.push(`"${existing[0]}" n'est pas un répertoire`);
        continue;
      }
      
      if (existing[1].children && existing[1].children.size > 0) {
        errors.push(`Répertoire non vide : "${existing[0]}"`);
        continue;
      }
      
      this.currentDir.children!.delete(existing[0]);
      removed.push(existing[0]);
    }
    
    return { removed, errors };
  }
  
  rename(oldName: string, newName: string): string {
    if (!oldName || !newName) {
      throw new Error('La syntaxe de la commande est incorrecte.');
    }
    
    if (!this.validateName(newName)) {
      throw new Error(`Nom de fichier invalide : "${newName}"`);
    }
    
    const existingOld = Array.from(this.currentDir.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === oldName.toLowerCase());
    
    if (!existingOld) {
      throw new Error(`Fichier non trouvé : ${oldName}`);
    }
    
    const existingNew = Array.from(this.currentDir.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === newName.toLowerCase());
    
    if (existingNew) {
      throw new Error(`Le fichier existe déjà : ${existingNew[0]}`);
    }
    
    const item = existingOld[1];
    item.name = newName;
    this.currentDir.children!.set(newName, item);
    this.currentDir.children!.delete(existingOld[0]);
    
    return `${existingOld[0]} renommé en ${newName}`;
  }
  
  move(source: string, dest: string): string {
    if (!source || !dest) {
      throw new Error('La syntaxe de la commande est incorrecte.');
    }
    
    const sourceItem = this.resolvePath(source);
    if (!sourceItem || sourceItem.type === 'dir') {
      throw new Error(`Source non trouvée ou est un répertoire : ${source}`);
    }
    
    const destParentPath = this.resolveParentPath(dest);
    if (!destParentPath) {
      throw new Error(`Destination invalide : ${dest}`);
    }
    
    const { parent: destParent, name: destName } = destParentPath;
    
    // Vérifier si la destination existe déjà (insensible à la casse)
    const existingDest = Array.from(destParent.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === destName.toLowerCase());
    
    if (existingDest) {
      throw new Error(`La destination existe déjà : ${existingDest[0]}`);
    }
    
    destParent.children!.set(destName, {
      ...sourceItem,
      name: destName,
      parent: destParent
    });
    
    const sourceParent = sourceItem.parent || this.currentDir;
    const sourceKey = Array.from(sourceParent.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === sourceItem.name.toLowerCase())?.[0];
    
    if (sourceKey) {
      sourceParent.children!.delete(sourceKey);
    }
    
    return `Déplacé ${sourceItem.name} vers ${destName}`;
  }
  
  copy(source: string, dest: string): string {
    if (!source || !dest) {
      throw new Error('La syntaxe de la commande est incorrecte.');
    }
    
    const sourceItem = this.resolvePath(source);
    if (!sourceItem || sourceItem.type === 'dir') {
      throw new Error(`Source non trouvée ou est un répertoire : ${source}`);
    }
    
    const destParentPath = this.resolveParentPath(dest);
    if (!destParentPath) {
      throw new Error(`Destination invalide : ${dest}`);
    }
    
    const { parent: destParent, name: destName } = destParentPath;
    
    // Vérifier si la destination existe déjà (insensible à la casse)
    const existingDest = Array.from(destParent.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === destName.toLowerCase());
    
    if (existingDest) {
      throw new Error(`La destination existe déjà : ${existingDest[0]}`);
    }
    
    destParent.children!.set(destName, {
      ...JSON.parse(JSON.stringify(sourceItem)),
      name: destName,
      parent: destParent,
      created: this.getDOSDate()
    });
    
    return `Copié ${sourceItem.name} vers ${destName}`;
  }
  
  erase(files: string[], options: { prompt?: boolean; all?: boolean; quiet?: boolean } = {}): { deleted: string[]; errors: string[] } {
    const deleted: string[] = [];
    const errors: string[] = [];
    
    for (const filePattern of files) {
      if (!filePattern) {
        errors.push('Paramètre requis manquant');
        continue;
      }
      
      if (filePattern.includes('*') || filePattern.includes('?')) {
        const regex = this.patternToRegex(filePattern);
        const filesToDelete: string[] = [];
        
        if (this.currentDir.children) {
          for (const [name, item] of this.currentDir.children) {
            if (regex.test(name) && item.type === 'file') {
              filesToDelete.push(name);
            }
          }
        }
        
        if (filesToDelete.length === 0) {
          if (!options.quiet) {
            errors.push(`Fichier non trouvé : ${filePattern}`);
          }
        } else {
          filesToDelete.forEach(file => {
            this.currentDir.children!.delete(file);
            deleted.push(file);
          });
        }
      } else {
        const existing = Array.from(this.currentDir.children?.entries() || [])
          .find(([key]) => key.toLowerCase() === filePattern.toLowerCase());
        
        if (!existing) {
          if (!options.quiet) {
            errors.push(`Fichier non trouvé : ${filePattern}`);
          }
          continue;
        }
        
        if (existing[1].type === 'dir') {
          errors.push(`Accès refusé : "${existing[0]}" est un répertoire`);
          continue;
        }
        
        this.currentDir.children!.delete(existing[0]);
        deleted.push(existing[0]);
      }
    }
    
    return { deleted, errors };
  }
}

export const fileSystem = new VirtualFileSystem();