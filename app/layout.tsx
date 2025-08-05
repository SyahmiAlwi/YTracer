import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { MouseFollower } from "@/components/mouse-follower"
import { ThemeToggle } from "@/components/theme-toggle"
import { Navigation } from "@/components/navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YTracker - YouTube Premium Family Tracker",
  description: "Manage and track payments for your YouTube Premium family subscription.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>

        
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <main className="flex min-h-screen flex-col">

            <header className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="YTracker Logo" 
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  YTracker
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </header>
            <Navigation />
            <div className="flex-1 pb-20 md:pb-0">
              {children}
            </div>
          </main>
        </ThemeProvider>
        <MouseFollower />
      </body>
    </html>
  )
}
