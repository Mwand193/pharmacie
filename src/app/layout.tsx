export const dynamic = 'force-dynamic';

import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className='bg-red-600 overscroll-y-auto dark:to-gray-800'>
       
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
