// app/page.tsx
import { 
  FaIndustry, 
  FaTruck, 
  FaWarehouse, 
  FaStore, 
  FaPills,
  FaCheckCircle,
  FaCalendar,
  FaBarcode,
  FaTemperatureHigh,
  FaArrowRight
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <FaCheckCircle className="mr-2 h-4 w-4" />
                Blockchain Sécurisée
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Traçabilité Pharmaceutique
              <span className="block text-green-600">Nouvelle Génération</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Suivez chaque médicament de sa fabrication jusqu'au patient avec une technologie blockchain infalsifiable
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/lots"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-lg"
              >
                Commencer
                <FaArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/traceability"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-lg"
              >
                Voir une démo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
            <div className="text-gray-600">Lots tracés</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-600">Conformité</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Partenaires</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600">Traçabilité</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Une traçabilité complète
            </h2>
            <p className="text-lg text-gray-600">
              De la fabrication à la dispensation, chaque étape est enregistrée et vérifiée
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaIndustry className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fabrication</h3>
              <p className="text-gray-600">
                Création de lots uniques avec QR codes et hash blockchain pour une authenticité garantie
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaTruck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Distribution</h3>
              <p className="text-gray-600">
                Suivi en temps réel des transferts entre fabricants, grossistes et pharmacies
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaStore className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dispensation</h3>
              <p className="text-gray-600">
                Vérification instantanée de l'authenticité des médicaments avant dispensation au patient
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Traceability Demo Section - Style du design fourni */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
          <div className="bg-black text-white p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <FaPills className="text-2xl text-green-400" />
                <span className="text-xl font-light tracking-wider">
                  PHARMA<span className="font-bold text-green-400">TRACE</span>
                </span>
              </div>
              <div className="text-sm">
                <span className="border border-gray-700 px-4 py-2">DÉMO</span>
              </div>
            </div>

            <div className="border border-gray-800 p-6 rounded-lg mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                    Traçabilité du Lot
                  </div>
                  <h2 className="text-3xl font-light mb-4 tracking-tight">
                    Paracetamol 500mg
                  </h2>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <FaBarcode className="text-gray-500" />
                      <span className="text-gray-300">
                        Lot: <span className="text-white font-mono">MED-2024-8472-B</span>
                      </span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="border border-gray-800 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <FaTemperatureHigh className="text-gray-500" />
                  <span className="font-medium">Chaîne du Froid</span>
                </div>
                <div className="text-gray-400 space-y-1">
                  <div>Min: 18.2°C / Max: 21.5°C</div>
                  <div>Conformité: 100%</div>
                </div>
              </div>
              
              <div className="border border-gray-800 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <FaCheckCircle className="text-gray-500" />
                  <span className="font-medium">Certifications</span>
                </div>
                <div className="text-gray-400 space-y-1">
                  <div>ISO 13485:2016</div>
                  <div>GDP Conforme</div>
                </div>
              </div>
              
              <div className="border border-gray-800 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <FaBarcode className="text-gray-500" />
                  <span className="font-medium">Traçabilité</span>
                </div>
                <div className="text-gray-400 space-y-1">
                  <div>GS1 Standard</div>
                  <div>Blockchain: Vérifié</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}