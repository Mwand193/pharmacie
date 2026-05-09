
// // // app/api/tunnel/route.ts
// // import { NextResponse } from 'next/server';
// // import { exec } from 'child_process';
// // import { promisify } from 'util';

// // const execAsync = promisify(exec);

// // // Variable pour suivre l'état du tunnel
// // let tunnelProcess: any = null;
// // let currentUrl: string | null = null;

// // // Fonction pour installer cloudflared via winget
// // async function installCloudflared(): Promise<boolean> {
// //   try {
// //     console.log('🔧 Installation de cloudflared via winget...');
    
// //     // Vérifier si winget est disponible
// //     await execAsync('winget --version');
    
// //     // Installer cloudflared
// //     await execAsync('winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements');
    
// //     console.log('✅ Cloudflared installé avec succès');
// //     return true;
// //   } catch (error: any) {
// //     console.error('❌ Erreur installation cloudflared:', error.message);
    
// //     // Si winget n'est pas disponible, essayer avec PowerShell
// //     try {
// //       console.log('🔄 Tentative d\'installation via PowerShell...');
      
// //       await execAsync('powershell -Command "winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements"');
      
// //       console.log('✅ Cloudflared installé avec succès via PowerShell');
// //       return true;
// //     } catch (psError: any) {
// //       console.error('❌ Échec installation via PowerShell:', psError.message);
// //       return false;
// //     }
// //   }
// // }

// // // Fonction pour vérifier/corriger la présence dans le PATH
// // async function verifyCloudflaredInPath(): Promise<boolean> {
// //   try {
// //     // Vérifier si cloudflared est accessible
// //     await execAsync('cloudflared --version');
// //     return true;
// //   } catch {
// //     // Essayer de trouver cloudflared manuellement
// //     try {
// //       await execAsync('where cloudflared');
// //       return true;
// //     } catch {
// //       // Chercher dans les emplacements communs de winget
// //       try {
// //         const wingetPaths = [
// //           '%LOCALAPPDATA%\\Microsoft\\WinGet\\Packages\\Cloudflare.cloudflared_*',
// //           '%PROGRAMFILES%\\cloudflared\\cloudflared.exe',
// //           '%USERPROFILE%\\AppData\\Local\\Programs\\cloudflared\\cloudflared.exe'
// //         ];
        
// //         for (const path of wingetPaths) {
// //           try {
// //             await execAsync(`"${path}" --version`);
// //             console.log('✅ Cloudflared trouvé à:', path);
// //             return true;
// //           } catch {
// //             continue;
// //           }
// //         }
// //       } catch {
// //         // Ignorer
// //       }
      
// //       return false;
// //     }
// //   }
// // }

// // // Fonction pour installer les dépendances automatiquement
// // async function setupCloudflaredDependencies(): Promise<void> {
// //   try {
// //     console.log('📦 Vérification des dépendances...');
    
// //     // Vérifier si C++ Redistributable est installé (nécessaire pour winget)
// //     try {
// //       await execAsync('powershell -Command "Get-ItemProperty HKLM:\\Software\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64"');
// //     } catch {
// //       console.log('⚠️ Visual C++ Redistributable pourrait être nécessaire');
// //       console.log('   Téléchargez-le depuis: https://aka.ms/vs/17/release/vc_redist.x64.exe');
// //     }
// //   } catch (error) {
// //     console.warn('⚠️ Erreur vérification dépendances:', error);
// //   }
// // }

// // export async function POST() {
// //   try {
// //     // Vérifier si Windows
// //     if (process.platform !== 'win32') {
// //       return NextResponse.json(
// //         { error: 'Cette installation automatique est conçue pour Windows. Pour Mac/Linux, utilisez les commandes appropriées.' },
// //         { status: 400 }
// //       );
// //     }

// //     // Installer les dépendances si nécessaire
// //     await setupCloudflaredDependencies();

// //     // Vérifier si cloudflared est installé
// //     let isInstalled = await verifyCloudflaredInPath();
    
// //     // Si pas installé, tenter l'installation
// //     if (!isInstalled) {
// //       console.log('📥 Cloudflared non trouvé, tentative d\'installation...');
      
// //       const installSuccess = await installCloudflared();
      
// //       if (!installSuccess) {
// //         return NextResponse.json({
// //           error: 'Cloudflared n\'a pas pu être installé automatiquement.',
// //           instructions: {
// //             title: 'Installation manuelle requise',
// //             steps: [
// //               'Option 1 (winget): winget install --id Cloudflare.cloudflared',
// //               'Option 2 (Chocolatey): choco install cloudflared',
// //               'Option 3 (Téléchargement): https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/',
// //               'Puis redémarrez cette requête'
// //             ]
// //           }
// //         }, { status: 500 });
// //       }
      
// //       // Attendre que l'installation soit complète et le PATH mis à jour
// //       await new Promise(resolve => setTimeout(resolve, 3000));
// //     }

// //     // Vérifier à nouveau
// //     const cloudflaredAvailable = await verifyCloudflaredInPath();
// //     if (!cloudflaredAvailable) {
// //       return NextResponse.json({
// //         error: 'Cloudflared est installé mais n\'est pas accessible. Redémarrez votre terminal ou ajoutez-le manuellement au PATH.'
// //       }, { status: 500 });
// //     }

// //     // Si un tunnel existe déjà, retourner son URL
// //     if (currentUrl && tunnelProcess) {
// //       return NextResponse.json({ url: currentUrl });
// //     }

// //     // Démarrer un nouveau tunnel
// //     const port = process.env.PORT || 3000;
    
// //     console.log(`🚀 Démarrage du tunnel sur le port ${port}...`);
    
// //     return new Promise((resolve) => {
// //       const child = exec(
// //         `cloudflared tunnel --url http://localhost:${port}`,
// //         {
// //           windowsHide: true // Masquer la fenêtre sur Windows
// //         },
// //         (error, stdout, stderr) => {
// //           if (error && !error.killed) {
// //             console.error('Erreur tunnel:', error);
// //             resolve(
// //               NextResponse.json(
// //                 { error: 'Erreur lors de la création du tunnel: ' + stderr },
// //                 { status: 500 }
// //               )
// //             );
// //           }
// //         }
// //       );

// //       // Écouter la sortie pour capturer l'URL
// //       let outputBuffer = '';
      
// //       child.stdout?.on('data', (data: string) => {
// //         outputBuffer += data;
        
// //         // Rechercher l'URL dans la sortie
// //         const urlMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
// //         if (urlMatch && !currentUrl) {
// //           currentUrl = urlMatch[0];
// //           tunnelProcess = child;
// //           console.log('✅ Tunnel créé:', currentUrl);
// //           resolve(NextResponse.json({ url: currentUrl }));
// //         }
// //       });

// //       child.stderr?.on('data', (data: string) => {
// //         outputBuffer += data;
        
// //         // Chercher aussi dans stderr car cloudflared peut y mettre les infos
// //         const urlMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
// //         if (urlMatch && !currentUrl) {
// //           currentUrl = urlMatch[0];
// //           tunnelProcess = child;
// //           console.log('✅ Tunnel créé:', currentUrl);
// //           resolve(NextResponse.json({ url: currentUrl }));
// //         }
// //       });

// //       // Timeout après 30 secondes
// //       setTimeout(() => {
// //         if (!currentUrl) {
// //           child.kill();
// //           resolve(
// //             NextResponse.json(
// //               { error: 'Timeout: La création du tunnel a pris trop de temps' },
// //               { status: 408 }
// //             )
// //           );
// //         }
// //       }, 30000);

// //       // Gérer la fermeture du processus
// //       child.on('close', (code) => {
// //         if (code !== null && code !== 0 && !currentUrl) {
// //           resolve(
// //             NextResponse.json(
// //               { error: `Le tunnel s'est arrêté avec le code ${code}` },
// //               { status: 500 }
// //             )
// //           );
// //         }
// //       });
// //     });
// //   } catch (error: any) {
// //     console.error('Erreur API tunnel:', error);
// //     return NextResponse.json(
// //       { error: error.message || 'Erreur interne' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // Arrêter le tunnel
// // export async function DELETE() {
// //   if (tunnelProcess) {
// //     tunnelProcess.kill();
// //     tunnelProcess = null;
// //     currentUrl = null;
// //     return NextResponse.json({ message: 'Tunnel arrêté' });
// //   }
// //   return NextResponse.json({ message: 'Aucun tunnel actif' });
// // }

// // // Vérifier l'état du tunnel
// // export async function GET() {
// //   if (currentUrl && tunnelProcess) {
// //     return NextResponse.json({ 
// //       active: true, 
// //       url: currentUrl 
// //     });
// //   }
// //   return NextResponse.json({ 
// //     active: false, 
// //     url: null 
// //   });
// // }
// // app/api/tunnel/route.ts
// import { NextResponse } from 'next/server';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const execAsync = promisify(exec);

// // Variable pour suivre l'état du tunnel
// let tunnelProcess: any = null;
// let currentUrl: string | null = null;
// let tunnelStartTime: number | null = null;

// // Fonction pour installer cloudflared via winget
// async function installCloudflared(): Promise<boolean> {
//   try {
//     await execAsync('winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements');
//     return true;
//   } catch {
//     try {
//       await execAsync('powershell -Command "winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements"');
//       return true;
//     } catch {
//       return false;
//     }
//   }
// }

// // Fonction pour vérifier si cloudflared est accessible
// async function verifyCloudflaredInPath(): Promise<boolean> {
//   try {
//     await execAsync('cloudflared --version');
//     return true;
//   } catch {
//     return false;
//   }
// }

// export async function POST() {
//   try {
//     // Si un tunnel existe déjà, vérifier qu'il tourne encore
//     if (currentUrl && tunnelProcess) {
//       try {
//         process.kill(tunnelProcess.pid!, 0);
//         return NextResponse.json({ 
//           url: currentUrl,
//           status: 'active',
//           startedAt: tunnelStartTime
//         });
//       } catch {
//         currentUrl = null;
//         tunnelProcess = null;
//         tunnelStartTime = null;
//       }
//     }

//     // Vérifier si Windows
//     if (process.platform !== 'win32') {
//       return NextResponse.json(
//         { error: 'Cette installation est conçue pour Windows.' },
//         { status: 400 }
//       );
//     }

//     // Vérifier/corriger l'installation de cloudflared
//     let isInstalled = await verifyCloudflaredInPath();
    
//     if (!isInstalled) {
//       const installSuccess = await installCloudflared();
      
//       if (!installSuccess) {
//         return NextResponse.json({
//           error: 'Cloudflared n\'a pas pu être installé automatiquement.',
//           instructions: {
//             title: 'Installation manuelle requise',
//             steps: [
//               'winget install --id Cloudflare.cloudflared',
//               'Ou téléchargez: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'
//             ]
//           }
//         }, { status: 500 });
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 3000));
//     }

//     const cloudflaredAvailable = await verifyCloudflaredInPath();
//     if (!cloudflaredAvailable) {
//       return NextResponse.json({
//         error: 'Cloudflared est installé mais n\'est pas accessible. Redémarrez votre terminal.'
//       }, { status: 500 });
//     }

//     // Démarrer un nouveau tunnel
//     const port = process.env.PORT || 3000;
    
//     return new Promise((resolve) => {
//       const child = exec(
//         `cloudflared tunnel --url http://localhost:${port} --no-autoupdate`,
//         {
//           windowsHide: true,
//           maxBuffer: 1024 * 1024 * 10
//         }
//       );

//       let outputBuffer = '';
//       let resolved = false;

//       const handleOutput = (data: string) => {
//         outputBuffer += data;
        
//         // Chercher l'URL trycloudflare.com
//         const urlMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        
//         if (urlMatch && !resolved) {
//           resolved = true;
//           const url = urlMatch[0];
          
//           currentUrl = url;
//           tunnelProcess = child;
//           tunnelStartTime = Date.now();
          
//           // Seul log important
//           console.log(`✅ Tunnel: ${url}`);
          
//           resolve(NextResponse.json({ 
//             url: url,
//             status: 'active',
//             startedAt: tunnelStartTime
//           }));
//         }
//       };

//       child.stdout?.on('data', handleOutput);
//       child.stderr?.on('data', handleOutput);

//       // Timeout après 30 secondes
//       setTimeout(() => {
//         if (!resolved) {
//           const lastMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
//           if (lastMatch) {
//             const url = lastMatch[0];
//             currentUrl = url;
//             tunnelProcess = child;
//             tunnelStartTime = Date.now();
//             resolved = true;
            
//             console.log(`✅ Tunnel: ${url}`);
//             resolve(NextResponse.json({ 
//               url: url,
//               status: 'active',
//               startedAt: tunnelStartTime
//             }));
//           } else {
//             child.kill();
//             resolve(
//               NextResponse.json(
//                 { error: 'Timeout: Impossible de créer le tunnel.' },
//                 { status: 408 }
//               )
//             );
//           }
//         }
//       }, 30000);

//       child.on('error', (err) => {
//         if (!resolved) {
//           resolved = true;
//           resolve(
//             NextResponse.json(
//               { error: 'Erreur cloudflared: ' + err.message },
//               { status: 500 }
//             )
//           );
//         }
//       });

//       child.on('close', (code) => {
//         if (code !== 0 && !resolved) {
//           resolved = true;
//           resolve(
//             NextResponse.json(
//               { error: `Tunnel arrêté (code ${code}).` },
//               { status: 500 }
//             )
//           );
//         }
//         if (currentUrl === (outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)?.[0])) {
//           currentUrl = null;
//           tunnelProcess = null;
//           tunnelStartTime = null;
//         }
//       });
//     });
//   } catch (error: any) {
//     console.error('Erreur tunnel:', error.message);
//     return NextResponse.json(
//       { error: error.message || 'Erreur interne' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE() {
//   if (tunnelProcess) {
//     try {
//       tunnelProcess.kill('SIGTERM');
//       if (process.platform === 'win32') {
//         exec(`taskkill /pid ${tunnelProcess.pid} /T /F`).catch(() => {});
//       }
//     } catch {}
//     tunnelProcess = null;
//     currentUrl = null;
//     tunnelStartTime = null;
//     console.log('🔴 Tunnel arrêté');
//     return NextResponse.json({ message: 'Tunnel arrêté' });
//   }
//   return NextResponse.json({ message: 'Aucun tunnel actif' });
// }

// export async function GET() {
//   if (currentUrl && tunnelProcess) {
//     try {
//       process.kill(tunnelProcess.pid!, 0);
//       return NextResponse.json({ 
//         active: true, 
//         url: currentUrl,
//         startedAt: tunnelStartTime,
//         uptime: tunnelStartTime ? Math.floor((Date.now() - tunnelStartTime) / 1000) : 0
//       });
//     } catch {
//       currentUrl = null;
//       tunnelProcess = null;
//       tunnelStartTime = null;
//     }
//   }
  
//   return NextResponse.json({ active: false, url: null });
// }
// app/api/tunnel/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Variable pour suivre l'état du tunnel
let tunnelProcess: any = null;
let currentUrl: string | null = null;
let tunnelStartTime: number | null = null;

// Fonction pour installer cloudflared via winget
async function installCloudflared(): Promise<boolean> {
  try {
    await execAsync('winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements');
    return true;
  } catch {
    try {
      await execAsync('powershell -Command "winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements"');
      return true;
    } catch {
      return false;
    }
  }
}

// Fonction pour vérifier si cloudflared est accessible
async function verifyCloudflaredInPath(): Promise<boolean> {
  try {
    await execAsync('cloudflared --version');
    return true;
  } catch {
    return false;
  }
}

export async function POST() {
  try {
    // Si un tunnel existe déjà, vérifier qu'il tourne encore
    if (currentUrl && tunnelProcess) {
      try {
        process.kill(tunnelProcess.pid!, 0);
        return NextResponse.json({ 
          url: currentUrl,
          status: 'active',
          startedAt: tunnelStartTime
        });
      } catch {
        currentUrl = null;
        tunnelProcess = null;
        tunnelStartTime = null;
      }
    }

    // Vérifier si Windows
    if (process.platform !== 'win32') {
      return NextResponse.json(
        { error: 'Cette installation est conçue pour Windows.' },
        { status: 400 }
      );
    }

    // Vérifier/corriger l'installation de cloudflared
    let isInstalled = await verifyCloudflaredInPath();
    
    if (!isInstalled) {
      const installSuccess = await installCloudflared();
      
      if (!installSuccess) {
        return NextResponse.json({
          error: 'Cloudflared n\'a pas pu être installé automatiquement.',
          instructions: {
            title: 'Installation manuelle requise',
            steps: [
              'winget install --id Cloudflare.cloudflared',
              'Ou téléchargez: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'
            ]
          }
        }, { status: 500 });
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const cloudflaredAvailable = await verifyCloudflaredInPath();
    if (!cloudflaredAvailable) {
      return NextResponse.json({
        error: 'Cloudflared est installé mais n\'est pas accessible. Redémarrez votre terminal.'
      }, { status: 500 });
    }

    // Démarrer un nouveau tunnel
    const port = process.env.PORT || 3000;
    
    return new Promise((resolve) => {
      const child = exec(
        `cloudflared tunnel --url http://localhost:${port} --no-autoupdate`,
        {
          windowsHide: true,
          maxBuffer: 1024 * 1024 * 10
        }
      );

      let outputBuffer = '';
      let resolved = false;

      const handleOutput = (data: string) => {
        outputBuffer += data;
        
        // Chercher l'URL trycloudflare.com
        const urlMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        
        if (urlMatch && !resolved) {
          resolved = true;
          const url = urlMatch[0];
          
          currentUrl = url;
          tunnelProcess = child;
          tunnelStartTime = Date.now();
          
          console.log(`✅ Tunnel: ${url}`);
          
          resolve(NextResponse.json({ 
            url: url,
            status: 'active',
            startedAt: tunnelStartTime
          }));
        }
      };

      child.stdout?.on('data', handleOutput);
      child.stderr?.on('data', handleOutput);

      // Timeout après 30 secondes
      setTimeout(() => {
        if (!resolved) {
          const lastMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
          if (lastMatch) {
            const url = lastMatch[0];
            currentUrl = url;
            tunnelProcess = child;
            tunnelStartTime = Date.now();
            resolved = true;
            console.log(`✅ Tunnel: ${url}`);
            resolve(NextResponse.json({ 
              url: url,
              status: 'active',
              startedAt: tunnelStartTime
            }));
          } else {
            child.kill();
            resolve(
              NextResponse.json(
                { error: 'Timeout: Impossible de créer le tunnel.' },
                { status: 408 }
              )
            );
          }
        }
      }, 30000);

      child.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          resolve(
            NextResponse.json(
              { error: 'Erreur cloudflared: ' + err.message },
              { status: 500 }
            )
          );
        }
      });

      child.on('close', (code) => {
        if (code !== 0 && !resolved) {
          resolved = true;
          resolve(
            NextResponse.json(
              { error: `Tunnel arrêté (code ${code}).` },
              { status: 500 }
            )
          );
        }
        if (currentUrl === (outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)?.[0])) {
          currentUrl = null;
          tunnelProcess = null;
          tunnelStartTime = null;
        }
      });
    });
  } catch (error: any) {
    console.error('Erreur tunnel:', error.message);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
      
      // Forcer l'arrêt sur Windows
      if (process.platform === 'win32') {
        try {
          const killProcess = exec(`taskkill /pid ${tunnelProcess.pid} /T /F`);
          // Ignorer les erreurs de taskkill
          killProcess.on('error', () => {});
          killProcess.stderr?.on('data', () => {});
        } catch {
          // Ignorer si taskkill échoue
        }
      }
    } catch {
      // Ignorer les erreurs
    }
    
    tunnelProcess = null;
    currentUrl = null;
    tunnelStartTime = null;
    console.log('🔴 Tunnel arrêté');
    return NextResponse.json({ message: 'Tunnel arrêté' });
  }
  return NextResponse.json({ message: 'Aucun tunnel actif' });
}

export async function GET() {
  if (currentUrl && tunnelProcess) {
    try {
      process.kill(tunnelProcess.pid!, 0);
      return NextResponse.json({ 
        active: true, 
        url: currentUrl,
        startedAt: tunnelStartTime,
        uptime: tunnelStartTime ? Math.floor((Date.now() - tunnelStartTime) / 1000) : 0
      });
    } catch {
      currentUrl = null;
      tunnelProcess = null;
      tunnelStartTime = null;
    }
  }
  
  return NextResponse.json({ active: false, url: null });
}