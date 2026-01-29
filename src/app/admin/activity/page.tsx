// 'use client';

// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   FiUsers, 
//   FiActivity,
//   FiClock,FiEye,
//   FiBarChart2
// } from 'react-icons/fi';
// import UserActivityPage from './UserActivityPage';
// import RecentSessionsPage from './RecentSessionsPage';
// type ActiveTab = 'sessions' | 'activity';

// export default function AdminActivityPage() {
//   const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');

//   const tabs = [
//     {
//       id: 'sessions' as ActiveTab,
//       label: 'Sessions Récentes',
//       icon: <FiUsers className="w-4 h-4" />,
//     },
//     {
//       id: 'activity' as ActiveTab,
//       label: 'Journal d\'Activité',
//       icon: <FiActivity className="w-4 h-4" />,
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
        

//           {/* Tabs Style Moderne */}
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`relative py-4 px-1 text-sm font-medium transition-colors duration-200 ${
//                     activeTab === tab.id
//                       ? 'text-blue-600'
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     {tab.icon}
//                     <span>{tab.label}</span>
//                   </div>
                  
//                   {/* Indicateur animé */}
//                   {activeTab === tab.id && (
//                     <motion.div
//                       className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
//                       layoutId="activeTab"
//                       transition={{
//                         type: "spring",
//                         stiffness: 300,
//                         damping: 30
//                       }}
//                     />
//                   )}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Contenu avec animation */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//           >
//             {activeTab === 'sessions' && <RecentSessionsPage />}
//             {activeTab === 'activity' && <UserActivityPage />}
//           </motion.div>
//         </AnimatePresence>
//       </div>
//       <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 flex items-center gap-6 text-xs"
//         >
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             <span className="text-gray-600">Système actif</span>
//           </div>
//           <div className="w-px h-4 bg-gray-300"></div>
//           <div className="flex items-center gap-2">
//             <FiBarChart2 className="w-3 h-3 text-blue-500" />
//             <span className="text-gray-600">Monitoring temps réel</span>
//           </div>
//           <div className="w-px h-4 bg-gray-300"></div>
//           <div className="flex items-center gap-2">
//             <FiEye className="w-3 h-3 text-purple-500" />
//             <span className="text-gray-600">Vue {activeTab === 'sessions' ? 'sessions' : 'activité'}</span>
//           </div>
//         </motion.div>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiActivity,
  FiClock,FiEye,
  FiBarChart2
} from 'react-icons/fi';
import UserActivityPage from './UserActivityPage';
import RecentSessionsPage from './RecentSessionsPage';
type ActiveTab = 'sessions' | 'activity';

export default function AdminActivityPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');

  const tabs = [
    {
      id: 'sessions' as ActiveTab,
      label: 'Sessions Récentes',
      icon: <FiUsers className="w-4 h-4" />,
    },
    {
      id: 'activity' as ActiveTab,
      label: 'Journal d\'Activité',
      icon: <FiActivity className="w-4 h-4" />,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb] hide-scrollbar transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
        

          {/* Tabs Style Moderne */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  
                  {/* Indicateur animé */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      layoutId="activeTab"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu avec animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'sessions' && <RecentSessionsPage />}
            {activeTab === 'activity' && <UserActivityPage />}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-3 flex items-center gap-6 text-xs transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 dark:text-gray-400">Système actif</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <FiBarChart2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-400">Monitoring temps réel</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <FiEye className="w-3 h-3 text-purple-500 dark:text-purple-400" />
            <span className="text-gray-600 dark:text-gray-400">Vue {activeTab === 'sessions' ? 'sessions' : 'activité'}</span>
          </div>
        </motion.div> */}
    </div>
  );
}