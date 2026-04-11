// app/traceability/page.tsx
import { 
  FaIndustry, 
  FaTruck, 
  FaWarehouse, 
  FaStore, 
  FaPills,
  FaCheckCircle,
  FaCalendar,
  FaBarcode,
  FaTemperatureHigh
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

export default function TraceabilityPage() {
  const lotNumber = "MED-2024-8472-B";
  const productName = "Paracetamol 500mg";
  
  const steps = [
    {
      id: 1,
      title: "Fabricant",
      location: "PharmaCorp Industries",
      address: "Lyon, France",
      date: "15 Jan 2024 - 08:30",
      icon: FaIndustry,
      status: "completed",
      details: {
        batch: "BATCH-001",
        quantity: "50,000 unités",
        certification: "BPF / GMP Certifié"
      }
    },
    {
      id: 2,
      title: "Contrôle Qualité",
      location: "Laboratoire Central",
      address: "Paris, France",
      date: "16 Jan 2024 - 14:15",
      icon: FaCheckCircle,
      status: "completed",
      details: {
        tests: "12/12 validés",
        purity: "99.8%",
        approved: "Dr. Martin"
      }
    },
    {
      id: 3,
      title: "Centre de Distribution",
      location: "LogiPharma Hub",
      address: "Orléans, France",
      date: "18 Jan 2024 - 11:20",
      icon: FaWarehouse,
      status: "completed",
      details: {
        storage: "Zone A-12",
        temp: "19-21°C",
        handling: "Conforme"
      }
    },
    {
      id: 4,
      title: "Transport",
      location: "TransMed Express",
      address: "En transit",
      date: "19 Jan 2024 - 06:45",
      icon: FaTruck,
      status: "completed",
      details: {
        vehicle: "FR-834-AM",
        tempLog: "20.3°C constant",
        driver: "J. Dupont"
      }
    },
    {
      id: 5,
      title: "Pharmacie",
      location: "Pharmacie Centrale",
      address: "Marseille, France",
      date: "20 Jan 2024 - 09:00",
      icon: FaStore,
      status: "current",
      details: {
        pharmacist: "E. Bernard",
        verification: "Lot scanné",
        stock: "Disponible"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Navigation minimaliste */}
      <nav className="border-b border-gray-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaPills className="text-2xl" />
            <span className="text-xl font-light tracking-wider">PHARMA<span className="font-bold">TRACE</span></span>
          </div>
          <div className="text-sm text-gray-400">
            <span className="border border-gray-700 px-4 py-2">SCAN</span>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* En-tête avec informations du lot */}
        <div className="mb-16 border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">Traçabilité du Lot</div>
              <h1 className="text-5xl font-light mb-4 tracking-tight">{productName}</h1>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <FaBarcode className="text-gray-500" />
                  <span className="text-gray-300">Lot: <span className="text-white font-mono">{lotNumber}</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendar className="text-gray-500" />
                  <span className="text-gray-300">Exp: 12/2026</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdVerified className="text-green-500" />
                  <span className="text-green-500">Authentique</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="border border-gray-700 px-6 py-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Statut</div>
                <div className="text-lg font-bold text-green-400">EN PHARMACIE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline - Style carré noir */}
        <div className="relative">
          {/* Ligne de progression */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gray-800 md:left-1/2 md:-ml-px"></div>
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={step.id} className={`relative flex flex-col md:flex-row ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8`}>
                  {/* Icône sur la ligne */}
                  <div className="absolute left-8 top-8 transform -translate-x-1/2 md:left-1/2 z-10">
                    <div className={`w-10 h-10 border-2 flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'border-green-500 bg-green-500/10 text-green-500' 
                        : 'border-white bg-black text-white'
                    }`}>
                      <Icon className="text-lg" />
                    </div>
                  </div>

                  {/* Contenu du bloc */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'} ml-20 md:ml-0`}>
                    <div className={`border border-gray-800 bg-black p-6 ${step.status === 'current' ? 'border-white' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-light tracking-wide">{step.title}</h3>
                        {step.status === 'completed' && (
                          <FaCheckCircle className="text-green-500" />
                        )}
                        {step.status === 'current' && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{step.location}</div>
                        <div className="text-gray-500">{step.address}</div>
                        <div className="text-gray-400 text-xs mt-2">{step.date}</div>
                      </div>

                      {/* Détails supplémentaires */}
                      <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 gap-2 text-xs">
                        {Object.entries(step.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 capitalize">{key}:</span>
                            <span className="text-gray-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied de page avec informations de conformité */}
        <div className="mt-16 border-t border-gray-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="border border-gray-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaTemperatureHigh className="text-gray-500" />
                <span className="font-medium">Chaîne du Froid</span>
              </div>
              <div className="text-gray-400 space-y-1">
                <div>Min: 18.2°C / Max: 21.5°C</div>
                <div>Conformité: 100%</div>
              </div>
            </div>
            
            <div className="border border-gray-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaCheckCircle className="text-gray-500" />
                <span className="font-medium">Certifications</span>
              </div>
              <div className="text-gray-400 space-y-1">
                <div>ISO 13485:2016</div>
                <div>GDP Conforme</div>
              </div>
            </div>
            
            <div className="border border-gray-800 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaBarcode className="text-gray-500" />
                <span className="font-medium">Traçabilité</span>
              </div>
              <div className="text-gray-400 space-y-1">
                <div>GS1 Standard</div>
                <div>Blockchain: Verifié</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button className="border border-white px-8 py-3 text-sm hover:bg-white hover:text-black transition-colors duration-300">
              TÉLÉCHARGER LE RAPPORT COMPLET
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}