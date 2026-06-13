import './globals.css'

export const metadata = {
  title: 'PinLeads Status - Uptime Monitoring',
  description: 'Real-time uptime monitoring and status updates for PinLeads.org services',
  keywords: 'uptime, status, monitoring, PinLeads, service status',
  authors: [{ name: 'PinLeads' }],
  creator: 'PinLeads',
  metadataBase: new URL('https://status.pinleads.org'),
  openGraph: {
    title: 'PinLeads Status - Uptime Monitoring',
    description: 'Real-time uptime monitoring and status updates for PinLeads.org services',
    url: 'https://status.pinleads.org',
    siteName: 'PinLeads Status',
    images: [
      {
        url: '/socialBanner.png',
        width: 1200,
        height: 630,
        alt: 'PinLeads Status',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PinLeads Status | Uptime Monitoring',
    description: 'Real-time uptime monitoring and status updates for PinLeads.org services',
    images: ['/socialBanner.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
