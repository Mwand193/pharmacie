
// // components/Modals/QRCodeModal.tsx
// 'use client';

// import { Fragment, useState } from 'react';
// import { Dialog, Transition } from '@headlessui/react';
// import { FaTimes, FaDownload, FaCopy, FaCheck } from 'react-icons/fa';
// import QRCodeGenerator from '@/components/QRCodeGenerator'; // Ajustez le chemin selon votre structure
// import type { Lot } from '@/types';

// interface QRCodeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   lot: Lot;
// }

// export default function QRCodeModal({ isOpen, onClose, lot }: QRCodeModalProps) {
//   const [copied, setCopied] = useState(false);
//   const [copiedHash, setCopiedHash] = useState(false);

//   // Préparer les données pour le QR code
//   const qrData = {
//     numero_lot: lot.numero_lot,
//     code_unique: lot.code_unique,
//     hash_lot: lot.hash_lot,
//     medicament: lot.medicament?.nom,
//     date_fabrication: lot.date_fabrication,
//     date_expiration: lot.date_expiration,
//     quantite_totale: lot.quantite_totale,
//   };

//   const qrValue = JSON.stringify(qrData);

//   const handleCopy = async (text: string, type: 'code' | 'hash') => {
//     try {
//       await navigator.clipboard.writeText(text);
//       if (type === 'code') {
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//       } else {
//         setCopiedHash(true);
//         setTimeout(() => setCopiedHash(false), 2000);
//       }
//     } catch (err) {
//       console.error('Erreur copie:', err);
//     }
//   };

//   const handleDownloadQR = () => {
//     // Trouver l'élément canvas ou img du QR code
//     const qrImage = document.querySelector('#qr-code-image') as HTMLImageElement;
    
//     if (qrImage && qrImage.src) {
//       const link = document.createElement('a');
//       link.download = `QR_${lot.numero_lot}.png`;
//       link.href = qrImage.src;
//       link.click();
//     }
//   };

//   const handlePrintQR = () => {
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>QR Code - ${lot.numero_lot}</title>
//             <style>
//               body {
//                 display: flex;
//                 flex-direction: column;
//                 align-items: center;
//                 justify-content: center;
//                 min-height: 100vh;
//                 margin: 0;
//                 font-family: monospace;
//                 background: white;
//               }
//               .qr-container {
//                 text-align: center;
//                 padding: 40px;
//                 border: 2px solid #000;
//                 border-radius: 8px;
//               }
//               h2 {
//                 margin-bottom: 20px;
//                 color: #333;
//               }
//               .lot-info {
//                 margin-top: 20px;
//                 font-size: 14px;
//                 color: #666;
//               }
//               .hash {
//                 font-size: 10px;
//                 color: #999;
//                 max-width: 300px;
//                 word-break: break-all;
//               }
//               @media print {
//                 body { margin: 0; }
//                 .qr-container { border: 2px solid #000; }
//               }
//             </style>
//           </head>
//           <body>
//             <div class="qr-container">
//               <h2>${lot.medicament?.nom || 'Médicament'}</h2>
//               <img src="${document.querySelector('#qr-code-image')?.getAttribute('src')}" 
//                    alt="QR Code" 
//                    width="300" 
//                    height="300" />
//               <div class="lot-info">
//                 <p><strong>Lot:</strong> ${lot.numero_lot}</p>
//                 <p><strong>Expiration:</strong> ${new Date(lot.date_expiration).toLocaleDateString('fr-FR')}</p>
//                 <p class="hash"><strong>Hash:</strong> ${lot.hash_lot}</p>
//               </div>
//             </div>
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//       printWindow.print();
//     }
//   };

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-10" onClose={onClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-25" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
//                 {/* En-tête */}
//                 <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-white px-6 py-4">
//                   <Dialog.Title as="div" className="flex items-center justify-between">
//                     <div>
//                       <h3 className="text-lg font-medium leading-6 text-gray-900">
//                         QR Code du lot
//                       </h3>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {lot.medicament?.nom}
//                       </p>
//                     </div>
//                     <button
//                       onClick={onClose}
//                       className="text-gray-400 hover:text-gray-500 transition-colors"
//                     >
//                       <FaTimes />
//                     </button>
//                   </Dialog.Title>
//                 </div>

//                 <div className="px-6 py-6">
//                   {/* QR Code */}
//                   <div className="flex justify-center mb-6">
//                     <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
//                       <div id="qr-code-image">
//                         <QRCodeGenerator value={qrValue} size={250} />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Informations du lot */}
//                   <div className="space-y-3">
//                     {/* Numéro de lot */}
//                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <div className="text-xs text-gray-500 mb-1">Numéro de lot</div>
//                         <div className="font-mono text-lg font-bold text-gray-900">
//                           {lot.numero_lot}
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => handleCopy(lot.numero_lot, 'code')}
//                         className="p-2 text-gray-500 hover:text-green-600 transition-colors"
//                         title="Copier le numéro de lot"
//                       >
//                         {copied ? (
//                           <FaCheck className="h-4 w-4 text-green-600" />
//                         ) : (
//                           <FaCopy className="h-4 w-4" />
//                         )}
//                       </button>
//                     </div>

//                     {/* Code unique */}
//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <div className="text-xs text-gray-500 mb-1">Code unique</div>
//                       <div className="font-mono text-sm text-gray-700 break-all">
//                         {lot.code_unique}
//                       </div>
//                     </div>

//                     {/* Hash blockchain */}
//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <div className="flex items-center justify-between mb-1">
//                         <span className="text-xs text-gray-500">Hash Blockchain</span>
//                         <button
//                           onClick={() => handleCopy(lot.hash_lot, 'hash')}
//                           className="text-gray-500 hover:text-green-600 transition-colors"
//                           title="Copier le hash"
//                         >
//                           {copiedHash ? (
//                             <FaCheck className="h-3 w-3 text-green-600" />
//                           ) : (
//                             <FaCopy className="h-3 w-3" />
//                           )}
//                         </button>
//                       </div>
//                       <div className="font-mono text-xs text-gray-600 break-all bg-white p-2 rounded border border-gray-200">
//                         {lot.hash_lot}
//                       </div>
//                     </div>

//                     {/* Détails supplémentaires */}
//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="p-3 bg-gray-50 rounded-lg">
//                         <div className="text-xs text-gray-500 mb-1">Date de fabrication</div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
//                         </div>
//                       </div>
//                       <div className="p-3 bg-gray-50 rounded-lg">
//                         <div className="text-xs text-gray-500 mb-1">Date d'expiration</div>
//                         <div className={`text-sm font-medium ${
//                           new Date(lot.date_expiration) < new Date() 
//                             ? 'text-red-600' 
//                             : 'text-gray-900'
//                         }`}>
//                           {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <div className="text-xs text-gray-500 mb-1">Quantité totale</div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {lot.quantite_totale} unités
//                       </div>
//                     </div>

//                     {/* Statut de vérification */}
//                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                       <div className="flex items-center space-x-2">
//                         <FaCheck className="h-4 w-4 text-green-600" />
//                         <span className="text-sm text-green-900">
//                           Lot vérifié et authentique
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="mt-6 flex justify-end space-x-3">
//                     <button
//                       type="button"
//                       onClick={handlePrintQR}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//                     >
//                       Imprimer
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleDownloadQR}
//                       className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
//                     >
//                       <FaDownload className="mr-2 h-4 w-4" />
//                       Télécharger QR Code
//                     </button>
//                   </div>
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }
// components/Modals/QRCodeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaCopy, FaCheck, FaPrint } from 'react-icons/fa';
import { QrCode } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import type { Lot } from '@/types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: Lot;
}

export default function QRCodeModal({ isOpen, onClose, lot }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (isOpen && lot) {
      document.body.style.overflow = 'hidden';
      
      // Préparer les données pour le QR code
      try {
        const qrData = typeof lot.qr_content === 'string' && lot.qr_content.startsWith('{')
          ? JSON.parse(lot.qr_content)
          : {
              numero_lot: lot.numero_lot,
              code_unique: lot.code_unique,
              hash_lot: lot.hash_lot,
              medicament: lot.medicament?.nom,
              date_fabrication: lot.date_fabrication,
              date_expiration: lot.date_expiration,
              quantite_totale: lot.quantite_totale,
            };
        
        setQrValue(JSON.stringify(qrData));
      } catch {
        const qrData = {
          numero_lot: lot.numero_lot,
          code_unique: lot.code_unique,
          hash_lot: lot.hash_lot,
        };
        setQrValue(JSON.stringify(qrData));
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, lot]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, type: 'code' | 'hash') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      }
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const handleDownloadQR = () => {
    const qrImage = document.querySelector('#qr-code-image img') as HTMLImageElement;
    
    if (qrImage && qrImage.src) {
      const link = document.createElement('a');
      link.download = `QR_${lot.numero_lot.replace(/\s+/g, '_')}.png`;
      link.href = qrImage.src;
      link.click();
    }
  };

  const handlePrintQR = () => {
    const qrImage = document.querySelector('#qr-code-image img') as HTMLImageElement;
    
    if (qrImage && qrImage.src) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code - ${lot.numero_lot}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  font-family: 'Courier New', monospace;
                  background: white;
                }
                .qr-container {
                  text-align: center;
                  padding: 40px;
                  border: 2px solid #000;
                  background: white;
                }
                h2 {
                  margin-bottom: 20px;
                  font-size: 24px;
                  font-weight: bold;
                  text-transform: uppercase;
                  color: #000;
                }
                .qr-code {
                  padding: 20px;
                  border: 1px solid #ccc;
                  display: inline-block;
                  margin-bottom: 20px;
                }
                .lot-info {
                  margin-top: 20px;
                  font-size: 14px;
                  color: #333;
                  text-align: left;
                }
                .lot-info p {
                  margin: 5px 0;
                }
                .hash {
                  font-size: 10px;
                  color: #666;
                  max-width: 350px;
                  word-break: break-all;
                  font-family: 'Courier New', monospace;
                }
                .verified {
                  margin-top: 15px;
                  padding: 10px;
                  background: #f0fdf4;
                  border: 1px solid #22c55e;
                  color: #166534;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { border: 2px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>${lot.medicament?.nom || 'Médicament'}</h2>
                <div class="qr-code">
                  <img src="${qrImage.src}" alt="QR Code" width="300" height="300" />
                </div>
                <div class="lot-info">
                  <p><strong>Lot N°:</strong> ${lot.numero_lot}</p>
                  <p><strong>Code unique:</strong> ${lot.code_unique}</p>
                  <p><strong>Fabrication:</strong> ${new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Expiration:</strong> ${new Date(lot.date_expiration).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Quantité:</strong> ${lot.quantite_totale} unités</p>
                  <p class="hash"><strong>Hash:</strong><br/>${lot.hash_lot}</p>
                </div>
                <div class="verified">
                  ✓ LOT VÉRIFIÉ ET AUTHENTIQUE
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 100);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-white shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-green-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <QrCode className="h-6 w-6 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                  QR Code du lot
                </h3>
                <p className="text-sm text-green-100">
                  {lot.medicament?.nom}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border">
                <div id="qr-code-image">
                  {qrValue && <QRCodeGenerator value={qrValue} size={250} />}
                </div>
              </div>
            </div>

            {/* Informations du lot */}
            <div className="space-y-3">
              {/* Numéro de lot */}
              <div className="border p-3">
                <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                  Numéro de lot
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg font-bold text-gray-900">
                    {lot.numero_lot}
                  </div>
                  <button
                    onClick={() => handleCopy(lot.numero_lot, 'code')}
                    className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                    title="Copier le numéro de lot"
                  >
                    {copied ? (
                      <FaCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <FaCopy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code unique */}
              <div className="border p-3">
                <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                  Code unique
                </div>
                <div className="font-mono text-sm text-gray-700 break-all">
                  {lot.code_unique}
                </div>
              </div>

              {/* Hash blockchain */}
              <div className="border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600 uppercase">
                    Hash Blockchain
                  </span>
                  <button
                    onClick={() => handleCopy(lot.hash_lot, 'hash')}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                    title="Copier le hash"
                  >
                    {copiedHash ? (
                      <FaCheck className="h-3 w-3 text-green-600" />
                    ) : (
                      <FaCopy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-gray-700 break-all bg-gray-50 p-2 border">
                  {lot.hash_lot}
                </div>
              </div>

              {/* Détails supplémentaires */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border p-3">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                    Date de fabrication
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="border p-3">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                    Date d'expiration
                  </div>
                  <div className={`text-sm font-medium ${
                    new Date(lot.date_expiration) < new Date() 
                      ? 'text-red-600' 
                      : 'text-gray-900'
                  }`}>
                    {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Quantité */}
              <div className="border p-3">
                <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                  Quantité totale
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {lot.quantite_totale.toLocaleString()} unités
                </div>
              </div>

              {/* Statut de vérification */}
              <div className="border border-green-600 bg-green-50 p-3">
                <div className="flex items-center space-x-2">
                  <FaCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-green-900 uppercase">
                    Lot vérifié et authentique
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
            <button
              type="button"
              onClick={handlePrintQR}
              className="px-6 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider bg-white border hover:bg-gray-100 transition-colors"
            >
              <FaPrint className="inline mr-2 h-4 w-4" />
              Imprimer
            </button>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-green-600 border border-green-800 hover:bg-green-700 transition-colors"
            >
              <FaDownload className="inline mr-2 h-4 w-4" />
              Télécharger QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}