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
                📧 Email Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Automatyczne pobieranie i przetwarzanie emaili klientów z inteligentną kategoryzacją.
              </p>
              <Link href="/dashboard/emails" className="text-blue-600 hover:text-blue-800 font-medium">
                Zarządzaj emailami →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Claude AI Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Inteligentne odpowiedzi AI w 7+ językach z wykorzystaniem bazy wiedzy o Dubaju.
              </p>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                Zobacz dashboard →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Kompletna baza wiedzy o Dubaju: hotele, atrakcje, transport, praktyczne informacje.
              </p>
              <Link href="/dashboard/knowledge" className="text-blue-600 hover:text-blue-800 font-medium">
                Zarządzaj bazą wiedzy →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Szczegółowe statystyki, analiza sentymentu i insights o zachowaniach klientów.
              </p>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                Zobacz statystyki →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌍 Multi-language Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Obsługa 7 języków z automatycznym wykrywaniem i dostosowaniem odpowiedzi.
              </p>
              <Link href="/dashboard/settings" className="text-blue-600 hover:text-blue-800 font-medium">
                Konfiguruj języki →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Settings & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Pełna konfiguracja Claude AI, email processing i wszystkich funkcji systemu.
              </p>
              <Link href="/dashboard/settings" className="text-blue-600 hover:text-blue-800 font-medium">
                Otwórz ustawienia →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/dashboard/emails" className="block">
              <div className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors">
                <div className="text-2xl mb-2">📧</div>
                <div className="font-medium text-blue-900">Check Emails</div>
                <div className="text-sm text-blue-700">View recent emails</div>
              </div>
            </Link>

            <Link href="/dashboard/knowledge" className="block">
              <div className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center transition-colors">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-green-900">Manage Knowledge</div>
                <div className="text-sm text-green-700">Update information</div>
              </div>
            </Link>

            <Link href="/dashboard/settings" className="block">
              <div className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center transition-colors">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-medium text-purple-900">Configure System</div>
                <div className="text-sm text-purple-700">Adjust settings</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔧 System Status
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-medium text-gray-900">Claude AI</div>
              <div className="text-sm text-gray-600">Intelligent response generation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Analytics</div>
              <div className="text-sm text-gray-600">Real-time insights & reporting</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="mb-2">
            <strong>Dubai Travel AI Agent</strong> - Powered by Claude AI & Next.js
          </p>
          <p className="text-sm">
            Your intelligent assistant for Dubai travel customer service
          </p>
        </div>
      </div>
    </div>
  )
} 