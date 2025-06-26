import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏙️ Dubai Travel Agent
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Inteligentny asystent AI dla biura podróży specjalizującego się w wyjazdach do Dubaju
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Przejdź do Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Assistant
              </CardTitle>
              <CardDescription>
                Automatyczne odpowiedzi w 7 językach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Wykrywanie języka zapytania</li>
                <li>• Analiza sentymentu klienta</li>
                <li>• Predykcja prawdopodobieństwa zakupu</li>
                <li>• Spersonalizowane rekomendacje</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Analytics
              </CardTitle>
              <CardDescription>
                Zaawansowana analityka klientów
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Profile behawioralne klientów</li>
                <li>• Segmentacja wartości</li>
                <li>• Analiza trendów zapytań</li>
                <li>• Optymalizacja konwersji</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Smart Escalation
              </CardTitle>
              <CardDescription>
                Inteligentne przekazywanie do człowieka
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Automatyczne wykrywanie problemów</li>
                <li>• Priorytetyzacja VIP klientów</li>
                <li>• Alerty dla negatywnych emocji</li>
                <li>• Notyfikacje w czasie rzeczywistym</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Funkcjonalności
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">🔄 Automatyzacja</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Integracja z Gmail API</li>
                <li>• Automatyczne odpowiedzi</li>
                <li>• Wielojęzyczność (PL, EN, DE, FR, ES, IT, RU)</li>
                <li>• Baza wiedzy o Dubaju</li>
                <li>• Personalizacja na podstawie historii</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">📈 Analityka AI</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Analiza sentymentu w czasie rzeczywistym</li>
                <li>• Predykcja prawdopodobieństwa zakupu</li>
                <li>• Scoring klientów (lojalność, wartość)</li>
                <li>• Rekomendacje upselling</li>
                <li>• Insights dla optymalizacji biznesu</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600">
            Powered by OpenAI GPT-4, Next.js, Prisma & PostgreSQL
          </p>
        </div>
      </div>
    </div>
  )
} 