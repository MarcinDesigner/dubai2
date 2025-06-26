const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Rozpoczynam seedowanie bazy danych...');

  // Wyczyść istniejące dane
  console.log('🧹 Czyszczę bazę danych...');
  await prisma.purchaseAlert.deleteMany();
  await prisma.purchaseReadinessLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.email.deleteMany();
  await prisma.clientInteraction.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.attraction.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.agentSettings.deleteMany();

  // Seed Hotels
  console.log('📍 Dodaję hotele...');
  await prisma.hotel.createMany({
    data: [
      {
        name: "Burj Al Arab Jumeirah",
        description: "Luksusowy hotel na sztucznej wyspie w kształcie żagla",
        location: "Jumeirah Beach",
        priceRange: "5000-15000 AED/noc",
        rating: 5.0,
        amenities: JSON.stringify(["Spa", "Prywatna plaża", "Butler service", "9 restauracji"]),
        imageUrl: "https://example.com/burj-al-arab.jpg"
      },
      {
        name: "Atlantis The Palm",
        description: "Ikoniczny resort na palmowej wyspie z parkiem wodnym",
        location: "Palm Jumeirah",
        priceRange: "2000-8000 AED/noc",
        rating: 4.8,
        amenities: JSON.stringify(["Aquaventure Waterpark", "Lost Chambers Aquarium", "Spa", "Prywatna plaża"]),
        imageUrl: "https://example.com/atlantis.jpg"
      },
      {
        name: "Emirates Palace",
        description: "Pałacowy hotel w Abu Dhabi ze złotymi detalami",
        location: "Abu Dhabi",
        priceRange: "3000-10000 AED/noc",
        rating: 4.9,
        amenities: JSON.stringify(["Prywatna plaża", "Spa", "Marina", "14 restauracji"]),
        imageUrl: "https://example.com/emirates-palace.jpg"
      },
      {
        name: "Four Seasons Resort Dubai at Jumeirah Beach",
        description: "Elegancki resort z widokiem na Zatokę Perską",
        location: "Jumeirah Beach",
        priceRange: "1500-4000 AED/noc",
        rating: 4.7,
        amenities: JSON.stringify(["Spa", "Prywatna plaża", "3 restauracje", "Basen infinity"]),
        imageUrl: "https://example.com/four-seasons.jpg"
      },
      {
        name: "Armani Hotel Dubai",
        description: "Designerski hotel w Burj Khalifa zaprojektowany przez Giorgio Armani",
        location: "Downtown Dubai",
        priceRange: "2500-6000 AED/noc",
        rating: 4.8,
        amenities: JSON.stringify(["Spa Armani", "Restauracje", "Klub", "Concierge"]),
        imageUrl: "https://example.com/armani.jpg"
      }
    ]
  });

  // Seed Attractions
  console.log('🎢 Dodaję atrakcje...');
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
      },
      {
        name: "Dubai Marina",
        description: "Nowoczesna dzielnica z wieżowcami i przystanią",
        location: "Dubai Marina",
        category: "Rozrywka",
        priceRange: "Bezpłatne spacery",
        hours: "24/7",
        rating: 4.6
      },
      {
        name: "Palm Jumeirah",
        description: "Sztuczna wyspa w kształcie palmy",
        location: "Palm Jumeirah",
        category: "Atrakcja",
        priceRange: "Różne opcje",
        hours: "24/7",
        rating: 4.5
      }
    ]
  });

  // Seed Restaurants
  console.log('🍽️ Dodaję restauracje...');
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
      },
      {
        name: "Nobu Dubai",
        description: "Słynna japońska restauracja z widokiem na Atlantis",
        cuisine: "Japońska",
        location: "Atlantis The Palm",
        priceRange: "300-600 AED/osoba",
        rating: 4.6
      }
    ]
  });

  // Seed Knowledge Base
  console.log('📚 Dodaję bazę wiedzy...');
  await prisma.knowledgeBase.createMany({
    data: [
      {
        title: "Najlepsza pora na odwiedziny Dubaju",
        content: "Najlepszy czas na wizytę w Dubaju to okres od listopada do marca, kiedy temperatury są przyjemne (20-30°C). Unikaj letnich miesięcy (czerwiec-sierpień) ze względu na ekstremalne upały (40-45°C). Sezon turystyczny trwa od października do kwietnia.",
        category: "WEATHER",
        tags: JSON.stringify(["pogoda", "klimat", "temperatura", "sezon"])
      },
      {
        title: "Transport w Dubaju",
        content: "Dubai Metro: Nowoczesny system metra z dwiema liniami (czerwona i zielona). Bilety od 3 AED. Taxi: Bardzo popularne, startowy koszt 5 AED. Uber/Careem: Dostępne aplikacje. Autobusy: Tania opcja, bilety od 2 AED. Wypożyczalnie aut: Dostępne, wymagane międzynarodowe prawo jazdy.",
        category: "TRANSPORT",
        tags: JSON.stringify(["metro", "taxi", "autobus", "transport", "uber"])
      },
      {
        title: "Dress code w Dubaju",
        content: "Dubai jest tolerancyjne, ale zaleca się skromny ubiór w miejscach publicznych. W hotelach i na plażach bikini są akceptowane. W meczetach wymagane jest zakrycie ramion i nóg. W centrach handlowych obowiązuje dress code - unikaj zbyt odsłaniających ubrań.",
        category: "GENERAL",
        tags: JSON.stringify(["ubiór", "kultura", "zasady", "dress-code"])
      },
      {
        title: "Najlepsze plaże w Dubaju",
        content: "Jumeirah Beach: Publiczna plaża z widokiem na Burj Al Arab. Kite Beach: Idealna do sportów wodnych. La Mer: Nowoczesna plaża z restauracjami i sklepami. JBR Beach: Przy Marina, z wieloma barami i restauracjami. Sunset Beach: Świetne miejsce na zachód słońca.",
        category: "ATTRACTIONS",
        tags: JSON.stringify(["plaże", "jumeirah", "marina", "sporty wodne"])
      },
      {
        title: "Shopping w Dubaju",
        content: "Dubai Mall: Największe centrum handlowe z akwarium i lodowiskiem. Mall of the Emirates: Ze stokiem narciarskim Ski Dubai. Gold Souk: Tradycyjny targ złota. Spice Souk: Targ przypraw w starym mieście. City Walk: Nowoczesne centrum na świeżym powietrzu.",
        category: "ATTRACTIONS",
        tags: JSON.stringify(["shopping", "centra handlowe", "targi", "zakupy"])
      }
    ]
  });

  // Seed Client Profiles
  console.log('👥 Dodaję profile klientów...');
  const clients = await Promise.all([
    prisma.clientProfile.create({
      data: {
        email: "anna.kowalska@gmail.com",
        name: "Anna Kowalska",
        phone: "+48 123 456 789",
        preferredLanguage: "pl",
        budgetRange: "luxury",
        travelStyle: "relaxation",
        groupSize: 2,
        seasonPreference: "winter",
        hotelPreference: "beach",
        averageSpend: 15000.0,
        bookingFrequency: "frequent",
        responseTime: 2,
        loyaltyScore: 0.85,
        valueScore: 0.9,
        engagementScore: 0.8
      }
    }),
    prisma.clientProfile.create({
      data: {
        email: "john.smith@example.com",
        name: "John Smith",
        phone: "+1 555 123 4567",
        preferredLanguage: "en",
        budgetRange: "mid-range",
        travelStyle: "adventure",
        groupSize: 4,
        seasonPreference: "winter",
        hotelPreference: "city",
        averageSpend: 8000.0,
        bookingFrequency: "occasional",
        responseTime: 6,
        loyaltyScore: 0.45,
        valueScore: 0.6,
        engagementScore: 0.7
      }
    }),
    prisma.clientProfile.create({
      data: {
        email: "marie.dubois@email.fr",
        name: "Marie Dubois",
        phone: "+33 1 23 45 67 89",
        preferredLanguage: "fr",
        budgetRange: "luxury",
        travelStyle: "cultural",
        groupSize: 2,
        seasonPreference: "shoulder",
        hotelPreference: "city",
        averageSpend: 12000.0,
        bookingFrequency: "frequent",
        responseTime: 1,
        loyaltyScore: 0.75,
        valueScore: 0.8,
        engagementScore: 0.85
      }
    }),
    prisma.clientProfile.create({
      data: {
        email: "hans.mueller@gmail.de",
        name: "Hans Mueller",
        phone: "+49 30 12345678",
        preferredLanguage: "de",
        budgetRange: "budget",
        travelStyle: "business",
        groupSize: 1,
        seasonPreference: "winter",
        hotelPreference: "city",
        averageSpend: 4000.0,
        bookingFrequency: "first-time",
        responseTime: 12,
        loyaltyScore: 0.0,
        valueScore: 0.3,
        engagementScore: 0.4
      }
    }),
    prisma.clientProfile.create({
      data: {
        email: "sofia.garcia@correo.es",
        name: "Sofia Garcia",
        phone: "+34 91 123 4567",
        preferredLanguage: "es",
        budgetRange: "mid-range",
        travelStyle: "relaxation",
        groupSize: 3,
        seasonPreference: "winter",
        hotelPreference: "beach",
        averageSpend: 9000.0,
        bookingFrequency: "occasional",
        responseTime: 4,
        loyaltyScore: 0.3,
        valueScore: 0.5,
        engagementScore: 0.6
      }
    })
  ]);

  // Seed Emails and Conversations with AI Analysis
  console.log('📧 Dodaję emaile z analizą AI...');
  
  const emailsData = [
    {
      clientId: clients[0].id, // Anna Kowalska - VIP client
      messageId: "msg_001_high_value",
      from: "anna.kowalska@gmail.com",
      subject: "PILNE: Rezerwacja na Sylwestra w Dubaju dla 2 osób",
      content: "Dzień dobry! Potrzebuję pilnie zarezerwować pobyt w najlepszym hotelu w Dubaju na Sylwestra 2024 dla 2 osób. Budżet bez ograniczeń. Proszę o propozycję z Burj Al Arab lub Atlantis. Chcę mieć pewność rezerwacji do końca tygodnia. Pozdrawiam, Anna Kowalska",
      language: "pl",
      sentiment: "excited",
      priority: "URGENT",
      purchaseProbability: 0.95,
      status: "RESPONDED"
    },
    {
      clientId: clients[1].id, // John Smith
      messageId: "msg_002_medium",
      from: "john.smith@example.com",
      subject: "Dubai vacation inquiry for family of 4",
      content: "Hi there! We're planning a family vacation to Dubai in February 2025. We have 2 kids (ages 8 and 12). Looking for a hotel with good facilities for children, maybe with a water park? Our budget is around $3000-4000 for 5 nights. Can you recommend some options? Thanks!",
      language: "en",
      sentiment: "positive",
      priority: "MEDIUM",
      purchaseProbability: 0.65,
      status: "RESPONDED"
    },
    {
      clientId: clients[2].id, // Marie Dubois - returning customer
      messageId: "msg_003_luxury",
      from: "marie.dubois@email.fr",
      subject: "Séjour de luxe à Dubai - Mars 2025",
      content: "Bonjour, Je souhaite réserver un séjour de luxe à Dubai pour mon mari et moi du 15 au 22 mars 2025. Nous préférons un hôtel en centre-ville avec spa et restaurants gastronomiques. Budget environ 15000 euros. Pourriez-vous me proposer quelques options premium? Cordialement, Marie Dubois",
      language: "fr",
      sentiment: "positive",
      priority: "HIGH",
      purchaseProbability: 0.85,
      status: "RESPONDED"
    },
    {
      clientId: clients[3].id, // Hans Mueller - budget traveler
      messageId: "msg_004_budget",
      from: "hans.mueller@gmail.de",
      subject: "Geschäftsreise nach Dubai - Budget Hotel",
      content: "Guten Tag, ich plane eine Geschäftsreise nach Dubai vom 10-14 Januar 2025. Ich brauche ein günstiges aber sauberes Hotel in der Nähe des Geschäftsviertels. Mein Budget ist begrenzt, maximal 200 Euro pro Nacht. Haben Sie passende Angebote? Mit freundlichen Grüßen, Hans Mueller",
      language: "de",
      sentiment: "neutral",
      priority: "LOW",
      purchaseProbability: 0.45,
      status: "PENDING"
    },
    {
      clientId: clients[4].id, // Sofia Garcia
      messageId: "msg_005_family",
      from: "sofia.garcia@correo.es",
      subject: "Viaje familiar a Dubai - Consulta precios",
      content: "Hola! Estamos pensando en viajar a Dubai en abril con nuestros 3 hijos. ¿Podrían enviarnos información sobre hoteles familiares y actividades para niños? Nuestro presupuesto es moderado. También nos interesa saber sobre el clima en esa época. Gracias!",
      language: "es",
      sentiment: "positive",
      priority: "MEDIUM",
      purchaseProbability: 0.55,
      status: "PROCESSING"
    },
    {
      clientId: clients[0].id, // Anna Kowalska - follow up
      messageId: "msg_006_urgent_followup",
      from: "anna.kowalska@gmail.com",
      subject: "Re: PILNE - Czy możecie potwierdzić rezerwację?",
      content: "Dzień dobry! Nie otrzymałam jeszcze odpowiedzi na moje wcześniejsze zapytanie o Sylwestra. Czas nagli, bo inne hotele już się wyprzedają. Proszę o szybki kontakt. Jestem gotowa zapłacić zaliczkę już dziś. Bardzo pilne! Anna",
      language: "pl",
      sentiment: "frustrated",
      priority: "URGENT",
      purchaseProbability: 0.98,
      status: "ESCALATED"
    },
    {
      clientId: clients[1].id, // John Smith - price comparison
      messageId: "msg_007_comparison",
      from: "john.smith@example.com",
      subject: "Re: Dubai vacation - Need better prices",
      content: "Thanks for the options, but the prices seem quite high compared to what I found online. Can you match or beat the price I found at Booking.com for Atlantis - $280/night? If you can offer something competitive with additional services, I'm ready to book this week.",
      language: "en",
      sentiment: "neutral",
      priority: "HIGH",
      purchaseProbability: 0.75,
      status: "RESPONDED"
    },
    {
      clientId: clients[2].id, // Marie Dubois - ready to book
      messageId: "msg_008_ready_to_book",
      from: "marie.dubois@email.fr",
      subject: "Confirmation de réservation - Emirates Palace",
      content: "Bonjour, Merci pour votre excellente proposition. Je confirme ma réservation pour l'Emirates Palace du 15 au 22 mars 2025, suite junior avec vue mer. Je suis prête à verser l'acompte de 50% dès réception de la facture proforma. Pouvez-vous m'envoyer les détails de paiement? Merci, Marie",
      language: "fr",
      sentiment: "excited",
      priority: "HIGH",
      purchaseProbability: 0.92,
      status: "RESPONDED"
    }
  ];

  const conversations = [];
  
  for (let i = 0; i < emailsData.length; i++) {
    const emailData = emailsData[i];
    
    // Create email
    const email = await prisma.email.create({
      data: {
        messageId: emailData.messageId,
        from: emailData.from,
        to: "agent@dubaitravel.com",
        subject: emailData.subject,
        content: emailData.content,
        status: emailData.status,
        processed: true,
        responded: emailData.status === "RESPONDED"
      }
    });

    // Create conversation with AI analysis
    const conversation = await prisma.conversation.create({
      data: {
        emailId: email.id,
        clientId: emailData.clientId,
        clientEmail: emailData.from,
        topic: "hotels",
        summary: `[${emailData.language.toUpperCase()}] ${emailData.subject} | Sentiment: ${emailData.sentiment} | Purchase: ${Math.round(emailData.purchaseProbability * 100)}%`,
        language: emailData.language,
        sentiment: emailData.sentiment,
        priority: emailData.priority,
        escalated: emailData.status === "ESCALATED",
        purchaseProbability: emailData.purchaseProbability,
        status: emailData.status === "ESCALATED" ? "ESCALATED" : "ACTIVE"
      }
    });

    conversations.push(conversation);

    // Add client message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: emailData.content,
        sender: "CLIENT"
      }
    });

    // Add AI response (except for PENDING and ESCALATED)
    if (emailData.status === "RESPONDED") {
      const responses = {
        "pl": "Dziękujemy za zapytanie dotyczące podróży do Dubaju. Przygotowaliśmy dla Państwa spersonalizowaną ofertę uwzględniającą Państwa preferencje i budżet.",
        "en": "Thank you for your inquiry about traveling to Dubai. We have prepared a personalized offer taking into account your preferences and budget.",
        "fr": "Merci pour votre demande concernant un voyage à Dubaï. Nous avons préparé une offre personnalisée tenant compte de vos préférences et de votre budget.",
        "de": "Vielen Dank für Ihre Anfrage bezüglich einer Reise nach Dubai. Wir haben ein personalisiertes Angebot erstellt, das Ihre Präferenzen und Ihr Budget berücksichtigt.",
        "es": "Gracias por su consulta sobre viajar a Dubai. Hemos preparado una oferta personalizada teniendo en cuenta sus preferencias y presupuesto."
      };

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: responses[emailData.language] || responses["en"],
          sender: "AGENT"
        }
      });
    }
  }

  // Seed Purchase Alerts for high-probability clients
  console.log('🎯 Dodaję alerty zakupowe...');
  
  const alertsData = [
    {
      conversationId: conversations[0].id, // Anna Kowalska - urgent
      clientEmail: "anna.kowalska@gmail.com",
      alertType: "PURCHASE_READY",
      priority: "URGENT",
      readinessScore: 0.95,
      estimatedValue: 20000.0,
      estimatedCloseTime: "24 hours",
      readySignals: JSON.stringify([
        "Klient używa słów wskazujących na pilność ('PILNE', 'do końca tygodnia')",
        "Budżet bez ograniczeń - wysokowartościowy klient",
        "Konkretne daty i wymagania (Sylwester 2024)",
        "VIP klient z historią zakupów"
      ]),
      immediateActions: JSON.stringify([
        "Natychmiastowy kontakt telefoniczny",
        "Przygotowanie oferty premium w ciągu 2h",
        "Zaproponowanie ekskluzywnych dodatków"
      ]),
      isActive: true
    },
    {
      conversationId: conversations[5].id, // Anna Kowalska - follow up (escalated)
      clientEmail: "anna.kowalska@gmail.com",
      alertType: "URGENT_RESPONSE",
      priority: "URGENT",
      readinessScore: 0.98,
      estimatedValue: 25000.0,
      estimatedCloseTime: "6 hours",
      readySignals: JSON.stringify([
        "Klient wykazuje frustrację brakiem odpowiedzi",
        "Gotowość do natychmiastowej płatności",
        "Presja czasowa - konkurencja",
        "Bardzo wysokie prawdopodobieństwo zakupu"
      ]),
      immediateActions: JSON.stringify([
        "NATYCHMIASTOWY kontakt - priorytet #1",
        "Przeprosiny za opóźnienie",
        "Oferta specjalna z rabatem za niedogodności",
        "Błyskawiczna rezerwacja"
      ]),
      isActive: true
    },
    {
      conversationId: conversations[2].id, // Marie Dubois - luxury
      clientEmail: "marie.dubois@email.fr",
      alertType: "HIGH_VALUE",
      priority: "HIGH",
      readinessScore: 0.85,
      estimatedValue: 15000.0,
      estimatedCloseTime: "48 hours",
      readySignals: JSON.stringify([
        "Klient luksusowy z wysokim budżetem (15000 EUR)",
        "Konkretne daty i preferencje",
        "Pozytywny sentiment",
        "Historia zakupów premium"
      ]),
      immediateActions: JSON.stringify([
        "Kontakt w ciągu 4h",
        "Prezentacja opcji ultra-premium",
        "Dodatkowe usługi VIP"
      ]),
      isActive: true
    },
    {
      conversationId: conversations[6].id, // John Smith - price sensitive but ready
      clientEmail: "john.smith@example.com",
      alertType: "PURCHASE_READY",
      priority: "HIGH",
      readinessScore: 0.75,
      estimatedValue: 4000.0,
      estimatedCloseTime: "72 hours",
      readySignals: JSON.stringify([
        "Klient porównuje ceny - sygnał gotowości",
        "Gotowość do rezerwacji w tym tygodniu",
        "Konkretne oczekiwania cenowe",
        "Szuka dodatkowej wartości"
      ]),
      immediateActions: JSON.stringify([
        "Dopasowanie oferty do budżetu",
        "Dodanie bezpłatnych usług",
        "Kontakt w ciągu 6h"
      ]),
      isActive: true
    },
    {
      conversationId: conversations[7].id, // Marie Dubois - ready to book
      clientEmail: "marie.dubois@email.fr",
      alertType: "PURCHASE_READY",
      priority: "URGENT",
      readinessScore: 0.92,
      estimatedValue: 18000.0,
      estimatedCloseTime: "12 hours",
      readySignals: JSON.stringify([
        "Klient potwierdza rezerwację",
        "Gotowość do wpłaty zaliczki",
        "Prosi o szczegóły płatności",
        "Bardzo wysokie prawdopodobieństwo finalizacji"
      ]),
      immediateActions: JSON.stringify([
        "Natychmiastowe wysłanie faktury proforma",
        "Potwierdzenie wszystkich szczegółów",
        "Przygotowanie dokumentów podróży"
      ]),
      isActive: true
    }
  ];

  for (const alertData of alertsData) {
    await prisma.purchaseAlert.create({
      data: alertData
    });
  }

  // Seed Purchase Readiness Logs
  console.log('📊 Dodaję logi analizy gotowości...');
  
  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    const emailData = emailsData[i];
    
    await prisma.purchaseReadinessLog.create({
      data: {
        clientEmail: emailData.from,
        readinessScore: emailData.purchaseProbability,
        confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
        estimatedValue: emailData.purchaseProbability * 20000, // Estimated value based on probability
        estimatedCloseTime: emailData.priority === "URGENT" ? "24 hours" : emailData.priority === "HIGH" ? "72 hours" : "1 week",
        readySignals: JSON.stringify([
          emailData.content.toLowerCase().includes('pilne') || emailData.content.toLowerCase().includes('urgent') ? "Urgency keywords detected" : null,
          emailData.content.toLowerCase().includes('budget') || emailData.content.toLowerCase().includes('price') ? "Budget mentioned" : null,
          /\d{1,2}.*\d{4}/.test(emailData.content) ? "Specific dates provided" : null,
          emailData.content.toLowerCase().includes('ready') || emailData.content.toLowerCase().includes('gotowa') ? "Ready to pay signals" : null,
          emailData.content.toLowerCase().includes('compared') || emailData.content.toLowerCase().includes('booking.com') ? "Price comparison behavior" : null
        ].filter(Boolean)),
        immediateActions: JSON.stringify([
          "Contact within priority timeframe",
          "Prepare personalized offer",
          "Follow up on specific requirements"
        ]),
        reasoning: `Client shows ${emailData.sentiment} sentiment with ${emailData.priority} priority. Purchase probability: ${Math.round(emailData.purchaseProbability * 100)}%`
      }
    });
  }

  // Seed some bookings for returning clients
  console.log('📅 Dodaję historię rezerwacji...');
  
  await prisma.booking.createMany({
    data: [
      {
        clientId: clients[0].id, // Anna Kowalska - VIP with history
        destination: "Dubai",
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-22'),
        guests: 2,
        totalValue: 18500.0,
        status: "COMPLETED",
        hotel: "Burj Al Arab Jumeirah",
        roomType: "Ocean Suite",
        attractions: JSON.stringify(["Burj Khalifa", "Dubai Mall", "Desert Safari"]),
        transportation: "Private transfers"
      },
      {
        clientId: clients[0].id, // Anna Kowalska - another booking
        destination: "Dubai",
        checkIn: new Date('2024-06-10'),
        checkOut: new Date('2024-06-17'),
        guests: 2,
        totalValue: 22000.0,
        status: "COMPLETED",
        hotel: "Emirates Palace",
        roomType: "Palace Suite",
        attractions: JSON.stringify(["Abu Dhabi city tour", "Louvre Abu Dhabi"]),
        transportation: "Luxury car rental"
      },
      {
        clientId: clients[2].id, // Marie Dubois - returning customer
        destination: "Dubai",
        checkIn: new Date('2024-03-20'),
        checkOut: new Date('2024-03-27'),
        guests: 2,
        totalValue: 16800.0,
        status: "COMPLETED",
        hotel: "Four Seasons Resort Dubai",
        roomType: "Executive Suite",
        attractions: JSON.stringify(["Dubai Marina", "Gold Souk", "Spice Souk"]),
        transportation: "Private driver"
      }
    ]
  });

  // Seed Agent Settings
  console.log('⚙️ Dodaję ustawienia agenta...');
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

  console.log('✅ Seedowanie zakończone pomyślnie!');
  console.log('📊 Utworzone dane:');
  console.log(`   - 5 hoteli`);
  console.log(`   - 5 atrakcji`);
  console.log(`   - 3 restauracje`);
  console.log(`   - 5 artykułów bazy wiedzy`);
  console.log(`   - 5 profili klientów`);
  console.log(`   - 8 emaili z analizą AI`);
  console.log(`   - 8 konwersacji`);
  console.log(`   - 5 alertów zakupowych`);
  console.log(`   - 8 logów analizy gotowości`);
  console.log(`   - 3 historyczne rezerwacje`);
  console.log('🎯 System alertów zakupowych gotowy do testowania!');
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 