## 14. Enhanced Dashboard API (src/app/api/dashboard/enhanced-stats/route.js)
```javascript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic stats
    const totalEmails = await prisma.email.count();
    const pendingEmails = await prisma.email.count({
      where: { status: 'PENDING' }
    });
    const respondedEmails = await prisma.email.count({
      where: { status: 'RESPONDED' }
    });
    const escalatedEmails = await prisma.email.count({
      where: { status: 'ESCALATED' }
    });

    // AI-enhanced stats
    const conversations = await prisma.conversation.findMany({
      where: {
        createdAt: { gte: yesterday }
      },
      include: {
        email: true
      }
    });

    // High-value leads (purchase probability > 70%)
    const highValueLeads = await prisma.conversation.count({
      where: {
        purchaseProbability: { gte: 0.7 },
        createdAt: { gte: weekAgo }
      }
    });

    // Average purchase probability
    const avgPurchaseResult = await prisma.conversation.aggregate({
      where: {
        purchaseProbability: { not: null },
        createdAt: { gte: weekAgo }
      },
      _avg: {
        purchaseProbability: true
      }
    });

    // Sentiment breakdown
    const sentimentCounts = await prisma.conversation.groupBy({
      by: ['sentiment'],
      where: {
        createdAt: { gte: yesterday },
        sentiment: { not: null }
      },
      _count: {
        sentiment: true
      }
    });

    const sentimentBreakdown = sentimentCounts.reduce((acc, item) => {
      acc[item.sentiment] = item._count.sentiment;
      return acc;
    }, {});

    // Response time calculation
    const emailsWithResponse = await prisma.email.findMany({
      where: {
        responded: true,
        createdAt: { gte: weekAgo }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const avgResponseTime = emailsWithResponse.length > 0 
      ? emailsWithResponse.reduce((sum, email) => {
          const responseTime = (email.updatedAt.getTime() - email.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + responseTime;
        }, 0) / emailsWithResponse.length 
      : 0;

    // Recent emails with AI insights
    const recentEmails = await prisma.email.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          select: {
            language: true,
            sentiment: true,
            priority: true,
            purchaseProbability: true,
            escalated: true
          }
        }
      }
    });

    // Generate AI insights
    const aiInsights = await generateAIInsights(conversations, sentimentBreakdown, highValueLeads);

    const stats = {
      totalEmails,
      pendingEmails,
      respondedEmails,
      escalatedEmails,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgPurchaseProbability: avgPurchaseResult._avg.purchaseProbability || 0,
      highValueLeads,
      sentimentBreakdown
    };

    return NextResponse.json({
      stats,
      recentEmails,
      aiInsights
    });

  } catch (error) {
    console.error('Error fetching enhanced dashboard stats:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania statystyk' },
      { status: 500 }
    );
  }
}

async function generateAIInsights(conversations, sentimentBreakdown, highValueLeads) {
  const insights = [];

  // Sentiment insights
  const negativeCount = (sentimentBreakdown.negative || 0) + (sentimentBreakdown.frustrated || 0) + (sentimentBreakdown.angry || 0);
  const totalSentiment = Object.values(sentimentBreakdown).reduce((sum, count) => sum + count, 0);
  
  if (negativeCount > totalSentiment * 0.3) {
    insights.push({
      title: "Wysoki poziom negatywnych emocji",
      description: `${Math.round(negativeCount / totalSentiment * 100)}% klientów wykazuje negatywne emocje`,
      action: "Rozważ przeszkolenie zespołu w zakresie obsługi trudnych klientów",
      type: "warning"
    });
  }

  // High-value leads insight
  if (highValueLeads > 5) {
    insights.push({
      title: "Duża liczba perspektywicznych klientów",
      description: `${highValueLeads} klientów ma wysokie prawdopodobieństwo zakupu`,
      action: "Priorytetowo skontaktuj się z tymi klientami",
      type: "opportunity"
    });
  }

  // Language diversity insight
  const languages = [...new Set(conversations.map(c => c.language).filter(Boolean))];
  if (languages.length > 3) {
    insights.push({
      title: "Międzynarodowa klientela",
      description: `Zapytania w ${languages.length} językach: ${languages.join(', ')}`,
      action: "Rozważ rozszerzenie zespołu o native speakerów",
      type: "info"
    });
  }

  // Peak time analysis
  const hourCounts = conversations.reduce((acc, conv) => {
    const hour = new Date(conv.createdAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
    count > (hourCounts[max] || 0) ? hour : max, '0');

  if (hourCounts[peakHour] > conversations.length * 0.2) {
    insights.push({
      title: "Godzina szczytu zapytań",
      description: `Najwięcej emaili otrzymujesz o ${peakHour}:00`,
      action: "Zaplanuj dostępność zespołu na te godziny",
      type: "info"
    });
  }

  // Purchase probability trends
  const avgPurchaseProb = conversations
    .filter(c => c.purchaseProbability)
    .reduce((sum, c) => sum + c.purchaseProbability, 0) / conversations.length;

  if (avgPurchaseProb > 0.6) {
    insights.push({
      title: "Wysokiej jakości leady",
      description: `Średnie prawdopodobieństwo zakupu: ${Math.round(avgPurchaseProb * 100)}%`,
      action: "Twoje strategie marketingowe działają dobrze!",
      type: "success"
    });
  } else if (avgPurchaseProb < 0.3) {
    insights.push({
      title: "Niskie prawdopodobieństwo konwersji",
      description: `Średnie prawdopodobieństwo zakupu: ${Math.round(avgPurchaseProb * 100)}%`,
      action: "Przeanalizuj źródła leadów i optymalizuj marketing",
      type: "warning"
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}
```

## 15. Client Profile Management Page (src/app/dashboard/clients/page.js)
```javascript
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, TrendingUp, Star } from 'lucide-react';

export default function ClientProfilesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients/profiles');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score > 0.7) return 'text-green-600';
    if (score > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getClientTypeIcon = (client) => {
    if (client.bookings?.length > 3) return '👑'; // VIP
    if (client.bookings?.length > 0) return '🔄'; // Returning
    return '✨'; // New
  };

  if (loading) {
    return <div className="p-6">Ładowanie profili klientów...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Klientów</h1>
        <p className="text-gray-600 mt-2">Analiza behawioralna i personalizacja obsługi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista Klientów ({clients.length})</CardTitle>
              <CardDescription>Sortowane według aktywności</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedClient?.id === client.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getClientTypeIcon(client)}</span>
                          <div className="font-medium">{client.name || client.email}</div>
                        </div>
                        <div className="text-# Dubai Travel AI Agent - Next.js Project

## Project Structure
```
dubai-travel-agent/
├── package.json
├── next.config.js
├── tailwind.config.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── dashboard/
│   │   │   ├── page.js
│   │   │   ├── emails/
│   │   │   │   └── page.js
│   │   │   ├── knowledge/
│   │   │   │   └── page.js
│   │   │   └── settings/
│   │   │       └── page.js
│   │   └── api/
│   │       ├── email/
│   │       │   ├── process/
│   │       │   │   └── route.js
│   │       │   ├── send/
│   │       │   │   └── route.js
│   │       │   └── webhook/
│   │       │       └── route.js
│   │       ├── knowledge/
│   │       │   └── route.js
│   │       └── ai/
│   │           └── route.js
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── EmailManager/
│   │   ├── KnowledgeBase/
│   │   └── ui/
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── ai.js
│   │   ├── email.js
│   │   └── utils.js
│   └── types/
└── .env.local
```

## 1. Package.json
```json
{
  "name": "dubai-travel-agent",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "node prisma/seed.js"
  }

// Funkcje pomocnicze dla lokalizacji
function getLocalizedTemplate(language) {
  const templates = {
    pl: "Dziękujemy za zainteresowanie podróżą do Dubaju. Oto informacje dotyczące Twojego zapytania:",
    en: "Thank you for your interest in traveling to Dubai. Here is the information regarding your inquiry:",
    de: "Vielen Dank für Ihr Interesse an einer Reise nach Dubai. Hier sind die Informationen zu Ihrer Anfrage:",
    fr: "Merci pour votre intérêt pour un voyage à Dubaï. Voici les informations concernant votre demande:",
    es: "Gracias por su interés en viajar a Dubai. Aquí está la información sobre su consulta:",
    it: "Grazie per il vostro interesse per un viaggio a Dubai. Ecco le informazioni riguardo alla vostra richiesta:",
    ru: "Спасибо за ваш интерес к поездке в Дубай. Вот информация по вашему запросу:"
  };
  
  return templates[language] || templates.en;
}

function getLocalizedSignature(language, defaultSignature) {
  const signatures = {
    pl: `Pozdrawiam,\nDubai Travel Assistant\n\nBiuro Podróży Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com`,
    en: `Best regards,\nDubai Travel Assistant\n\nDubai Dreams Travel Agency\nTel: +48 123 456 789\nEmail: contact@dubaitravel.com`,
    de: `Mit freundlichen Grüßen,\nDubai Travel Assistant\n\nReisebüro Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com`,
    fr: `Cordialement,\nDubai Travel Assistant\n\nAgence de Voyage Dubai Dreams\nTél: +48 123 456 789\nEmail: contact@dubaitravel.com`,
    es: `Saludos cordiales,\nDubai Travel Assistant\n\nAgencia de Viajes Dubai Dreams\nTel: +48 123 456 789\nEmail: contacto@dubaitravel.com`,
    it: `Cordiali saluti,\nDubai Travel Assistant\n\nAgenzia di Viaggi Dubai Dreams\nTel: +48 123 456 789\nEmail: contatto@dubaitravel.com`,
    ru: `С уважением,\nDubai Travel Assistant\n\nТуристическое агентство Dubai Dreams\nТел: +48 123 456 789\nEmail: kontakt@dubaitravel.com`
  };
  
  return signatures[language] || defaultSignature || signatures.en;
}

function getLocalizedSubject(language, originalSubject) {
  const prefixes = {
    pl: "Re:",
    en: "Re:",
    de: "AW:",
    fr: "Re:",
    es: "Re:",
    it: "Re:",
    ru: "Re:"
  };
  
  const prefix = prefixes[language] || "Re:";
  return `${prefix} ${originalSubject}`;
},
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "openai": "^4.0.0",
    "@google-cloud/gmail": "^4.0.0",
    "nodemailer": "^6.9.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "lucide-react": "^0.263.1",
    "recharts": "^2.8.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 2. Prisma Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Email {
  id          String   @id @default(cuid())
  messageId   String   @unique
  from        String
  to          String
  subject     String
  content     String
  processed   Boolean  @default(false)
  responded   Boolean  @default(false)
  response    String?
  status      EmailStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  conversation Conversation?
  
  @@map("emails")
}

model Conversation {
  id        String   @id @default(cuid())
  emailId   String   @unique
  clientEmail String
  topic     String?
  summary   String?
  language  String?  // Dodane pole dla języka
  sentiment String?  // Sentiment analysis result
  priority  Priority @default(MEDIUM) // Priority based on sentiment
  escalated Boolean  @default(false)  // Whether escalated to human
  purchaseProbability Float? // Predicted purchase probability (0-1)
  status    ConversationStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  email     Email    @relation(fields: [emailId], references: [id])
  messages  Message[]
  
  @@map("conversations")
}

model ClientProfile {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  phone         String?
  preferredLanguage String?
  
  // Preferences learned from conversations
  budgetRange   String?  // "budget|mid-range|luxury"
  travelStyle   String?  // "adventure|relaxation|cultural|business"
  groupSize     Int?     // Typical group size
  seasonPreference String? // "winter|summer|shoulder"
  hotelPreference String? // "beach|city|desert"
  
  // Behavioral data
  averageSpend  Float?   // Average booking value
  bookingFrequency String? // "frequent|occasional|first-time"
  responseTime  Int?     // How quickly they usually respond (hours)
  
  // Calculated scores
  loyaltyScore  Float?   // 0-1 based on repeat bookings
  valueScore    Float?   // 0-1 based on average spend
  engagementScore Float? // 0-1 based on email interactions
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  conversations Conversation[]
  interactions  ClientInteraction[]
  bookings      Booking[]
  
  @@map("client_profiles")
}

model ClientInteraction {
  id          String   @id @default(cuid())
  clientId    String
  type        InteractionType
  content     String?
  sentiment   String?  // positive|neutral|negative
  value       Float?   // Monetary value if applicable
  outcome     String?  // "booking|quote|no-action|follow-up"
  createdAt   DateTime @default(now())
  
  client      ClientProfile @relation(fields: [clientId], references: [id])
  
  @@map("client_interactions")
}

model Booking {
  id            String   @id @default(cuid())
  clientId      String
  conversationId String?
  
  destination   String
  checkIn       DateTime
  checkOut      DateTime
  guests        Int
  totalValue    Float
  status        BookingStatus
  
  // Booking details
  hotel         String?
  roomType      String?
  attractions   String[]
  transportation String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  client        ClientProfile @relation(fields: [clientId], references: [id])
  
  @@map("bookings")
}

model MLModel {
  id          String   @id @default(cuid())
  name        String   @unique
  version     String
  type        MLModelType
  accuracy    Float?
  parameters  Json?
  trainedAt   DateTime
  isActive    Boolean  @default(true)
  
  @@map("ml_models")
}

model PredictionLog {
  id          String   @id @default(cuid())
  modelName   String
  input       Json
  prediction  Json
  confidence  Float?
  actual      Json?    // For training feedback
  createdAt   DateTime @default(now())
  
  @@map("prediction_logs")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum InteractionType {
  EMAIL
  PHONE
  WHATSAPP
  BOOKING
  COMPLAINT
  INQUIRY
  FOLLOW_UP
}

enum BookingStatus {
  INQUIRY
  QUOTED
  CONFIRMED
  PAID
  COMPLETED
  CANCELLED
}

enum MLModelType {
  SENTIMENT_ANALYSIS
  PURCHASE_PREDICTION
  PRICE_OPTIMIZATION
  RECOMMENDATION
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  content        String
  sender         MessageSender
  timestamp      DateTime @default(now())
  
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  
  @@map("messages")
}

model Hotel {
  id          String   @id @default(cuid())
  name        String
  description String
  location    String
  priceRange  String
  rating      Float?
  amenities   String[]
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("hotels")
}

model Attraction {
  id          String   @id @default(cuid())
  name        String
  description String
  location    String
  category    String
  priceRange  String
  hours       String?
  rating      Float?
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("attractions")
}

model Restaurant {
  id          String   @id @default(cuid())
  name        String
  description String
  cuisine     String
  location    String
  priceRange  String
  rating      Float?
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("restaurants")
}

model KnowledgeBase {
  id          String   @id @default(cuid())
  title       String
  content     String
  category    KnowledgeCategory
  tags        String[]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("knowledge_base")
}

model AgentSettings {
  id                String   @id @default(cuid())
  emailAccount      String
  agentName         String   @default("Dubai Travel Assistant")
  responseTemplate  String
  autoReply         Boolean  @default(false)
  maxResponseTime   Int      @default(24) // hours
  workingHours      Json?
  signature         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("agent_settings")
}

enum EmailStatus {
  PENDING
  PROCESSING
  RESPONDED
  FAILED
  IGNORED
}

enum ConversationStatus {
  ACTIVE
  RESOLVED
  ESCALATED
  ARCHIVED
}

enum MessageSender {
  CLIENT
  AGENT
  SYSTEM
}

enum KnowledgeCategory {
  HOTELS
  ATTRACTIONS
  RESTAURANTS
  TRANSPORT
  WEATHER
  GENERAL
  FAQ
}
```

## 3. Database Seed (prisma/seed.js)
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Seed Hotels
  await prisma.hotel.createMany({
    data: [
      {
        name: "Burj Al Arab Jumeirah",
        description: "Luksusowy hotel na sztucznej wyspie w kształcie żagla",
        location: "Jumeirah Beach",
        priceRange: "5000-15000 AED/noc",
        rating: 5.0,
        amenities: ["Spa", "Prywatna plaża", "Butler service", "9 restauracji"],
        imageUrl: "https://example.com/burj-al-arab.jpg"
      },
      {
        name: "Atlantis The Palm",
        description: "Ikoniczny resort na palmowej wyspie z parkiem wodnym",
        location: "Palm Jumeirah",
        priceRange: "2000-8000 AED/noc",
        rating: 4.8,
        amenities: ["Aquaventure Waterpark", "Lost Chambers Aquarium", "Spa", "Prywatna plaża"],
        imageUrl: "https://example.com/atlantis.jpg"
      },
      {
        name: "Emirates Palace",
        description: "Pałacowy hotel w Abu Dhabi ze złotymi detalami",
        location: "Abu Dhabi",
        priceRange: "3000-10000 AED/noc",
        rating: 4.9,
        amenities: ["Prywatna plaża", "Spa", "Marina", "14 restauracji"],
        imageUrl: "https://example.com/emirates-palace.jpg"
      }
    ]
  });

  // Seed Attractions
  await prisma.attraction.createMany({
    data: [
      {
        name: "Burj Khalifa",
        description: "Najwyższy budynek świata z platformami widokowymi",
        location: "Downtown Dubai",
        category: "Architektura",
        priceRange: "150-500 AED",
        hours: "8:30-23:00",
        rating: 4.9
      },
      {
        name: "Dubai Mall",
        description: "Jedno z największych centrów handlowych na świecie",
        location: "Downtown Dubai",
        category: "Shopping",
        priceRange: "Bezpłatny wstęp",
        hours: "10:00-24:00",
        rating: 4.7
      },
      {
        name: "Dubai Fountain",
        description: "Spektakularne pokazy fontann przy Burj Khalifa",
        location: "Downtown Dubai",
        category: "Rozrywka",
        priceRange: "Bezpłatne",
        hours: "18:00-23:00 (pokazy co 30 min)",
        rating: 4.8
      }
    ]
  });

  // Seed Restaurants
  await prisma.restaurant.createMany({
    data: [
      {
        name: "At.mosphere",
        description: "Restauracja na 122 piętrze Burj Khalifa",
        cuisine: "Europejska",
        location: "Burj Khalifa, Downtown Dubai",
        priceRange: "500-1500 AED/osoba",
        rating: 4.8
      },
      {
        name: "Pierchic",
        description: "Ekskluzywna restauracja nad wodą",
        cuisine: "Owoce morza",
        location: "Al Qasr, Madinat Jumeirah",
        priceRange: "400-800 AED/osoba",
        rating: 4.7
      }
    ]
  });

  // Seed Knowledge Base
  await prisma.knowledgeBase.createMany({
    data: [
      {
        title: "Najlepsza pora na odwiedziny Dubaju",
        content: "Najlepszy czas na wizytę w Dubaju to okres od listopada do marca, kiedy temperatury są przyjemne (20-30°C). Unikaj letnich miesięcy (czerwiec-sierpień) ze względu na ekstremalne upały (40-45°C).",
        category: "WEATHER",
        tags: ["pogoda", "klimat", "temperatura"]
      },
      {
        title: "Transport w Dubaju",
        content: "Dubai Metro: Nowoczesny system metra z dwiema liniami (czerwona i zielona). Bilety od 3 AED. Taxi: Bardzo popularne, startowy koszt 5 AED. Uber/Careem: Dostępne aplikacje. Autobusy: Tania opcja, bilety od 2 AED.",
        category: "TRANSPORT",
        tags: ["metro", "taxi", "autobus", "transport"]
      },
      {
        title: "Dress code w Dubaju",
        content: "Dubai jest tolerancyjne, ale zaleca się skromny ubiór w miejscach publicznych. W hotelach i na plażach bikini są akceptowane. W meczetach wymagane jest zakrycie ramion i nóg.",
        category: "GENERAL",
        tags: ["ubiór", "kultura", "zasady"]
      }
    ]
  });

  // Seed Agent Settings
  await prisma.agentSettings.create({
    data: {
      emailAccount: "agent@dubaitravel.com",
      agentName: "Dubai Travel Assistant",
      responseTemplate: "Dziękujemy za zainteresowanie podróżą do Dubaju. Oto informacje dotyczące Twojego zapytania:",
      autoReply: false,
      maxResponseTime: 4,
      signature: "Pozdrawiam,\nDubai Travel Assistant\n\nBiuro Podróży Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com"
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 4. Environment Variables (.env.local)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dubai_agent"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Gmail API
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REFRESH_TOKEN="your-refresh-token"

# Email Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App Settings
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Webhook URL for Gmail
WEBHOOK_URL="https://yourdomain.com/api/email/webhook"
```

## 5. AI Service (src/lib/ai.js)
```javascript
import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function detectLanguage(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Detect the language of the following text. Return only the language code: 
          - "pl" for Polish
          - "en" for English  
          - "de" for German
          - "fr" for French
          - "es" for Spanish
          - "it" for Italian
          - "ru" for Russian
          - "other" for any other language
          
          Return ONLY the language code, nothing else.`
        },
        { role: "user", content: text }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    return completion.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'pl'; // Default to Polish
  }
}

export async function generateResponse(emailContent, customerInfo = null) {
  try {
    // Rozpoznaj język emaila
    const detectedLanguage = await detectLanguage(emailContent);
    
    // Pobierz kontekst z bazy wiedzy
    const knowledgeContext = await getRelevantKnowledge(emailContent);
    const hotelContext = await getHotelInfo();
    const attractionContext = await getAttractionInfo();
    
    // Przygotuj prompt w zależności od języka
    const systemPrompt = getLocalizedPrompt(detectedLanguage, {
      knowledgeContext,
      hotelContext,
      attractionContext,
      customerInfo
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: emailContent }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content;
    
    return {
      response,
      detectedLanguage,
      originalEmail: emailContent
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Nie udało się wygenerować odpowiedzi');
  }
}

## 12. Complete AI Service (src/lib/ai.js)
```javascript
import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language detection
export async function detectLanguage(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Detect the language of the following text. Return only the language code: 
          - "pl" for Polish
          - "en" for English  
          - "de" for German
          - "fr" for French
          - "es" for Spanish
          - "it" for Italian
          - "ru" for Russian
          - "other" for any other language
          
          Return ONLY the language code, nothing else.`
        },
        { role: "user", content: text }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    return completion.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'pl'; // Default to Polish
  }
}

// Enhanced generateResponse with AI insights
export async function generateResponse(emailContent, aiContext = {}) {
  try {
    // Rozpoznaj język emaila
    const detectedLanguage = await detectLanguage(emailContent);
    
    // Pobierz kontekst z bazy wiedzy
    const knowledgeContext = await getRelevantKnowledge(emailContent);
    const hotelContext = await getHotelInfo();
    const attractionContext = await getAttractionInfo();
    
    // Extract AI context
    const { 
      clientProfile, 
      sentimentAnalysis, 
      purchasePrediction, 
      personalizedRecommendations 
    } = aiContext;
    
    // Przygotuj enhanced prompt z AI insights
    const systemPrompt = getEnhancedLocalizedPrompt(detectedLanguage, {
      knowledgeContext,
      hotelContext,
      attractionContext,
      clientProfile,
      sentimentAnalysis,
      purchasePrediction,
      personalizedRecommendations
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: emailContent }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      timeout: 30000 // 30 second timeout
    });

    const response = completion.choices[0].message.content;
    
    return {
      response,
      detectedLanguage,
      originalEmail: emailContent
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback response based on language
    const detectedLanguage = await detectLanguage(emailContent).catch(() => 'pl');
    const fallbackResponse = getFallbackResponse(detectedLanguage);
    
    return {
      response: fallbackResponse,
      detectedLanguage,
      originalEmail: emailContent,
      error: true
    };
  }
}

// Email categorization with language detection
export async function categorizeEmail(emailContent) {
  try {
    // Najpierw wykryj język
    const language = await detectLanguage(emailContent);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Categorize email about travel to Dubai. Return JSON with categories:
{
  "category": "hotels|attractions|restaurants|transport|general|booking",
  "urgency": "low|medium|high",
  "topics": ["array", "of", "topics"],
  "sentiment": "positive|neutral|negative",
  "language": "${language}",
  "hasSpecificDates": true|false,
  "priceRange": "budget|mid-range|luxury|not-specified"
}`
        },
        { role: "user", content: emailContent }
      ],
      temperature: 0.1,
      timeout: 15000
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, detectedLanguage: language };
  } catch (error) {
    console.error('Error categorizing email:', error);
    return {
      category: "general",
      urgency: "medium",
      topics: ["general"],
      sentiment: "neutral",
      language: "pl",
      detectedLanguage: "pl",
      hasSpecificDates: false,
      priceRange: "not-specified"
    };
  }
}

// Enhanced localized prompt generation
function getEnhancedLocalizedPrompt(language, context) {
  const { 
    knowledgeContext, 
    hotelContext, 
    attractionContext, 
    clientProfile,
    sentimentAnalysis,
    purchasePrediction,
    personalizedRecommendations
  } = context;
  
  const basePrompts = {
    pl: `Jesteś profesjonalnym agentem biura podróży specjalizującym się w wyjazdach do Dubaju i ZEA.`,
    en: `You are a professional travel agent specializing in trips to Dubai and UAE.`,
    de: `Sie sind ein professioneller Reiseberater, der sich auf Reisen nach Dubai und die VAE spezialisiert hat.`,
    fr: `Vous êtes un agent de voyage professionnel spécialisé dans les voyages à Dubaï et aux EAU.`,
    es: `Eres un agente de viajes profesional especializado en viajes a Dubái y EAU.`,
    it: `Sei un agente di viaggio professionale specializzato in viaggi a Dubai e EAU.`,
    ru: `Вы профессиональный турагент, специализирующийся на поездках в Дубай и ОАЭ.`
  };

  const instructions = {
    pl: `
INSTRUKCJE ODPOWIEDZI:
- Odpowiadaj TYLKO po polsku
- Bądź konkretny i pomocny
- Zawsze podaj ceny w AED i PLN (kurs 1 AED = 1.08 PLN)
- Sugeruj konkretne hotele, atrakcje i restauracje z naszej oferty
- Jeśli nie masz informacji, zaproponuj kontakt telefoniczny
- Na końcu zawsze dodaj zachętę do kontaktu`,
    
    en: `
RESPONSE INSTRUCTIONS:
- Respond ONLY in English
- Be specific and helpful
- Always provide prices in AED and USD (rate 1 AED = 0.27 USD)
- Suggest specific hotels, attractions and restaurants from our offer
- If you don't have information, suggest phone contact
- Always end with encouragement to contact us`,
    
    de: `
ANTWORT-ANWEISUNGEN:
- Antworten Sie NUR auf Deutsch
- Seien Sie spezifisch und hilfreich
- Geben Sie immer Preise in AED und EUR an (Kurs 1 AED = 0.25 EUR)
- Schlagen Sie spezifische Hotels, Attraktionen und Restaurants vor
- Bei fehlenden Informationen schlagen Sie telefonischen Kontakt vor
- Enden Sie immer mit einer Ermutigung zur Kontaktaufnahme`,

    fr: `
INSTRUCTIONS DE RÉPONSE:
- Répondez UNIQUEMENT en français
- Soyez précis et utile
- Fournissez toujours les prix en AED et EUR (taux 1 AED = 0.25 EUR)
- Suggérez des hôtels, attractions et restaurants spécifiques
- Si vous n'avez pas d'informations, proposez un contact téléphonique
- Terminez toujours par un encouragement à nous contacter`,

    es: `
INSTRUCCIONES DE RESPUESTA:
- Responde SOLO en español
- Sé específico y útil
- Proporciona siempre precios en AED y EUR (tipo 1 AED = 0.25 EUR)
- Sugiere hoteles, atracciones y restaurantes específicos
- Si no tienes información, sugiere contacto telefónico
- Termina siempre con ánimo de contactarnos`,

    it: `
ISTRUZIONI DI RISPOSTA:
- Rispondi SOLO in italiano
- Sii specifico e utile
- Fornisci sempre prezzi in AED ed EUR (tasso 1 AED = 0.25 EUR)
- Suggerisci hotel, attrazioni e ristoranti specifici
- Se non hai informazioni, suggerisci contatto telefonico
- Termina sempre con incoraggiamento a contattarci`,

    ru: `
ИНСТРУКЦИИ ПО ОТВЕТУ:
- Отвечайте ТОЛЬКО на русском языке
- Будьте конкретны и полезны
- Всегда указывайте цены в AED и USD (курс 1 AED = 0.27 USD)
- Предлагайте конкретные отели, достопримечательности и рестораны
- Если у вас нет информации, предложите телефонный контакт
- Всегда заканчивайте призывом связаться с нами`
  };

  // Client-specific instructions based on AI analysis
  let clientContext = '';
  if (clientProfile) {
    const returningClient = clientProfile.bookings?.length > 0;
    const loyaltyLevel = clientProfile.loyaltyScore > 0.7 ? 'VIP' : clientProfile.loyaltyScore > 0.3 ? 'returning' : 'new';
    
    clientContext = `
INFORMACJE O KLIENCIE / CLIENT CONTEXT:
- Status: ${returningClient ? 'Powracający klient' : 'Nowy klient'} (${loyaltyLevel})
- Preferencje budżetowe: ${clientProfile.budgetRange || 'nieznane'}
- Styl podróży: ${clientProfile.travelStyle || 'nieznany'}
- Poziom zaangażowania: ${Math.round((clientProfile.engagementScore || 0) * 100)}%
- Wartość: ${Math.round((clientProfile.valueScore || 0) * 100)}%
${returningClient ? '- WAŻNE: To powracający klient - odnieś się do jego wcześniejszych doświadczeń!' : ''}`;
  }

  // Sentiment-based instructions
  let sentimentContext = '';
  if (sentimentAnalysis) {
    const sentiment = sentimentAnalysis.sentiment;
    const emotion = sentimentAnalysis.emotion;
    
    if (sentiment === 'negative' || sentiment === 'frustrated') {
      sentimentContext = `
⚠️ UWAGA SPECJALNA - SENTIMENT ANALYSIS:
- Klient wykazuje negatywne emocje: ${sentiment} / ${emotion}
- PRIORYTET: Bądź szczególnie empatyczny i pomocny
- Zaproponuj bezpośredni kontakt telefoniczny
- Skup się na rozwiązaniu problemów, nie na sprzedaży`;
    } else if (sentiment === 'positive' || emotion === 'excited') {
      sentimentContext = `
✨ POZYTYWNE NASTAWIENIE KLIENTA:
- Klient jest pozytywnie nastawiony: ${sentiment} / ${emotion}
- Możesz być bardziej proaktywny w sugerowaniu dodatkowych opcji
- Skorzystaj z entuzjazmu do prezentacji premium opcji`;
    }
  }

  // Purchase prediction context
  let purchaseContext = '';
  if (purchasePrediction) {
    const probability = Math.round(purchasePrediction.purchaseProbability * 100);
    const timeframe = purchasePrediction.timeToDecision;
    
    if (probability > 80) {
      purchaseContext = `
🎯 WYSOKA PRAWDOPODOBIEŃSTWO ZAKUPU (${probability}%):
- Klient prawdopodobnie kupi w okresie: ${timeframe}
- PRIORYTET: Przekaż konkretną ofertę z cenami
- Zaproponuj szybkie ustalenie szczegółów
- Wspomnij o ograniczonej dostępności dla terminów`;
    } else if (probability > 60) {
      purchaseContext = `
📊 ŚREDNIE ZAINTERESOWANIE ZAKUPEM (${probability}%):
- Potrzebuje więcej informacji przed decyzją
- Skup się na edukacji i budowaniu zaufania
- Zaproponuj bezpłatną wycenę`;
    }
  }

  // Personalized recommendations
  let recommendationsContext = '';
  if (personalizedRecommendations) {
    recommendationsContext = `
🎨 SPERSONALIZOWANE REKOMENDACJE:
${JSON.stringify(personalizedRecommendations, null, 2)}
- Wykorzystaj te rekomendacje w swojej odpowiedzi
- Wyjaśnij dlaczego są dopasowane do klienta`;
  }

  const basePrompt = basePrompts[language] || basePrompts.en;
  const instruction = instructions[language] || instructions.en;
  
  return `${basePrompt}

${instruction}

${clientContext}

${sentimentContext}

${purchaseContext}

${recommendationsContext}

DOSTĘPNE INFORMACJE / AVAILABLE INFORMATION:
${knowledgeContext}

HOTELE W OFERCIE / HOTELS IN OFFER:
${hotelContext}

ATRAKCJE / ATTRACTIONS:
${attractionContext}

ZADANIE:
Odpowiedz na zapytanie klienta w sposób maksymalnie spersonalizowany, wykorzystując wszystkie dostępne informacje o kliencie i analizę AI. Twoja odpowiedź powinna być:
1. Dopasowana do wykrytych emocji i potrzeb
2. Uwzględniająca historię klienta (jeśli istnieje)
3. Zawierająca konkretne rekomendacje i ceny
4. Profesjonalna ale ciepła w tonie
5. Zawierająca konkretny call-to-action`;
}

// Helper functions for knowledge base
async function getRelevantKnowledge(query) {
  try {
    const knowledge = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      select: { title: true, content: true, category: true }
    });
    
    return knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return 'Baza wiedzy niedostępna';
  }
}

async function getHotelInfo() {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      select: { name: true, description: true, location: true, priceRange: true, rating: true }
    });
    
    return hotels.map(h => 
      `${h.name} (${h.location}) - ${h.description}. Cena: ${h.priceRange}, Ocena: ${h.rating}/5`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return 'Informacje o hotelach niedostępne';
  }
}

async function getAttractionInfo() {
  try {
    const attractions = await prisma.attraction.findMany({
      where: { isActive: true },
      select: { name: true, description: true, location: true, priceRange: true, hours: true }
    });
    
    return attractions.map(a => 
      `${a.name} - ${a.description}. Lokalizacja: ${a.location}, Cena: ${a.priceRange}, Godziny: ${a.hours || 'Sprawdź lokalnie'}`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return 'Informacje o atrakcjach niedostępne';
  }
}

// Fallback responses when AI fails
function getFallbackResponse(language) {
  const fallbacks = {
    pl: `Dziękujemy za Twoje zapytanie dotyczące podróży do Dubaju. 
    
Ze względu na czasowe problemy techniczne, nie mogę w tej chwili udzielić szczegółowej odpowiedzi. 

Prosimy o kontakt telefoniczny pod numerem +48 123 456 789 lub odpowiedź na tego emaila, a nasz zespół pomoże Ci zaplanować idealną podróż do Dubaju.

Pozdrawiam,
Dubai Travel Team`,

    en: `Thank you for your inquiry about traveling to Dubai.

Due to temporary technical issues, I cannot provide a detailed response at the moment.

Please contact us by phone at +48 123 456 789 or reply to this email, and our team will help you plan the perfect trip to Dubai.

Best regards,
Dubai Travel Team`,

    de: `Vielen Dank für Ihre Anfrage bezüglich einer Reise nach Dubai.

Aufgrund temporärer technischer Probleme kann ich momentan keine detaillierte Antwort geben.

Bitte kontaktieren Sie uns telefonisch unter +48 123 456 789 oder antworten Sie auf diese E-Mail, und unser Team wird Ihnen bei der Planung der perfekten Dubai-Reise helfen.

Mit freundlichen Grüßen,
Dubai Travel Team`
  };

  return fallbacks[language] || fallbacks.en;
}

// Localization helper functions
export function getLocalizedTemplate(language) {
  const templates = {
    pl: "Dziękujemy za zainteresowanie podróżą do Dubaju. Oto informacje dotyczące Twojego zapytania:",
    en: "Thank you for your interest in traveling to Dubai. Here is the information regarding your inquiry:",
    de: "Vielen Dank für Ihr Interesse an einer Reise nach Dubai. Hier sind die Informationen zu Ihrer Anfrage:",
    fr: "Merci pour votre intérêt pour un voyage à Dubaï. Voici les informations concernant votre demande:",
    es: "Gracias por su interés en viajar a Dubai. Aquí está la información sobre su consulta:",
    it: "Grazie per il vostro interesse per un viaggio a Dubai. Ecco le informazioni riguardo alla vostra richiesta:",
    ru: "Спасибо за ваш интерес к поездке в Дубай. Вот информация по вашему запросу:"
  };
  
  return templates[language] || templates.en;
}

export function getLocalizedSignature(language, defaultSignature) {
  const signatures = {
    pl: `Pozdrawiam,\nDubai Travel Assistant\n\nBiuro Podróży Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com`,
    en: `Best regards,\nDubai Travel Assistant\n\nDubai Dreams Travel Agency\nTel: +48 123 456 789\nEmail: contact@dubaitravel.com`,
    de: `Mit freundlichen Grüßen,\nDubai Travel Assistant\n\nReisebüro Dubai Dreams\nTel: +48 123 456 789\nEmail: kontakt@dubaitravel.com`,
    fr: `Cordialement,\nDubai Travel Assistant\n\nAgence de Voyage Dubai Dreams\nTél: +48 123 456 789\nEmail: contact@dubaitravel.com`,
    es: `Saludos cordiales,\nDubai Travel Assistant\n\nAgencia de Viajes Dubai Dreams\nTel: +48 123 456 789\nEmail: contacto@dubaitravel.com`,
    it: `Cordiali saluti,\nDubai Travel Assistant\n\nAgenzia di Viaggi Dubai Dreams\nTel: +48 123 456 789\nEmail: contatto@dubaitravel.com`,
    ru: `С уважением,\nDubai Travel Assistant\n\nТуристическое агентство Dubai Dreams\nТел: +48 123 456 789\nEmail: kontakt@dubaitravel.com`
  };
  
  return signatures[language] || defaultSignature || signatures.en;
}

export function getLocalizedSubject(language, originalSubject) {
  const prefixes = {
    pl: "Re:",
    en: "Re:",
    de: "AW:",
    fr: "Re:",
    es: "Re:",
    it: "Re:",
    ru: "Re:"
  };
  
  const prefix = prefixes[language] || "Re:";
  return `${prefix} ${originalSubject}`;
}
```
```
  const { knowledgeContext, hotelContext, attractionContext, customerInfo } = context;
  
  const prompts = {
    pl: `Jesteś profesjonalnym agentem biura podróży specjalizującym się w wyjazdach do Dubaju i ZEA. 

INSTRUKCJE:
- Odpowiadaj TYLKO po polsku
- Bądź konkretny i pomocny
- Zawsze podaj ceny w AED i PLN (kurs 1 AED = 1.08 PLN)
- Sugeruj konkretne hotele, atrakcje i restauracje z naszej oferty
- Jeśli nie masz informacji, zaproponuj kontakt telefoniczny
- Zachowaj profesjonalny, ale przyjazny ton
- Na końcu zawsze dodaj zachętę do kontaktu`,

    en: `You are a professional travel agent specializing in trips to Dubai and UAE.

INSTRUCTIONS:
- Respond ONLY in English
- Be specific and helpful
- Always provide prices in AED and USD (rate 1 AED = 0.27 USD)
- Suggest specific hotels, attractions and restaurants from our offer
- If you don't have information, suggest phone contact
- Maintain professional but friendly tone
- Always end with encouragement to contact us`,

    de: `Sie sind ein professioneller Reiseberater, der sich auf Reisen nach Dubai und die VAE spezialisiert hat.

ANWEISUNGEN:
- Antworten Sie NUR auf Deutsch
- Seien Sie spezifisch und hilfreich
- Geben Sie immer Preise in AED und EUR an (Kurs 1 AED = 0.25 EUR)
- Schlagen Sie spezifische Hotels, Attraktionen und Restaurants aus unserem Angebot vor
- Wenn Sie keine Informationen haben, schlagen Sie telefonischen Kontakt vor
- Bewahren Sie einen professionellen, aber freundlichen Ton
- Enden Sie immer mit einer Ermutigung zur Kontaktaufnahme`,

    fr: `Vous êtes un agent de voyage professionnel spécialisé dans les voyages à Dubaï et aux EAU.

INSTRUCTIONS:
- Répondez UNIQUEMENT en français
- Soyez précis et utile
- Fournissez toujours les prix en AED et EUR (taux 1 AED = 0.25 EUR)
- Suggérez des hôtels, attractions et restaurants spécifiques de notre offre
- Si vous n'avez pas d'informations, proposez un contact téléphonique
- Maintenez un ton professionnel mais amical
- Terminez toujours par un encouragement à nous contacter`,

    es: `Eres un agente de viajes profesional especializado en viajes a Dubái y EAU.

INSTRUCCIONES:
- Responde SOLO en español
- Sé específico y útil
- Proporciona siempre precios en AED y EUR (tipo 1 AED = 0.25 EUR)
- Sugiere hoteles, atracciones y restaurantes específicos de nuestra oferta
- Si no tienes información, sugiere contacto telefónico
- Mantén un tono profesional pero amigable
- Termina siempre con ánimo de contactarnos`,

    it: `Sei un agente di viaggio professionale specializzato in viaggi a Dubai e EAU.

ISTRUZIONI:
- Rispondi SOLO in italiano
- Sii specifico e utile
- Fornisci sempre prezzi in AED ed EUR (tasso 1 AED = 0.25 EUR)
- Suggerisci hotel, attrazioni e ristoranti specifici della nostra offerta
- Se non hai informazioni, suggerisci contatto telefonico
- Mantieni un tono professionale ma amichevole
- Termina sempre con incoraggiamento a contattarci`,

    ru: `Вы профессиональный турагент, специализирующийся на поездках в Дубай и ОАЭ.

ИНСТРУКЦИИ:
- Отвечайте ТОЛЬКО на русском языке
- Будьте конкретны и полезны
- Всегда указывайте цены в AED и USD (курс 1 AED = 0.27 USD)
- Предлагайте конкретные отели, достопримечательности и рестораны из нашего предложения
- Если у вас нет информации, предложите телефонный контакт
- Поддерживайте профессиональный, но дружелюбный тон
- Всегда заканчивайте призывом связаться с нами`,

    other: `You are a professional travel agent specializing in trips to Dubai and UAE.

INSTRUCTIONS:
- Respond in English (as fallback language)
- Be specific and helpful
- Always provide prices in AED and USD (rate 1 AED = 0.27 USD)
- Suggest specific hotels, attractions and restaurants from our offer
- If you don't have information, suggest phone contact
- Maintain professional but friendly tone
- Always end with encouragement to contact us`
  };

  const basePrompt = prompts[language] || prompts.other;
  
  return `${basePrompt}

DOSTĘPNE INFORMACJE / AVAILABLE INFORMATION:
${knowledgeContext}

HOTELE W OFERCIE / HOTELS IN OFFER:
${hotelContext}

ATRAKCJE / ATTRACTIONS:
${attractionContext}

INFORMACJE O KLIENCIE / CLIENT INFO:
${customerInfo ? JSON.stringify(customerInfo) : 'Brak dodatkowych informacji / No additional information'}

Odpowiedz na zapytanie klienta w sposób kompleksowy i profesjonalny. / Answer the client's inquiry comprehensively and professionally.`;
}

async function getRelevantKnowledge(query) {
  const knowledge = await prisma.knowledgeBase.findMany({
    where: { isActive: true },
    select: { title: true, content: true, category: true }
  });
  
  return knowledge.map(k => `${k.title}: ${k.content}`).join('\n\n');
}

async function getHotelInfo() {
  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    select: { name: true, description: true, location: true, priceRange: true, rating: true }
  });
  
  return hotels.map(h => 
    `${h.name} (${h.location}) - ${h.description}. Cena: ${h.priceRange}, Ocena: ${h.rating}/5`
  ).join('\n');
}

async function getAttractionInfo() {
  const attractions = await prisma.attraction.findMany({
    where: { isActive: true },
    select: { name: true, description: true, location: true, priceRange: true, hours: true }
  });
  
  return attractions.map(a => 
    `${a.name} - ${a.description}. Lokalizacja: ${a.location}, Cena: ${a.priceRange}, Godziny: ${a.hours || 'Sprawdź lokalnie'}`
  ).join('\n');
}

export async function categorizeEmail(emailContent) {
  try {
    // Najpierw wykryj język
    const language = await detectLanguage(emailContent);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Categorize email about travel to Dubai. Return JSON with categories:
{
  "category": "hotels|attractions|restaurants|transport|general|booking",
  "urgency": "low|medium|high",
  "topics": ["array", "of", "topics"],
  "sentiment": "positive|neutral|negative",
  "language": "${language}",
  "hasSpecificDates": true|false,
  "priceRange": "budget|mid-range|luxury|not-specified"
}`
        },
        { role: "user", content: emailContent }
      ],
      temperature: 0.1
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, detectedLanguage: language };
  } catch (error) {
    console.error('Error categorizing email:', error);
    return {
      category: "general",
      urgency: "medium",
      topics: ["general"],
      sentiment: "neutral",
      language: "pl",
      detectedLanguage: "pl",
      hasSpecificDates: false,
      priceRange: "not-specified"
    };
  }
}
```

## 6. Email Service (src/lib/email.js)
```javascript
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const gmail = google.gmail({ version: 'v1' });

// Konfiguracja SMTP
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, htmlContent, textContent }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Nie udało się wysłać emaila');
  }
}

export async function setupGmailWebhook() {
  try {
    // Setup Gmail push notifications
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth });
    
    const watchResponse = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: 'projects/your-project/topics/gmail-webhook',
        labelIds: ['INBOX']
      }
    });

    return watchResponse.data;
  } catch (error) {
    console.error('Error setting up Gmail webhook:', error);
    throw error;
  }
}

export async function getGmailMessages(auth, query = '', maxResults = 10) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });

    if (!response.data.messages) {
      return [];
    }

    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        const msgData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        return parseGmailMessage(msgData.data);
      })
    );

    return messages;
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

function parseGmailMessage(message) {
  const headers = message.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const from = headers.find(h => h.name === 'From')?.value || '';
  const to = headers.find(h => h.name === 'To')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';

  let body = '';
  if (message.payload.parts) {
    const textPart = message.payload.parts.find(
      part => part.mimeType === 'text/plain'
    );
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString();
    }
  } else if (message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString();
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date,
    body,
    snippet: message.snippet
  };
}
```

## 7. API Routes

### Enhanced Email Processing (src/app/api/email/process/route.js)
```javascript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResponse, categorizeEmail } from '@/lib/ai';
import { 
  analyzeSentiment, 
  predictPurchaseProbability, 
  generatePersonalizedRecommendations,
  getOrCreateClientProfile,
  determinePriority,
  checkEscalationCriteria 
} from '@/lib/ai-advanced';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { messageId, from, to, subject, content } = await request.json();

    // Sprawdź czy email już został przetworzony
    const existingEmail = await prisma.email.findUnique({
      where: { messageId }
    });

    if (existingEmail) {
      return NextResponse.json({ 
        message: 'Email już przetworzony',
        emailId: existingEmail.id 
      });
    }

    // 1. BASIC CATEGORIZATION & LANGUAGE DETECTION
    const emailCategory = await categorizeEmail(content);

    // 2. ADVANCED AI ANALYSIS
    console.log('Starting advanced AI analysis...');
    
    // Get or create client profile
    const clientProfile = await getOrCreateClientProfile(from);
    
    // Sentiment analysis
    const sentimentAnalysis = await analyzeSentiment(content, emailCategory.detectedLanguage);
    
    // Purchase prediction
    const purchasePrediction = await predictPurchaseProbability(content, clientProfile);
    
    // Personalized recommendations
    const personalizedRecommendations = await generatePersonalizedRecommendations(content, clientProfile);
    
    // Determine priority
    const priority = determinePriority(sentimentAnalysis, purchasePrediction);

    // 3. SAVE EMAIL WITH AI INSIGHTS
    const email = await prisma.email.create({
      data: {
        messageId,
        from,
        to,
        subject,
        content,
        status: 'PROCESSING'
      }
    });

    // 4. CREATE ENHANCED CONVERSATION
    const conversation = await prisma.conversation.create({
      data: {
        emailId: email.id,
        clientEmail: from,
        topic: emailCategory.category,
        language: emailCategory.detectedLanguage,
        sentiment: sentimentAnalysis.sentiment,
        priority: priority,
        purchaseProbability: purchasePrediction.purchaseProbability,
        summary: `[${emailCategory.detectedLanguage.toUpperCase()}] ${emailCategory.category} - ${emailCategory.topics.join(', ')} | Sentiment: ${sentimentAnalysis.sentiment} | Purchase: ${Math.round(purchasePrediction.purchaseProbability * 100)}%`
      }
    });

    // 5. CHECK FOR ESCALATION
    const escalationCheck = await checkEscalationCriteria(sentimentAnalysis, conversation);
    
    if (escalationCheck.shouldEscalate) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { 
          escalated: true,
          priority: 'URGENT'
        }
      });
      
      // Send notification to human agents
      await notifyHumanAgents(conversation, escalationCheck.reasons);
    }

    // 6. ADD CLIENT MESSAGE
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        sender: 'CLIENT'
      }
    });

    // 7. GENERATE AI RESPONSE (Enhanced with personalization)
    const aiResult = await generateResponse(content, {
      clientProfile,
      sentimentAnalysis,
      purchasePrediction,
      personalizedRecommendations
    });

    // 8. PREPARE RESPONSE WITH PERSONALIZATION
    const settings = await prisma.agentSettings.findFirst();
    const localizedSignature = getLocalizedSignature(aiResult.detectedLanguage, settings?.signature);
    const localizedTemplate = getLocalizedTemplate(aiResult.detectedLanguage);
    
    // Add upsell suggestions if high purchase probability
    let enhancedResponse = aiResult.response;
    if (purchasePrediction.purchaseProbability > 0.7 && purchasePrediction.upsellOpportunities.length > 0) {
      enhancedResponse += `\n\n✨ Dodatkowe rekomendacje specjalnie dla Ciebie:\n${purchasePrediction.upsellOpportunities.join('\n')}`;
    }
    
    const fullResponse = `${localizedTemplate}\n\n${enhancedResponse}\n\n${localizedSignature}`;

    // 9. SAVE AI RESPONSE
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: enhancedResponse,
        sender: 'AGENT'
      }
    });

    // 10. UPDATE EMAIL STATUS
    await prisma.email.update({
      where: { id: email.id },
      data: {
        response: fullResponse,
        status: escalationCheck.shouldEscalate ? 'ESCALATED' : 'RESPONDED',
        responded: !escalationCheck.shouldEscalate
      }
    });

    // 11. AUTO-REPLY LOGIC (only if not escalated)
    if (settings?.autoReply && !escalationCheck.shouldEscalate) {
      const localizedSubject = getLocalizedSubject(aiResult.detectedLanguage, subject);
      
      await sendEmail({
        to: from,
        subject: localizedSubject,
        textContent: fullResponse,
        htmlContent: fullResponse.replace(/\n/g, '<br>')
      });
    }

    // 12. RETURN COMPREHENSIVE RESPONSE
    return NextResponse.json({
      success: true,
      emailId: email.id,
      conversationId: conversation.id,
      response: enhancedResponse,
      category: emailCategory,
      detectedLanguage: aiResult.detectedLanguage,
      aiInsights: {
        sentiment: sentimentAnalysis,
        purchasePrediction: purchasePrediction,
        priority: priority,
        escalated: escalationCheck.shouldEscalate,
        escalationReasons: escalationCheck.reasons,
        clientProfile: {
          isReturning: clientProfile.bookings.length > 0,
          loyaltyScore: clientProfile.loyaltyScore,
          valueScore: clientProfile.valueScore
        }
      }
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Błąd przetwarzania emaila' },
      { status: 500 }
    );
  }
}

// Helper function for human agent notification
async function notifyHumanAgents(conversation, reasons) {
  try {
    // Send email notification to human agents
    await sendEmail({
      to: process.env.HUMAN_AGENT_EMAIL || 'agent@dubaitravel.com',
      subject: `🚨 URGENT: Email Escalation Required - ${conversation.clientEmail}`,
      textContent: `
ESCALATION ALERT

Client: ${conversation.clientEmail}
Priority: ${conversation.priority}
Purchase Probability: ${Math.round(conversation.purchaseProbability * 100)}%
Sentiment: ${conversation.sentiment}

Escalation Reasons:
${reasons.map(r => `- ${r}`).join('\n')}

Please review and respond manually.

Dashboard: ${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}
      `,
      htmlContent: `
        <h2 style="color: red;">🚨 ESCALATION ALERT</h2>
        <p><strong>Client:</strong> ${conversation.clientEmail}</p>
        <p><strong>Priority:</strong> <span style="color: red; font-weight: bold;">${conversation.priority}</span></p>
        <p><strong>Purchase Probability:</strong> ${Math.round(conversation.purchaseProbability * 100)}%</p>
        <p><strong>Sentiment:</strong> ${conversation.sentiment}</p>
        
        <h3>Escalation Reasons:</h3>
        <ul>
          ${reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard/conversations/${conversation.id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Dashboard</a></p>
      `
    });
    
    // You could also integrate with Slack, Teams, or SMS here
    console.log(`Escalation notification sent for conversation ${conversation.id}`);
  } catch (error) {
    console.error('Error notifying human agents:', error);
  }
}
```
```javascript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResponse, categorizeEmail } from '@/lib/ai';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { messageId, from, to, subject, content } = await request.json();

    // Sprawdź czy email już został przetworzony
    const existingEmail = await prisma.email.findUnique({
      where: { messageId }
    });

    if (existingEmail) {
      return NextResponse.json({ 
        message: 'Email już przetworzony',
        emailId: existingEmail.id 
      });
    }

    // Kategoryzuj email i wykryj język
    const emailCategory = await categorizeEmail(content);

    // Zapisz email w bazie
    const email = await prisma.email.create({
      data: {
        messageId,
        from,
        to,
        subject,
        content,
        status: 'PROCESSING'
      }
    });

    // Stwórz konwersację z informacją o języku
    const conversation = await prisma.conversation.create({
      data: {
        emailId: email.id,
        clientEmail: from,
        topic: emailCategory.category,
        language: emailCategory.detectedLanguage, // Zapisz wykryty język
        summary: `[${emailCategory.detectedLanguage.toUpperCase()}] ${emailCategory.category} - ${emailCategory.topics.join(', ')}`
      }
    });

    // Dodaj wiadomość klienta
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        sender: 'CLIENT'
      }
    });

    // Generuj odpowiedź AI w wykrytym języku
    const aiResult = await generateResponse(content);

    // Pobierz ustawienia agenta
    const settings = await prisma.agentSettings.findFirst();
    
    // Przygotuj podpis w odpowiednim języku
    const localizedSignature = getLocalizedSignature(aiResult.detectedLanguage, settings?.signature);
    const localizedTemplate = getLocalizedTemplate(aiResult.detectedLanguage);
    
    const fullResponse = `${localizedTemplate}\n\n${aiResult.response}\n\n${localizedSignature}`;

    // Zapisz odpowiedź agenta
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResult.response,
        sender: 'AGENT'
      }
    });

    // Aktualizuj email z informacją o języku
    await prisma.email.update({
      where: { id: email.id },
      data: {
        response: fullResponse,
        status: 'RESPONDED',
        responded: true
      }
    });

    // Jeśli auto-reply jest włączone, wyślij email
    if (settings?.autoReply) {
      const localizedSubject = getLocalizedSubject(aiResult.detectedLanguage, subject);
      
      await sendEmail({
        to: from,
        subject: localizedSubject,
        textContent: fullResponse,
        htmlContent: fullResponse.replace(/\n/g, '<br>')
      });
    }

    return NextResponse.json({
      success: true,
      emailId: email.id,
      conversationId: conversation.id,
      response: aiResult.response,
      category: emailCategory,
      detectedLanguage: aiResult.detectedLanguage
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Błąd przetwarzania emaila' },
      { status: 500 }
    );
  }
}
```

### Gmail Webhook (src/app/api/email/webhook/route.js)
```javascript
import { NextResponse } from 'next/server';
import { getGmailMessages } from '@/lib/email';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Verify webhook (Google Cloud Pub/Sub)
    if (body.message) {
      const data = JSON.parse(
        Buffer.from(body.message.data, 'base64').toString()
      );
      
      if (data.emailAddress) {
        // Nowy email otrzymany
        await processNewEmails();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}

async function processNewEmails() {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Pobierz nieprzeczytane emaile
    const messages = await getGmailMessages(
      auth, 
      'is:unread label:inbox', 
      5
    );

    for (const message of messages) {
      // Przetwórz każdy email
      await fetch(`${process.env.NEXTAUTH_URL}/api/email/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          from: message.from,
          to: message.to,
          subject: message.subject,
          content: message.body
        })
      });
    }
  } catch (error) {
    console.error('Error processing new emails:', error);
  }
}
```

### Knowledge Base API (src/app/api/knowledge/route.js)
```javascript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let where = { isActive: true };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const knowledge = await prisma.knowledgeBase.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd pobierania bazy wiedzy' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title, content, category, tags } = await request.json();

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        category,
        tags: tags || []
      }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd dodawania do bazy wiedzy' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, title, content, category, tags, isActive } = await request.json();

    const knowledge = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        title,
        content,
        category,
        tags: tags || [],
        isActive: isActive ?? true
      }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd aktualizacji bazy wiedzy' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await prisma.knowledgeBase.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Błąd usuwania z bazy wiedzy' },
      { status: 500 }
    );
  }
}
```

## 13. Enhanced Dashboard with AI Insights (src/app/dashboard/page.js)
```javascript
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Users,
  DollarSign,
  Brain,
  Target
} from 'lucide-react';

export default function EnhancedDashboard() {
  const [stats, setStats] = useState({
    totalEmails: 0,
    pendingEmails: 0,
    respondedEmails: 0,
    escalatedEmails: 0,
    avgResponseTime: 0,
    avgPurchaseProbability: 0,
    highValueLeads: 0,
    sentimentBreakdown: {}
  });

  const [recentEmails, setRecentEmails] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    fetchEnhancedDashboardData();
  }, []);

  const fetchEnhancedDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/enhanced-stats');
      const data = await response.json();
      setStats(data.stats);
      setRecentEmails(data.recentEmails);
      setAiInsights(data.aiInsights);
    } catch (error) {
      console.error('Error fetching enhanced dashboard data:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'frustrated': return 'text-red-700';
      case 'angry': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI-Enhanced Dubai Travel Dashboard</h1>
        <p className="text-gray-600 mt-2">Zaawansowana analityka z wykorzystaniem sztucznej inteligencji</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie Emaile</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              {stats.escalatedEmails} eskalowanych
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wysokie Prawdopodobieństwo</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highValueLeads}</div>
            <p className="text-xs text-muted-foreground">
              Śr. {Math.round(stats.avgPurchaseProbability * 100)}% szansy na zakup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eskalacje</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.escalatedEmails}</div>
            <p className="text-xs text-muted-foreground">
              Wymagają uwagi człowieka
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Średni czas odpowiedzi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Analiza Sentymentu (24h)</CardTitle>
            <CardDescription>Nastroje klientów w ostatnich emailach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.sentimentBreakdown).map(([sentiment, count]) => (
                <div key={sentiment} className="flex justify-between items-center">
                  <span className={`capitalize ${getSentimentColor(sentiment)}`}>
                    {sentiment}
                  </span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Najważniejsze spostrzeżenia z analiz AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">{insight.title}</div>
                  <div className="text-sm text-blue-700">{insight.description}</div>
                  {insight.action && (
                    <div className="text-xs text-blue-600 mt-1">
                      💡 {insight.action}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie Emaile z Analizą AI</CardTitle>
          <CardDescription>Najnowsze zapytania z insights AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{email.subject}</div>
                  <div className="text-sm text-gray-600">{email.from}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(email.createdAt).toLocaleString('pl-PL')}
                  </div>
                  
                  {/* AI Insights Row */}
                  <div className="flex gap-4 mt-2">
                    {email.conversation?.language && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {email.conversation.language.toUpperCase()}
                      </span>
                    )}
                    
                    {email.conversation?.sentiment && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        email.conversation.sentiment === 'positive' 
                          ? 'bg-green-100 text-green-800'
                          : email.conversation.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        😊 {email.conversation.sentiment}
                      </span>
                    )}
                    
                    {email.conversation?.purchaseProbability && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        email.conversation.purchaseProbability > 0.7 
                          ? 'bg-green-100 text-green-800'
                          : email.conversation.purchaseProbability > 0.4
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        🎯 {Math.round(email.conversation.purchaseProbability * 100)}%
                      </span>
                    )}
                    
                    {email.conversation?.priority && (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(email.conversation.priority)}`}>
                        {email.conversation.priority}
                      </span>
                    )}
                    
                    {email.conversation?.escalated && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                        🚨 ESKALACJA
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    email.status === 'RESPONDED' 
                      ? 'bg-green-100 text-green-800' 
                      : email.status === 'ESCALATED'
                      ? 'bg-red-100 text-red-800'
                      : email.status === 'PROCESSING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {email.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rekomendowane Akcje</CardTitle>
          <CardDescription>Co wymaga Twojej uwagi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.escalatedEmails > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">
                    {stats.escalatedEmails} emaili wymaga natychmiastowej uwagi
                  </div>
                  <div className="text-sm text-red-700">
                    Klienci wykazują negatywne emocje lub są wysokowartościowi
                  </div>
                </div>
              </div>
            )}
            
            {stats.highValueLeads > 5 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">
                    {stats.highValueLeads} potencjalnych klientów o wysokim prawdopodobieństwie zakupu
                  </div>
                  <div className="text-sm text-green-700">
                    Skontaktuj się z nimi priorytetowo
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```
```javascript
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmails: 0,
    pendingEmails: 0,
    respondedEmails: 0,
    avgResponseTime: 0
  });

  const [recentEmails, setRecentEmails] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data.stats);
      setRecentEmails(data.recentEmails);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dubai Travel Agent Dashboard</h1>
        <p className="text-gray-600 mt-2">Zarządzaj emailami i bazą wiedzy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie Emaile</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oczekujące</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingEmails}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odpowiedziane</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.respondedEmails}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Śr. Czas Odpowiedzi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie Emaile</CardTitle>
          <CardDescription>Najnowsze zapytania od klientów</CardDescription>
        </CardHeader>
        <CardContent>
                        <div className="space-y-4">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{email.subject}</div>
                  <div className="text-sm text-gray-600">{email.from}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(email.createdAt).toLocaleString('pl-PL')}
                  </div>
                  {email.conversation?.language && (
                    <div className="text-xs text-blue-600 mt-1">
                      Język: {email.conversation.language.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    email.status === 'RESPONDED' 
                      ? 'bg-green-100 text-green-800' 
                      : email.status === 'PROCESSING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {email.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  );
}
```

## 9. Installation Instructions

### Krok 1: Inicjalizacja projektu
```bash
npx create-next-app@latest dubai-travel-agent
cd dubai-travel-agent
npm install
```

### Krok 2: Konfiguracja bazy danych
```bash
# Skopiuj powyższe pliki do odpowiednich folderów
# Skonfiguruj .env.local z właściwymi kluczami

# Inicjalizuj bazę danych
npx prisma db push
npm run db:seed
```

### Krok 3: Uruchomienie
```bash
npm run dev
```

### Krok 4: Konfiguracja Gmail API
1. Idź do Google Cloud Console
2. Włącz Gmail API
3. Stwórz credentials OAuth 2.0
4. Skonfiguruj webhook endpoint
5. Dodaj klucze do .env.local

### Krok 5: Konfiguracja OpenAI
1. Uzyskaj API key z OpenAI
2. Dodaj do .env.local

## 10. Następne kroki (rozszerzenia)
- Integracja z systemem rezerwacji (API endpoint /api/booking)
- System uprawnień i autoryzacji
- Backup i monitoring
- Mobile app
- Analytics i raporty
- Wielojęzyczność

Projekt jest gotowy do uruchomienia! Potrzebujesz pomocy z któryś z kroków konfiguracji?