import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'tailwindcss/tailwind.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Management',
  description: 'Organization and project management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
