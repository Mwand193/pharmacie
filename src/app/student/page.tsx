
// // // // 'use client';

// // // // import { useEffect, useState } from 'react';
// // // // import { useRouter } from 'next/navigation';
// // // // import { ArrowRightOnRectangleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
// // // // import { supabase } from '@/lib/supabase';
// // // // import Link from 'next/link';
// // // // import { Terminal, TerminalSquare } from 'lucide-react';
// // // // import { FaTerminal } from 'react-icons/fa';

// // // // interface Assessment {
// // // //   name: string;
// // // //   type: string;
// // // //   max_score: number;
// // // //   assessment_date: string;
// // // // }

// // // // interface Score {
// // // //   id: string;
// // // //   assessment_name: string;
// // // //   assessment_type: string;
// // // //   score: number | null;
// // // //   max_score: number;
// // // //   assessment_date: string;
// // // //   created_at: string;
// // // //   assessments: Assessment | Assessment[];
// // // // }

// // // // export default function StudentDashboardPage() {
// // // //   const router = useRouter();
// // // //   const [student, setStudent] = useState<any>(null);
// // // //   const [scores, setScores] = useState<Score[]>([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [selectedType, setSelectedType] = useState<string>('all');

// // // //   useEffect(() => {
// // // //     loadStudentData();
// // // //   }, []);

// // // //   const loadStudentData = async () => {
// // // //     const userStr = localStorage.getItem('user');
    
// // // //     if (!userStr) {
// // // //       router.push('/login');
// // // //       return;
// // // //     }
    
// // // //     const userData = JSON.parse(userStr);
// // // //     setStudent(userData);
    
// // // //     // Charger les cotes de l'étudiant
// // // //     try {
// // // //       const { data, error } = await supabase
// // // //         .from('scores')
// // // //         .select(`
// // // //           id,
// // // //           score,
// // // //           created_at,
// // // //           assessments (
// // // //             name,
// // // //             type,
// // // //             max_score,
// // // //             assessment_date
// // // //           )
// // // //         `)
// // // //         .eq('matricule', userData.matricule)
// // // //         .order('created_at', { ascending: false });
      
// // // //       if (error) throw error;
      
// // // //       const formattedScores = data.map(item => ({
// // // //         id: item.id,
// // // //         assessment_name: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.name || '' : (item.assessments as Assessment)?.name || '',
// // // //         assessment_type: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.type || '' : (item.assessments as Assessment)?.type || '',
// // // //         score: item.score,
// // // //         max_score: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.max_score || 20 : (item.assessments as Assessment)?.max_score || 20,
// // // //         assessment_date: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.assessment_date || '' : (item.assessments as Assessment)?.assessment_date || '',
// // // //         created_at: item.created_at,
// // // //         assessments: item.assessments
// // // //       }));
      
// // // //       setScores(formattedScores);
// // // //     } catch (error) {
// // // //       console.error('Erreur:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleLogout = () => {
// // // //     localStorage.removeItem('user');
// // // //     router.push('/login');
// // // //   };

// // // //   const filteredScores = selectedType === 'all' 
// // // //     ? scores 
// // // //     : scores.filter(score => score.assessment_type === selectedType);

// // // //   const getScoreColor = (score: number | null, maxScore: number = 20) => {
// // // //     if (score === null) return 'text-gray-600 bg-gray-50';
    
// // // //     // Si max_score <= 10, seuil à 5, sinon à 10
// // // //     if (maxScore <= 10) {
// // // //       if (score < 5) return 'text-red-600 bg-red-50';
// // // //       if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
// // // //       return 'text-green-600 bg-green-50';
// // // //     } else {
// // // //       if (score < 10) return 'text-red-600 bg-red-50';
// // // //       if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
// // // //       return 'text-green-600 bg-green-50';
// // // //     }
// // // //   };

// // // //   const getTypeColor = (type: string) => {
// // // //     switch (type) {
// // // //       case 'TD': return 'bg-blue-50 text-blue-700';
// // // //       case 'TP': return 'bg-green-50 text-green-700';
// // // //       case 'INTERRO': return 'bg-yellow-50 text-yellow-700';
// // // //       case 'EXAMEN': return 'bg-red-50 text-red-700';
// // // //       default: return 'bg-gray-50 text-gray-700';
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-screen bg-white flex items-center justify-center">
// // // //         <div className="text-center">
// // // //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
// // // //           <p className="mt-2 text-gray-600">Chargement...</p>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-50">
// // // //       {/* Header minimaliste */}
// // // //       <div className="bg-white border-b">
// // // //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// // // //           <div className="flex justify-between items-center">
// // // //             <div className="flex items-center ">
// // // //               <AcademicCapIcon className="h-6 w-6 text-gray-700 mr-2" />
// // // //               <div>
// // // //                 <h1 className="text- cypher font-medium text-gray-900">L1</h1>
// // // //               </div>
// // // //             </div>
// // // //             <div>
// // // //               <Link href="/terminal" className='flex items-center cypher text-gray-700 font-bold'>
               
              
// // // //                 <TerminalSquare className='text-gray-600'/>
// // // //                 MS-DOS
// // // //               </Link>
// // // //             </div>
// // // //             <button
// // // //               onClick={handleLogout}
// // // //               className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
// // // //             >
// // // //               <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1.5" />
// // // //               Déconnexion
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* Contenu principal */}
// // // //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
// // // //         {/* En-tête étudiant minimaliste */}
// // // //         <div className="mb-6">
// // // //           <p className='text-xl font-bold cypher '>
// // // //             SFO
// // // //           </p>
// // // //           <h2 className="text-xl font-medium text-gray-900 mb-1">
// // // //             {student?.username}
// // // //           </h2>
// // // //           <div className="flex items-center space-x-4 text-sm text-gray-600">
// // // //             <div className="flex items-center">
// // // //               <span className="mr-1.5">Matricule:</span>
// // // //               <span className="font-medium text-gray-800">{student?.matricule}</span>
// // // //             </div>
// // // //             <div className="w-px h-4 bg-gray-300"></div>
// // // //             <div className="flex items-center">
// // // //               <span className="mr-1.5">Genre:</span>
// // // //               <span className="font-medium text-gray-800">
// // // //                 {student?.genre === 'M' ? 'Masculin' : 'Féminin'}
// // // //               </span>
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         {/* Filtres */}
// // // //         <div className="mb-4">
// // // //           <div className="flex items-center justify-between">
// // // //             <h3 className="text-base font-medium text-gray-900">
// // // //               Mes cotes ({scores.length})
// // // //             </h3>
            
// // // //             <select
// // // //               value={selectedType}
// // // //               onChange={(e) => setSelectedType(e.target.value)}
// // // //               className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
// // // //             >
// // // //               <option value="all">Tous les types</option>
// // // //               <option value="TD">TD</option>
// // // //               <option value="TP">TP</option>
// // // //               <option value="INTERRO">Interro</option>
// // // //               <option value="EXAMEN">Examen</option>
// // // //             </select>
// // // //           </div>
// // // //         </div>

// // // //         {/* Tableau des cotes - minimaliste */}
// // // //         <div className="bg-white border border-gray-200 rounded overflow-hidden">
// // // //           {filteredScores.length === 0 ? (
// // // //             <div className="text-center py-8">
// // // //               <p className="text-gray-500">Aucune cote disponible</p>
// // // //             </div>
// // // //           ) : (
// // // //             <div className="overflow-x-auto">
// // // //               <table className="min-w-full divide-y divide-gray-200">
// // // //                 <thead className="bg-gray-50">
// // // //                   <tr>
                   
// // // //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// // // //                       Type
// // // //                     </th>
// // // //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// // // //                       Date
// // // //                     </th>
// // // //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// // // //                       Score
// // // //                     </th>
                   
// // // //                   </tr>
// // // //                 </thead>
// // // //                 <tbody className="bg-white divide-y divide-gray-200">
// // // //                   {filteredScores.map((score) => {
// // // //                     const percentage = score.score !== null 
// // // //                       ? (score.score / score.max_score) * 100 
// // // //                       : null;
                    
// // // //                     // Déterminer le statut
// // // //                     let status = 'En attente';
// // // //                     let statusColor = 'text-gray-500';
                    
// // // //                     if (score.score !== null) {
// // // //                       if (score.max_score <= 10) {
// // // //                         if (score.score < 5) {
// // // //                           status = 'Échec';
// // // //                           statusColor = 'text-red-600';
// // // //                         } else if (score.score < score.max_score * 0.7) {
// // // //                           status = 'Passable';
// // // //                           statusColor = 'text-yellow-600';
// // // //                         } else {
// // // //                           status = 'Réussi';
// // // //                           statusColor = 'text-green-600';
// // // //                         }
// // // //                       } else {
// // // //                         if (score.score < 10) {
// // // //                           status = 'Échec';
// // // //                           statusColor = 'text-red-600';
// // // //                         } else if (score.score < score.max_score * 0.7) {
// // // //                           status = 'Passable';
// // // //                           statusColor = 'text-yellow-600';
// // // //                         } else {
// // // //                           status = 'Réussi';
// // // //                           statusColor = 'text-green-600';
// // // //                         }
// // // //                       }
// // // //                     }
                    
// // // //                     return (
// // // //                       <tr key={score.id} className="hover:bg-gray-50">
                       
// // // //                         <td className="px-4 py-3">
// // // //                           <span className={`inline-flex cypher items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
// // // //                             {score.assessment_type}
// // // //                           </span>
// // // //                         </td>
// // // //                         <td className="px-4 py-3 text-sm cypher text-gray-600">
// // // //                           {score.assessment_date 
// // // //                             ? new Date(score.assessment_date).toLocaleDateString('fr-FR')
// // // //                             : '-'
// // // //                           }
// // // //                         </td>
// // // //                         <td className="px-4 py-3">
// // // //                           <div className={`inline-flex items-center cypher px-2 py-1 rounded text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
// // // //                             {score.score === null ? (
// // // //                               'Non noté'
// // // //                             ) : (
// // // //                               <>
// // // //                                 {score.score}/{score.max_score}
// // // //                                 {/* {percentage !== null && (
// // // //                                   <span className="ml-1.5 text-xs">
// // // //                                     ({percentage.toFixed(0)}%)
// // // //                                   </span>
// // // //                                 )} */}
// // // //                               </>
// // // //                             )}
// // // //                           </div>
// // // //                         </td>
                        
// // // //                       </tr>
// // // //                     );
// // // //                   })}
// // // //                 </tbody>
// // // //               </table>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {/* Statistiques minimalistes */}
// // // //         {scores.length > 0 && (
// // // //           <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
// // // //             <div className="bg-white border border-gray-200 rounded p-3">
// // // //               <div className="text-xs text-gray-500 mb-1">Notés</div>
// // // //               <div className="text-lg font-medium text-gray-900 cypher">
// // // //                 {scores.filter(s => s.score !== null).length}
// // // //               </div>
// // // //             </div>
            
// // // //             <div className="bg-white border border-gray-200 rounded p-3">
// // // //               <div className="text-xs text-gray-500 mb-1">En attente</div>
// // // //               <div className="text-lg font-medium cypher text-gray-500">
// // // //                 {scores.filter(s => s.score === null).length}
// // // //               </div>
// // // //             </div>
            
// // // //             <div className="bg-white border border-gray-200 rounded p-3">
// // // //               <div className="text-xs text-gray-500 mb-1">Réussites</div>
// // // //               <div className="text-lg font-medium cypher text-green-600">
// // // //                 {scores
// // // //                   .filter(s => s.score !== null)
// // // //                   .filter(s => {
// // // //                     if (s.max_score <= 10) {
// // // //                       return s.score! >= 5;
// // // //                     }
// // // //                     return s.score! >= 10;
// // // //                   }).length}
// // // //               </div>
// // // //             </div>
            
// // // //             <div className="bg-white border border-gray-200 rounded p-3">
// // // //               <div className="text-xs text-gray-500 mb-1">Échecs</div>
// // // //               <div className="text-lg cypher font-medium text-red-600">
// // // //                 {scores
// // // //                   .filter(s => s.score !== null)
// // // //                   .filter(s => {
// // // //                     if (s.max_score <= 10) {
// // // //                       return s.score! < 5;
// // // //                     }
// // // //                     return s.score! < 10;
// // // //                   }).length}
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         )}

// // // //         {/* Notes informatives */}
// // // //         <div className="mt-4 cypher text-gray-500 space-y-1">
// // // //           <p>
// // // //             En cas de réclamation, présentez-vous avec votre justificatif pour modifier vos notes.
// // // //           Faites le dans le plus bref délai possible.
// // // //           </p>         
// // // //         </div>
// // // //       </div>

// // // //       {/* Footer minimaliste */}
// // // //       <div className=" pt-4 border-t">
// // // //         <div className="max-w-7xl cypher mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-500">
// // // //           Système disponible jusqu'à la fin du cours.• {new Date().getFullYear()}
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // 'use client';

// // // import { useEffect, useState } from 'react';
// // // import { useRouter } from 'next/navigation';
// // // import { ArrowRightOnRectangleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
// // // import { supabase } from '@/lib/supabase';
// // // import Link from 'next/link';
// // // import { TerminalSquare } from 'lucide-react';

// // // interface Assessment {
// // //   name: string;
// // //   type: string;
// // //   max_score: number;
// // //   assessment_date: string;
// // // }

// // // interface Score {
// // //   id: string;
// // //   assessment_name: string;
// // //   assessment_type: string;
// // //   score: number | null;
// // //   max_score: number;
// // //   assessment_date: string;
// // //   created_at: string;
// // //   assessments: Assessment | Assessment[];
// // // }

// // // export default function StudentDashboardPage() {
// // //   const router = useRouter();
// // //   const [student, setStudent] = useState<any>(null);
// // //   const [scores, setScores] = useState<Score[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedType, setSelectedType] = useState<string>('all');

// // //   // Calculs des moyennes
// // //   const calculateAverages = () => {
// // //     // Filtrer les scores notés
// // //     const scoredScores = scores.filter(s => s.score !== null);
    
// // //     // Regrouper par type
// // //     const tdScores = scoredScores.filter(s => s.assessment_type === 'TD');
// // //     const interroScores = scoredScores.filter(s => s.assessment_type === 'INTERRO');
    
// // //     // Calculer la moyenne des TD (moyenne de toutes les notes de TD)
// // //     let tdAverage = 0;
// // //     if (tdScores.length > 0) {
// // //       const tdSum = tdScores.reduce((sum, score) => sum + (score.score! / score.max_score) * 20, 0);
// // //       tdAverage = tdSum / tdScores.length;
// // //     }
    
// // //     // Calculer la moyenne des Interros
// // //     let interroAverage = 0;
// // //     if (interroScores.length > 0) {
// // //       const interroSum = interroScores.reduce((sum, score) => sum + (score.score! / score.max_score) * 20, 0);
// // //       interroAverage = interroSum / interroScores.length;
// // //     }
    
// // //     // Calculer la moyenne pondérée sur 70% (sans l'exposé)
// // //     let weightedAverage = 0;
// // //     let hasTd = tdScores.length > 0;
// // //     let hasInterro = interroScores.length > 0;
    
// // //     if (hasTd && hasInterro) {
// // //       // Les deux sont disponibles
// // //       weightedAverage = (tdAverage * 0.3 + interroAverage * 0.4) / 0.7;
// // //     } else if (hasTd && !hasInterro) {
// // //       // Seulement les TD
// // //       weightedAverage = tdAverage;
// // //     } else if (!hasTd && hasInterro) {
// // //       // Seulement les interros
// // //       weightedAverage = interroAverage;
// // //     }
    
// // //     return {
// // //       tdAverage: tdAverage.toFixed(2),
// // //       interroAverage: interroAverage.toFixed(2),
// // //       weightedAverage: weightedAverage.toFixed(2),
// // //       hasTd,
// // //       hasInterro,
// // //       tdCount: tdScores.length,
// // //       interroCount: interroScores.length
// // //     };
// // //   };

// // //   const averages = calculateAverages();

// // //   useEffect(() => {
// // //     loadStudentData();
// // //   }, []);

// // //   const loadStudentData = async () => {
// // //     const userStr = localStorage.getItem('user');
    
// // //     if (!userStr) {
// // //       router.push('/login');
// // //       return;
// // //     }
    
// // //     const userData = JSON.parse(userStr);
// // //     setStudent(userData);
    
// // //     // Charger les cotes de l'étudiant
// // //     try {
// // //       const { data, error } = await supabase
// // //         .from('scores')
// // //         .select(`
// // //           id,
// // //           score,
// // //           created_at,
// // //           assessments (
// // //             name,
// // //             type,
// // //             max_score,
// // //             assessment_date
// // //           )
// // //         `)
// // //         .eq('matricule', userData.matricule)
// // //         .order('created_at', { ascending: false });
      
// // //       if (error) throw error;
      
// // //       const formattedScores = data.map(item => ({
// // //         id: item.id,
// // //         assessment_name: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.name || '' : (item.assessments as Assessment)?.name || '',
// // //         assessment_type: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.type || '' : (item.assessments as Assessment)?.type || '',
// // //         score: item.score,
// // //         max_score: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.max_score || 20 : (item.assessments as Assessment)?.max_score || 20,
// // //         assessment_date: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.assessment_date || '' : (item.assessments as Assessment)?.assessment_date || '',
// // //         created_at: item.created_at,
// // //         assessments: item.assessments
// // //       }));
      
// // //       setScores(formattedScores);
// // //     } catch (error) {
// // //       console.error('Erreur:', error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleLogout = () => {
// // //     localStorage.removeItem('user');
// // //     router.push('/login');
// // //   };

// // //   const filteredScores = selectedType === 'all' 
// // //     ? scores 
// // //     : scores.filter(score => score.assessment_type === selectedType);

// // //   const getScoreColor = (score: number | null, maxScore: number = 20) => {
// // //     if (score === null) return 'text-gray-600 bg-gray-50';
    
// // //     // Si max_score <= 10, seuil à 5, sinon à 10
// // //     if (maxScore <= 10) {
// // //       if (score < 5) return 'text-red-600 bg-red-50';
// // //       if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
// // //       return 'text-green-600 bg-green-50';
// // //     } else {
// // //       if (score < 10) return 'text-red-600 bg-red-50';
// // //       if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
// // //       return 'text-green-600 bg-green-50';
// // //     }
// // //   };

// // //   const getTypeColor = (type: string) => {
// // //     switch (type) {
// // //       case 'TD': return 'bg-blue-50 text-blue-700';
// // //       case 'TP': return 'bg-green-50 text-green-700';
// // //       case 'INTERRO': return 'bg-yellow-50 text-yellow-700';
// // //       case 'EXAMEN': return 'bg-red-50 text-red-700';
// // //       default: return 'bg-gray-50 text-gray-700';
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-screen bg-white flex items-center justify-center">
// // //         <div className="text-center">
// // //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
// // //           <p className="mt-2 text-gray-600">Chargement...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gray-50">
// // //       {/* Header minimaliste */}
// // //       <div className="bg-white border-b">
// // //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// // //           <div className="flex justify-between items-center">
// // //             <div className="flex items-center ">
// // //               <AcademicCapIcon className="h-6 w-6 text-gray-700 mr-2" />
// // //               <div>
// // //                 <h1 className="text-cypher font-medium text-gray-900">L1</h1>
// // //               </div>
// // //             </div>
// // //             <div>
// // //               <Link href="/terminal" className='flex items-center cypher text-gray-700 font-bold'>
// // //                 <TerminalSquare className='text-gray-600'/>
// // //                 MS-DOS
// // //               </Link>
// // //             </div>
// // //             <button
// // //               onClick={handleLogout}
// // //               className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
// // //             >
// // //               <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1.5" />
// // //               Déconnexion
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Contenu principal */}
// // //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
// // //         {/* En-tête étudiant minimaliste */}
// // //         <div className="mb-6">
// // //           <p className='text-xl font-bold cypher '>
// // //             SFO
// // //           </p>
// // //           <h2 className="text-xl font-medium text-gray-900 mb-1">
// // //             {student?.username}
// // //           </h2>
// // //           <div className="flex items-center space-x-4 text-sm text-gray-600">
// // //             <div className="flex items-center">
// // //               <span className="mr-1.5">Matricule:</span>
// // //               <span className="font-medium text-gray-800">{student?.matricule}</span>
// // //             </div>
// // //             <div className="w-px h-4 bg-gray-300"></div>
// // //             <div className="flex items-center">
// // //               <span className="mr-1.5">Genre:</span>
// // //               <span className="font-medium text-gray-800">
// // //                 {student?.genre === 'M' ? 'Masculin' : 'Féminin'}
// // //               </span>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Nouvelle section: Calcul des moyennes */}
// // //         <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
// // //           {/* Carte Moyenne TD */}
// // //           <div className="bg-white border border-gray-200 p-4">
// // //             <div className="text-xs text-gray-500 mb-1">Moyenne TD (30%)</div>
// // //             <div className="text-2xl font-bold text-blue-600 cypher">
// // //               {averages.hasTd ? averages.tdAverage : '—'}
// // //             </div>
// // //             <div className="text-xs text-gray-400 mt-1">
// // //               {averages.tdCount} note(s)
// // //             </div>
// // //           </div>

// // //           {/* Carte Moyenne Interro */}
// // //           <div className="bg-white border border-gray-200 p-4">
// // //             <div className="text-xs text-gray-500 mb-1">Moyenne Interro (40%)</div>
// // //             <div className="text-2xl font-bold text-yellow-600 cypher">
// // //               {averages.hasInterro ? averages.interroAverage : '—'}
// // //             </div>
// // //             <div className="text-xs text-gray-400 mt-1">
// // //               {averages.interroCount} note(s)
// // //             </div>
// // //           </div>

// // //           {/* Carte Exposé (en attente) */}
// // //           <div className="bg-white border border-gray-200 p-4">
// // //             <div className="text-xs text-gray-500 mb-1">Exposé (30%)</div>
// // //             <div className="text-2xl font-bold text-purple-400 cypher">
// // //               —
// // //             </div>
// // //             <div className="text-xs text-purple-400 mt-1">
// // //               En attente
// // //             </div>
// // //           </div>

// // //           {/* Carte Moyenne Pondérée (sur 70%) */}
// // //           <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
// // //             <div className="text-xs text-gray-500 mb-1">Moyenne actuelle (sur 70%)</div>
// // //             <div className="text-2xl font-bold text-gray-900 cypher">
// // //               {(averages.hasTd || averages.hasInterro) ? averages.weightedAverage : '—'}
// // //             </div>
// // //             <div className="text-xs text-gray-400 mt-1">
// // //               {averages.hasTd && averages.hasInterro ? 'TD (30%) + Interro (40%)' : 
// // //                averages.hasTd ? 'Basée uniquement sur TD' :
// // //                averages.hasInterro ? 'Basée uniquement sur Interro' :
// // //                'Aucune note disponible'}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Filtres */}
// // //         <div className="mb-4">
// // //           <div className="flex items-center justify-between">
// // //             <h3 className="text-base font-medium text-gray-900">
// // //               Mes cotes ({scores.length})
// // //             </h3>
            
// // //             <select
// // //               value={selectedType}
// // //               onChange={(e) => setSelectedType(e.target.value)}
// // //               className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
// // //             >
// // //               <option value="all">Tous les types</option>
// // //               <option value="TD">TD</option>
// // //               <option value="TP">TP</option>
// // //               <option value="INTERRO">Interro</option>
// // //               <option value="EXAMEN">Examen</option>
// // //             </select>
// // //           </div>
// // //         </div>

// // //         {/* Tableau des cotes - minimaliste */}
// // //         <div className="bg-white border border-gray-200 rounded overflow-hidden">
// // //           {filteredScores.length === 0 ? (
// // //             <div className="text-center py-8">
// // //               <p className="text-gray-500">Aucune cote disponible</p>
// // //             </div>
// // //           ) : (
// // //             <div className="overflow-x-auto">
// // //               <table className="min-w-full divide-y divide-gray-200">
// // //                 <thead className="bg-gray-50">
// // //                   <tr>
                   
// // //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// // //                       Type
// // //                     </th>
// // //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// // //                       Date
// // //                     </th>
// // //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// // //                       Score
// // //                     </th>
                   
// // //                   </tr>
// // //                 </thead>
// // //                 <tbody className="bg-white divide-y divide-gray-200">
// // //                   {filteredScores.map((score) => {
// // //                     const percentage = score.score !== null 
// // //                       ? (score.score / score.max_score) * 100 
// // //                       : null;
                    
// // //                     // Déterminer le statut
// // //                     let status = 'En attente';
// // //                     let statusColor = 'text-gray-500';
                    
// // //                     if (score.score !== null) {
// // //                       if (score.max_score <= 10) {
// // //                         if (score.score < 5) {
// // //                           status = 'Échec';
// // //                           statusColor = 'text-red-600';
// // //                         } else if (score.score < score.max_score * 0.7) {
// // //                           status = 'Passable';
// // //                           statusColor = 'text-yellow-600';
// // //                         } else {
// // //                           status = 'Réussi';
// // //                           statusColor = 'text-green-600';
// // //                         }
// // //                       } else {
// // //                         if (score.score < 10) {
// // //                           status = 'Échec';
// // //                           statusColor = 'text-red-600';
// // //                         } else if (score.score < score.max_score * 0.7) {
// // //                           status = 'Passable';
// // //                           statusColor = 'text-yellow-600';
// // //                         } else {
// // //                           status = 'Réussi';
// // //                           statusColor = 'text-green-600';
// // //                         }
// // //                       }
// // //                     }
                    
// // //                     return (
// // //                       <tr key={score.id} className="hover:bg-gray-50">
                       
// // //                         <td className="px-4 py-3">
// // //                           <span className={`inline-flex cypher items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
// // //                             {score.assessment_type}
// // //                           </span>
// // //                         </td>
// // //                         <td className="px-4 py-3 text-sm cypher text-gray-600">
// // //                           {score.assessment_date 
// // //                             ? new Date(score.assessment_date).toLocaleDateString('fr-FR')
// // //                             : '-'
// // //                           }
// // //                         </td>
// // //                         <td className="px-4 py-3">
// // //                           <div className={`inline-flex items-center cypher px-2 py-1 rounded text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
// // //                             {score.score === null ? (
// // //                               'Non noté'
// // //                             ) : (
// // //                               <>
// // //                                 {score.score}/{score.max_score}
// // //                               </>
// // //                             )}
// // //                           </div>
// // //                         </td>
                        
// // //                       </tr>
// // //                     );
// // //                   })}
// // //                 </tbody>
// // //               </table>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* Statistiques minimalistes */}
// // //         {scores.length > 0 && (
// // //           <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
// // //             <div className="bg-white border border-gray-200 rounded p-3">
// // //               <div className="text-xs text-gray-500 mb-1">Notés</div>
// // //               <div className="text-lg font-medium text-gray-900 cypher">
// // //                 {scores.filter(s => s.score !== null).length}
// // //               </div>
// // //             </div>
            
// // //             <div className="bg-white border border-gray-200 rounded p-3">
// // //               <div className="text-xs text-gray-500 mb-1">En attente</div>
// // //               <div className="text-lg font-medium cypher text-gray-500">
// // //                 {scores.filter(s => s.score === null).length}
// // //               </div>
// // //             </div>
            
// // //             <div className="bg-white border border-gray-200 rounded p-3">
// // //               <div className="text-xs text-gray-500 mb-1">Réussites</div>
// // //               <div className="text-lg font-medium cypher text-green-600">
// // //                 {scores
// // //                   .filter(s => s.score !== null)
// // //                   .filter(s => {
// // //                     if (s.max_score <= 10) {
// // //                       return s.score! >= 5;
// // //                     }
// // //                     return s.score! >= 10;
// // //                   }).length}
// // //               </div>
// // //             </div>
            
// // //             <div className="bg-white border border-gray-200 rounded p-3">
// // //               <div className="text-xs text-gray-500 mb-1">Échecs</div>
// // //               <div className="text-lg cypher font-medium text-red-600">
// // //                 {scores
// // //                   .filter(s => s.score !== null)
// // //                   .filter(s => {
// // //                     if (s.max_score <= 10) {
// // //                       return s.score! < 5;
// // //                     }
// // //                     return s.score! < 10;
// // //                   }).length}
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Notes informatives */}
// // //         <div className="mt-4 cypher text-gray-500 space-y-1">
// // //           <p>
// // //             En cas de réclamation, présentez-vous avec votre justificatif pour modifier vos notes.
// // //             Faites le dans le plus bref délai possible.
// // //           </p>         
// // //         </div>
// // //       </div>

// // //       {/* Footer minimaliste */}
// // //       <div className="pt-4 border-t">
// // //         <div className="max-w-7xl cypher mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-500">
// // //           Système disponible jusqu'à la fin du cours.• {new Date().getFullYear()}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { ArrowRightOnRectangleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
// // import { supabase } from '@/lib/supabase';
// // import Link from 'next/link';
// // import { TerminalSquare } from 'lucide-react';

// // interface Assessment {
// //   name: string;
// //   type: string;
// //   max_score: number;
// //   assessment_date: string;
// // }

// // interface Score {
// //   id: string;
// //   assessment_name: string;
// //   assessment_type: string;
// //   score: number | null;
// //   max_score: number;
// //   assessment_date: string;
// //   created_at: string;
// //   assessments: Assessment | Assessment[];
// // }

// // export default function StudentDashboardPage() {
// //   const router = useRouter();
// //   const [student, setStudent] = useState<any>(null);
// //   const [scores, setScores] = useState<Score[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedType, setSelectedType] = useState<string>('all');

// //   // Fonction pour convertir une note sur 10
// //   const convertToTen = (score: number, maxScore: number): number => {
// //     return (score / maxScore) * 10;
// //   };

// //   // Calculs des moyennes
// //   const calculateAverages = () => {
// //     // Filtrer les scores notés
// //     const scoredScores = scores.filter(s => s.score !== null);
    
// //     // Regrouper par type
// //     const tdScores = scoredScores.filter(s => s.assessment_type === 'TD');
// //     const interroScores = scoredScores.filter(s => s.assessment_type === 'INTERRO');
    
// //     // Calculer la moyenne des TD (moyenne de toutes les notes de TD converties sur 10)
// //     let tdAverage = 0;
// //     if (tdScores.length > 0) {
// //       const tdSum = tdScores.reduce((sum, score) => {
// //         const scoreOnTen = convertToTen(score.score!, score.max_score);
// //         return sum + scoreOnTen;
// //       }, 0);
// //       tdAverage = tdSum / tdScores.length;
// //     }
    
// //     // Calculer la moyenne des Interros
// //     let interroAverage = 0;
// //     if (interroScores.length > 0) {
// //       const interroSum = interroScores.reduce((sum, score) => {
// //         const scoreOnTen = convertToTen(score.score!, score.max_score);
// //         return sum + scoreOnTen;
// //       }, 0);
// //       interroAverage = interroSum / interroScores.length;
// //     }
    
// //     // Calculer la moyenne pondérée sur 70% (sans l'exposé)
// //     let weightedAverage = 0;
// //     let hasTd = tdScores.length > 0;
// //     let hasInterro = interroScores.length > 0;
    
// //     if (hasTd && hasInterro) {
// //       // Les deux sont disponibles
// //       weightedAverage = (tdAverage * 0.3 + interroAverage * 0.4) / 0.7;
// //     } else if (hasTd && !hasInterro) {
// //       // Seulement les TD
// //       weightedAverage = tdAverage;
// //     } else if (!hasTd && hasInterro) {
// //       // Seulement les interros
// //       weightedAverage = interroAverage;
// //     }
    
// //     return {
// //       tdAverage: tdAverage.toFixed(2),
// //       interroAverage: interroAverage.toFixed(2),
// //       weightedAverage: weightedAverage.toFixed(2),
// //       hasTd,
// //       hasInterro,
// //       tdCount: tdScores.length,
// //       interroCount: interroScores.length
// //     };
// //   };

// //   const averages = calculateAverages();

// //   useEffect(() => {
// //     loadStudentData();
// //   }, []);

// //   const loadStudentData = async () => {
// //     const userStr = localStorage.getItem('user');
    
// //     if (!userStr) {
// //       router.push('/login');
// //       return;
// //     }
    
// //     const userData = JSON.parse(userStr);
// //     setStudent(userData);
    
// //     // Charger les cotes de l'étudiant
// //     try {
// //       const { data, error } = await supabase
// //         .from('scores')
// //         .select(`
// //           id,
// //           score,
// //           created_at,
// //           assessments (
// //             name,
// //             type,
// //             max_score,
// //             assessment_date
// //           )
// //         `)
// //         .eq('matricule', userData.matricule)
// //         .order('created_at', { ascending: false });
      
// //       if (error) throw error;
      
// //       const formattedScores = data.map(item => ({
// //         id: item.id,
// //         assessment_name: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.name || '' : (item.assessments as Assessment)?.name || '',
// //         assessment_type: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.type || '' : (item.assessments as Assessment)?.type || '',
// //         score: item.score,
// //         max_score: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.max_score || 10 : (item.assessments as Assessment)?.max_score || 10,
// //         assessment_date: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.assessment_date || '' : (item.assessments as Assessment)?.assessment_date || '',
// //         created_at: item.created_at,
// //         assessments: item.assessments
// //       }));
      
// //       setScores(formattedScores);
// //     } catch (error) {
// //       console.error('Erreur:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleLogout = () => {
// //     localStorage.removeItem('user');
// //     router.push('/login');
// //   };

// //   const filteredScores = selectedType === 'all' 
// //     ? scores 
// //     : scores.filter(score => score.assessment_type === selectedType);

// //   const getScoreColor = (score: number | null, maxScore: number = 10) => {
// //     if (score === null) return 'text-gray-600 bg-gray-50';
    
// //     // Convertir le score sur 10 pour l'évaluation
// //     const scoreOnTen = (score / maxScore) * 10;
    
// //     if (scoreOnTen < 5) return 'text-red-600 bg-red-50';
// //     if (scoreOnTen < 7) return 'text-yellow-600 bg-yellow-50';
// //     return 'text-green-600 bg-green-50';
// //   };

// //   const getTypeColor = (type: string) => {
// //     switch (type) {
// //       case 'TD': return 'bg-blue-50 text-blue-700';
// //       case 'TP': return 'bg-green-50 text-green-700';
// //       case 'INTERRO': return 'bg-yellow-50 text-yellow-700';
// //       case 'EXAMEN': return 'bg-red-50 text-red-700';
// //       default: return 'bg-gray-50 text-gray-700';
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-white flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
// //           <p className="mt-2 text-gray-600">Chargement...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Header minimaliste */}
// //       <div className="bg-white border-b">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
// //           <div className="flex justify-between items-center">
// //             <div className="flex items-center ">
// //               <AcademicCapIcon className="h-6 w-6 text-gray-700 mr-2" />
// //               <div>
// //                 <h1 className="text-cypher font-medium text-gray-900">L1</h1>
// //               </div>
// //             </div>
// //             <div>
// //               <Link href="/terminal" className='flex items-center cypher text-gray-700 font-bold'>
// //                 <TerminalSquare className='text-gray-600'/>
// //                 MS-DOS
// //               </Link>
// //             </div>
// //             <button
// //               onClick={handleLogout}
// //               className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
// //             >
// //               <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1.5" />
// //               Déconnexion
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Contenu principal */}
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
// //         {/* En-tête étudiant minimaliste */}
// //         <div className="mb-6">
// //           <p className='text-xl font-bold cypher '>
// //             SFO
// //           </p>
// //           <h2 className="text-xl font-medium text-gray-900 mb-1">
// //             {student?.username}
// //           </h2>
// //           <div className="flex items-center space-x-4 text-sm text-gray-600">
// //             <div className="flex items-center">
// //               <span className="mr-1.5">Matricule:</span>
// //               <span className="font-medium text-gray-800">{student?.matricule}</span>
// //             </div>
// //             <div className="w-px h-4 bg-gray-300"></div>
// //             <div className="flex items-center">
// //               <span className="mr-1.5">Genre:</span>
// //               <span className="font-medium text-gray-800">
// //                 {student?.genre === 'M' ? 'Masculin' : 'Féminin'}
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Nouvelle section: Calcul des moyennes */}
// //         <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
// //           {/* Carte Moyenne TD */}
// //           <div className="bg-white border border-gray-200 p-4">
// //             <div className="text-xs text-gray-500 mb-1">Moyenne TD (30%)</div>
// //             <div className="text-2xl font-bold text-blue-600 cypher">
// //               {averages.hasTd ? averages.tdAverage : '—'}/10
// //             </div>
// //             <div className="text-xs text-gray-400 mt-1">
// //               {averages.tdCount} note(s)
// //             </div>
// //           </div>

// //           {/* Carte Moyenne Interro */}
// //           <div className="bg-white border border-gray-200 p-4">
// //             <div className="text-xs text-gray-500 mb-1">Moyenne Interro (40%)</div>
// //             <div className="text-2xl font-bold text-yellow-600 cypher">
// //               {averages.hasInterro ? averages.interroAverage : '—'}/10
// //             </div>
// //             <div className="text-xs text-gray-400 mt-1">
// //               {averages.interroCount} note(s)
// //             </div>
// //           </div>

// //           {/* Carte Exposé (en attente) */}
// //           <div className="bg-white border border-gray-200 p-4">
// //             <div className="text-xs text-gray-500 mb-1">Exposé (30%)</div>
// //             <div className="text-2xl font-bold text-purple-400 cypher">
// //               —/10
// //             </div>
// //             <div className="text-xs text-purple-400 mt-1">
// //               En attente
// //             </div>
// //           </div>

// //           {/* Carte Moyenne Pondérée (sur 70%) */}
// //           <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
// //             <div className="text-xs text-gray-500 mb-1">Moyenne actuelle (sur 70%)</div>
// //             <div className="text-2xl font-bold text-gray-900 cypher">
// //               {(averages.hasTd || averages.hasInterro) ? averages.weightedAverage : '—'}/10
// //             </div>
// //             <div className="text-xs text-gray-400 mt-1">
// //               {averages.hasTd && averages.hasInterro ? 'TD (30%) + Interro (40%)' : 
// //                averages.hasTd ? 'Basée uniquement sur TD' :
// //                averages.hasInterro ? 'Basée uniquement sur Interro' :
// //                'Aucune note disponible'}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Filtres */}
// //         <div className="mb-4">
// //           <div className="flex items-center justify-between">
// //             <h3 className="text-base font-medium text-gray-900">
// //               Mes cotes ({scores.length})
// //             </h3>
            
// //             <select
// //               value={selectedType}
// //               onChange={(e) => setSelectedType(e.target.value)}
// //               className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
// //             >
// //               <option value="all">Tous les types</option>
// //               <option value="TD">TD</option>
// //               <option value="TP">TP</option>
// //               <option value="INTERRO">Interro</option>
// //               <option value="EXAMEN">Examen</option>
// //             </select>
// //           </div>
// //         </div>

// //         {/* Tableau des cotes - minimaliste */}
// //         <div className="bg-white border border-gray-200 rounded overflow-hidden">
// //           {filteredScores.length === 0 ? (
// //             <div className="text-center py-8">
// //               <p className="text-gray-500">Aucune cote disponible</p>
// //             </div>
// //           ) : (
// //             <div className="overflow-x-auto">
// //               <table className="min-w-full divide-y divide-gray-200">
// //                 <thead className="bg-gray-50">
// //                   <tr>
                   
// //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// //                       Type
// //                     </th>
// //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// //                       Date
// //                     </th>
// //                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
// //                       Score
// //                     </th>
                   
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {filteredScores.map((score) => {
// //                     // Convertir le score sur 10 pour l'affichage si nécessaire
// //                     const scoreOnTen = score.score !== null 
// //                       ? ((score.score / score.max_score) * 10).toFixed(0)
// //                       : null;
                    
// //                     // Déterminer le statut
// //                     let status = 'En attente';
// //                     let statusColor = 'text-gray-500';
                    
// //                     if (score.score !== null) {
// //                       const scoreValue = (score.score / score.max_score) * 10;
// //                       if (scoreValue < 5) {
// //                         status = 'Échec';
// //                         statusColor = 'text-red-600';
// //                       } else if (scoreValue < 7) {
// //                         status = 'Passable';
// //                         statusColor = 'text-yellow-600';
// //                       } else {
// //                         status = 'Réussi';
// //                         statusColor = 'text-green-600';
// //                       }
// //                     }
                    
// //                     return (
// //                       <tr key={score.id} className="hover:bg-gray-50">
                       
// //                         <td className="px-4 py-3">
// //                           <span className={`inline-flex cypher items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
// //                             {score.assessment_type}
// //                           </span>
// //                         </td>
// //                         <td className="px-4 py-3 text-sm cypher text-gray-600">
// //                           {score.assessment_date 
// //                             ? new Date(score.assessment_date).toLocaleDateString('fr-FR')
// //                             : '-'
// //                           }
// //                         </td>
// //                         <td className="px-4 py-3">
// //                           <div className={`inline-flex items-center cypher px-2 py-1 rounded text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
// //                             {score.score === null ? (
// //                               'Non noté'
// //                             ) : (
// //                               <>
// //                                 {scoreOnTen}/10
                              
// //                               </>
// //                             )}
// //                           </div>
// //                         </td>
                        
// //                       </tr>
// //                     );
// //                   })}
// //                 </tbody>
// //               </table>
// //             </div>
// //           )}
// //         </div>

// //         {/* Statistiques minimalistes */}
// //         {scores.length > 0 && (
// //           <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
// //             <div className="bg-white border border-gray-200 rounded p-3">
// //               <div className="text-xs text-gray-500 mb-1">Notés</div>
// //               <div className="text-lg font-medium text-gray-900 cypher">
// //                 {scores.filter(s => s.score !== null).length}
// //               </div>
// //             </div>
            
// //             <div className="bg-white border border-gray-200 rounded p-3">
// //               <div className="text-xs text-gray-500 mb-1">En attente</div>
// //               <div className="text-lg font-medium cypher text-gray-500">
// //                 {scores.filter(s => s.score === null).length}
// //               </div>
// //             </div>
            
// //             <div className="bg-white border border-gray-200 rounded p-3">
// //               <div className="text-xs text-gray-500 mb-1">Réussites</div>
// //               <div className="text-lg font-medium cypher text-green-600">
// //                 {scores
// //                   .filter(s => s.score !== null)
// //                   .filter(s => {
// //                     const scoreOnTen = (s.score! / s.max_score) * 10;
// //                     return scoreOnTen >= 5;
// //                   }).length}
// //               </div>
// //             </div>
            
// //             <div className="bg-white border border-gray-200 rounded p-3">
// //               <div className="text-xs text-gray-500 mb-1">Échecs</div>
// //               <div className="text-lg cypher font-medium text-red-600">
// //                 {scores
// //                   .filter(s => s.score !== null)
// //                   .filter(s => {
// //                     const scoreOnTen = (s.score! / s.max_score) * 10;
// //                     return scoreOnTen < 5;
// //                   }).length}
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Notes informatives */}
// //         <div className="mt-4 cypher text-gray-500 space-y-1">
// //           <p>
// //             En cas de réclamation, présentez-vous avec votre justificatif pour modifier vos notes.
// //             Faites le dans le plus bref délai possible.
// //           </p>         
// //         </div>
// //       </div>

// //       {/* Footer minimaliste */}
// //       <div className="pt-4 border-t">
// //         <div className="max-w-7xl cypher mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-500">
// //           Système disponible jusqu'à la fin du cours.• {new Date().getFullYear()}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowRightOnRectangleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
// import { supabase } from '@/lib/supabase';
// import Link from 'next/link';
// import { TerminalSquare } from 'lucide-react';
// import WhatsAppButton from '@/components/WhatsAppButton';

// interface Assessment {
//   name: string;
//   type: string;
//   max_score: number;
//   assessment_date: string;
// }

// interface Score {
//   id: string;
//   assessment_name: string;
//   assessment_type: string;
//   score: number | null;
//   max_score: number;
//   assessment_date: string;
//   created_at: string;
//   assessments: Assessment | Assessment[];
// }

// export default function StudentDashboardPage() {
//   const router = useRouter();
//   const [student, setStudent] = useState<any>(null);
//   const [scores, setScores] = useState<Score[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedType, setSelectedType] = useState<string>('all');

//   // Fonction pour convertir une note sur 10
//   const convertToTen = (score: number, maxScore: number): number => {
//     return (score / maxScore) * 10;
//   };

//   // Calculs des moyennes
//   const calculateAverages = () => {
//     // Filtrer les scores notés
//     const scoredScores = scores.filter(s => s.score !== null);
    
//     // Regrouper par type
//     const tdScores = scoredScores.filter(s => s.assessment_type === 'TD');
//     const interroScores = scoredScores.filter(s => s.assessment_type === 'INTERRO');
    
//     // Calculer la moyenne des TD (moyenne de toutes les notes de TD converties sur 10)
//     let tdAverage = 0;
//     if (tdScores.length > 0) {
//       const tdSum = tdScores.reduce((sum, score) => {
//         const scoreOnTen = convertToTen(score.score!, score.max_score);
//         return sum + scoreOnTen;
//       }, 0);
//       tdAverage = tdSum / tdScores.length;
//     }
    
//     // Calculer la moyenne des Interros
//     let interroAverage = 0;
//     if (interroScores.length > 0) {
//       const interroSum = interroScores.reduce((sum, score) => {
//         const scoreOnTen = convertToTen(score.score!, score.max_score);
//         return sum + scoreOnTen;
//       }, 0);
//       interroAverage = interroSum / interroScores.length;
//     }
    
//     // Calculer la moyenne pondérée sur 70% (sans l'exposé)
//     let weightedAverage = 0;
//     let hasTd = tdScores.length > 0;
//     let hasInterro = interroScores.length > 0;
    
//     if (hasTd && hasInterro) {
//       // Les deux sont disponibles
//       weightedAverage = (tdAverage * 0.3 + interroAverage * 0.4) / 0.7;
//     } else if (hasTd && !hasInterro) {
//       // Seulement les TD
//       weightedAverage = tdAverage;
//     } else if (!hasTd && hasInterro) {
//       // Seulement les interros
//       weightedAverage = interroAverage;
//     }
    
//     return {
//       tdAverage: tdAverage.toFixed(2),
//       interroAverage: interroAverage.toFixed(2),
//       weightedAverage: weightedAverage.toFixed(2),
//       hasTd,
//       hasInterro,
//       tdCount: tdScores.length,
//       interroCount: interroScores.length
//     };
//   };

//   const averages = calculateAverages();

//   useEffect(() => {
//     loadStudentData();
//   }, []);

//   const loadStudentData = async () => {
//     const userStr = localStorage.getItem('user');
    
//     if (!userStr) {
//       router.push('/login');
//       return;
//     }
    
//     const userData = JSON.parse(userStr);
//     setStudent(userData);
    
//     // Charger les cotes de l'étudiant
//     try {
//       const { data, error } = await supabase
//         .from('scores')
//         .select(`
//           id,
//           score,
//           created_at,
//           assessments (
//             name,
//             type,
//             max_score,
//             assessment_date
//           )
//         `)
//         .eq('matricule', userData.matricule)
//         .order('created_at', { ascending: false });
      
//       if (error) throw error;
      
//       const formattedScores = data.map(item => ({
//         id: item.id,
//         assessment_name: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.name || '' : (item.assessments as Assessment)?.name || '',
//         assessment_type: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.type || '' : (item.assessments as Assessment)?.type || '',
//         score: item.score,
//         max_score: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.max_score || 10 : (item.assessments as Assessment)?.max_score || 10,
//         assessment_date: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.assessment_date || '' : (item.assessments as Assessment)?.assessment_date || '',
//         created_at: item.created_at,
//         assessments: item.assessments
//       }));
      
//       setScores(formattedScores);
//     } catch (error) {
//       console.error('Erreur:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     router.push('/login');
//   };

//   const filteredScores = selectedType === 'all' 
//     ? scores 
//     : scores.filter(score => score.assessment_type === selectedType);

//   const getScoreColor = (score: number | null, maxScore: number = 10) => {
//     if (score === null) return 'text-gray-600 bg-gray-50';
    
//     // Utiliser la même logique que l'original mais avec max_score sur 10
//     if (maxScore <= 10) {
//       if (score < 5) return 'text-red-600 bg-red-50';
//       if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
//       return 'text-green-600 bg-green-50';
//     } else {
//       if (score < 10) return 'text-red-600 bg-red-50';
//       if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
//       return 'text-green-600 bg-green-50';
//     }
//   };

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case 'TD': return 'bg-blue-50 text-blue-700';
//       case 'TP': return 'bg-green-50 text-green-700';
//       case 'INTERRO': return 'bg-yellow-50 text-yellow-700';
//       case 'EXAMEN': return 'bg-red-50 text-red-700';
//       default: return 'bg-gray-50 text-gray-700';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
//           <p className="mt-2 text-gray-600">Chargement...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header minimaliste */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
           
//             <div>
//               <Link href="/" className='text-red-500 flex items-center cypher text-700 '>
//                System indisponible pour le moment
//               </Link>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
//             >
//               <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1.5" />
//               Déconnexion
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Contenu principal */}
//       <div className="max-w-7xl mx-auto  px-4 sm:px-6 lg:px-8 py-6">
//         {/* En-tête étudiant minimaliste */}
//         <div className="mb-6 hidden">
//           <p className='text-xl font-bold cypher '>
//             SFO
//           </p>
//           <h2 className="text-xl font-medium text-gray-900 mb-1">
//             {student?.username}
//           </h2>
//           <div className="flex items-center space-x-4 text-sm text-gray-600">
//             <div className="flex items-center">
//               <span className="mr-1.5">Matricule:</span>
//               <span className="font-medium text-gray-800">{student?.matricule}</span>
//             </div>
//             <div className="w-px h-4 bg-gray-300"></div>
//             <div className="flex items-center">
//               <span className="mr-1.5">Genre:</span>
//               <span className="font-medium text-gray-800">
//                 {student?.genre === 'M' ? 'Masculin' : 'Féminin'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Nouvelle section: Calcul des moyennes */}
//         <div className="mb-6 grid hidden grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="bg-white border border-gray-200 p-4">
//             <div className="text-xs text-gray-500 mb-1">Moyenne TD (30%)</div>
//             <div className="text-xl font-bold text-blue-600 cypher">
//               {averages.hasTd ? averages.tdAverage : '—'}/10
//             </div>
//             <div className="text-xs text-gray-400 mt-1">
//               {averages.tdCount} note(s)
//             </div>
//           </div>

//           {/* Carte Moyenne Interro */}
//           <div className="bg-white border border-gray-200 p-4">
//             <div className="text-xs text-gray-500 mb-1">Moyenne Interro (40%)</div>
//             <div className="text-xl font-bold text-yellow-600 cypher">
//               {averages.hasInterro ? averages.interroAverage : '—'}/10
//             </div>
//             <div className="text-xs text-gray-400 mt-1">
//               {averages.interroCount} note(s)
//             </div>
//           </div>

//           {/* Carte Exposé (en attente) */}
//           <div className="bg-white border border-gray-200 p-4">
//             <div className="text-xs text-gray-500 mb-1">Exposé (30%)</div>
//             <div className="text-xl font-bold text-purple-400 cypher">
//               —/10
//             </div>
//             <div className="text-xs text-purple-400 mt-1">
//               En attente
//             </div>
//           </div>

//           {/* Carte Moyenne Pondérée (sur 70%) */}
//           <div className="bg-white border-2 border-gray-300  p-4">
//             <div className="text-xs text-gray-500 mb-1">Moyenne actuelle (sur 70%)</div>
//             <div className="text-xl font-bold text-gray-900 cypher">
//               {(averages.hasTd || averages.hasInterro) ? averages.weightedAverage : '—'}/10
//             </div>
//             <div className="text-xs text-gray-400 mt-1">
//               {averages.hasTd && averages.hasInterro ? 'TD (30%) + Interro (40%)' : 
//                averages.hasTd ? 'Basée uniquement sur TD' :
//                averages.hasInterro ? 'Basée uniquement sur Interro' :
//                'Aucune note disponible'}
//             </div>
//           </div>
//         </div>


// {/* <div className='cypher mb-6'>

//   La moyenne vous sera envoyer par la coordination, moyenne finale sera sur 10 , la totalite de cotes de TD sur 3 ,
//   l'exposee sur 3 et l'interrogation sur 4 , d'ici 18 heure vous aller verifier la mise a jour en terme de reclamation
// </div> */}

// <div className="cypher mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded shadow">
//   <h2 className="text-lg font-semibold text-yellow-700 mb-2">📌 Informations sur la moyenne</h2>
//   <p className="text-gray-800 leading-relaxed">
//     La moyenne vous sera envoyée par la coordination. 
//     <br />
//     <span className="font-bold">Moyenne finale :</span> sur 10 
//     <br />
//     <span className="font-bold">Totalité des cotes de TD :</span> sur 3 
//     <br />
//     <span className="font-bold">Exposé :</span> sur 3 
//     <br />
//     <span className="font-bold">Interrogation :</span> sur 4 
//     <br />
//     <span className="text-red-600 font-semibold"></span>
//   </p>
// </div>

//         {/* Filtres */}
//         {/* <div className="mb-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-base font-medium text-gray-900">
//               Mes cotes ({scores.length})
//             </h3>
            
//             <select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="all">Tous les types</option>
//               <option value="TD">TD</option>
//               <option value="TP">TP</option>
//               <option value="INTERRO">Interro</option>
//               <option value="EXAMEN">Examen</option>
//             </select>
//           </div>
//         </div> */}

//         {/* Tableau des cotes - avec la logique originale */}
//         <div className="bg-white border hidden border-gray-200 rounded overflow-hidden">
//           {filteredScores.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-500">Aucune cote disponible</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Travail
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Score
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredScores.map((score) => {
//                     // Déterminer le statut avec la logique originale
//                     let status = 'En attente';
//                     let statusColor = 'text-gray-500';
                    
//                     if (score.score !== null) {
//                       if (score.max_score <= 10) {
//                         if (score.score < 5) {
//                           status = 'Échec';
//                           statusColor = 'text-red-600';
//                         } else if (score.score < score.max_score * 0.7) {
//                           status = 'Passable';
//                           statusColor = 'text-yellow-600';
//                         } else {
//                           status = 'Réussi';
//                           statusColor = 'text-green-600';
//                         }
//                       } else {
//                         if (score.score < 10) {
//                           status = 'Échec';
//                           statusColor = 'text-red-600';
//                         } else if (score.score < score.max_score * 0.7) {
//                           status = 'Passable';
//                           statusColor = 'text-yellow-600';
//                         } else {
//                           status = 'Réussi';
//                           statusColor = 'text-green-600';
//                         }
//                       }
//                     }
                    
//                     return (
//                       <tr key={score.id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex cypher items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
//                             {score.assessment_name}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-sm cypher text-gray-600">
//                           {score.assessment_date 
//                             ? new Date(score.assessment_date).toLocaleDateString('fr-FR')
//                             : '-'
//                           }
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className={`inline-flex items-center cypher px-2 py-1 rounded text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
//                             {score.score === null ? (
//                               'Non noté'
//                             ) : (
//                               <>
//                                 {score.score}/{score.max_score}
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
// <div className='hidden'>
//   <WhatsAppButton numero='243990664406'
//   message='Deposer une reclamation'/>
//   </div>
//         {/* Statistiques minimalistes - avec la logique originale */}
//         {scores.length > 0 && (
//           <div className="mt-6 grid grid-cols-2 hidden md:grid-cols-4 gap-3">
//             <div className="bg-white border border-gray-200 rounded p-3">
//               <div className="text-xs text-gray-500 mb-1">Notés</div>
//               <div className="text-lg font-medium text-gray-900 cypher">
//                 {scores.filter(s => s.score !== null).length}
//               </div>
//             </div>
            
//             <div className="bg-white border border-gray-200 rounded p-3">
//               <div className="text-xs text-gray-500 mb-1">En attente</div>
//               <div className="text-lg font-medium cypher text-gray-500">
//                 {scores.filter(s => s.score === null).length}
//               </div>
//             </div>
            
//             <div className="bg-white border border-gray-200 rounded p-3">
//               <div className="text-xs text-gray-500 mb-1">Réussites</div>
//               <div className="text-lg font-medium cypher text-green-600">
//                 {scores
//                   .filter(s => s.score !== null)
//                   .filter(s => {
//                     if (s.max_score <= 10) {
//                       return s.score! >= 5;
//                     }
//                     return s.score! >= 10;
//                   }).length}
//               </div>
//             </div>
            
//             <div className="bg-white border border-gray-200 rounded p-3">
//               <div className="text-xs text-gray-500 mb-1">Échecs</div>
//               <div className="text-lg cypher font-medium text-red-600">
//                 {scores
//                   .filter(s => s.score !== null)
//                   .filter(s => {
//                     if (s.max_score <= 10) {
//                       return s.score! < 5;
//                     }
//                     return s.score! < 10;
//                   }).length}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Notes informatives */}
//         <div className="mt-4 cypher hidden text-gray-500 space-y-1">
//           <p>
//             En cas de réclamation, présentez-vous avec votre justificatif pour modifier vos notes.
//             Faites le dans le plus bref délai possible.
//           </p>         
//         </div>
//       </div>

//       {/* Footer minimaliste */}
//       <div className="pt-4 border-t">
//         <div className="max-w-7xl cypher mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-500">
//           Système disponible jusqu'à la fin du cours.• {new Date().getFullYear()}
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function StudentPage() {

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <div>
                        <div className='text-red-500 text-center w-max w mx-auto flex items-center cypher text-700 '>
                         System indisponible pour le moment
                        </div>
                      </div>
        </div>
        <div className="cypher mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded shadow">
  <h2 className="text-lg font-semibold text-yellow-700 mb-2">📌 Informations sur la moyenne</h2>
  <p className="text-gray-800 leading-relaxed">
    La moyenne vous sera envoyée par la coordination . 
    <br />
    <span className="font-bold">Moyenne finale :</span> sur 10 
    <br />
    <span className="font-bold">Totalité des cotes de TD :</span> sur 3 
    <br />
    <span className="font-bold">Exposé :</span> sur 3 
    <br />
    <span className="font-bold">Interrogation :</span> sur 4 
    <br />
    <span className="text-red-600 font-semibold"></span>
  </p>
</div>

     

      
      </div>
    </div>
  );
}