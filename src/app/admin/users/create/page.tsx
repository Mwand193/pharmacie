
  // 'use client';

  // import { useState } from 'react';
  // import { useRouter } from 'next/navigation';
  // import { supabase } from '@/lib/supabase';

  // interface UserCsvRow {
  //   matricule: string;
  //   username: string;
  //   password: string;
  //   role: 'admin' | 'student';
  //   genre: 'M' | 'F';
  // }

  // export default function CreateUserPage() {
  //   const router = useRouter();
  //   const [formData, setFormData] = useState({
  //     matricule: '',
  //     username: '',
  //     password: '',
  //     role: 'student' as 'admin' | 'student',
  //     genre: 'M' as 'M' | 'F'
  //   });
  //   const [loading, setLoading] = useState(false);
  //   const [csvLoading, setCsvLoading] = useState(false);
  //   const [message, setMessage] = useState('');
  //   const [errors, setErrors] = useState<Record<string, string>>({});
  //   const [csvUsers, setCsvUsers] = useState<UserCsvRow[]>([]);
  //   const [uploadedFileName, setUploadedFileName] = useState('');

  //   // Fonction pour détecter le séparateur CSV
  //   const detectSeparator = (firstLine: string): string => {
  //     const separators = [',', ';', '\t'];
  //     let maxCount = 0;
  //     let detectedSeparator = ','; // Par défaut

  //     for (const sep of separators) {
  //       const count = (firstLine.match(new RegExp(`\\${sep}`, 'g')) || []).length;
  //       if (count > maxCount) {
  //         maxCount = count;
  //         detectedSeparator = sep;
  //       }
  //     }
      
  //     return detectedSeparator;
  //   };

  //   // Fonction pour parser une ligne CSV avec gestion des guillemets
  //   const parseCsvLine = (line: string, separator: string): string[] => {
  //     const result: string[] = [];
  //     let current = '';
  //     let inQuotes = false;
      
  //     for (let i = 0; i < line.length; i++) {
  //       const char = line[i];
  //       const nextChar = line[i + 1];
        
  //       if (char === '"') {
  //         if (inQuotes && nextChar === '"') {
  //           // Guillemet double à l'intérieur des guillemets
  //           current += '"';
  //           i++; // Sauter le prochain guillemet
  //         } else {
  //           // Début ou fin de guillemets
  //           inQuotes = !inQuotes;
  //         }
  //       } else if (char === separator && !inQuotes) {
  //         // Fin du champ
  //         result.push(current.trim());
  //         current = '';
  //       } else {
  //         current += char;
  //       }
  //     }
      
  //     // Ajouter le dernier champ
  //     result.push(current.trim());
  //     return result;
  //   };

  //   // Fonction pour créer un username à partir du nom et prénom
  //   const createUsername = (nom: string, prenom: string): string => {
  //     const cleanName = nom.toLowerCase()
  //       .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  //       .replace(/[^a-z]/g, "");
      
  //     const cleanPrenom = prenom.toLowerCase()
  //       .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  //       .replace(/[^a-z]/g, "");
      
  //     return `${cleanName}.${cleanPrenom}`;
  //   };

  //   // Fonction pour créer un mot de passe par défaut
  //   const createDefaultPassword = (matricule: string): string => {
  //     const shortMat = matricule.slice(-6);
  //     return `${shortMat}123`;
  //   };

  //   // Télécharger le template CSV
  //   const downloadTemplate = () => {
  //     const headers = ['matricule', 'username', 'password', 'role', 'genre'];
      
  //     // Vos données
  //     const vosDonnees = [
  //       { matricule: "25AA001SI", nom: "AGANZE", prenom: "Isaac", genre: "M" },
  //       { matricule: "25AM404SI", nom: "AGANZE", prenom: "Gaël", genre: "M" },
  //       { matricule: "24AL002SI", nom: "AKILA", prenom: "Clady", genre: "F" },
  //       { matricule: "25AB469SI", nom: "ASHUZA", prenom: "Daniel", genre: "M" },
  //       { matricule: "25AS002SI", nom: "ASSUMANI", prenom: "Glody", genre: "M" },
  //       { matricule: "25BM003SI", nom: "BAJIKILA", prenom: "Jean-Luc", genre: "M" },
  //       { matricule: "22BB011", nom: "BAKUMBANE", prenom: "Harold", genre: "M" },
  //       { matricule: "24BN014SI", nom: "BAKWA", prenom: "Antoine", genre: "M" }
  //     ];

  //     // Convertir les données au format CSV avec séparateur point-virgule
  //     let csvContent = headers.join(';') + '\n';
      
  //     vosDonnees.forEach(row => {
  //       const username = createUsername(row.nom, row.prenom);
  //       const password = createDefaultPassword(row.matricule);
        
  //       csvContent += `${row.matricule};${username};${password};student;${row.genre}\n`;
  //     });

  //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'etudiants_sciences_informatiques.csv';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     window.URL.revokeObjectURL(url);
  //   };

  //   // Lire le fichier CSV
  //   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = e.target.files?.[0];
  //     if (!file) return;

  //     setUploadedFileName(file.name);
  //     setCsvUsers([]);

  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       const text = event.target?.result as string;
        
  //       // Détecter le séparateur
  //       const firstLine = text.split('\n')[0];
  //       const separator = detectSeparator(firstLine);
        
  //       const rows = text.split('\n').filter(row => row.trim() !== '');
  //       const headers = parseCsvLine(rows[0], separator).map(h => h.trim());
        
  //       // Vérifier les headers
  //       const requiredHeaders = ['matricule', 'username', 'password', 'role'];
  //       const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
  //       if (missingHeaders.length > 0) {
  //         setMessage(`Erreur: Headers manquants: ${missingHeaders.join(', ')}. Détecté séparateur: "${separator}"`);
  //         return;
  //       }

  //       const users: UserCsvRow[] = [];
  //       const errors: string[] = [];
  //       const seenMatricules = new Set<string>();

  //       for (let i = 1; i < Math.min(rows.length, 800); i++) {
  //         const values = parseCsvLine(rows[i], separator);
  //         if (values.length < 4) continue;

  //         const user: any = {};
  //         headers.forEach((header, index) => {
  //           if (index < values.length) {
  //             user[header] = values[index];
  //           }
  //         });

  //         // Validation
  //         if (!user.matricule) {
  //           errors.push(`Ligne ${i}: Matricule manquant`);
  //           continue;
  //         }
          
  //         if (seenMatricules.has(user.matricule)) {
  //           errors.push(`Ligne ${i}: Matricule ${user.matricule} en double`);
  //           continue;
  //         }
  //         seenMatricules.add(user.matricule);

  //         if (!user.username) {
  //           errors.push(`Ligne ${i}: Username manquant`);
  //           continue;
  //         }
          
  //         if (!user.password || user.password.length < 4) {
  //           errors.push(`Ligne ${i}: Mot de passe invalide (min 4 caractères)`);
  //           continue;
  //         }
          
  //         if (!['admin', 'student'].includes(user.role)) {
  //           errors.push(`Ligne ${i}: Rôle invalide (doit être 'admin' ou 'student')`);
  //           continue;
  //         }
          
  //         if (!user.genre) {
  //           user.genre = 'M';
  //         } else if (!['M', 'F'].includes(user.genre)) {
  //           errors.push(`Ligne ${i}: Genre invalide (doit être 'M' ou 'F')`);
  //           continue;
  //         }

  //         users.push(user as UserCsvRow);
  //       }

  //       if (errors.length > 0) {
  //         setMessage(`Erreurs dans le CSV (séparateur: "${separator}"): ${errors.join('; ')}`);
  //       } else {
  //         setCsvUsers(users.slice(0, 800));
  //         setMessage(`${users.length} utilisateurs chargés depuis le CSV (séparateur: "${separator}"). Cliquez sur "Importer CSV" pour les créer.`);
  //       }
  //     };

  //     reader.readAsText(file, 'UTF-8');
  //   };

  //   // Importer les utilisateurs depuis le CSV
  //   const importCsvUsers = async () => {
  //     if (csvUsers.length === 0) {
  //       setMessage('Aucun utilisateur à importer');
  //       return;
  //     }

  //     setCsvLoading(true);
  //     setMessage('');

  //     try {
  //       const errors: string[] = [];
  //       const matricules = csvUsers.map(u => u.matricule);

  //       const { data: existingUsers, error: fetchError } = await supabase
  //         .from('users')
  //         .select('matricule')
  //         .in('matricule', matricules);

  //       if (fetchError) throw fetchError;

  //       const existingMatSet = new Set(existingUsers?.map(u => u.matricule) || []);

  //       const usersToInsert = csvUsers.filter(user => {
  //         if (existingMatSet.has(user.matricule)) {
  //           errors.push(`Matricule ${user.matricule} existe déjà`);
  //           return false;
  //         }
  //         return true;
  //       });

  //       if (usersToInsert.length === 0) {
  //         setMessage(`Aucun utilisateur à créer. Erreurs: ${errors.join('; ')}`);
  //         setCsvLoading(false);
  //         return;
  //       }

  //       const { error } = await supabase
  //         .from('users')
  //         .insert(usersToInsert.map(user => ({
  //           matricule: user.matricule.trim(),
  //           username: user.username.trim(),
  //           password: user.password,
  //           role: user.role,
  //           genre: user.genre || 'M'
  //         })));

  //       if (error) throw error;

  //       setMessage(`${usersToInsert.length} utilisateurs créés avec succès`);
  //       if (errors.length > 0) {
  //         setMessage(prev => prev + `. Erreurs: ${errors.join('; ')}`);
  //       }
        
  //       setCsvUsers([]);
  //       setUploadedFileName('');

  //     } catch (error) {
  //       console.error('Erreur import:', error);
  //       setMessage('Erreur lors de l\'importation');
  //     } finally {
  //       setCsvLoading(false);
  //     }
  //   };

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     setMessage('');
  //     setErrors({});

  //     const newErrors: Record<string, string> = {};
  //     if (!formData.matricule.trim()) newErrors.matricule = 'Matricule requis';
  //     if (!formData.username.trim()) newErrors.username = 'Nom requis';
  //     if (!formData.password.trim()) newErrors.password = 'Mot de passe requis';
  //     if (formData.password.length < 4) newErrors.password = 'Minimum 4 caractères';

  //     if (Object.keys(newErrors).length > 0) {
  //       setErrors(newErrors);
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const { data: existingMatricule } = await supabase
  //         .from('users')
  //         .select('id')
  //         .eq('matricule', formData.matricule)
  //         .single();

  //       if (existingMatricule) {
  //         setErrors({ matricule: 'Matricule existe déjà' });
  //         setLoading(false);
  //         return;
  //       }

  //       const { data: user, error } = await supabase
  //         .from('users')
  //         .insert([{
  //           matricule: formData.matricule.trim(),
  //           username: formData.username.trim(),
  //           password: formData.password,
  //           role: formData.role,
  //           genre: formData.genre
  //         }])
  //         .select()
  //         .single();

  //       if (error) throw error;

  //       setMessage(`Utilisateur ${formData.username} (${formData.matricule}) créé`);
        
  //       setFormData({
  //         matricule: '',
  //         username: '',
  //         password: '',
  //         role: 'student',
  //         genre: 'M'
  //       });

  //       setTimeout(() => {
  //         router.push('/admin/users');
  //       }, 2000);

  //     } catch (error) {
  //       console.error('Erreur:', error);
  //       setMessage('Erreur création');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //     const { name, value } = e.target;
  //     setFormData(prev => ({
  //       ...prev,
  //       [name]: value
  //     }));
  //     if (errors[name]) {
  //       setErrors(prev => ({ ...prev, [name]: '' }));
  //     }
  //   };

  //   return (
  //     <div className="min-h-screen bg-white">
  //       <div className="max-w-5xl mx-auto px-4 py-8">
  //         {/* Header */}
  //         <div className="mb-8">
  //           <button
  //             onClick={() => router.push('/admin/users')}
  //             className="text-sm text-gray-600 hover:text-gray-900 mb-4"
  //           >
  //             ← Retour
  //           </button>
  //           <h1 className="text-xl font-medium">Créer un utilisateur</h1>
  //           <div className="text-sm text-gray-500 mt-1">
  //             Le matricule doit être unique. Plusieurs utilisateurs peuvent avoir le même nom.
  //           </div>
  //         </div>
          
  //         <div className='grid grid-cols-2 gap-3'>
  //           {/* Import CSV Section */}
  //           <div className="border rounded p-6 mb-6">
  //             <div className="space-y-4">
  //               <div>
  //                 <div className="text-sm text-gray-600 mb-2">Import CSV</div>
  //                 <div className="flex items-center gap-2 mb-3">
  //                   <button
  //                     type="button"
  //                     onClick={downloadTemplate}
  //                     className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
  //                   >
  //                     Télécharger template
  //                   </button>
  //                   <div className="text-xs text-gray-500">
  //                     Format: matricule;username;password;role;genre (séparateur ;)
  //                   </div>
  //                 </div>
                  
  //                 <div className="space-y-3">
  //                   <div className="flex items-center gap-2">
  //                     <label className="flex-1">
  //                       <div className={`border rounded px-3 py-2 text-center text-sm cursor-pointer hover:bg-gray-50 ${
  //                         uploadedFileName ? 'text-gray-900' : 'text-gray-500'
  //                       }`}>
  //                         {uploadedFileName || 'Choisir fichier CSV'}
  //                       </div>
  //                       <input
  //                         type="file"
  //                         accept=".csv"
  //                         onChange={handleFileUpload}
  //                         className="hidden"
  //                       />
  //                     </label>
  //                     <button
  //                       type="button"
  //                       onClick={importCsvUsers}
  //                       disabled={csvUsers.length === 0 || csvLoading}
  //                       className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 text-sm"
  //                     >
  //                       {csvLoading ? 'Import...' : 'Importer CSV'}
  //                     </button>
  //                   </div>
  //                   <div className="text-xs text-gray-500">
  //                     Supports les séparateurs: virgule (,), point-virgule (;), tabulation
  //                   </div>
  //                 </div>
  //               </div>

  //               {/* Preview CSV Users */}
  //               {csvUsers.length > 0 && (
  //                 <div className="border-t pt-4">
  //                   <div className="text-sm text-gray-600 mb-2">
  //                     {csvUsers.length} utilisateurs chargés (premiers 5 affichés) :
  //                   </div>
  //                   <div className="space-y-2 max-h-60 overflow-y-auto">
  //                     {csvUsers.slice(0, 5).map((user, index) => (
  //                       <div key={index} className="text-sm p-2 border rounded bg-gray-50">
  //                         <div className="flex justify-between items-start">
  //                           <div>
  //                             <div className="font-medium">{user.matricule}</div>
  //                             <div className="text-gray-600">{user.username}</div>
  //                             <div className="text-xs text-gray-500 mt-1">
  //                               Genre: {user.genre === 'M' ? 'Masculin' : 'Féminin'}
  //                             </div>
  //                           </div>
  //                           <div className="flex flex-col items-end gap-1">
  //                             <span className={`px-2 py-0.5 rounded text-xs ${
  //                               user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
  //                             }`}>
  //                               {user.role === 'admin' ? 'Admin' : 'Étudiant'}
  //                             </span>
  //                             <span className={`px-2 py-0.5 rounded text-xs ${
  //                               user.genre === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
  //                             }`}>
  //                               {user.genre === 'M' ? 'M' : 'F'}
  //                             </span>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     ))}
  //                     {csvUsers.length > 5 && (
  //                       <div className="text-sm text-gray-500 text-center py-1">
  //                         ... et {csvUsers.length - 5} autres
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           {/* Formulaire manuel */}
  //           <div className="border rounded p-6">
  //             <div className="text-sm text-gray-600 mb-4">Création manuelle</div>
  //             <form onSubmit={handleSubmit} className="space-y-4">
  //               {/* Matricule */}
  //               <div>
  //                 <div className="flex items-center justify-between mb-1">
  //                   <div className="text-sm text-gray-600">Matricule *</div>
  //                   <div className="text-xs text-gray-400">(unique)</div>
  //                 </div>
  //                 <input
  //                   type="text"
  //                   name="matricule"
  //                   value={formData.matricule}
  //                   onChange={handleChange}
  //                   className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-black ${
  //                     errors.matricule ? 'border-red-500' : ''
  //                   }`}
  //                   placeholder="25AA001SI"
  //                 />
  //                 {errors.matricule && (
  //                   <div className="text-red-500 text-sm mt-1">{errors.matricule}</div>
  //                 )}
  //               </div>

  //               {/* Username */}
  //               <div>
  //                 <div className="flex items-center justify-between mb-1">
  //                   <div className="text-sm text-gray-600">Nom d'utilisateur *</div>
  //                   <div className="text-xs text-gray-400">(peut être partagé)</div>
  //                 </div>
  //                 <input
  //                   type="text"
  //                   name="username"
  //                   value={formData.username}
  //                   onChange={handleChange}
  //                   className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-black ${
  //                     errors.username ? 'border-red-500' : ''
  //                   }`}
  //                   placeholder="aganze.isaac"
  //                 />
  //                 {errors.username && (
  //                   <div className="text-red-500 text-sm mt-1">{errors.username}</div>
  //                 )}
  //               </div>

  //               {/* Password */}
  //               <div>
  //                 <div className="text-sm text-gray-600 mb-1">Mot de passe *</div>
  //                 <input
  //                   type="password"
  //                   name="password"
  //                   value={formData.password}
  //                   onChange={handleChange}
  //                   className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-black ${
  //                     errors.password ? 'border-red-500' : ''
  //                   }`}
  //                   placeholder="001SI123"
  //                 />
  //                 {errors.password && (
  //                   <div className="text-red-500 text-sm mt-1">{errors.password}</div>
  //                 )}
  //               </div>

  //               {/* Role */}
  //               <div>
  //                 <div className="text-sm text-gray-600 mb-1">Rôle *</div>
  //                 <select
  //                   name="role"
  //                   value={formData.role}
  //                   onChange={handleChange}
  //                   className="w-full border rounded px-3 py-2 focus:outline-none focus:border-black"
  //                 >
  //                   <option value="student">Étudiant</option>
  //                   <option value="admin">Administrateur</option>
  //                 </select>
  //               </div>

  //               {/* Genre */}
  //               <div>
  //                 <div className="text-sm text-gray-600 mb-1">Genre *</div>
  //                 <select
  //                   name="genre"
  //                   value={formData.genre}
  //                   onChange={handleChange}
  //                   className="w-full border rounded px-3 py-2 focus:outline-none focus:border-black"
  //                 >
  //                   <option value="M">Masculin</option>
  //                   <option value="F">Féminin</option>
  //                 </select>
  //               </div>

  //               {/* Message */}
  //               {message && (
  //                 <div className={`p-3 rounded text-sm ${
  //                   message.includes('créé') || message.includes('succès') 
  //                     ? 'bg-green-50 text-green-700' 
  //                     : 'bg-red-50 text-red-700'
  //                 }`}>
  //                   {message}
  //                 </div>
  //               )}

  //               {/* Buttons */}
  //               <div className="flex gap-2 pt-4">
  //                 <button
  //                   type="submit"
  //                   disabled={loading}
  //                   className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
  //                 >
  //                   {loading ? 'Création...' : 'Créer'}
  //                 </button>
                  
  //                 <button
  //                   type="button"
  //                   onClick={() => router.push('/admin/users')}
  //                   className="flex-1 py-2 border rounded hover:bg-gray-50"
  //                 >
  //                   Annuler
  //                 </button>
  //               </div>
  //             </form>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserCsvRow {
  matricule: string;
  username: string;
  password: string;
  role: 'admin' | 'student';
  genre: 'M' | 'F';
}

interface ImportProgress {
  total: number;
  processed: number;
  created: number;
  errors: number;
  currentBatch: number;
  totalBatches: number;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    matricule: '',
    username: '',
    password: '',
    role: 'student' as 'admin' | 'student',
    genre: 'M' as 'M' | 'F'
  });
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csvUsers, setCsvUsers] = useState<UserCsvRow[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);

  // Configuration du batch
  const BATCH_SIZE = 100; // Nombre d'utilisateurs par batch
  const BATCH_DELAY = 500; // Délai entre les batches en ms

  // Fonction pour détecter le séparateur CSV
  const detectSeparator = (firstLine: string): string => {
    const separators = [',', ';', '\t'];
    let maxCount = 0;
    let detectedSeparator = ',';

    for (const sep of separators) {
      const count = (firstLine.match(new RegExp(`\\${sep}`, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        detectedSeparator = sep;
      }
    }
    
    return detectedSeparator;
  };

  // Fonction pour parser une ligne CSV avec gestion des guillemets
  const parseCsvLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  // Fonction pour créer un username à partir du nom et prénom
  const createUsername = (nom: string, prenom: string): string => {
    const cleanName = nom.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "");
    
    const cleanPrenom = prenom.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "");
    
    return `${cleanName}.${cleanPrenom}`;
  };

  // Fonction pour créer un mot de passe par défaut
  const createDefaultPassword = (matricule: string): string => {
    const shortMat = matricule.slice(-6);
    return `${shortMat}123`;
  };

  // Télécharger le template CSV
  const downloadTemplate = () => {
    const headers = ['matricule', 'username', 'password', 'role', 'genre'];
    
    const vosDonnees = [
      { matricule: "25AA001SI", nom: "AGANZE", prenom: "Isaac", genre: "M" },
      { matricule: "25AM404SI", nom: "AGANZE", prenom: "Gaël", genre: "M" },
      { matricule: "24AL002SI", nom: "AKILA", prenom: "Clady", genre: "F" },
      { matricule: "25AB469SI", nom: "ASHUZA", prenom: "Daniel", genre: "M" },
      { matricule: "25AS002SI", nom: "ASSUMANI", prenom: "Glody", genre: "M" },
      { matricule: "25BM003SI", nom: "BAJIKILA", prenom: "Jean-Luc", genre: "M" },
      { matricule: "22BB011", nom: "BAKUMBANE", prenom: "Harold", genre: "M" },
      { matricule: "24BN014SI", nom: "BAKWA", prenom: "Antoine", genre: "M" }
    ];

    let csvContent = headers.join(';') + '\n';
    
    vosDonnees.forEach(row => {
      const username = createUsername(row.nom, row.prenom);
      const password = createDefaultPassword(row.matricule);
      
      csvContent += `${row.matricule};${username};${password};student;${row.genre}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'etudiants_sciences_informatiques.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Lire le fichier CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setCsvUsers([]);
    setImportProgress(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      const firstLine = text.split('\n')[0];
      const separator = detectSeparator(firstLine);
      
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const headers = parseCsvLine(rows[0], separator).map(h => h.trim());
      
      const requiredHeaders = ['matricule', 'username', 'password', 'role'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setMessage(`Erreur: Headers manquants: ${missingHeaders.join(', ')}. Détecté séparateur: "${separator}"`);
        return;
      }

      const users: UserCsvRow[] = [];
      const errors: string[] = [];
      const seenMatricules = new Set<string>();

      for (let i = 1; i < rows.length; i++) {
        const values = parseCsvLine(rows[i], separator);
        if (values.length < 4) continue;

        const user: any = {};
        headers.forEach((header, index) => {
          if (index < values.length) {
            user[header] = values[index];
          }
        });

        // Validation
        if (!user.matricule) {
          errors.push(`Ligne ${i}: Matricule manquant`);
          continue;
        }
        
        if (seenMatricules.has(user.matricule)) {
          errors.push(`Ligne ${i}: Matricule ${user.matricule} en double`);
          continue;
        }
        seenMatricules.add(user.matricule);

        if (!user.username) {
          errors.push(`Ligne ${i}: Username manquant`);
          continue;
        }
        
        if (!user.password || user.password.length < 4) {
          errors.push(`Ligne ${i}: Mot de passe invalide (min 4 caractères)`);
          continue;
        }
        
        if (!['admin', 'student'].includes(user.role)) {
          errors.push(`Ligne ${i}: Rôle invalide (doit être 'admin' ou 'student')`);
          continue;
        }
        
        if (!user.genre) {
          user.genre = 'M';
        } else if (!['M', 'F'].includes(user.genre)) {
          errors.push(`Ligne ${i}: Genre invalide (doit être 'M' ou 'F')`);
          continue;
        }

        users.push(user as UserCsvRow);
      }

      if (errors.length > 0) {
        setMessage(`Erreurs dans le CSV (séparateur: "${separator}"): ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? `... et ${errors.length - 5} autres erreurs` : ''}`);
      } else {
        setCsvUsers(users);
        const totalBatches = Math.ceil(users.length / BATCH_SIZE);
        setImportProgress({
          total: users.length,
          processed: 0,
          created: 0,
          errors: 0,
          currentBatch: 0,
          totalBatches
        });
        setMessage(`${users.length} utilisateurs chargés depuis le CSV (séparateur: "${separator}"). ${totalBatches} batch(s) de ${BATCH_SIZE} utilisateurs. Cliquez sur "Importer CSV" pour les créer.`);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Fonction pour créer des utilisateurs par batch
  const createUsersInBatch = async (users: UserCsvRow[]): Promise<{ created: number; errors: string[] }> => {
    const errors: string[] = [];
    let created = 0;

    try {
      // Vérifier les matricules existants pour ce batch
      const matricules = users.map(u => u.matricule.trim());
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('matricule')
        .in('matricule', matricules);

      if (fetchError) throw fetchError;

      const existingMatSet = new Set(existingUsers?.map(u => u.matricule) || []);
      
      // Filtrer les utilisateurs avec matricules existants
      const usersToInsert = users.filter(user => {
        if (existingMatSet.has(user.matricule.trim())) {
          errors.push(`Matricule ${user.matricule} existe déjà`);
          return false;
        }
        return true;
      });

      if (usersToInsert.length === 0) {
        return { created: 0, errors };
      }

      // Préparer les données pour l'insertion
      const usersData = usersToInsert.map(user => ({
        matricule: user.matricule.trim(),
        username: user.username.trim(),
        password: user.password,
        role: user.role,
        genre: user.genre || 'M',
        created_at: new Date().toISOString()
      }));

      // Insérer en batch
      const { error } = await supabase
        .from('users')
        .insert(usersData);

      if (error) throw error;

      created = usersToInsert.length;

    } catch (error: any) {
      console.error('Erreur batch:', error);
      errors.push(`Erreur batch: ${error.message || 'Erreur inconnue'}`);
    }

    return { created, errors };
  };

  // Importer les utilisateurs depuis le CSV par batch
  const importCsvUsers = async () => {
    if (csvUsers.length === 0) {
      setMessage('Aucun utilisateur à importer');
      return;
    }

    setCsvLoading(true);
    setMessage('Importation en cours...');

    try {
      // Initialiser la progression
      const totalBatches = Math.ceil(csvUsers.length / BATCH_SIZE);
      setImportProgress({
        total: csvUsers.length,
        processed: 0,
        created: 0,
        errors: 0,
        currentBatch: 0,
        totalBatches
      });

      const allErrors: string[] = [];
      let totalCreated = 0;

      // Traiter par batch
      for (let i = 0; i < totalBatches; i++) {
        const startIdx = i * BATCH_SIZE;
        const endIdx = Math.min(startIdx + BATCH_SIZE, csvUsers.length);
        const batchUsers = csvUsers.slice(startIdx, endIdx);

        // Mettre à jour la progression
        setImportProgress(prev => prev ? {
          ...prev,
          currentBatch: i + 1,
          processed: endIdx
        } : null);

        // Créer le batch
        const result = await createUsersInBatch(batchUsers);
        
        totalCreated += result.created;
        allErrors.push(...result.errors);

        // Mettre à jour la progression
        setImportProgress(prev => prev ? {
          ...prev,
          created: totalCreated,
          errors: allErrors.length
        } : null);

        // Attendre entre les batches (sauf pour le dernier)
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }

      // Afficher le résultat final
      let finalMessage = `Importation terminée ! ${totalCreated} utilisateurs créés sur ${csvUsers.length}.`;
      
      if (allErrors.length > 0) {
        const errorCount = allErrors.length;
        finalMessage += ` ${errorCount} erreur(s).`;
        
        // Afficher les premières erreurs
        if (errorCount <= 5) {
          finalMessage += ` Erreurs: ${allErrors.join('; ')}`;
        } else {
          finalMessage += ` Premières erreurs: ${allErrors.slice(0, 5).join('; ')}...`;
        }
      }

      setMessage(finalMessage);

      // Réinitialiser après un délai si succès
      if (totalCreated > 0) {
        setTimeout(() => {
          setCsvUsers([]);
          setUploadedFileName('');
          setImportProgress(null);
        }, 5000);
      }

    } catch (error) {
      console.error('Erreur import:', error);
      setMessage('Erreur lors de l\'importation');
    } finally {
      setCsvLoading(false);
    }
  };

  // Annuler l'import
  const cancelImport = () => {
    setCsvUsers([]);
    setUploadedFileName('');
    setImportProgress(null);
    setMessage('Importation annulée');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.matricule.trim()) newErrors.matricule = 'Matricule requis';
    if (!formData.username.trim()) newErrors.username = 'Nom requis';
    if (!formData.password.trim()) newErrors.password = 'Mot de passe requis';
    if (formData.password.length < 4) newErrors.password = 'Minimum 4 caractères';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const { data: existingMatricule } = await supabase
        .from('users')
        .select('id')
        .eq('matricule', formData.matricule)
        .single();

      if (existingMatricule) {
        setErrors({ matricule: 'Matricule existe déjà' });
        setLoading(false);
        return;
      }

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          matricule: formData.matricule.trim(),
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role,
          genre: formData.genre
        }])
        .select()
        .single();

      if (error) throw error;

      setMessage(`Utilisateur ${formData.username} (${formData.matricule}) créé`);
      
      setFormData({
        matricule: '',
        username: '',
        password: '',
        role: 'student',
        genre: 'M'
      });

      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);

    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur création');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/users')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Retour
          </button>
          <h1 className="text-xl font-medium">Créer un utilisateur</h1>
          <div className="text-sm text-gray-500 mt-1">
            Le matricule doit être unique. Plusieurs utilisateurs peuvent avoir le même nom.
          </div>
        </div>
        
        <div className='grid grid-cols-2 gap-3'>
          {/* Import CSV Section */}
          <div className="border rounded p-6 mb-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">Import CSV</div>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
                  >
                    Télécharger template
                  </button>
                  <div className="text-xs text-gray-500">
                    Format: matricule;username;password;role;genre (séparateur ;)
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <div className={`border rounded px-3 py-2 text-center text-sm cursor-pointer hover:bg-gray-50 ${
                        uploadedFileName ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {uploadedFileName || 'Choisir fichier CSV'}
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {csvUsers.length > 0 && !csvLoading && (
                      <button
                        type="button"
                        onClick={cancelImport}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                  
                  {importProgress && (
                    <div className="border rounded p-4 bg-gray-50">
                      <div className="text-sm font-medium mb-2">Progression de l'importation</div>
                      
                      <div className="space-y-3">
                        {/* Barre de progression */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Batch {importProgress.currentBatch}/{importProgress.totalBatches}</span>
                            <span>{importProgress.processed}/{importProgress.total} utilisateurs</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(importProgress.processed / importProgress.total) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Statistiques */}
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-medium text-green-700">{importProgress.created}</div>
                            <div className="text-xs text-green-600">Créés</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-medium text-red-700">{importProgress.errors}</div>
                            <div className="text-xs text-red-600">Erreurs</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-medium text-blue-700">{importProgress.total}</div>
                            <div className="text-xs text-blue-600">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={importCsvUsers}
                      disabled={csvUsers.length === 0 || csvLoading}
                      className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 text-sm"
                    >
                      {csvLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Import en cours...
                        </span>
                      ) : 'Importer CSV'}
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Supports les séparateurs: virgule (,), point-virgule (;), tabulation
                    <br />
                    Batch size: {BATCH_SIZE} utilisateurs, délai entre batches: {BATCH_DELAY}ms
                  </div>
                </div>
              </div>

              {/* Preview CSV Users */}
              {csvUsers.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">
                      {csvUsers.length} utilisateurs chargés (premiers 5 affichés) :
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil(csvUsers.length / BATCH_SIZE)} batch(s) requis
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {csvUsers.slice(0, 5).map((user, index) => (
                      <div key={index} className="text-sm p-2 border rounded bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{user.matricule}</div>
                            <div className="text-gray-600">{user.username}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Genre: {user.genre === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Étudiant'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              user.genre === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {user.genre === 'M' ? 'M' : 'F'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {csvUsers.length > 5 && (
                      <div className="text-sm text-gray-500 text-center py-1">
                        ... et {csvUsers.length - 5} autres
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire manuel */}
          <div className="border rounded p-6">
            <div className="text-sm text-gray-600 mb-4">Création manuelle</div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Matricule */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-gray-600">Matricule *</div>
                  <div className="text-xs text-gray-400">(unique)</div>
                </div>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-black ${
                    errors.matricule ? 'border-red-500' : ''
                  }`}
                  placeholder="25AA001SI"
                />
                {errors.matricule && (
                  <div className="text-red-500 text-sm mt-1">{errors.matricule}</div>
                )}
              </div>

              {/* Username */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-gray-600">Nom d'utilisateur *</div>
                  <div className="text-xs text-gray-400">(peut être partagé)</div>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-black ${
                    errors.username ? 'border-red-500' : ''
                  }`}
                  placeholder="aganze.isaac"
                />
                {errors.username && (
                  <div className="text-red-500 text-sm mt-1">{errors.username}</div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Mot de passe *</div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:border-black ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="001SI123"
                />
                {errors.password && (
                  <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                )}
              </div>

              {/* Role */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Rôle *</div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-black"
                >
                  <option value="student">Étudiant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {/* Genre */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Genre *</div>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-black"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded text-sm ${
                  message.includes('créé') || message.includes('succès') || message.includes('terminée')
                    ? 'bg-green-50 text-green-700' 
                    : message.includes('Erreur') || message.includes('annulée')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {message}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/admin/users')}
                  className="flex-1 py-2 border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}