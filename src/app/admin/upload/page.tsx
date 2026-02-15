
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowUpTrayIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
// import { supabase } from '@/lib/supabase';

// interface AssessmentConfig {
//   columnName: string;
//   assessmentName: string;
//   type: string;
//   maxScore: number;
//   date: string;
// }

// export default function AdminUploadPage() {
//   const router = useRouter();
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [previewData, setPreviewData] = useState<any[]>([]);
//   const [headers, setHeaders] = useState<string[]>([]);
//   const [assessments, setAssessments] = useState<AssessmentConfig[]>([]);
//   const [matriculeHeader, setMatriculeHeader] = useState('');
//   const [totalScores, setTotalScores] = useState(0);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       setFile(selectedFile);
//       setError('');
//       setSuccess('');
//       setAssessments([]);
//       setTotalScores(0);
      
//       // Lire le fichier CSV
//       const text = await selectedFile.text();
//       const lines = text.split('\n').filter(line => line.trim());
      
//       if (lines.length === 0) {
//         setError('Fichier vide');
//         return;
//       }
      
//       // Détecter séparateur
//       const separator = lines[0].includes(';') ? ';' : ',';
//       const fileHeaders = lines[0].split(separator).map(h => h.trim());
//       setHeaders(fileHeaders);
      
//       // Trouver automatiquement la colonne matricule
//       const foundMatricule = fileHeaders.find(h => 
//         h.toLowerCase().includes('matricule') || 
//         h.toLowerCase().includes('matric')
//       ) || fileHeaders[0];
      
//       setMatriculeHeader(foundMatricule);
      
//       // Détecter automatiquement les colonnes de cotes
//       const detectedAssessments: AssessmentConfig[] = [];
      
//       fileHeaders.forEach(header => {
//         // Ignorer la colonne matricule et les colonnes de nom
//         if (header === foundMatricule || 
//             header.toLowerCase().includes('nom') || 
//             header.toLowerCase().includes('prenom')) {
//           return;
//         }
        
//         // Détecter le type basé sur le nom de la colonne
//         let type = 'TD';
//         if (header.toLowerCase().includes('tp')) type = 'TP';
//         if (header.toLowerCase().includes('interro') || header.toLowerCase().includes('quiz')) type = 'INTERRO';
//         if (header.toLowerCase().includes('exam')) type = 'EXAMEN';
//         if (header.toLowerCase().includes('projet')) type = 'PROJET';
        
//         detectedAssessments.push({
//           columnName: header,
//           assessmentName: header,
//           type: type,
//           maxScore: 10, // Valeur par défaut 10 pour tous les travaux
//           date: new Date().toISOString().split('T')[0]
//         });
//       });
      
//       setAssessments(detectedAssessments);
      
//       // Prévisualisation (5 premières lignes maximum)
//       const preview = [];
//       const previewLimit = Math.min(lines.length - 1, 5); // Max 5 lignes de données
//       let scoreCount = 0;
      
//       for (let i = 1; i <= previewLimit; i++) {
//         const values = lines[i].split(separator).map(v => v.trim());
//         const row: any = {};
//         fileHeaders.forEach((header, idx) => {
//           row[header] = values[idx] || '';
//           // Compter les scores non vides
//           if (detectedAssessments.some(a => a.columnName === header) && values[idx] && values[idx].trim() !== '') {
//             scoreCount++;
//           }
//         });
//         preview.push(row);
//       }
      
//       setPreviewData(preview);
//       setTotalScores(scoreCount);
//     }
//   };

//   const updateAssessment = (index: number, field: keyof AssessmentConfig, value: any) => {
//     const newAssessments = [...assessments];
    
//     // Gérer spécifiquement le champ maxScore pour éviter NaN
//     if (field === 'maxScore') {
//       // Convertir en nombre
//       const numValue = parseFloat(value);
      
//       // Si la valeur est vide ou invalide, mettre 10 par défaut
//       if (isNaN(numValue) || value === '' || value === null || value === undefined) {
//         newAssessments[index] = {
//           ...newAssessments[index],
//           maxScore: 10 // Valeur par défaut
//         };
//       } else {
//         // Assurer que la valeur est positive
//         const validValue = Math.max(0, numValue);
//         newAssessments[index] = {
//           ...newAssessments[index],
//           maxScore: validValue
//         };
//       }
//     } else {
//       // Pour les autres champs
//       newAssessments[index] = {
//         ...newAssessments[index],
//         [field]: value
//       };
//     }
    
//     setAssessments(newAssessments);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!file) {
//       setError('Veuillez sélectionner un fichier');
//       return;
//     }
    
//     if (!matriculeHeader) {
//       setError('Colonne matricule non détectée');
//       return;
//     }
    
//     if (assessments.length === 0) {
//       setError('Aucune cote détectée dans le fichier');
//       return;
//     }
    
//     setUploading(true);
//     setError('');
//     setSuccess('');
    
//     try {
//       // Lire le fichier complet
//       const text = await file.text();
//       const lines = text.split('\n').filter(line => line.trim());
//       const separator = lines[0].includes(';') ? ';' : ',';
//       const fileHeaders = lines[0].split(separator).map(h => h.trim());
      
//       const matriculeIndex = fileHeaders.indexOf(matriculeHeader);
//       if (matriculeIndex === -1) {
//         throw new Error('Colonne matricule non trouvée');
//       }
      
//       let totalImported = 0;
//       let totalAssessments = 0;
      
//       // Pour chaque évaluation configurée
//       for (const assessment of assessments) {
//         const scoreIndex = fileHeaders.indexOf(assessment.columnName);
//         if (scoreIndex === -1) {
//           console.warn(`Colonne ${assessment.columnName} non trouvée, ignorée`);
//           continue;
//         }
        
//         // 1. Créer l'évaluation
//         const { data: assessmentData, error: assessmentError } = await supabase
//           .from('assessments')
//           .insert({
//             name: assessment.assessmentName,
//             type: assessment.type,
//             max_score: assessment.maxScore,
//             assessment_date: assessment.date
//           })
//           .select()
//           .single();
        
//         if (assessmentError) throw assessmentError;
        
//         totalAssessments++;
        
//         // 2. Collecter les scores
//         const scoresToInsert = [];
        
//         for (let i = 1; i < lines.length; i++) {
//           const values = lines[i].split(separator).map(v => v.trim());
//           const matricule = values[matriculeIndex];
//           const scoreStr = values[scoreIndex];
          
//           if (!matricule) continue;
          
//           let score = null;
//           if (scoreStr && scoreStr.trim() !== '') {
//             // Gérer absences et cas spéciaux
//             const cleanScore = scoreStr.trim().toUpperCase();
//             if (cleanScore === 'ABS' || cleanScore === 'ABSENT' || cleanScore === 'AB') {
//               score = null; // Absence
//             } else {
//               const parsed = parseFloat(cleanScore.replace(',', '.'));
//               if (!isNaN(parsed)) {
//                 score = parsed;
//               }
//             }
//           }
          
//           scoresToInsert.push({
//             matricule: matricule.toUpperCase(),
//             assessment_id: assessmentData.id,
//             score: score
//           });
//         }
        
//         // 3. Insérer les scores
//         if (scoresToInsert.length > 0) {
//           const { error: scoresError } = await supabase
//             .from('scores')
//             .insert(scoresToInsert);
          
//           if (scoresError) throw scoresError;
          
//           totalImported += scoresToInsert.length;
//         }
//       }
      
//       setSuccess(`✅ Import réussi ! ${totalImported} cotes importées pour ${totalAssessments} évaluations`);
      
//       // Réinitialiser après 3 secondes
//       setTimeout(() => {
//         setFile(null);
//         setPreviewData([]);
//         setHeaders([]);
//         setAssessments([]);
//         setMatriculeHeader('');
//         setTotalScores(0);
//       }, 3000);
      
//     } catch (err: any) {
//       setError(`Erreur: ${err.message}`);
//       console.error(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const getScoreColor = (scoreValue: string, maxScore: number = 20) => {
//     if (!scoreValue || scoreValue.trim() === '' || scoreValue.toUpperCase() === 'ABS') {
//       return 'text-gray-600 bg-gray-100'; // Gris pour vide/absent
//     }
    
//     try {
//       const score = parseFloat(scoreValue.replace(',', '.'));
//       if (isNaN(score)) {
//         return 'text-gray-600 bg-gray-100'; // Gris si pas un nombre
//       }
      
//       if (score < 5) {
//         return 'text-red-800 bg-red-100'; // Rouge pour < 5
//       } else {
//         return 'text-green-800 bg-green-100'; // Vert pour >= 5
//       }
//     } catch {
//       return 'text-gray-600 bg-gray-100';
//     }
//   };

//   // Fonction pour valider et formater la valeur maxScore
//   const formatMaxScoreValue = (value: number | string): string => {
//     if (typeof value === 'string') {
//       const num = parseFloat(value);
//       return isNaN(num) ? '10' : num.toString();
//     }
//     return value.toString();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Importer des Cotes</h1>
//               <p className="text-gray-600 mt-1">Importez plusieurs cotes en une fois</p>
//             </div>
//             <button
//               onClick={() => router.push('/admin/students')}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
//             >
//               Voir les étudiants
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Formulaire */}
//         <div className="bg-white rounded-lg shadow p-6 mb-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Fichier CSV avec les cotes *
//               </label>
              
//               {!file ? (
//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
//                   <div className="space-y-1 text-center">
//                     <div className="flex text-sm text-gray-600 justify-center">
//                       <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
//                         <span>Choisir un fichier</span>
//                         <input
//                           type="file"
//                           accept=".csv,.txt"
//                           onChange={handleFileChange}
//                           className="sr-only"
//                           required
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       Format: Matricule, TD1, TD2, TP1, Interro, ...
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mt-1 border border-gray-300 rounded-lg p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
//                         <CheckIcon className="h-6 w-6 text-green-600" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">{file.name}</p>
//                         <p className="text-xs text-gray-500">
//                           {headers.length} colonnes • {assessments.length} évaluations détectées • {totalScores} cotes dans l'aperçu
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setFile(null);
//                         setPreviewData([]);
//                         setHeaders([]);
//                         setAssessments([]);
//                         setTotalScores(0);
//                       }}
//                       className="text-gray-400 hover:text-gray-500"
//                     >
//                       <XMarkIcon className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Aperçu du fichier */}
//             {previewData.length > 0 && (
//               <div>
//                 <div className="flex justify-between items-center mb-3">
//                   <h3 className="text-sm font-medium text-gray-700">
//                     Aperçu des données ({previewData.length} étudiants)
//                   </h3>
//                   <div className="flex items-center space-x-4">
//                     <div className="flex items-center">
//                       <div className="h-3 w-3 bg-green-100 border border-green-300 rounded mr-1"></div>
//                       <span className="text-xs text-gray-600">≥ 5</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="h-3 w-3 bg-red-100 border border-red-300 rounded mr-1"></div>
//                       <span className="text-xs text-gray-600">&lt; 5</span>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="h-3 w-3 bg-gray-100 border border-gray-300 rounded mr-1"></div>
//                       <span className="text-xs text-gray-600">Vide/Abs</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="overflow-x-auto border border-gray-200 rounded-lg">
//                   <table className="min-w-full divide-y divide-gray-200 text-sm">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         {headers.map(header => (
//                           <th
//                             key={header}
//                             className={`px-3 py-2 text-left font-medium ${
//                               header === matriculeHeader
//                                 ? 'bg-blue-50 text-blue-700'
//                                 : assessments.some(a => a.columnName === header)
//                                 ? 'bg-green-50 text-green-700'
//                                 : 'text-gray-500'
//                             }`}
//                           >
//                             {header}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {previewData.map((row, idx) => (
//                         <tr key={idx} className="hover:bg-gray-50">
//                           {headers.map(header => {
//                             const value = row[header];
//                             const isScore = assessments.some(a => a.columnName === header);
//                             const isEmpty = !value || value === '';
                            
//                             return (
//                               <td
//                                 key={`${idx}-${header}`}
//                                 className={`px-3 py-2 ${
//                                   !isScore
//                                     ? ''
//                                     : getScoreColor(value)
//                                 }`}
//                               >
//                                 {isEmpty ? '-' : value}
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
                
//                 {previewData.length < totalScores && (
//                   <p className="text-xs text-gray-500 mt-2 text-center">
//                     Affichage des 5 premiers étudiants seulement • {totalScores} cotes dans l'aperçu
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Configuration des évaluations */}
//             {assessments.length > 0 && (
//               <div className="border-t pt-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-sm font-medium text-gray-700">
//                     Configuration des évaluations ({assessments.length} trouvées)
//                   </h3>
//                   <div className="bg-blue-50 px-3 py-1 rounded-md">
//                     <span className="text-xs font-medium text-blue-700">
//                       Total: {assessments.length} évaluations • {totalScores} cotes
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="space-y-4">
//                   {assessments.map((assessment, idx) => (
//                     <div key={idx} className="border rounded-lg p-4 bg-gray-50">
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div>
//                           <label className="block text-xs text-gray-600 mb-1">
//                             Colonne
//                           </label>
//                           <div className="font-medium text-gray-900">
//                             {assessment.columnName}
//                           </div>
//                         </div>
                        
//                         <div>
//                           <label className="block text-xs text-gray-600 mb-1">
//                             Nom *
//                           </label>
//                           <input
//                             type="text"
//                             value={assessment.assessmentName}
//                             onChange={(e) => updateAssessment(idx, 'assessmentName', e.target.value)}
//                             className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
//                             required
//                           />
//                         </div>
                        
//                         <div>
//                           <label className="block text-xs text-gray-600 mb-1">
//                             Type *
//                           </label>
//                           <select
//                             value={assessment.type}
//                             onChange={(e) => updateAssessment(idx, 'type', e.target.value)}
//                             className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
//                           >
//                             <option value="TD">TD</option>
//                             <option value="TP">TP</option>
//                             <option value="INTERRO">Interro</option>
//                             <option value="EXAMEN">Examen</option>
//                             <option value="PROJET">Projet</option>
//                           </select>
//                         </div>
                        
//                         <div className="grid grid-cols-2 gap-2">
//                           <div>
//                             <label className="block text-xs text-gray-600 mb-1">
//                               Score max
//                             </label>
//                             <input
//                               type="number"
//                               value={formatMaxScoreValue(assessment.maxScore)}
//                               onChange={(e) => {
//                                 const value = e.target.value;
//                                 // Permettre la saisie, même vide temporairement
//                                 if (value === '') {
//                                   updateAssessment(idx, 'maxScore', '');
//                                 } else {
//                                   updateAssessment(idx, 'maxScore', value);
//                                 }
//                               }}
//                               onBlur={(e) => {
//                                 // Quand le champ perd le focus, valider et corriger si nécessaire
//                                 const value = e.target.value;
//                                 if (value === '' || isNaN(parseFloat(value))) {
//                                   updateAssessment(idx, 'maxScore', 10);
//                                 }
//                               }}
//                               className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
//                               step="0.5"
//                               min="0"
//                               placeholder="10"
//                             />
//                             <p className="text-xs text-gray-500 mt-1">
//                               Valeur par défaut: 10
//                             </p>
//                           </div>
                          
//                           <div>
//                             <label className="block text-xs text-gray-600 mb-1">
//                               Date
//                             </label>
//                             <input
//                               type="date"
//                               value={assessment.date}
//                               onChange={(e) => updateAssessment(idx, 'date', e.target.value)}
//                               className="w-full px-3- py-1.5 text-sm border border-gray-300 rounded"
//                             />
//                           </div>
//                         </div>
//                       </div>
                      
//                       {/* Statistiques pour cette évaluation */}
//                       {previewData.length > 0 && (
//                         <div className="mt-3 pt-3 border-t border-gray-200">
//                           <div className="flex items-center space-x-4 text-xs text-gray-600">
//                             <div className="flex items-center">
//                               <div className="h-2 w-2 bg-green-100 border border-green-300 rounded-full mr-1"></div>
//                               <span>≥ 5: {
//                                 previewData.filter(row => {
//                                   const value = row[assessment.columnName];
//                                   if (!value || value.trim() === '') return false;
//                                   const score = parseFloat(value.replace(',', '.'));
//                                   return !isNaN(score) && score >= 5;
//                                 }).length
//                               }</span>
//                             </div>
//                             <div className="flex items-center">
//                               <div className="h-2 w-2 bg-red-100 border border-red-300 rounded-full mr-1"></div>
//                               <span>&lt; 5: {
//                                 previewData.filter(row => {
//                                   const value = row[assessment.columnName];
//                                   if (!value || value.trim() === '') return false;
//                                   const score = parseFloat(value.replace(',', '.'));
//                                   return !isNaN(score) && score < 5;
//                                 }).length
//                               }</span>
//                             </div>
//                             <div className="flex items-center">
//                               <div className="h-2 w-2 bg-gray-100 border border-gray-300 rounded-full mr-1"></div>
//                               <span>Vide/Abs: {
//                                 previewData.filter(row => {
//                                   const value = row[assessment.columnName];
//                                   return !value || value.trim() === '' || value.toUpperCase() === 'ABS';
//                                 }).length
//                               }</span>
//                             </div>
//                             <div className="ml-2 text-blue-600 font-medium">
//                               Max: {assessment.maxScore}
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Messages */}
//             {error && (
//               <div className="rounded-md bg-red-50 p-4">
//                 <p className="text-sm text-red-800">{error}</p>
//               </div>
//             )}

//             {success && (
//               <div className="rounded-md bg-green-50 p-4">
//                 <p className="text-sm text-green-800">{success}</p>
//               </div>
//             )}

//             {/* Bouton */}
//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 disabled={uploading || !file || assessments.length === 0}
//                 className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//               >
//                 {uploading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Import en cours...
//                   </>
//                 ) : (
//                   <>
//                     <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
//                     Importer {assessments.length} évaluation(s)
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Instructions */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Format attendu</h3>
          
//           <div className="overflow-x-auto mb-4">
//             <table className="min-w-full text-sm border border-gray-300">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border p-2 font-medium">MATRICULE</th>
//                   <th className="border p-2 font-medium">TD1 (10)</th>
//                   <th className="border p-2 font-medium">TD2 (10)</th>
//                   <th className="border p-2 font-medium">TP1 (10)</th>
//                   <th className="border p-2 font-medium">Interro (10)</th>
//                   <th className="border p-2 font-medium">Examen (20)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="border p-2 font-mono">25AA001SI</td>
//                   <td className="border p-2 bg-green-100 text-green-800">8,5</td>
//                   <td className="border p-2 bg-green-100 text-green-800">9</td>
//                   <td className="border p-2 bg-green-100 text-green-800">7,5</td>
//                   <td className="border p-2 bg-green-100 text-green-800">8</td>
//                   <td className="border p-2 bg-green-100 text-green-800">16</td>
//                 </tr>
//                 <tr>
//                   <td className="border p-2 font-mono">25AM040SI</td>
//                   <td className="border p-2 bg-gray-100 text-gray-600">ABS</td>
//                   <td className="border p-2 bg-green-100 text-green-800">6,5</td>
//                   <td className="border p-2 bg-gray-100 text-gray-600"></td>
//                   <td className="border p-2 bg-green-100 text-green-800">5,5</td>
//                   <td className="border p-2 bg-green-100 text-green-800">12,5</td>
//                 </tr>
//                 <tr>
//                   <td className="border p-2 font-mono">24AL002S</td>
//                   <td className="border p-2 bg-red-100 text-red-800">4,5</td>
//                   <td className="border p-2 bg-red-100 text-red-800">3</td>
//                   <td className="border p-2 bg-red-100 text-red-800">2,5</td>
//                   <td className="border p-2 bg-red-100 text-red-800">1</td>
//                   <td className="border p-2 bg-red-100 text-red-800">8</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
          
//           <div className="text-sm text-gray-600 space-y-2">
//             <p><strong>Colonnes requises :</strong></p>
//             <ul className="list-disc pl-5">
//               <li>Une colonne <code>MATRICULE</code> (ou similaire)</li>
//               <li>Autant de colonnes de cotes que nécessaire</li>
//               <li>Les entêtes des colonnes deviennent les noms des évaluations</li>
//             </ul>
            
//             <p><strong>Couleurs des scores :</strong></p>
//             <ul className="list-disc pl-5">
//               <li><span className="text-green-600 font-medium">Vert</span> : Score ≥ 5</li>
//               <li><span className="text-red-600 font-medium">Rouge</span> : Score &lt; 5</li>
//               <li><span className="text-gray-600 font-medium">Gris</span> : Vide, ABS ou absent</li>
//             </ul>
            
//             <p><strong>Valeurs acceptées :</strong></p>
//             <ul className="list-disc pl-5">
//               <li>Nombres avec virgule ou point : <code>8,5</code> ou <code>8.5</code></li>
//               <li><code>ABS</code> ou <code>ABSENT</code> pour les absences</li>
//               <li>Case vide pour "non noté"</li>
//               <li><strong>Score max par défaut : 10</strong> pour tous les travaux (TD, TP, Interro)</li>
//             </ul>
            
//             <p className="text-blue-600 font-medium mt-4">
//               ✓ Les cotes sont automatiquement assignées aux étudiants via leur matricule
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpTrayIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

interface AssessmentConfig {
  columnName: string;
  assessmentName: string;
  type: string;
  maxScore: number;
  date: string;
}

export default function AdminUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [assessments, setAssessments] = useState<AssessmentConfig[]>([]);
  const [matriculeHeader, setMatriculeHeader] = useState('');
  const [totalScores, setTotalScores] = useState(0);

  // Fonction pour normaliser un matricule
  const normalizeMatricule = (matricule: string): string => {
    if (!matricule) return '';
    
    return matricule
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '') // Enlever tous les espaces
      .replace(/[^A-Z0-9]/g, ''); // Garder seulement lettres majuscules et chiffres
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
      setSuccess('');
      setAssessments([]);
      setTotalScores(0);
      
      try {
        // Lire le fichier CSV
        const text = await selectedFile.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          setError('Fichier vide');
          return;
        }
        
        // Détecter séparateur
        const separator = lines[0].includes(';') ? ';' : ',';
        const fileHeaders = lines[0].split(separator).map(h => h.trim());
        setHeaders(fileHeaders);
        
        // Trouver automatiquement la colonne matricule
        const foundMatricule = fileHeaders.find(h => 
          h.toLowerCase().includes('matricule') || 
          h.toLowerCase().includes('matric') ||
          h.toLowerCase().includes('mat') ||
          h.toLowerCase().includes('code') ||
          h.toLowerCase().includes('id')
        ) || fileHeaders[0];
        
        setMatriculeHeader(foundMatricule);
        
        // Détecter automatiquement les colonnes de cotes
        const detectedAssessments: AssessmentConfig[] = [];
        
        fileHeaders.forEach(header => {
          // Ignorer la colonne matricule et les colonnes de nom
          if (header === foundMatricule || 
              header.toLowerCase().includes('nom') || 
              header.toLowerCase().includes('prenom') ||
              header.toLowerCase().includes('name') ||
              header.toLowerCase().includes('first') ||
              header.toLowerCase().includes('email') ||
              header.toLowerCase().includes('username') ||
              header.toLowerCase().includes('password') ||
              header.toLowerCase().includes('role')) {
            return;
          }
          
          // Détecter le type basé sur le nom de la colonne
          let type = 'TD';
          if (header.toLowerCase().includes('tp')) type = 'TP';
          if (header.toLowerCase().includes('interro') || header.toLowerCase().includes('quiz')) type = 'INTERRO';
          if (header.toLowerCase().includes('exam')) type = 'EXAMEN';
          if (header.toLowerCase().includes('projet')) type = 'PROJET';
          if (header.toLowerCase().includes('cc')) type = 'CONTROLE';
          if (header.toLowerCase().includes('ds')) type = 'DEVOIR';
          
          detectedAssessments.push({
            columnName: header,
            assessmentName: header,
            type: type,
            maxScore: 10,
            date: new Date().toISOString().split('T')[0]
          });
        });
        
        setAssessments(detectedAssessments);
        
        // Prévisualisation
        const preview = [];
        const previewLimit = Math.min(lines.length - 1, 5);
        let scoreCount = 0;
        
        for (let i = 1; i <= previewLimit; i++) {
          const values = lines[i].split(separator).map(v => v.trim());
          const row: any = {};
          fileHeaders.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          preview.push(row);
          
          // Compter les scores valides
          detectedAssessments.forEach(assessment => {
            const scoreIndex = fileHeaders.indexOf(assessment.columnName);
            if (scoreIndex !== -1) {
              const value = values[scoreIndex];
              if (value && value.trim() !== '' && 
                  value.toUpperCase() !== 'ABS' && 
                  value.toUpperCase() !== 'ABSENT' && 
                  value.toUpperCase() !== 'AB') {
                scoreCount++;
              }
            }
          });
        }
        
        setPreviewData(preview);
        setTotalScores(scoreCount);
        
      } catch (err) {
        setError('Erreur lors de la lecture du fichier');
        console.error(err);
      }
    }
  };

  const updateAssessment = (index: number, field: keyof AssessmentConfig, value: any) => {
    const newAssessments = [...assessments];
    
    if (field === 'maxScore') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || value === '' || value === null || value === undefined) {
        newAssessments[index] = {
          ...newAssessments[index],
          maxScore: 10
        };
      } else {
        const validValue = Math.max(0, numValue);
        newAssessments[index] = {
          ...newAssessments[index],
          maxScore: validValue
        };
      }
    } else {
      newAssessments[index] = {
        ...newAssessments[index],
        [field]: value
      };
    }
    
    setAssessments(newAssessments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    
    if (!matriculeHeader) {
      setError('Colonne matricule non détectée');
      return;
    }
    
    if (assessments.length === 0) {
      setError('Aucune cote détectée dans le fichier');
      return;
    }
    
    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      // Lire le fichier complet
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const separator = lines[0].includes(';') ? ';' : ',';
      const fileHeaders = lines[0].split(separator).map(h => h.trim());
      
      const matriculeIndex = fileHeaders.indexOf(matriculeHeader);
      if (matriculeIndex === -1) {
        throw new Error('Colonne matricule non trouvée');
      }
      
      // Récupérer tous les utilisateurs (étudiants) avec leurs matricules normalisés
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('matricule, id, username')
        .eq('role', 'student'); // Seulement les étudiants
      
      if (usersError) throw usersError;
      
      console.log('Utilisateurs trouvés:', allUsers?.length);
      
      // Créer un dictionnaire des matricules normalisés
      const userMap = new Map();
      allUsers?.forEach(user => {
        const normalizedMatricule = normalizeMatricule(user.matricule);
        userMap.set(normalizedMatricule, user);
        console.log(`Étudiant en base: ${user.matricule} (${user.username}) -> normalisé: ${normalizedMatricule}`);
      });
      
      console.log(`Total étudiants en base: ${userMap.size}`);
      
      let totalImported = 0;
      let totalAssessments = 0;
      let errors: string[] = [];
      let warnings: string[] = [];
      
      // Pour chaque évaluation configurée
      for (const assessment of assessments) {
        const scoreIndex = fileHeaders.indexOf(assessment.columnName);
        if (scoreIndex === -1) {
          warnings.push(`Colonne ${assessment.columnName} non trouvée, ignorée`);
          continue;
        }
        
        try {
          // Vérifier si l'évaluation existe déjà
          const { data: existingAssessment } = await supabase
            .from('assessments')
            .select('id')
            .eq('name', assessment.assessmentName)
            .eq('type', assessment.type)
            .maybeSingle();
          
          let assessmentId;
          
          if (existingAssessment) {
            assessmentId = existingAssessment.id;
            // Mettre à jour l'évaluation existante
            const { error: updateError } = await supabase
              .from('assessments')
              .update({
                max_score: assessment.maxScore,
                assessment_date: assessment.date
              })
              .eq('id', assessmentId);
            
            if (updateError) throw updateError;
          } else {
            // Créer nouvelle évaluation
            const { data: newAssessment, error: assessmentError } = await supabase
              .from('assessments')
              .insert({
                name: assessment.assessmentName,
                type: assessment.type,
                max_score: assessment.maxScore,
                assessment_date: assessment.date
              })
              .select()
              .single();
            
            if (assessmentError) throw assessmentError;
            assessmentId = newAssessment.id;
          }
          
          totalAssessments++;
          
          // Collecter les scores à insérer
          const scoresToInsert = [];
          const studentsNotFound = [];
          const invalidScores = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(separator).map(v => v.trim());
            const rawMatricule = values[matriculeIndex];
            const scoreStr = values[scoreIndex];
            
            if (!rawMatricule) continue;
            
            // Normaliser le matricule du fichier
            const normalizedFileMatricule = normalizeMatricule(rawMatricule);
            
            // Chercher l'étudiant correspondant
            const user = userMap.get(normalizedFileMatricule);
            
            if (!user) {
              studentsNotFound.push(rawMatricule);
              continue;
            }
            
            // Traiter le score
            let score = null;
            if (scoreStr && scoreStr.trim() !== '') {
              const cleanScore = scoreStr.trim().toUpperCase();
              if (cleanScore === 'ABS' || cleanScore === 'ABSENT' || cleanScore === 'AB') {
                score = null; // Absence
              } else {
                const parsed = parseFloat(cleanScore.replace(',', '.'));
                if (!isNaN(parsed)) {
                  // Vérifier que le score ne dépasse pas le max
                  if (parsed > assessment.maxScore) {
                    invalidScores.push(`Matricule ${rawMatricule}: ${parsed} > ${assessment.maxScore}`);
                    score = assessment.maxScore; // Optionnel: tronquer au max
                  } else {
                    score = parsed;
                  }
                } else {
                  invalidScores.push(`Matricule ${rawMatricule}: "${scoreStr}" n'est pas un nombre valide`);
                }
              }
            }
            
            scoresToInsert.push({
              matricule: user.matricule, // Utiliser le matricule original de la base
              assessment_id: assessmentId,
              score: score
            });
          }
          
          // Afficher les avertissements
          if (studentsNotFound.length > 0) {
            warnings.push(`${studentsNotFound.length} matricules non trouvés pour ${assessment.assessmentName}: ${studentsNotFound.slice(0, 5).join(', ')}${studentsNotFound.length > 5 ? '...' : ''}`);
          }
          
          if (invalidScores.length > 0) {
            warnings.push(`${invalidScores.length} scores invalides pour ${assessment.assessmentName}: ${invalidScores.slice(0, 3).join(', ')}`);
          }
          
          // Insérer les scores
          if (scoresToInsert.length > 0) {
            // Supprimer les anciens scores pour cette évaluation
            const { error: deleteError } = await supabase
              .from('scores')
              .delete()
              .eq('assessment_id', assessmentId);
            
            if (deleteError) throw deleteError;
            
            // Insérer les nouveaux scores par lots de 100 pour éviter les timeouts
            const batchSize = 100;
            for (let j = 0; j < scoresToInsert.length; j += batchSize) {
              const batch = scoresToInsert.slice(j, j + batchSize);
              const { error: insertError } = await supabase
                .from('scores')
                .insert(batch);
              
              if (insertError) throw insertError;
            }
            
            totalImported += scoresToInsert.length;
          }
          
        } catch (err: any) {
          errors.push(`Erreur pour ${assessment.assessmentName}: ${err.message}`);
        }
      }
      
      // Message de résultat
      let resultMessage = `✅ ${totalImported} cotes importées pour ${totalAssessments} évaluations`;
      
      if (warnings.length > 0) {
        resultMessage += `\n⚠️ ${warnings.length} avertissement(s):\n${warnings.join('\n')}`;
      }
      
      if (errors.length > 0) {
        resultMessage += `\n❌ ${errors.length} erreur(s):\n${errors.join('\n')}`;
      }
      
      setSuccess(resultMessage);
      
      // Réinitialiser après 5 secondes
      setTimeout(() => {
        setFile(null);
        setPreviewData([]);
        setHeaders([]);
        setAssessments([]);
        setMatriculeHeader('');
        setTotalScores(0);
        setSuccess('');
      }, 8000);
      
    } catch (err: any) {
      setError(`Erreur: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (scoreValue: string) => {
    if (!scoreValue || scoreValue.trim() === '' || 
        scoreValue.toUpperCase() === 'ABS' || 
        scoreValue.toUpperCase() === 'ABSENT' || 
        scoreValue.toUpperCase() === 'AB') {
      return 'text-gray-600 bg-gray-100';
    }
    
    try {
      const score = parseFloat(scoreValue.replace(',', '.'));
      if (isNaN(score)) {
        return 'text-gray-600 bg-gray-100';
      }
      
      if (score < 5) {
        return 'text-red-800 bg-red-100';
      } else {
        return 'text-green-800 bg-green-100';
      }
    } catch {
      return 'text-gray-600 bg-gray-100';
    }
  };

  const formatMaxScoreValue = (value: number | string): string => {
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '10' : num.toString();
    }
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Importer des Cotes</h1>
              <p className="text-gray-600 mt-1">Importez plusieurs cotes en une fois</p>
            </div>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Voir les utilisateurs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier CSV avec les cotes *
              </label>
              
              {!file ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Choisir un fichier</span>
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileChange}
                          className="sr-only"
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Format: Matricule, TD1, TD2, TP1, Interro, ...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {headers.length} colonnes • {assessments.length} évaluations détectées • {totalScores} cotes dans l'aperçu
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewData([]);
                        setHeaders([]);
                        setAssessments([]);
                        setTotalScores(0);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Aperçu du fichier */}
            {previewData.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Aperçu des données ({previewData.length} étudiants)
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-100 border border-green-300 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">≥ 5</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-red-100 border border-red-300 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">&lt; 5</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-gray-100 border border-gray-300 rounded mr-1"></div>
                      <span className="text-xs text-gray-600">Vide/Abs</span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map(header => (
                          <th
                            key={header}
                            className={`px-3 py-2 text-left font-medium ${
                              header === matriculeHeader
                                ? 'bg-blue-50 text-blue-700'
                                : assessments.some(a => a.columnName === header)
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-500'
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, rowIndex) => (
                        <tr key={`preview-${rowIndex}`} className="hover:bg-gray-50">
                          {headers.map(header => {
                            const value = row[header];
                            const isScore = assessments.some(a => a.columnName === header);
                            
                            return (
                              <td
                                key={`${rowIndex}-${header}`}
                                className={`px-3 py-2 ${
                                  !isScore
                                    ? ''
                                    : getScoreColor(value)
                                }`}
                              >
                                {!value || value === '' ? '-' : value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Configuration des évaluations */}
            {assessments.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Configuration des évaluations ({assessments.length} trouvées)
                  </h3>
                  <div className="bg-blue-50 px-3 py-1 rounded-md">
                    <span className="text-xs font-medium text-blue-700">
                      Total: {assessments.length} évaluations • {totalScores} cotes valides
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {assessments.map((assessment, idx) => (
                    <div key={`assessment-${idx}`} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Colonne
                          </label>
                          <div className="font-medium text-gray-900">
                            {assessment.columnName}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Nom *
                          </label>
                          <input
                            type="text"
                            value={assessment.assessmentName}
                            onChange={(e) => updateAssessment(idx, 'assessmentName', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Type *
                          </label>
                          <select
                            value={assessment.type}
                            onChange={(e) => updateAssessment(idx, 'type', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                          >
                            <option value="TD">TD</option>
                            <option value="TP">TP</option>
                            <option value="INTERRO">Interro</option>
                            <option value="EXAMEN">Examen</option>
                            <option value="PROJET">Projet</option>
                            <option value="CONTROLE">Contrôle</option>
                            <option value="DEVOIR">Devoir</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Score max
                            </label>
                            <input
                              type="number"
                              value={formatMaxScoreValue(assessment.maxScore)}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  updateAssessment(idx, 'maxScore', '');
                                } else {
                                  updateAssessment(idx, 'maxScore', value);
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                if (value === '' || isNaN(parseFloat(value))) {
                                  updateAssessment(idx, 'maxScore', 10);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                              step="0.5"
                              min="0"
                              placeholder="10"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={assessment.date}
                              onChange={(e) => updateAssessment(idx, 'date', e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Statistiques pour cette évaluation */}
                      {previewData.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-green-100 border border-green-300 rounded-full mr-1"></div>
                              <span>≥ 5: {
                                previewData.filter(row => {
                                  const value = row[assessment.columnName];
                                  if (!value || value.trim() === '') return false;
                                  if (['ABS', 'ABSENT', 'AB'].includes(value.toUpperCase())) return false;
                                  const score = parseFloat(value.replace(',', '.'));
                                  return !isNaN(score) && score >= 5;
                                }).length
                              }</span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-red-100 border border-red-300 rounded-full mr-1"></div>
                              <span>&lt; 5: {
                                previewData.filter(row => {
                                  const value = row[assessment.columnName];
                                  if (!value || value.trim() === '') return false;
                                  if (['ABS', 'ABSENT', 'AB'].includes(value.toUpperCase())) return false;
                                  const score = parseFloat(value.replace(',', '.'));
                                  return !isNaN(score) && score < 5;
                                }).length
                              }</span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-gray-100 border border-gray-300 rounded-full mr-1"></div>
                              <span>Vide/Abs: {
                                previewData.filter(row => {
                                  const value = row[assessment.columnName];
                                  return !value || value.trim() === '' || 
                                         ['ABS', 'ABSENT', 'AB'].includes(value.toUpperCase());
                                }).length
                              }</span>
                            </div>
                            <div className="ml-2 text-blue-600 font-medium">
                              Max: {assessment.maxScore}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800 whitespace-pre-line">{success}</p>
              </div>
            )}

            {/* Bouton */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || !file || assessments.length === 0}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Importer {assessments.length} évaluation(s)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Format attendu</h3>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 font-medium">MATRICULE</th>
                  <th className="border p-2 font-medium">TD1</th>
                  <th className="border p-2 font-medium">TD2</th>
                  <th className="border p-2 font-medium">TP1</th>
                  <th className="border p-2 font-medium">Interro</th>
                  <th className="border p-2 font-medium">Examen</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-mono">25AA001SI</td>
                  <td className="border p-2 bg-green-100 text-green-800">8,5</td>
                  <td className="border p-2 bg-green-100 text-green-800">9</td>
                  <td className="border p-2 bg-green-100 text-green-800">7,5</td>
                  <td className="border p-2 bg-green-100 text-green-800">8</td>
                  <td className="border p-2 bg-green-100 text-green-800">16</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">25AM040SI</td>
                  <td className="border p-2 bg-gray-100 text-gray-600">ABS</td>
                  <td className="border p-2 bg-green-100 text-green-800">6,5</td>
                  <td className="border p-2 bg-gray-100 text-gray-600"></td>
                  <td className="border p-2 bg-green-100 text-green-800">5,5</td>
                  <td className="border p-2 bg-green-100 text-green-800">12,5</td>
                </tr>
                <tr>
                  <td className="border p-2 font-mono">24AL002S</td>
                  <td className="border p-2 bg-red-100 text-red-800">4,5</td>
                  <td className="border p-2 bg-red-100 text-red-800">3</td>
                  <td className="border p-2 bg-red-100 text-red-800">2,5</td>
                  <td className="border p-2 bg-red-100 text-red-800">1</td>
                  <td className="border p-2 bg-red-100 text-red-800">8</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Colonnes requises :</strong></p>
            <ul className="list-disc pl-5">
              <li>Une colonne <code>MATRICULE</code> (ou similaire)</li>
              <li>Autant de colonnes de cotes que nécessaire</li>
              <li>Les entêtes des colonnes deviennent les noms des évaluations</li>
            </ul>
            
            <p><strong>Couleurs des scores :</strong></p>
            <ul className="list-disc pl-5">
              <li><span className="text-green-600 font-medium">Vert</span> : Score ≥ 5</li>
              <li><span className="text-red-600 font-medium">Rouge</span> : Score &lt; 5</li>
              <li><span className="text-gray-600 font-medium">Gris</span> : Vide, ABS ou absent</li>
            </ul>
            
            <p><strong>Valeurs acceptées :</strong></p>
            <ul className="list-disc pl-5">
              <li>Nombres avec virgule ou point : <code>8,5</code> ou <code>8.5</code></li>
              <li><code>ABS</code>, <code>ABSENT</code> ou <code>AB</code> pour les absences</li>
              <li>Case vide pour "non noté"</li>
              <li><strong>Score max par défaut : 10</strong> pour tous les travaux (TD, TP, Interro)</li>
            </ul>
            
            <p className="text-blue-600 font-medium mt-4">
              ✓ Les matricules sont automatiquement normalisés (suppression des espaces, passage en majuscules)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}