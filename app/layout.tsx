import './globals.css'

export const metadata = {
  title: 'PinLeads Status',
  description: 'Uptime monitoring for PinLeads.org',
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
