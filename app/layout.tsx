import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cars Json',
  description: 'Cars Json',
  generator: 'Cars Json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
