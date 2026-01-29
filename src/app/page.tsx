// // app/page.tsx

// export default function Home() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4">
//       <main className="max-w-md text-center">
//         <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
//           Bonjour
//         </h1>
//         <p className="text-gray-500 text-lg font-light">
//           Page d&apos;accueil minimaliste
//         </p>
//       </main>
//       <footer className="absolute bottom-8">
//         <p className="text-sm text-gray-400 font-light">—</p>
//       </footer>
//     </div>
//   );
// }
// app/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  redirect('/student');
  
  // Le code ci-dessous ne sera jamais exécuté
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
          Bonjour
        </h1>
        <p className="text-gray-500 text-lg cypher font-light">
          Veuiller vous connecter pour continuer.
        </p>
        <Link href="/login" className="mt-4 px-5 py-3 inline-block text-white bg-black rounded-full hover:underline">
          Aller à la page de connexion
        </Link>
      </main>
      <footer className="absolute bottom-8">
        <p className="text-sm text-gray-400 font-light">—</p>
      </footer>
    </div>
  );
}