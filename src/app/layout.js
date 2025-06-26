import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dubai Travel Agent - AI Assistant',
  description: 'Inteligentny asystent dla biura podróży specjalizującego się w wyjazdach do Dubaju',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">
                      🏙️ Dubai Travel Agent
                    </h1>
                  </div>
                  <div className="ml-10 flex items-baseline space-x-4">
                    <a
                      href="/dashboard"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/dashboard/emails"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Emaile
                    </a>
                    <a
                      href="/dashboard/clients"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Klienci
                    </a>
                    <a
                      href="/dashboard/knowledge"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Baza wiedzy
                    </a>
                    <a
                      href="/dashboard/learning"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      🧠 Uczenie AI
                    </a>
                    <a
                      href="/dashboard/settings"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Ustawienia
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 