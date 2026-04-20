import './globals.css'

export const metadata = {
  title: 'BollyHitster - The Bollywood Music Timeline Game',
  description: 'Test your Bollywood music knowledge! Guess release years and build your timeline.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise-overlay">
        <div className="min-h-screen bg-gradient-to-br from-bollywood-dark via-[#0d0d15] to-bollywood-dark">
          {children}
        </div>
      </body>
    </html>
  )
}
