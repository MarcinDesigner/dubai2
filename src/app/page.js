import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏙️ Dubai Travel AI Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inteligentny system zarządzania emailami dla biura podróży. 
            Automatyczne odpowiedzi AI, analiza klientów i zarządzanie bazą wiedzy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📧 Zarządzanie Emailami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatyczne pobieranie, kategoryzacja i odpowiadanie na emaile klientów 
                z wykorzystaniem AI Claude.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Inteligentne Odpowiedzi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI Claude generuje spersonalizowane odpowiedzi w różnych językach, 
                dostosowane do potrzeb klienta.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Analiza Klientów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Zaawansowana analiza sentymentu, prawdopodobieństwa zakupu 
                i profilowania klientów.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧠 Baza Wiedzy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Zarządzanie informacjami o hotelach, atrakcjach i ofercie 
                dla lepszych odpowiedzi AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚨 Alerty Zakupowe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatyczne powiadomienia o potencjalnych klientach 
                z wysoką prawdopodobieństwem zakupu.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Konfiguracja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Elastyczne ustawienia AI, szablonów odpowiedzi 
                i parametrów systemu.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 Panel Zarządzania
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/dashboard" className="block">
              <div className="bg-blue-50 hover:bg-blue-100 rounded-lg p-6 text-center transition-colors border-2 border-transparent hover:border-blue-200">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600">Przegląd statystyk i aktywności</p>
              </div>
            </Link>

            <Link href="/dashboard/emails" className="block">
              <div className="bg-green-50 hover:bg-green-100 rounded-lg p-6 text-center transition-colors border-2 border-transparent hover:border-green-200">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="font-semibold text-gray-900">Emaile</h3>
                <p className="text-sm text-gray-600">Zarządzanie emailami klientów</p>
              </div>
            </Link>

            <Link href="/dashboard/knowledge" className="block">
              <div className="bg-purple-50 hover:bg-purple-100 rounded-lg p-6 text-center transition-colors border-2 border-transparent hover:border-purple-200">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-semibold text-gray-900">Baza Wiedzy</h3>
                <p className="text-sm text-gray-600">Zarządzanie informacjami</p>
              </div>
            </Link>

            <Link href="/dashboard/purchase-alerts" className="block">
              <div className="bg-orange-50 hover:bg-orange-100 rounded-lg p-6 text-center transition-colors border-2 border-transparent hover:border-orange-200">
                <div className="text-3xl mb-2">🚨</div>
                <h3 className="font-semibold text-gray-900">Alerty</h3>
                <p className="text-sm text-gray-600">Powiadomienia o zakupach</p>
              </div>
            </Link>

            <Link href="/dashboard/settings" className="block">
              <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 text-center transition-colors border-2 border-transparent hover:border-gray-200">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900">Ustawienia</h3>
                <p className="text-sm text-gray-600">Konfiguracja systemu</p>
              </div>
            </Link>

            <Link href="/api/ai-status" className="block">
              <div className="bg-indigo-50 hover:bg-indigo-100 rounded-lg p-6 text-center transition-colors border-2 border-transparent hover:border-indigo-200">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-semibold text-gray-900">Status AI</h3>
                <p className="text-sm text-gray-600">Sprawdź konfigurację</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p className="mb-2">
            **Powered by Claude AI, Next.js, and ❤️**
          </p>
          <p className="text-sm">
            Wersja 2.0 - Profesjonalny system zarządzania emailami dla biur podróży
          </p>
        </div>
      </div>
    </div>
  )
} 