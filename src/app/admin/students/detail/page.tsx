// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { EyeIcon, ArrowPathIcon, CalendarIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
// import { supabase } from '@/lib/supabase';

// interface StudentWithScores {
//   matricule: string;
//   username: string;
//   genre: string;
//   scores: {
//     id: string;
//     assessment_name: string;
//     assessment_type: string;
//     score: number | null;
//     max_score: number;
//     assessment_date: string;
//     created_at: string;
//   }[];
// }

// interface AssessmentStats {
//   totalAssessments: number;
//   totalScores: number;
//   successRate: number;
//   scoresByType: Record<string, number>;
//   completedScores: number;
// }

// export default function AdminStudentsPage() {
//   const router = useRouter();
//   const [students, setStudents] = useState<StudentWithScores[]>([]);
//   const [assessmentsList, setAssessmentsList] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [stats, setStats] = useState<AssessmentStats>({
//     totalAssessments: 0,
//     totalScores: 0,
//     successRate: 0,
//     scoresByType: {},
//     completedScores: 0
//   });
//   const [errorMessage, setErrorMessage] = useState('');
//   const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

//   useEffect(() => {
//     checkAdminAndLoadData();
//   }, []);

//   const checkAdminAndLoadData = async () => {
//     const userStr = localStorage.getItem('user');
//     if (!userStr) {
//       router.push('/login');
//       return;
//     }
    
//     const user = JSON.parse(userStr);
//     if (user.role !== 'admin') {
//       router.push('/student');
//       return;
//     }
    
//     await loadStudents();
//   };

//   const loadStudents = async () => {
//     setLoading(true);
//     setErrorMessage('');
//     try {
//       console.log('🚀 Début du chargement des données...');
      
//       // 1. Récupérer TOUS les étudiants (sans limite)
//       const { data: studentsData, error: studentsError } = await supabase
//         .from('users')
//         .select('matricule, username, genre')
//         .eq('role', 'student')
//         .order('matricule');
      
//       if (studentsError) throw studentsError;
//       console.log(`📊 Étudiants récupérés: ${studentsData?.length || 0}`);
      
//       // 2. Récupérer TOUTES les évaluations (sans limite)
//       const { data: assessmentsData, error: assessmentsError } = await supabase
//         .from('assessments')
//         .select('*')
//         .order('assessment_date', { ascending: false });
      
//       if (assessmentsError) throw assessmentsError;
//       console.log(`📚 Évaluations récupérées: ${assessmentsData?.length || 0}`);
//       setAssessmentsList(assessmentsData || []);
      
//       // 3. Récupérer TOUTES les notes (sans limite)
//       let allScores: any[] = [];
//       let page = 0;
//       const pageSize = 1000;
//       let hasMore = true;
      
//       while (hasMore) {
//         const { data: scoresData, error: scoresError } = await supabase
//           .from('scores')
//           .select('*')
//           .range(page * pageSize, (page + 1) * pageSize - 1)
//           .order('created_at', { ascending: false });
        
//         if (scoresError) throw scoresError;
        
//         if (scoresData && scoresData.length > 0) {
//           allScores = [...allScores, ...scoresData];
//           page++;
          
//           if (scoresData.length < pageSize) {
//             hasMore = false;
//           }
//         } else {
//           hasMore = false;
//         }
//       }
      
//       console.log(`🎯 Scores récupérés: ${allScores.length}`);
      
//       const completedScores = allScores.filter(s => s.score !== null).length;
      
//       // 4. Créer un map pour les évaluations
//       const assessmentsMap = new Map();
//       assessmentsData?.forEach(assessment => {
//         assessmentsMap.set(assessment.id, assessment);
//       });
      
//       // Filtrer les scores avec des assessment_id valides
//       const scoresWithValidAssessments = allScores.filter(score => {
//         return assessmentsMap.has(score.assessment_id);
//       });
      
//       // 5. Calculer les statistiques
//       const scoredScores = scoresWithValidAssessments.filter(s => s.score !== null);
//       const passed = scoredScores.filter(s => {
//         const assessment = assessmentsMap.get(s.assessment_id);
//         if (!assessment) return false;
//         return s.score! >= assessment.max_score * 0.5;
//       }).length;
      
//       const scoresByType: Record<string, number> = {};
//       scoredScores.forEach(score => {
//         const assessment = assessmentsMap.get(score.assessment_id);
//         const type = assessment?.type || 'INCONNU';
//         scoresByType[type] = (scoresByType[type] || 0) + 1;
//       });
      
//       setStats({
//         totalAssessments: assessmentsData?.length || 0,
//         totalScores: allScores.length,
//         completedScores,
//         successRate: scoredScores.length > 0 ? (passed / scoredScores.length) * 100 : 0,
//         scoresByType
//       });
      
//       // 6. Combiner les données pour chaque étudiant
//       const studentsWithScores = studentsData.map(student => {
//         const allStudentScores = scoresWithValidAssessments
//           .filter(s => s.matricule === student.matricule);
        
//         const completedScores = allStudentScores
//           .filter(s => s.score !== null)
//           .map(s => {
//             const assessment = assessmentsMap.get(s.assessment_id);
//             return {
//               id: s.id,
//               assessment_name: assessment?.name || 'Évaluation inconnue',
//               assessment_type: assessment?.type || 'TD',
//               score: s.score,
//               max_score: assessment?.max_score || 20,
//               assessment_date: assessment?.assessment_date || '',
//               created_at: s.created_at || ''
//             };
//           })
//           .sort((a, b) => new Date(b.assessment_date || b.created_at).getTime() - new Date(a.assessment_date || a.created_at).getTime());
        
//         const ungradedScores = allStudentScores
//           .filter(s => s.score === null)
//           .map(s => {
//             const assessment = assessmentsMap.get(s.assessment_id);
//             return {
//               id: s.id,
//               assessment_name: assessment?.name || 'Évaluation inconnue',
//               assessment_type: assessment?.type || 'TD',
//               score: s.score,
//               max_score: assessment?.max_score || 20,
//               assessment_date: assessment?.assessment_date || '',
//               created_at: s.created_at || ''
//             };
//           });
        
//         return {
//           ...student,
//           scores: [...completedScores, ...ungradedScores]
//         };
//       });
      
//       setStudents(studentsWithScores);
      
//     } catch (error: any) {
//       console.error('❌ Erreur lors du chargement:', error);
//       setErrorMessage(`Erreur: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCompletedScoresCount = (student: StudentWithScores) => {
//     return student.scores.filter(score => score.score !== null).length;
//   };

//   const getUngradedAssessments = (student: StudentWithScores) => {
//     return student.scores.filter(score => score.score === null);
//   };

//   const getMissingAssessments = (student: StudentWithScores) => {
//     const studentAssessmentNames = student.scores.map(score => score.assessment_name);
//     return assessmentsList.filter(assessment => 
//       !studentAssessmentNames.includes(assessment.name)
//     );
//   };

//   const filteredStudents = students.filter(student =>
//     student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     student.username.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case 'TD': return 'bg-blue-100 text-blue-800';
//       case 'TP': return 'bg-green-100 text-green-800';
//       case 'INTERRO': return 'bg-yellow-100 text-yellow-800';
//       case 'EXAMEN': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getScoreColor = (score: number | null, maxScore: number) => {
//     if (score === null) return 'bg-gray-100 text-gray-600';
    
//     if (maxScore <= 10) {
//       if (score < 5) return 'bg-red-100 text-red-800';
//       if (score < 7) return 'bg-yellow-100 text-yellow-800';
//       return 'bg-green-100 text-green-800';
//     } else {
//       const percentage = (score / maxScore) * 100;
//       if (percentage < 50) return 'bg-red-100 text-red-800';
//       if (percentage < 70) return 'bg-yellow-100 text-yellow-800';
//       return 'bg-green-100 text-green-800';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('fr-FR', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//     } catch {
//       return 'N/A';
//     }
//   };

//   const getScoreStatus = (score: number | null, maxScore: number) => {
//     if (score === null) return 'Non noté';
    
//     if (maxScore <= 10) {
//       if (score < 5) return 'Échec';
//       if (score < 7) return 'Passable';
//       return 'Réussi';
//     } else {
//       const percentage = (score / maxScore) * 100;
//       if (percentage < 50) return 'Échec';
//       if (percentage < 70) return 'Passable';
//       return 'Réussi';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
//           <p className="mt-2 text-gray-600">Chargement des données...</p>
//           <p className="text-xs text-gray-500 mt-1">Cela peut prendre quelques secondes</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Gestion des Étudiants</h1>
//               <p className="text-gray-600 mt-1">
//                 {students.length} étudiants • {stats.totalAssessments} évaluations • {stats.completedScores} cotes notées
//               </p>
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => router.push('/admin/upload')}
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
//               >
//                 Importer des cotes
//               </button>
//               <button
//                 onClick={loadStudents}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
//               >
//                 <ArrowPathIcon className="h-4 w-4 mr-1" />
//                 Actualiser
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Barre de recherche */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {errorMessage && (
//           <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
//             <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
//             <p className="text-sm text-red-800">{errorMessage}</p>
//           </div>
//         )}

//         <div className="mb-6">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Rechercher par matricule ou nom..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//             <svg
//               className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Liste des évaluations disponibles */}
//         <div className="mb-8 bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-gray-900">
//               Évaluations disponibles ({assessmentsList.length})
//             </h3>
//             <DocumentTextIcon className="h-6 w-6 text-gray-400" />
//           </div>
          
//           {assessmentsList.length === 0 ? (
//             <p className="text-gray-500">Aucune évaluation importée</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score max</th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Étudiants notés</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {assessmentsList.map((assessment) => (
//                     <tr key={assessment.id}>
//                       <td className="px-3 py-2">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(assessment.type)}`}>
//                           {assessment.type}
//                         </span>
//                       </td>
//                       <td className="px-3 py-2 text-sm font-medium text-gray-900">{assessment.name}</td>
//                       <td className="px-3 py-2 text-sm text-gray-500">{formatDate(assessment.assessment_date)}</td>
//                       <td className="px-3 py-2 text-sm font-medium text-gray-900">{assessment.max_score}</td>
//                       <td className="px-3 py-2 text-sm text-gray-600">
//                         {students.reduce((count, student) => 
//                           count + student.scores.filter(s => 
//                             s.assessment_name === assessment.name && s.score !== null
//                           ).length, 0)} / {students.length}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Liste des étudiants avec scores affichés directement */}
//         <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
//           {filteredStudents.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500">Aucun étudiant trouvé</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredStudents.map((student) => {
//                 const completedCount = getCompletedScoresCount(student);
//                 const ungradedCount = getUngradedAssessments(student).length;
//                 const missingCount = getMissingAssessments(student).length;
                
//                 return (
//                   <div key={student.matricule} className="p-6 hover:bg-gray-50">
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                       {/* Informations étudiant */}
//                       <div className="lg:col-span-1">
//                         <div className="bg-gray-50 p-4 rounded-lg">
//                           <h3 className="text-lg font-bold text-gray-900">
//                             {student.username}
//                           </h3>
//                           <div className="mt-3 space-y-2">
//                             <div className="flex items-center">
//                               <span className="text-sm font-medium text-gray-700 mr-2">Matricule:</span>
//                               <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-sm">
//                                 {student.matricule}
//                               </span>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="text-sm font-medium text-gray-700 mr-2">Genre:</span>
//                               <span className="text-sm">{student.genre === 'M' ? 'Masculin' : 'Féminin'}</span>
//                             </div>
//                             <div className="flex items-center">
//                               <span className="text-sm font-medium text-gray-700 mr-2">Cotes notées:</span>
//                               <span className={`font-bold text-sm ${
//                                 completedCount === assessmentsList.length ? 'text-green-600' :
//                                 completedCount >= assessmentsList.length * 0.7 ? 'text-yellow-600' :
//                                 'text-red-600'
//                               }`}>
//                                 {completedCount}/{assessmentsList.length}
//                               </span>
//                             </div>
//                           </div>
                          
//                           {/* Statut des évaluations */}
//                           <div className="mt-4 pt-3 border-t border-gray-200">
//                             <div className="space-y-2">
//                               {missingCount > 0 && (
//                                 <div className="flex items-center justify-between">
//                                   <span className="text-xs text-gray-600">Manquantes:</span>
//                                   <span className="text-xs font-medium text-red-600">{missingCount}</span>
//                                 </div>
//                               )}
//                               {ungradedCount > 0 && (
//                                 <div className="flex items-center justify-between">
//                                   <span className="text-xs text-gray-600">Non notées:</span>
//                                   <span className="text-xs font-medium text-yellow-600">{ungradedCount}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Scores des TD - Affichage en carrés */}
//                       <div className="lg:col-span-2">
//                         <div className="bg-white border border-gray-200 rounded-lg p-4">
//                           <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
//                             <span className="h-3 w-3 bg-blue-500 rounded-full mr-2"></span>
//                             Scores TD ({student.scores.filter(s => s.assessment_type === 'TD' && s.score !== null).length})
//                           </h4>
                          
//                           {student.scores.filter(s => s.assessment_type === 'TD').length === 0 ? (
//                             <p className="text-gray-500 text-sm italic">Aucun TD</p>
//                           ) : (
//                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                               {student.scores
//                                 .filter(score => score.assessment_type === 'TD')
//                                 .map((score) => (
//                                 <div 
//                                   key={score.id} 
//                                   className={`border rounded-lg p-3 transition-all hover:shadow-md ${
//                                     score.score === null 
//                                       ? 'border-gray-300 bg-gray-50' 
//                                       : getScoreColor(score.score, score.max_score).includes('green') 
//                                         ? 'border-green-200' 
//                                         : getScoreColor(score.score, score.max_score).includes('yellow') 
//                                           ? 'border-yellow-200' 
//                                           : getScoreColor(score.score, score.max_score).includes('red') 
//                                             ? 'border-red-200' 
//                                             : 'border-gray-200'
//                                   }`}
//                                 >
//                                   <div className="flex justify-between items-start mb-2">
//                                     <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(score.assessment_type)}`}>
//                                       TD
//                                     </span>
//                                     {score.score !== null && (
//                                       <span className="text-xs text-gray-500">
//                                         {formatDate(score.assessment_date)}
//                                       </span>
//                                     )}
//                                   </div>
                                  
//                                   <div className="mb-1">
//                                     <div className="text-xs font-medium text-gray-900 truncate">
//                                       {score.assessment_name}
//                                     </div>
//                                   </div>
                                  
//                                   <div className="mt-2">
//                                     {score.score === null ? (
//                                       <div className="flex items-center justify-center">
//                                         <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                                           <span className="h-1.5 w-1.5 bg-gray-400 rounded-full inline-block mr-1"></span>
//                                           Non noté
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <>
//                                         <div className={`text-center py-1.5 rounded ${getScoreColor(score.score, score.max_score)}`}>
//                                           <div className="font-bold text-lg">
//                                             {score.score}<span className="text-xs">/{score.max_score}</span>
//                                           </div>
//                                           <div className="text-xs mt-0.5">
//                                             {((score.score / score.max_score) * 100).toFixed(0)}%
//                                           </div>
//                                         </div>
//                                         <div className={`text-center text-xs font-medium mt-1 ${
//                                           getScoreStatus(score.score, score.max_score) === 'Échec' ? 'text-red-600' :
//                                           getScoreStatus(score.score, score.max_score) === 'Passable' ? 'text-yellow-600' :
//                                           'text-green-600'
//                                         }`}>
//                                           {getScoreStatus(score.score, score.max_score)}
//                                         </div>
//                                       </>
//                                     )}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>

//                         {/* Autres types d'évaluations (TP, INTERRO, EXAMEN) */}
//                         {['TP', 'INTERRO', 'EXAMEN'].map(type => {
//                           const typeScores = student.scores.filter(s => s.assessment_type === type);
//                           if (typeScores.length === 0) return null;
                          
//                           return (
//                             <div key={type} className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
//                               <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
//                                 <span className={`h-3 w-3 rounded-full mr-2 ${
//                                   type === 'TP' ? 'bg-green-500' :
//                                   type === 'INTERRO' ? 'bg-yellow-500' :
//                                   'bg-red-500'
//                                 }`}></span>
//                                 Scores {type} ({typeScores.filter(s => s.score !== null).length})
//                               </h4>
                              
//                               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                                 {typeScores.map((score) => (
//                                   <div 
//                                     key={score.id} 
//                                     className={`border rounded-lg p-3 transition-all hover:shadow-md ${
//                                       score.score === null 
//                                         ? 'border-gray-300 bg-gray-50' 
//                                         : getScoreColor(score.score, score.max_score).includes('green') 
//                                           ? 'border-green-200' 
//                                           : getScoreColor(score.score, score.max_score).includes('yellow') 
//                                             ? 'border-yellow-200' 
//                                             : getScoreColor(score.score, score.max_score).includes('red') 
//                                               ? 'border-red-200' 
//                                               : 'border-gray-200'
//                                     }`}
//                                   >
//                                     <div className="flex justify-between items-start mb-2">
//                                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(score.assessment_type)}`}>
//                                         {score.assessment_type}
//                                       </span>
//                                       {score.score !== null && (
//                                         <span className="text-xs text-gray-500">
//                                           {formatDate(score.assessment_date)}
//                                         </span>
//                                       )}
//                                     </div>
                                    
//                                     <div className="mb-1">
//                                       <div className="text-xs font-medium text-gray-900 truncate">
//                                         {score.assessment_name}
//                                       </div>
//                                     </div>
                                    
//                                     <div className="mt-2">
//                                       {score.score === null ? (
//                                         <div className="flex items-center justify-center">
//                                           <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                                             <span className="h-1.5 w-1.5 bg-gray-400 rounded-full inline-block mr-1"></span>
//                                             Non noté
//                                           </div>
//                                         </div>
//                                       ) : (
//                                         <>
//                                           <div className={`text-center py-1.5 rounded ${getScoreColor(score.score, score.max_score)}`}>
//                                             <div className="font-bold text-lg">
//                                               {score.score}<span className="text-xs">/{score.max_score}</span>
//                                             </div>
//                                             <div className="text-xs mt-0.5">
//                                               {((score.score / score.max_score) * 100).toFixed(0)}%
//                                             </div>
//                                           </div>
//                                           <div className={`text-center text-xs font-medium mt-1 ${
//                                             getScoreStatus(score.score, score.max_score) === 'Échec' ? 'text-red-600' :
//                                             getScoreStatus(score.score, score.max_score) === 'Passable' ? 'text-yellow-600' :
//                                             'text-green-600'
//                                           }`}>
//                                             {getScoreStatus(score.score, score.max_score)}
//                                           </div>
//                                         </>
//                                       )}
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           );
//                         })}

//                         {/* Bouton pour voir plus/moins de détails */}
//                         {student.scores.length > 0 && (
//                           <div className="mt-4 text-center">
//                             <button
//                               onClick={() => setExpandedStudent(
//                                 expandedStudent === student.matricule ? null : student.matricule
//                               )}
//                               className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
//                             >
//                               <EyeIcon className="h-4 w-4 mr-1" />
//                               {expandedStudent === student.matricule ? 'Masquer les détails' : 'Voir tous les détails'}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Section détaillée (expandable) */}
//                     {expandedStudent === student.matricule && student.scores.length > 0 && (
//                       <div className="mt-6 pt-6 border-t border-gray-200">
//                         <h4 className="text-sm font-bold text-gray-700 mb-3">Détails complets des évaluations</h4>
                        
//                         <div className="overflow-x-auto">
//                           <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                               <tr>
//                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Évaluation</th>
//                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
//                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
//                                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
//                               </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                               {student.scores.map((score) => (
//                                 <tr key={score.id} className="hover:bg-gray-50">
//                                   <td className="px-3 py-2">
//                                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
//                                       {score.assessment_type}
//                                     </span>
//                                   </td>
//                                   <td className="px-3 py-2 text-sm font-medium text-gray-900">
//                                     {score.assessment_name}
//                                   </td>
//                                   <td className="px-3 py-2 text-sm text-gray-500">
//                                     {formatDate(score.assessment_date)}
//                                   </td>
//                                   <td className="px-3 py-2">
//                                     <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
//                                       {score.score === null ? (
//                                         <>
//                                           <span className="h-2 w-2 bg-gray-400 rounded-full mr-2"></span>
//                                           Non noté
//                                         </>
//                                       ) : (
//                                         <>
//                                           <span className="font-bold">
//                                             {score.score}/{score.max_score}
//                                           </span>
//                                         </>
//                                       )}
//                                     </div>
//                                   </td>
//                                   <td className="px-3 py-2 text-sm font-medium text-gray-900">
//                                     {score.score !== null ? `${((score.score / score.max_score) * 100).toFixed(1)}%` : 'N/A'}
//                                   </td>
//                                   <td className="px-3 py-2">
//                                     <div className={`text-sm font-medium ${
//                                       score.score === null 
//                                         ? 'text-gray-600' 
//                                         : getScoreStatus(score.score, score.max_score) === 'Échec'
//                                         ? 'text-red-600' 
//                                         : getScoreStatus(score.score, score.max_score) === 'Passable'
//                                         ? 'text-yellow-600'
//                                         : 'text-green-600'
//                                     }`}>
//                                       {getScoreStatus(score.score, score.max_score)}
//                                     </div>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Statistiques détaillées */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-medium text-gray-500 mb-2">Total Étudiants</h3>
//             <p className="text-3xl font-bold text-gray-900">{students.length}</p>
//             <p className="text-xs text-gray-500 mt-1">
//               {filteredStudents.length} correspond à la recherche
//             </p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-medium text-gray-500 mb-2">Évaluations</h3>
//             <p className="text-3xl font-bold text-gray-900">
//               {stats.totalAssessments}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               {stats.completedScores} cotes notées
//             </p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-medium text-gray-500 mb-2">Taux de complétion</h3>
//             <p className={`text-3xl font-bold ${
//               (stats.completedScores / (students.length * stats.totalAssessments) * 100) >= 70 ? 'text-green-600' :
//               (stats.completedScores / (students.length * stats.totalAssessments) * 100) >= 50 ? 'text-yellow-600' :
//               'text-red-600'
//             }`}>
//               {students.length > 0 && stats.totalAssessments > 0 
//                 ? ((stats.completedScores / (students.length * stats.totalAssessments)) * 100).toFixed(1)
//                 : '0'
//               }%
//             </p>
//             <div className="text-xs text-gray-500 mt-1">
//               Cotes notées / total possible
//             </div>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-medium text-gray-500 mb-2">Répartition par type</h3>
//             <div className="space-y-2">
//               {Object.entries(stats.scoresByType).map(([type, count]) => (
//                 <div key={type} className="flex items-center justify-between">
//                   <span className={`text-xs px-2 py-1 rounded ${getTypeColor(type)}`}>
//                     {type}
//                   </span>
//                   <span className="text-sm font-medium">{count}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, ArrowPathIcon, CalendarIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

interface StudentWithScores {
  matricule: string;
  username: string;
  genre: string;
  scores: {
    id: string;
    assessment_name: string;
    assessment_type: string;
    score: number | null;
    max_score: number;
    assessment_date: string;
    created_at: string;
  }[];
}

interface AssessmentStats {
  totalAssessments: number;
  totalScores: number;
  successRate: number;
  scoresByType: Record<string, number>;
  completedScores: number;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithScores[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    totalScores: 0,
    successRate: 0,
    scoresByType: {},
    completedScores: 0
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [groupByType, setGroupByType] = useState<string>('all');

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/student');
      return;
    }
    
    await loadStudents();
  };

  const loadStudents = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      console.log('🚀 Début du chargement des données...');
      
      // 1. Récupérer TOUS les étudiants
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select('matricule, username, genre')
        .eq('role', 'student')
        .order('matricule');
      
      if (studentsError) throw studentsError;
      console.log(`📊 Étudiants récupérés: ${studentsData?.length || 0}`);
      
      // 2. Récupérer TOUTES les évaluations
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .order('assessment_date', { ascending: true });
      
      if (assessmentsError) throw assessmentsError;
      console.log(`📚 Évaluations récupérées: ${assessmentsData?.length || 0}`);
      setAssessmentsList(assessmentsData || []);
      
      // 3. Récupérer TOUTES les notes
      let allScores: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data: scoresData, error: scoresError } = await supabase
          .from('scores')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('created_at', { ascending: false });
        
        if (scoresError) throw scoresError;
        
        if (scoresData && scoresData.length > 0) {
          allScores = [...allScores, ...scoresData];
          page++;
          
          if (scoresData.length < pageSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`🎯 Scores récupérés: ${allScores.length}`);
      
      const completedScores = allScores.filter(s => s.score !== null).length;
      
      // 4. Créer un map pour les évaluations
      const assessmentsMap = new Map();
      assessmentsData?.forEach(assessment => {
        assessmentsMap.set(assessment.id, assessment);
      });
      
      // Filtrer les scores avec des assessment_id valides
      const scoresWithValidAssessments = allScores.filter(score => {
        return assessmentsMap.has(score.assessment_id);
      });
      
      // 5. Calculer les statistiques
      const scoredScores = scoresWithValidAssessments.filter(s => s.score !== null);
      const passed = scoredScores.filter(s => {
        const assessment = assessmentsMap.get(s.assessment_id);
        if (!assessment) return false;
        return s.score! >= assessment.max_score * 0.5;
      }).length;
      
      const scoresByType: Record<string, number> = {};
      scoredScores.forEach(score => {
        const assessment = assessmentsMap.get(score.assessment_id);
        const type = assessment?.type || 'INCONNU';
        scoresByType[type] = (scoresByType[type] || 0) + 1;
      });
      
      setStats({
        totalAssessments: assessmentsData?.length || 0,
        totalScores: allScores.length,
        completedScores,
        successRate: scoredScores.length > 0 ? (passed / scoredScores.length) * 100 : 0,
        scoresByType
      });
      
      // 6. Combiner les données pour chaque étudiant
      const studentsWithScores = studentsData.map(student => {
        const allStudentScores = scoresWithValidAssessments
          .filter(s => s.matricule === student.matricule);
        
        const completedScores = allStudentScores
          .filter(s => s.score !== null)
          .map(s => {
            const assessment = assessmentsMap.get(s.assessment_id);
            return {
              id: s.id,
              assessment_name: assessment?.name || 'Évaluation inconnue',
              assessment_type: assessment?.type || 'TD',
              score: s.score,
              max_score: assessment?.max_score || 20,
              assessment_date: assessment?.assessment_date || '',
              created_at: s.created_at || ''
            };
          })
          .sort((a, b) => new Date(b.assessment_date || b.created_at).getTime() - new Date(a.assessment_date || a.created_at).getTime());
        
        const ungradedScores = allStudentScores
          .filter(s => s.score === null)
          .map(s => {
            const assessment = assessmentsMap.get(s.assessment_id);
            return {
              id: s.id,
              assessment_name: assessment?.name || 'Évaluation inconnue',
              assessment_type: assessment?.type || 'TD',
              score: s.score,
              max_score: assessment?.max_score || 20,
              assessment_date: assessment?.assessment_date || '',
              created_at: s.created_at || ''
            };
          });
        
        return {
          ...student,
          scores: [...completedScores, ...ungradedScores]
        };
      });
      
      setStudents(studentsWithScores);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement:', error);
      setErrorMessage(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreForAssessment = (student: StudentWithScores, assessmentName: string) => {
    return student.scores.find(score => score.assessment_name === assessmentName);
  };

  const getCompletedScoresCount = (student: StudentWithScores) => {
    return student.scores.filter(score => score.score !== null).length;
  };

  const filteredStudents = students.filter(student =>
    student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TD': return 'bg-blue-100 text-blue-800';
      case 'TP': return 'bg-green-100 text-green-800';
      case 'INTERRO': return 'bg-yellow-100 text-yellow-800';
      case 'EXAMEN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number | null, maxScore: number) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    
    if (maxScore <= 10) {
      if (score < 5) return 'bg-red-100 text-red-800';
      if (score < 7) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    } else {
      const percentage = (score / maxScore) * 100;
      if (percentage < 50) return 'bg-red-100 text-red-800';
      if (percentage < 70) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getScoreStatus = (score: number | null, maxScore: number) => {
    if (score === null) return 'Non noté';
    
    if (maxScore <= 10) {
      if (score < 5) return 'Échec';
      if (score < 7) return 'Passable';
      return 'Réussi';
    } else {
      const percentage = (score / maxScore) * 100;
      if (percentage < 50) return 'Échec';
      if (percentage < 70) return 'Passable';
      return 'Réussi';
    }
  };

  // Filtrer les évaluations par type
  const filteredAssessments = groupByType === 'all' 
    ? assessmentsList 
    : assessmentsList.filter(a => a.type === groupByType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-600">Chargement des données...</p>
          <p className="text-xs text-gray-500 mt-1">Cela peut prendre quelques secondes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Barre de recherche et filtres - sticky aussi */}
     

      {/* Tableau des cotes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {/* Ligne des types et dates - STICKY */}
              <div className="fixed top-[0px] z-20 bg-white border-b-2 border-gray-300 shadow-sm">
                 <div className=" top-[73px] z-20 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par matricule ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Filtre par type */}
            <div className="sm:w-48">
              <select
                value={groupByType}
                onChange={(e) => setGroupByType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="TD">TD</option>
                <option value="TP">TP</option>
                <option value="INTERRO">Interros</option>
                <option value="EXAMEN">Examens</option>
              </select>
            </div>
          </div>
        </div>
      </div>
                <div className="flex">
                  {/* Colonne vide pour l'espace des infos étudiant */}
                  <div className="sticky left-0 z-30 bg-white border-r border-gray-200 min-w-[250px] p-3">
                    <span className="font-bold text-gray-700">Étudiant</span>
                  </div>
                  
                  {/* En-têtes des évaluations */}
                  <div className="flex-1 flex">
                    {filteredAssessments.map((assessment) => (
                      <div 
                        key={assessment.id} 
                        className="min-w-[130px] max-w-[160px] p-2 border-r border-gray-200 bg-gray-50"
                      >
                     
                        <div className="text-xs font-bold text-gray-700 truncate" title={assessment.name}>
                          {assessment.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{formatDate(assessment.assessment_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Corps du tableau - Lignes des étudiants */}
              <div className="divide-y pt-28 divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Aucun étudiant trouvé
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    // Calcul de la moyenne de l'étudiant (ramenée sur 20)
                    const scoredScores = student.scores.filter(s => s.score !== null);
                   

                    return (
                      <div key={student.matricule} className="flex  hover:bg-gray-50">
                        {/* Colonne fixe des infos étudiant */}
                        <div className="stick left-0 z-10  bg-white border-r border-gray-200 min-w-[250px] p-3">
                          <div className="font-medium text-gray-900">
                            {student.username}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {student.matricule}
                          </div>
                         
                       
                        </div>

                        {/* Cellules des notes */}
                        <div className="flex-1 flex">
                          {filteredAssessments.map((assessment) => {
                            const score = getScoreForAssessment(student, assessment.name);
                            
                            return (
                              <div 
                                key={assessment.id} 
                                className="min-w-[130px] max-w-[160px] p-3 border-r border-gray-200"
                              >
                                {score ? (
                                  score.score === null ? (
                                    <div className="text-center">
                                      <span className="inline-flex items-center px-2 py-1  text-xs bg-gray-100 text-gray-600">
                                        En attente
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <div className={`inline-flex flex-col items-center p-1  min-w-[80px] ${getScoreColor(score.score, score.max_score)}`}>
                                        <span className="font-medium text-sm ">
                                          {score.score} /{score.max_score}
                                        </span>
                                        
                                       
                                      </div>
                                    
                                    </div>
                                  )
                                ) : (
                                  <div className="text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-400">
                                      Non évalué
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Étudiants</h3>
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {filteredStudents.length} correspond à la recherche
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Évaluations</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalAssessments}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.completedScores} cotes notées
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Taux de complétion</h3>
            <p className={`text-3xl font-bold ${
              (stats.completedScores / (students.length * stats.totalAssessments) * 100) >= 70 ? 'text-green-600' :
              (stats.completedScores / (students.length * stats.totalAssessments) * 100) >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {students.length > 0 && stats.totalAssessments > 0 
                ? ((stats.completedScores / (students.length * stats.totalAssessments)) * 100).toFixed(1)
                : '0'
              }%
            </p>
            <div className="text-xs text-gray-500 mt-1">
              Cotes notées / total possible
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Répartition par type</h3>
            <div className="space-y-2">
              {Object.entries(stats.scoresByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${getTypeColor(type)}`}>
                    {type}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}