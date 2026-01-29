
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowRightOnRectangleIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline';
// import { supabase } from '@/lib/supabase';

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
//   assessments: Assessment | Assessment[]; // Define the type for assessments
// }

// export default function StudentDashboardPage() {
//   const router = useRouter();
//   const [student, setStudent] = useState<any>(null);
//   const [scores, setScores] = useState<Score[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedType, setSelectedType] = useState<string>('all');

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
//         max_score: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.max_score || 20 : (item.assessments as Assessment)?.max_score || 20,
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

//   const getScoreColor = (score: number | null, maxScore: number = 20) => {
//     if (score === null) return 'text-gray-600 bg-gray-100';
//     if (score < 10) return 'text-red-800 bg-red-100';
//     if (score < maxScore * 0.7) return 'text-yellow-800 bg-yellow-100';
//     return 'text-green-800 bg-green-100';
//   };

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case 'TD': return 'bg-blue-100 text-blue-800';
//       case 'TP': return 'bg-green-100 text-green-800';
//       case 'INTERRO': return 'bg-yellow-100 text-yellow-800';
//       case 'EXAMEN': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const calculateAverage = () => {
//     const scored = filteredScores.filter(s => s.score !== null);
//     if (scored.length === 0) return null;
    
//     const total = scored.reduce((sum, s) => sum + (s.score || 0), 0);
//     return (total / scored.length).toFixed(2);
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
//       {/* Header */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center">
//               <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-3" />
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Portail Étudiant</h1>
//                 <p className="text-sm text-gray-600">Consultez vos résultats</p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
//             >
//               <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
//               Déconnexion
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Contenu principal */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* En-tête étudiant */}
//         <div className="bg-white rounded-lg shadow p-6 mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Bonjour, {student?.username}
//               </h2>
//               <div className="flex items-center space-x-6 mt-2">
//                 <div className="flex items-center">
//                   <span className="text-gray-600 mr-2">Matricule:</span>
//                   <span className="font-medium text-gray-900">{student?.matricule}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="text-gray-600 mr-2">Genre:</span>
//                   <span className="font-medium text-gray-900">
//                     {student?.genre === 'M' ? 'Masculin' : 'Féminin'}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             {calculateAverage() && (
//               <div className="mt-4 md:mt-0 bg-blue-50 px-6 py-4 rounded-lg">
//                 <div className="text-sm font-medium text-blue-900 mb-1">Moyenne générale</div>
//                 <div className="text-3xl font-bold text-blue-700">
//                   {calculateAverage()}/20
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Filtres et statistiques */}
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
//             <div>
//               <h3 className="text-lg font-medium text-gray-900">Mes Cotes</h3>
//               <p className="text-sm text-gray-600">
//                 {scores.length} travaux au total
//               </p>
//             </div>
            
//             <div className="flex space-x-4">
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">Tous les types</option>
//                 <option value="TD">Travaux Dirigés</option>
//                 <option value="TP">Travaux Pratiques</option>
//                 <option value="INTERRO">Interrogations</option>
//                 <option value="EXAMEN">Examens</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Tableau des cotes */}
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           {filteredScores.length === 0 ? (
//             <div className="text-center py-12">
//               <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
//               <p className="mt-4 text-gray-500">Aucune cote disponible</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Travail
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Type
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Score
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Pourcentage
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Statut
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredScores.map((score) => {
//                     const percentage = score.score !== null 
//                       ? (score.score / score.max_score) * 100 
//                       : null;
                    
//                     return (
//                       <tr 
//                         key={score.id} 
//                         className={`hover:bg-gray-50 ${
//                           score.score === null 
//                             ? 'bg-gray-50' 
//                             : score.score < 10 
//                               ? 'bg-red-50' 
//                               : ''
//                         }`}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">
//                             {score.assessment_name}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
//                             {score.assessment_type}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(score.assessment_date).toLocaleDateString('fr-FR')}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
//                             {score.score === null ? (
//                               <>
//                                 <span className="h-2 w-2 bg-gray-400 rounded-full mr-2"></span>
//                                 Non noté
//                               </>
//                             ) : (
//                               <>
//                                 {score.score < 10 && (
//                                   <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
//                                 )}
//                                 {score.score}/{score.max_score}
//                               </>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             {percentage !== null ? (
//                               <>
//                                 <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
//                                   <div
//                                     className={`h-2 rounded-full ${
//                                       percentage < 50 
//                                         ? 'bg-red-500' 
//                                         : percentage < 70 
//                                           ? 'bg-yellow-500' 
//                                           : 'bg-green-500'
//                                     }`}
//                                     style={{ width: `${Math.min(percentage, 100)}%` }}
//                                   ></div>
//                                 </div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   {percentage.toFixed(1)}%
//                                 </span>
//                               </>
//                             ) : (
//                               <span className="text-gray-400">-</span>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {score.score === null ? (
//                             <span className="text-gray-500">En attente</span>
//                           ) : score.score < score.max_score * 0.5 ? (
//                             <span className="text-red-600 font-medium">Échec</span>
//                           ) : score.score < score.max_score * 0.7 ? (
//                             <span className="text-yellow-600 font-medium">Passable</span>
//                           ) : (
//                             <span className="text-green-600 font-medium">Réussi</span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Statistiques résumées */}
//         {scores.length > 0 && (
//           <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm font-medium text-gray-500 mb-1">Travaux notés</div>
//               <div className="text-2xl font-bold text-gray-900">
//                 {scores.filter(s => s.score !== null).length}
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm font-medium text-gray-500 mb-1">En attente</div>
//               <div className="text-2xl font-bold text-gray-500">
//                 {scores.filter(s => s.score === null).length}
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm font-medium text-gray-500 mb-1">Réussites</div>
//               <div className="text-2xl font-bold text-green-600">
//                 {scores
//                   .filter(s => s.score !== null)
//                   .filter(s => (s.score! / s.max_score) >= 0.5)
//                   .length}
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow p-4">
//               <div className="text-sm font-medium text-gray-500 mb-1">Moyenne TD</div>
//               <div className="text-2xl font-bold text-blue-600">
//                 {(() => {
//                   const tdScores = scores.filter(s => 
//                     s.assessment_type === 'TD' && s.score !== null
//                   );
//                   if (tdScores.length === 0) return '-';
                  
//                   const avg = tdScores.reduce((sum, s) => sum + (s.score || 0), 0) / tdScores.length;
//                   return avg.toFixed(1);
//                 })()}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="border-t mt-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
//           Système de gestion académique - {new Date().getFullYear()}
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

interface Assessment {
  name: string;
  type: string;
  max_score: number;
  assessment_date: string;
}

interface Score {
  id: string;
  assessment_name: string;
  assessment_type: string;
  score: number | null;
  max_score: number;
  assessment_date: string;
  created_at: string;
  assessments: Assessment | Assessment[];
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    setStudent(userData);
    
    // Charger les cotes de l'étudiant
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          score,
          created_at,
          assessments (
            name,
            type,
            max_score,
            assessment_date
          )
        `)
        .eq('matricule', userData.matricule)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedScores = data.map(item => ({
        id: item.id,
        assessment_name: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.name || '' : (item.assessments as Assessment)?.name || '',
        assessment_type: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.type || '' : (item.assessments as Assessment)?.type || '',
        score: item.score,
        max_score: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.max_score || 20 : (item.assessments as Assessment)?.max_score || 20,
        assessment_date: Array.isArray(item.assessments) ? (item.assessments[0] as Assessment)?.assessment_date || '' : (item.assessments as Assessment)?.assessment_date || '',
        created_at: item.created_at,
        assessments: item.assessments
      }));
      
      setScores(formattedScores);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredScores = selectedType === 'all' 
    ? scores 
    : scores.filter(score => score.assessment_type === selectedType);

  const getScoreColor = (score: number | null, maxScore: number = 20) => {
    if (score === null) return 'text-gray-600 bg-gray-50';
    
    // Si max_score <= 10, seuil à 5, sinon à 10
    if (maxScore <= 10) {
      if (score < 5) return 'text-red-600 bg-red-50';
      if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
      return 'text-green-600 bg-green-50';
    } else {
      if (score < 10) return 'text-red-600 bg-red-50';
      if (score < maxScore * 0.7) return 'text-yellow-600 bg-yellow-50';
      return 'text-green-600 bg-green-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TD': return 'bg-blue-50 text-blue-700';
      case 'TP': return 'bg-green-50 text-green-700';
      case 'INTERRO': return 'bg-yellow-50 text-yellow-700';
      case 'EXAMEN': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimaliste */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 text-gray-700 mr-2" />
              <div>
                <h1 className="text-lg font-medium text-gray-900">Portail Étudiant</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête étudiant minimaliste */}
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-1">
            {student?.username}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-1.5">Matricule:</span>
              <span className="font-medium text-gray-800">{student?.matricule}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center">
              <span className="mr-1.5">Genre:</span>
              <span className="font-medium text-gray-800">
                {student?.genre === 'M' ? 'Masculin' : 'Féminin'}
              </span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-900">
              Mes cotes ({scores.length})
            </h3>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="TD">TD</option>
              <option value="TP">TP</option>
              <option value="INTERRO">Interro</option>
              <option value="EXAMEN">Examen</option>
            </select>
          </div>
        </div>

        {/* Tableau des cotes - minimaliste */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {filteredScores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune cote disponible</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Travail
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScores.map((score) => {
                    const percentage = score.score !== null 
                      ? (score.score / score.max_score) * 100 
                      : null;
                    
                    // Déterminer le statut
                    let status = 'En attente';
                    let statusColor = 'text-gray-500';
                    
                    if (score.score !== null) {
                      if (score.max_score <= 10) {
                        if (score.score < 5) {
                          status = 'Échec';
                          statusColor = 'text-red-600';
                        } else if (score.score < score.max_score * 0.7) {
                          status = 'Passable';
                          statusColor = 'text-yellow-600';
                        } else {
                          status = 'Réussi';
                          statusColor = 'text-green-600';
                        }
                      } else {
                        if (score.score < 10) {
                          status = 'Échec';
                          statusColor = 'text-red-600';
                        } else if (score.score < score.max_score * 0.7) {
                          status = 'Passable';
                          statusColor = 'text-yellow-600';
                        } else {
                          status = 'Réussi';
                          statusColor = 'text-green-600';
                        }
                      }
                    }
                    
                    return (
                      <tr key={score.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {score.assessment_name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(score.assessment_type)}`}>
                            {score.assessment_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {score.assessment_date 
                            ? new Date(score.assessment_date).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getScoreColor(score.score, score.max_score)}`}>
                            {score.score === null ? (
                              'Non noté'
                            ) : (
                              <>
                                {score.score}/{score.max_score}
                                {percentage !== null && (
                                  <span className="ml-1.5 text-xs">
                                    ({percentage.toFixed(0)}%)
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-medium ${statusColor}`}>
                            {status}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistiques minimalistes */}
        {scores.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Notés</div>
              <div className="text-lg font-medium text-gray-900">
                {scores.filter(s => s.score !== null).length}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">En attente</div>
              <div className="text-lg font-medium text-gray-500">
                {scores.filter(s => s.score === null).length}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Réussites</div>
              <div className="text-lg font-medium text-green-600">
                {scores
                  .filter(s => s.score !== null)
                  .filter(s => {
                    if (s.max_score <= 10) {
                      return s.score! >= 5;
                    }
                    return s.score! >= 10;
                  }).length}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Échecs</div>
              <div className="text-lg font-medium text-red-600">
                {scores
                  .filter(s => s.score !== null)
                  .filter(s => {
                    if (s.max_score <= 10) {
                      return s.score! < 5;
                    }
                    return s.score! < 10;
                  }).length}
              </div>
            </div>
          </div>
        )}

        {/* Notes informatives */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>• Seuil de réussite : 5/10 ou 10/20</p>
          <p>• Score manquant : travail non encore noté</p>
        </div>
      </div>

      {/* Footer minimaliste */}
      <div className="mt-8 pt-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-500">
          Système académique • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}