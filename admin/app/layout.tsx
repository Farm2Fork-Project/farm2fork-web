import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Farm2Fork Admin — Supply Chain Management',
  description: 'Admin dashboard for Farm2Fork supply chain logistics, marketplace management, harvest tracking, and smart price advisory.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
