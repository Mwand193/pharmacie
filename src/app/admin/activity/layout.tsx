
export const dynamic = 'force-dynamic';

import Navigation from '@/components/Navigation'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <>
          
                <Navigation />
                {children}
             
              </>
  )
}