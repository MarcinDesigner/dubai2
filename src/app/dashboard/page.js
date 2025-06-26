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
  Target,
  Globe,
  Star,
  UserCheck,
  UserPlus,
  Activity
} from 'lucide-react';

export default function EnhancedDashboard() {
  const [stats, setStats] = useState({
    totalEmails: 0,
    pendingEmails: 0,
    respondedEmails: 0,
    escalatedEmails: 0,
    processingEmails: 0,
    avgResponseTime: 0,
    avgPurchaseProbability: 0,
    highValueLeads: 0,
    mediumValueLeads: 0,
    sentimentBreakdown: {},
    languageBreakdown: {},
    priorityBreakdown: {},
    totalClients: 0,
    vipClients: 0,
    newClients: 0
  });

  const [recentEmails, setRecentEmails] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    fetchEnhancedDashboardData();
  }, []);

  const fetchEnhancedDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/enhanced-stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Safe assignment with fallbacks
      setStats(data.stats || {
        totalEmails: 0,
        pendingEmails: 0,
        respondedEmails: 0,
        escalatedEmails: 0,
        processingEmails: 0,
        avgResponseTime: 0,
        avgPurchaseProbability: 0,
        highValueLeads: 0,
        mediumValueLeads: 0,
        sentimentBreakdown: {},
        languageBreakdown: {},
        priorityBreakdown: {},
        totalClients: 0,
        vipClients: 0,
        newClients: 0
      });
      setRecentEmails(data.recentEmails || []);
      setAiInsights(data.aiInsights || []);
    } catch (error) {
      console.error('Error fetching enhanced dashboard data:', error);
      // Set fallback data
      setStats({
        totalEmails: 0,
        pendingEmails: 0,
        respondedEmails: 0,
        escalatedEmails: 0,
        processingEmails: 0,
        avgResponseTime: 0,
        avgPurchaseProbability: 0,
        highValueLeads: 0,
        mediumValueLeads: 0,
        sentimentBreakdown: {},
        languageBreakdown: {},
        priorityBreakdown: {},
        totalClients: 0,
        vipClients: 0,
        newClients: 0
      });
      setAiInsights([{
        title: "Skonfiguruj DATABASE_URL w pliku .env.local aby zobaczyć rzeczywiste dane",
        description: "💡 Skopiuj env-template.txt do .env.local i wypełnij dane",
        action: "Sprawdź dokumentację konfiguracji bazy danych",
        type: "info"
      }]);
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
      case 'excited': return 'text-green-700';
      case 'negative': return 'text-red-600';
      case 'frustrated': return 'text-red-700';
      case 'angry': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getInsightTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'opportunity': return 'bg-blue-50 border-blue-200';
      case 'info': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'opportunity': return '🎯';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI-Enhanced Dubai Travel Dashboard</h1>
        <p className="text-gray-600 mt-2">Zaawansowana analityka z wykorzystaniem sztucznej inteligencji</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie Emaile</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              {stats.escalatedEmails} eskalowanych, {stats.processingEmails} w trakcie
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
              {stats.mediumValueLeads} średnie, Śr. {Math.round(stats.avgPurchaseProbability * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baza Klientów</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.vipClients} VIP, {stats.newClients} nowych
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

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analiza Sentymentu (7 dni)</CardTitle>
            <CardDescription>Nastroje klientów w ostatnich emailach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.sentimentBreakdown || {}).length > 0 ? (
                Object.entries(stats.sentimentBreakdown).map(([sentiment, count]) => (
                  <div key={sentiment} className="flex justify-between items-center">
                    <span className={`capitalize ${getSentimentColor(sentiment)}`}>
                      {sentiment}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>Brak danych o sentymencie</p>
                  <p className="text-xs">Skonfiguruj bazę danych aby zobaczyć analizę</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Language Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Języki Zapytań</CardTitle>
            <CardDescription>Rozkład językowy klientów</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.languageBreakdown || {}).length > 0 ? (
                Object.entries(stats.languageBreakdown).map(([language, count]) => (
                  <div key={language} className="flex justify-between items-center">
                    <span className="uppercase font-medium text-blue-600">
                      {language}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>Brak danych językowych</p>
                  <p className="text-xs">Skonfiguruj bazę danych aby zobaczyć rozkład</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Priorytety Zapytań</CardTitle>
            <CardDescription>Rozkład priorytetów według AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.priorityBreakdown || {}).length > 0 ? (
                Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center">
                    <span className={`font-medium ${getPriorityColor(priority)} px-2 py-1 rounded text-xs`}>
                      {priority}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>Brak danych o priorytetach</p>
                  <p className="text-xs">Skonfiguruj bazę danych aby zobaczyć analizę</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>AI Insights & Rekomendacje</CardTitle>
          <CardDescription>Najważniejsze spostrzeżenia z analiz sztucznej inteligencji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights && aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${getInsightTypeColor(insight.type)}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getInsightIcon(insight.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{insight.title}</div>
                      <div className="text-sm text-gray-700 mt-1">{insight.description}</div>
                      {insight.action && (
                        <div className="text-xs text-gray-600 mt-2 italic">
                          💡 {insight.action}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500 py-8">
                <p>Brak AI insights</p>
                <p className="text-xs">Skonfiguruj bazę danych aby zobaczyć rekomendacje</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Emails */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie Emaile z Analizą AI</CardTitle>
          <CardDescription>Najnowsze zapytania z kompleksową analizą sztucznej inteligencji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEmails && recentEmails.length > 0 ? (
              recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium">{email.subject}</div>
                    <div className="text-sm text-gray-600">{email.from}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(email.createdAt).toLocaleString('pl-PL')}
                    </div>
                    
                    {/* AI Insights Row */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {email.conversation?.language && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          🌍 {email.conversation.language.toUpperCase()}
                        </span>
                      )}
                      
                      {email.conversation?.sentiment && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          email.conversation.sentiment === 'positive' || email.conversation.sentiment === 'excited'
                            ? 'bg-green-100 text-green-800'
                            : email.conversation.sentiment === 'negative' || email.conversation.sentiment === 'frustrated'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          😊 {email.conversation.sentiment}
                        </span>
                      )}
                      
                      {email.conversation?.purchaseProbability !== null && email.conversation?.purchaseProbability !== undefined && (
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
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Brak ostatnich emaili</p>
                <p className="text-xs">Skonfiguruj bazę danych aby zobaczyć ostatnie emaile</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rekomendowane Akcje</CardTitle>
          <CardDescription>Co wymaga Twojej uwagi na podstawie analizy AI</CardDescription>
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
            
            {stats.highValueLeads > 3 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">
                    {stats.highValueLeads} potencjalnych klientów o wysokim prawdopodobieństwie zakupu
                  </div>
                  <div className="text-sm text-green-700">
                    Skontaktuj się z nimi priorytetowo w ciągu 24h
                  </div>
                </div>
              </div>
            )}

            {stats.processingEmails > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-900">
                    {stats.processingEmails} emaili w trakcie przetwarzania
                  </div>
                  <div className="text-sm text-yellow-700">
                    AI analizuje zapytania i przygotowuje odpowiedzi
                  </div>
                </div>
              </div>
            )}

            {Object.keys(stats.languageBreakdown || {}).length > 3 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">
                    Międzynarodowa klientela w {Object.keys(stats.languageBreakdown).length} językach
                  </div>
                  <div className="text-sm text-blue-700">
                    Rozważ rozszerzenie zespołu o native speakerów
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